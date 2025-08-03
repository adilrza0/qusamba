const Order = require('../models/Order');
const AdminSettings = require('../models/AdminSettings');
const { sendOrderConfirmationEmail, sendOrderShippedEmail } = require('../utils/email');
const { autoCreateShipment } = require('./shippingController');

exports.placeOrder = async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress, subtotal, shippingCost, tax, currency } = req.body;
    
    // Save shipping address to user's addresses if it's new
    if (shippingAddress && !shippingAddress._id) {
      const User = require('../models/User');
      const user = await User.findById(req.user.id);
      if (user) {
        user.addresses.push(shippingAddress);
        await user.save();
      }
    }
    
    // Calculate shipping dimensions and weight from items
    const Product = require('../models/Product');
    let totalWeight = 0;
    let maxLength = 10; // Start with minimum values
    let maxBreadth = 10; // Use breadth to match Order schema
    let totalHeight = 10;
    
    try {
      for (const item of items) {
        try {
          const product = await Product.findById(item.product);
          if (product) {
            // Calculate weight (convert to kg for shipping)
            const itemWeight = (product.weight?.value || 50) / 1000; // Default 50g, convert to kg
            totalWeight += itemWeight * item.quantity;
            
            // Calculate dimensions (assume cm, convert if needed)
            if (product.dimensions && typeof product.dimensions === 'object') {
              const length = product.dimensions.length || 10;
              const width = product.dimensions.width || 10;
              const height = product.dimensions.height || 5;
              
              maxLength = Math.max(maxLength, length);
              maxBreadth = Math.max(maxBreadth, width); // width -> breadth
              totalHeight += height * item.quantity; // Stack height
            }
          }
        } catch (productError) {
          console.error(`Error fetching product ${item.product}:`, productError);
          // Continue with defaults if product fetch fails
        }
      }
    } catch (error) {
      console.error('Error calculating shipping dimensions:', error);
      // Use defaults if calculation fails
    }
    
    // Set minimum dimensions and weight
    const shippingWeight = Math.max(totalWeight || 0, 0.5); // Minimum 0.5kg
    const shippingDimensions = {
      length: Number(Math.max(maxLength || 10, 10)),
      breadth: Number(Math.max(maxBreadth || 10, 10)),
      height: Number(Math.max(totalHeight || 10, 10))
    };
    
    console.log('Calculated shipping dimensions:', {
      weight: shippingWeight,
      dimensions: shippingDimensions
    });
    
    // Validate dimensions object
    console.log('Dimensions validation:', {
      isObject: typeof shippingDimensions === 'object',
      length: shippingDimensions.length,
      breadth: shippingDimensions.breadth,
      height: shippingDimensions.height
    });
    
    const order = await Order.create({
      user: req.user.id,
      items,
      subtotal: subtotal || totalAmount,
      shippingCost: shippingCost || 0,
      tax: tax || 0,
      totalAmount,
      currency: currency || 'INR',
      shippingAddress,
      shipping: {
        method: 'Not Specified',
        carrier: 'Not Specified',
        trackingNumber: '',
        estimatedDelivery: null,
        actualDelivery: null,
        shippedAt: null,
        shiprocket_order_id: '',
        shipment_id: '',
        awb_code: '',
        courier_company_id: '',
        courier_name: '',
        pickup_location: '',
        weight: shippingWeight,
        dimensions: shippingDimensions
      },
      payment: {
        method: 'razorpay',
        amount: totalAmount,
        currency: currency || 'INR'
      }
    });
    
    // Populate the order with user and product details for email
    await order.populate('user', 'name email');
    await order.populate('items.product', 'name price');
    
    // Send order confirmation email
    await sendOrderConfirmationEmail(order.user.email, order.user.name, order);
    
    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getOrders = async (req, res) => {
  console.log('getOrders');
  try {
    const orders = await Order.find({ user: req.user.id }).populate('items.product');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update order status (admin only)
exports.updateOrderStatus = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, trackingNumber, carrier, estimatedDelivery, notes } = req.body;
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Update order status
    order.status = status;
    
    // Update shipping information if provided
    if (status === 'shipped') {
      if (trackingNumber) {
        order.shipping.trackingNumber = trackingNumber;
      }
      if (carrier) {
        order.shipping.carrier = carrier;
      }
      if (estimatedDelivery) {
        order.shipping.estimatedDelivery = new Date(estimatedDelivery);
      }
      order.shipping.shippedAt = new Date();
    }
    
    // Add tracking update with admin notes
    order.tracking.push({
      status,
      message: notes || `Order status changed to ${status}`,
      timestamp: new Date(),
      updatedBy: req.user.id
    });
    
    await order.save();
    
    // Send email notification when order is shipped
    if (status === 'shipped') {
      await sendOrderShippedEmail(
        order.user.email, 
        order.user.name, 
        order, 
        order.shipping.trackingNumber || 'N/A'
      );
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all orders (admin only)
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    
    let query = {};
    if (status && status !== 'all') {
      query.status = status;
    }
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .populate('tracking.updatedBy', 'name')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Order.countDocuments(query);
    
    console.log(`Fetched ${orders.length} orders for admin`);
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single order details (admin only)
exports.getOrderById = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId)
      .populate('user', 'name email phone')
      .populate('items.product', 'name price images')
      .populate('tracking.updatedBy', 'name');
      
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bulk update order status (admin only)
exports.bulkUpdateOrderStatus = async (req, res) => {
  try {
    const { orderIds, status, trackingInfo } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Order IDs are required' });
    }
    
    const updates = [];
    const emailPromises = [];
    
    for (const orderId of orderIds) {
      const order = await Order.findById(orderId).populate('user', 'name email');
      
      if (order) {
        order.status = status;
        
        // Update shipping info if provided
        if (status === 'shipped' && trackingInfo) {
          order.shipping = {
            ...order.shipping,
            ...trackingInfo,
            shippedAt: new Date()
          };
        }
        
        // Add tracking entry
        order.tracking.push({
          status,
          message: `Bulk update: Order status changed to ${status}`,
          timestamp: new Date(),
          updatedBy: req.user.id
        });
        
        await order.save();
        updates.push(order);
        
        // Queue email if shipped
        if (status === 'shipped') {
          emailPromises.push(
            sendOrderShippedEmail(
              order.user.email,
              order.user.name,
              order,
              order.shipping.trackingNumber || 'N/A'
            )
          );
        }
      }
    }
    
    // Send all emails
    if (emailPromises.length > 0) {
      await Promise.all(emailPromises);
    }
    
    res.json({
      message: `${updates.length} orders updated successfully`,
      updatedOrders: updates
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get shipping statistics (admin only)
exports.getShippingStats = async (req, res) => {
  try {
    const stats = await Order.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalValue: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const todayShipped = await Order.countDocuments({
      status: 'shipped',
      'shipping.shippedAt': {
        $gte: new Date(new Date().setHours(0, 0, 0, 0))
      }
    });
    
    const pendingShipments = await Order.countDocuments({
      status: { $in: ['confirmed', 'processing'] }
    });
    
    res.json({
      statusBreakdown: stats,
      todayShipped,
      pendingShipments
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Track order (public - for customers)
exports.trackOrder = async (req, res) => {
  try {
    const { orderNumber } = req.params;
    
    const order = await Order.findOne({ orderNumber })
      .select('orderNumber status tracking shipping createdAt')
      .populate('tracking.updatedBy', 'name');
      
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    res.json({
      orderNumber: order.orderNumber,
      status: order.status,
      tracking: order.tracking,
      shipping: order.shipping,
      orderDate: order.createdAt
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Approve order and create shipment (admin only)
exports.approveOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // Check if order can be approved
    if (!['placed', 'confirmed', 'processing'].includes(order.status)) {
      return res.status(400).json({ 
        error: `Order cannot be approved. Current status: ${order.status}` 
      });
    }
    
    // Check if payment is completed
    if (order.payment?.status !== 'completed') {
      return res.status(400).json({ 
        error: 'Order payment must be completed before approval' 
      });
    }
    
    // Check if shipment already exists
    if (order.shipping?.shiprocket_order_id) {
      return res.status(400).json({ 
        error: 'Shipment already exists for this order' 
      });
    }
    
    // Update order status to processing
    order.status = 'processing';
    
    // Add approval tracking
    order.tracking.push({
      status: 'processing',
      message: notes || 'Order approved by admin',
      timestamp: new Date(),
      updatedBy: req.user.id
    });
    
    // Add admin notes if provided
    if (notes) {
      order.adminNotes = order.adminNotes ? `${order.adminNotes}\n\n[${new Date().toISOString()}] ${notes}` : notes;
    }
    
    await order.save();
    
    // Create shipment after approval
    try {
      await autoCreateShipment(order._id);
      
      // Refresh order data to get updated shipping info
      const updatedOrder = await Order.findById(orderId)
        .populate('user', 'name email')
        .populate('items.product', 'name price')
        .populate('tracking.updatedBy', 'name');
      
      // Check if AWB was generated successfully
      if (updatedOrder.shipping?.awb_code) {
        res.json({
          message: 'Order approved and shipment created successfully',
          order: updatedOrder,
          shipment: {
            awb_code: updatedOrder.shipping.awb_code,
            courier_name: updatedOrder.shipping.courier_name,
            tracking_url: `https://shiprocket.co/tracking/${updatedOrder.shipping.awb_code}`
          }
        });
      } else {
        res.json({
          message: 'Order approved but AWB generation failed',
          order: updatedOrder,
          warning: 'Shipment created in Shiprocket but AWB code not generated. Please check Shiprocket dashboard or try generating AWB manually.',
          shipment: {
            awb_code: null,
            courier_name: updatedOrder.shipping?.courier_name,
            tracking_url: null,
            manual_action_required: true
          }
        });
      }
    } catch (shipmentError) {
      console.error('Shipment creation failed after approval:', shipmentError);
      
      // Still return success for approval, but indicate shipment creation failed
      res.json({
        message: 'Order approved but shipment creation failed',
        order,
        shipmentError: shipmentError.message,
        note: 'You can manually create the shipment from the shipping section'
      });
    }
  } catch (error) {
    console.error('Order approval error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Bulk approve orders (admin only)
exports.bulkApproveOrders = async (req, res) => {
  try {
    const { orderIds, notes } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({ error: 'Order IDs are required' });
    }
    
    const results = [];
    const errors = [];
    
    for (const orderId of orderIds) {
      try {
        const order = await Order.findById(orderId).populate('user', 'name email');
        
        if (!order) {
          errors.push({ orderId, error: 'Order not found' });
          continue;
        }
        
        if (!['placed', 'confirmed', 'processing'].includes(order.status)) {
          errors.push({ orderId, error: `Cannot approve order with status: ${order.status}` });
          continue;
        }
        
        if (order.payment?.status !== 'completed') {
          errors.push({ orderId, error: 'Payment not completed' });
          continue;
        }
        
        if (order.shipping?.shiprocket_order_id) {
          errors.push({ orderId, error: 'Shipment already exists' });
          continue;
        }
        
        // Update order
        order.status = 'processing';
        order.tracking.push({
          status: 'processing',
          message: notes || 'Order approved by admin (bulk approval)',
          timestamp: new Date(),
          updatedBy: req.user.id
        });
        
        if (notes) {
          order.adminNotes = order.adminNotes ? `${order.adminNotes}\n\n[${new Date().toISOString()}] ${notes}` : notes;
        }
        
        await order.save();
        
        // Try to create shipment
        try {
          await autoCreateShipment(order._id);
          results.push({ 
            orderId, 
            status: 'approved_and_shipped',
            orderNumber: order.orderNumber 
          });
        } catch (shipmentError) {
          results.push({ 
            orderId, 
            status: 'approved_shipment_failed',
            orderNumber: order.orderNumber,
            shipmentError: shipmentError.message
          });
        }
      } catch (error) {
        errors.push({ orderId, error: error.message });
      }
    }
    
    res.json({
      message: `${results.length} orders processed`,
      results,
      errors: errors.length > 0 ? errors : undefined,
      summary: {
        total: orderIds.length,
        successful: results.length,
        failed: errors.length
      }
    });
  } catch (error) {
    console.error('Bulk approve orders error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get orders pending approval (admin only)
exports.getOrdersPendingApproval = async (req, res) => {
  
  try {
    const { page = 1, limit = 20 } = req.query;
    
    // Get admin settings to check if approval is required
    const settings = await AdminSettings.getSettings();
    
    if (!settings.requireOrderApproval) {
      return res.json({
        orders: [],
        message: 'Order approval is currently disabled. Orders are processed automatically.',
        totalPages: 0,
        currentPage: page,
        total: 0,
        automationEnabled: true
      });
    }
    
    // Find orders that are paid but not yet shipped and don't have shipment created
    const query = {
      'payment.status': 'completed',
      status: { $in: ['placed', 'confirmed'] },
      'shipping.shiprocket_order_id': { $exists: false }
    };
    
    const orders = await Order.find(query)
      .populate('user', 'name email')
      .populate('items.product', 'name price')
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit);
      
    const total = await Order.countDocuments(query);
    
    res.json({
      orders,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      automationEnabled: false
    });
  } catch (error) {
    console.error('Get orders pending approval error:', error);
    res.status(500).json({ error: error.message });
  }
};
