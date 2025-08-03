const shiprocketService = require('../services/shiprocketService');
const Order = require('../models/Order');
const { sendOrderShippedEmail } = require('../utils/email');

// Create shipment after payment confirmation
exports.createShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is already shipped or has shipment
    if (order.shipping?.shiprocket_order_id) {
      return res.status(400).json({
        success: false,
        message: 'Shipment already created for this order'
      });
    }

    // Ensure payment is completed
    if (order.payment?.status !== 'completed') {
      return res.status(400).json({
        success: false,
        message: 'Payment must be completed before creating shipment'
      });
    }

    // Create shipment in Shiprocket
    const shipmentResult = await shiprocketService.createOrder(order);
    
    if (shipmentResult.success) {
      // Preserve existing dimensions and weight, or set defaults
      const existingDimensions = order.shipping?.dimensions || {
        length: 10,
        breadth: 10,
        height: 10
      };
      const existingWeight = order.shipping?.weight || 0.5;
      
      // Ensure shipping object exists
      if (!order.shipping) {
        order.shipping = {};
      }
      
      // Update order with Shiprocket details - using explicit assignment
      order.shipping.shiprocket_order_id = shipmentResult.shiprocket_order_id;
      order.shipping.shipment_id = shipmentResult.shipment_id;
      order.shipping.awb_code = shipmentResult.awb_code;
      order.shipping.courier_company_id = shipmentResult.courier_company_id;
      order.shipping.courier_name = shipmentResult.courier_name;
      order.shipping.method = 'Shiprocket';
      order.shipping.carrier = shipmentResult.courier_name;
      order.shipping.trackingNumber = shipmentResult.awb_code;
      order.shipping.shippedAt = new Date();
      order.shipping.weight = existingWeight;
      order.shipping.dimensions = existingDimensions;

      // Update order status
      order.status = 'shipped';
      
      // Add tracking entry
      order.tracking.push({
        status: 'shipped',
        message: `Order shipped via ${shipmentResult.courier_name}. AWB: ${shipmentResult.awb_code}`,
        timestamp: new Date(),
        updatedBy: req.user?.id
      });

      await order.save();

      // Send shipped email notification
      if (order.user?.email) {
        await sendOrderShippedEmail(
          order.user.email,
          order.user.name,
          order,
          shipmentResult.awb_code
        );
      }

      res.status(200).json({
        success: true,
        message: 'Shipment created successfully',
        shipment: {
          shiprocket_order_id: shipmentResult.shiprocket_order_id,
          awb_code: shipmentResult.awb_code,
          courier_name: shipmentResult.courier_name,
          tracking_url: `https://shiprocket.co/tracking/${shipmentResult.awb_code}`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create shipment',
        error: shipmentResult.error
      });
    }

  } catch (error) {
    console.error('Create shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create shipment',
      error: error.message
    });
  }
};

// Mark order as shipped (when package actually leaves warehouse)
exports.shipOrder = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { notes } = req.body;
    
    const order = await Order.findById(orderId).populate('user', 'name email');
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if order is ready to ship
    console.log(order.status);
    if (order.status !== 'ready_to_ship') {
      return res.status(400).json({
        success: false,
        message: `Cannot ship order. Current status: ${order.status}. Order must be in 'ready_to_ship' status.`
      });
    }

    // Check if Shiprocket order exists
    if (!order.shipping?.shiprocket_order_id) {
      return res.status(400).json({
        success: false,
        message: 'No Shiprocket order found. Please create shipment first.'
      });
    }

    // Request pickup/dispatch from Shiprocket
    let dispatchResult = null;
    if (order.shipping.shipment_id) {
      try {
        console.log('Requesting Shiprocket dispatch for shipment:', order.shipping.shipment_id);
        dispatchResult = await shiprocketService.dispatchShipment(order.shipping.shipment_id);
        console.log('Shiprocket dispatch result:', dispatchResult);
      } catch (dispatchError) {
        console.warn('Shiprocket dispatch failed, but continuing with local update:', dispatchError.message);
        // Continue with local update even if Shiprocket dispatch fails
      }
    }

    // Update order status to shipped
    order.status = 'shipped';
    order.shipping.shippedAt = new Date();
    
    // Add pickup token if available
    if (dispatchResult?.pickup_token_number) {
      order.shipping.pickup_token_number = dispatchResult.pickup_token_number;
    }
    
    // Add tracking entry
    const dispatchMessage = dispatchResult?.success 
      ? `Order shipped via ${order.shipping.courier_name}. Pickup requested. Token: ${dispatchResult.pickup_token_number || 'N/A'}` 
      : notes || `Order marked as shipped locally via ${order.shipping.courier_name}.`;
      
    order.tracking.push({
      status: 'shipped',
      message: dispatchMessage,
      timestamp: new Date(),
      updatedBy: req.user?.id
    });

    await order.save();

    // Send shipped email notification
    // if (order.user?.email) {
    //   await sendOrderShippedEmail(
    //     order.user.email,
    //     order.user.name,
    //     order,
    //     order.shipping.awb_code
    //   );
    // }

    res.status(200).json({
      success: true,
      message: dispatchResult?.success 
        ? 'Order shipped and pickup requested from Shiprocket successfully' 
        : 'Order marked as shipped successfully',
      order: {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        awb_code: order.shipping.awb_code,
        courier_name: order.shipping.courier_name,
        tracking_url: `https://shiprocket.co/tracking/${order.shipping.awb_code}`,
        pickup_token_number: order.shipping.pickup_token_number
      },
      shiprocket_dispatch: dispatchResult ? {
        success: dispatchResult.success,
        pickup_token_number: dispatchResult.pickup_token_number,
        message: dispatchResult.message
      } : null
    });

  } catch (error) {
    console.error('Ship order error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to ship order',
      error: error.message
    });
  }
};

// Auto-create shipment after payment confirmation (called from payment webhook)
exports.autoCreateShipment = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate('user', 'name email');
    console.log(order)
    if (!order) {
      console.error('Order not found for auto-shipment:', orderId);
      return;
    }

    // Check if shipment already exists
    if (order.shipping?.shiprocket_order_id) {
      console.log('Shipment already exists for order:', orderId);
      return;
    }

    // Log current order shipping data for debugging
    console.log('Order shipping before shipment creation:', {
      orderId,
      shipping: order.shipping,
      hasDimensions: !!order.shipping?.dimensions,
      hasWeight: !!order.shipping?.weight
    });
    
    // Create shipment in Shiprocket
    const shipmentResult = await shiprocketService.createOrder(order);
    console.log('Shipment result:', shipmentResult);
    if (shipmentResult.success) {
      // Preserve existing dimensions and weight, or set defaults
      const existingDimensions = order.shipping?.dimensions || {
        length: 10,
        breadth: 10,
        height: 10
      };
      const existingWeight = order.shipping?.weight || 0.5;
      
      console.log('Using dimensions and weight:', {
        dimensions: existingDimensions,
        weight: existingWeight
      });
      
      // Ensure shipping object exists
      if (!order.shipping) {
        order.shipping = {};
      }
      
      // Update order with Shiprocket details - using explicit assignment
      order.shipping.shiprocket_order_id = shipmentResult.shiprocket_order_id;
      order.shipping.shipment_id = shipmentResult.shipment_id;
      order.shipping.awb_code = shipmentResult.awb_code;
      order.shipping.courier_company_id = shipmentResult.courier_company_id;
      order.shipping.courier_name = shipmentResult.courier_name;
      order.shipping.method = 'Shiprocket';
      order.shipping.carrier = shipmentResult.courier_name;
      order.shipping.trackingNumber = shipmentResult.awb_code;
      order.shipping.shippedAt = new Date();
      order.shipping.weight = existingWeight;
      order.shipping.dimensions = existingDimensions;

      // Update order status to ready_to_ship (order created in Shiprocket but not shipped yet)
      order.status = 'ready_to_ship';
      
      // Add tracking entry
      order.tracking.push({
        status: 'ready_to_ship',
        message: `Shiprocket order created via ${shipmentResult.courier_name}. AWB: ${shipmentResult.awb_code}. Ready to ship.`,
        timestamp: new Date(),
        updatedBy: order.user
      });
      console.log(order.shipping)
      await order.save();

      // Send shipped email notification
      if (order.user?.email) {
        await sendOrderShippedEmail(
          order.user.email,
          order.user.name,
          order,
          shipmentResult.awb_code
        );
      }

      console.log('Auto-shipment created successfully for order:', orderId);
    } else {
      console.error('Auto-shipment creation failed for order:', orderId, shipmentResult.error);
    }

  } catch (error) {
    console.error('Auto-create shipment error:', error);
  }
};

// Track shipment
exports.trackShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.shipping?.awb_code) {
      return res.status(400).json({
        success: false,
        message: 'No tracking information available'
      });
    }

    const trackingResult = await shiprocketService.trackShipment(order.shipping.awb_code);
    
    if (trackingResult.success) {
      // Update order status based on tracking data
      const shipmentStatus = trackingResult.shipment_status;
      let orderStatus = order.status;

      // Map Shiprocket status to our order status
      if (shipmentStatus === 'DELIVERED') {
        orderStatus = 'delivered';
        if (!order.deliveredAt) {
          order.deliveredAt = new Date();
          order.shipping.actualDelivery = new Date();
        }
      } else if (shipmentStatus === 'OUT FOR DELIVERY') {
        orderStatus = 'out_for_delivery';
      } else if (shipmentStatus === 'IN TRANSIT') {
        orderStatus = 'shipped';
      }

      // Update order if status changed
      if (orderStatus !== order.status) {
        order.status = orderStatus;
        order.tracking.push({
          status: orderStatus,
          message: trackingResult.current_status,
          timestamp: new Date()
        });
        await order.save();
      }

      res.status(200).json({
        success: true,
        tracking: {
          awb_code: order.shipping.awb_code,
          courier_name: order.shipping.courier_name,
          current_status: trackingResult.current_status,
          shipment_status: trackingResult.shipment_status,
          tracking_data: trackingResult.tracking_data,
          tracking_url: `https://shiprocket.co/tracking/${order.shipping.awb_code}`
        }
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch tracking information',
        error: trackingResult.error
      });
    }

  } catch (error) {
    console.error('Track shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to track shipment',
      error: error.message
    });
  }
};

// Get shipping rates
exports.getShippingRates = async (req, res) => {
  try {
    const { pincode, cod = 0, weight = 0.5 } = req.query;
    
    if (!pincode) {
      return res.status(400).json({
        success: false,
        message: 'Pincode is required'
      });
    }

    const ratesResult = await shiprocketService.getShippingRates(pincode, cod, weight);
    
    if (ratesResult.success) {
      res.status(200).json({
        success: true,
        shipping_rates: ratesResult.rates,
        recommended_courier: ratesResult.recommended_courier,
        available_couriers: ratesResult.available_couriers
      });
    } else {
      res.status(200).json({
        success: false,
        message: ratesResult.message || 'No shipping rates available',
        error: ratesResult.error
      });
    }

  } catch (error) {
    console.error('Get shipping rates error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch shipping rates',
      error: error.message
    });
  }
};

// Cancel shipment
exports.cancelShipment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { reason } = req.body;
    
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.shipping?.awb_code) {
      return res.status(400).json({
        success: false,
        message: 'No shipment found to cancel'
      });
    }

    // Check if order can be cancelled
    if (!order.canBeCancelled()) {
      return res.status(400).json({
        success: false,
        message: 'Order cannot be cancelled at this stage'
      });
    }

    const cancelResult = await shiprocketService.cancelShipment(order.shipping.awb_code);
    
    if (cancelResult.success) {
      // Update order status
      order.status = 'cancelled';
      order.cancelledAt = new Date();
      order.cancellationReason = reason || 'Shipment cancelled';
      
      // Add tracking entry
      order.tracking.push({
        status: 'cancelled',
        message: `Shipment cancelled. Reason: ${reason || 'User requested'}`,
        timestamp: new Date(),
        updatedBy: req.user?.id
      });

      await order.save();

      res.status(200).json({
        success: true,
        message: 'Shipment cancelled successfully'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to cancel shipment',
        error: cancelResult.error
      });
    }

  } catch (error) {
    console.error('Cancel shipment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to cancel shipment',
      error: error.message
    });
  }
};

// Bulk ship orders (admin only)
exports.bulkShipOrders = async (req, res) => {
  try {
    const { orderIds, notes } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs are required'
      });
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

        if (order.status !== 'ready_to_ship') {
          errors.push({ orderId, error: `Cannot ship order with status: ${order.status}` });
          continue;
        }

        if (!order.shipping?.shiprocket_order_id) {
          errors.push({ orderId, error: 'No Shiprocket order found' });
          continue;
        }

        // Update order status to shipped
        order.status = 'shipped';
        order.shipping.shippedAt = new Date();
        
        order.tracking.push({
          status: 'shipped',
          message: notes || `Bulk shipped via ${order.shipping.courier_name}. Package dispatched from warehouse.`,
          timestamp: new Date(),
          updatedBy: req.user?.id
        });

        await order.save();

        // Send shipped email notification
        if (order.user?.email) {
          await sendOrderShippedEmail(
            order.user.email,
            order.user.name,
            order,
            order.shipping.awb_code
          );
        }

        results.push({
          orderId,
          orderNumber: order.orderNumber,
          awb_code: order.shipping.awb_code,
          courier_name: order.shipping.courier_name
        });
        
      } catch (error) {
        errors.push({ orderId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.length} orders shipped successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk ship orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to bulk ship orders',
      error: error.message
    });
  }
};

// Bulk create shipments (admin only)
exports.bulkCreateShipments = async (req, res) => {
  try {
    const { orderIds } = req.body;
    
    if (!orderIds || !Array.isArray(orderIds) || orderIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order IDs are required'
      });
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

        if (order.shipping?.shiprocket_order_id) {
          errors.push({ orderId, error: 'Shipment already exists' });
          continue;
        }

        if (order.payment?.status !== 'completed') {
          errors.push({ orderId, error: 'Payment not completed' });
          continue;
        }

        const shipmentResult = await shiprocketService.createOrder(order);
        
        if (shipmentResult.success) {
          // Preserve existing dimensions and weight, or set defaults
          const existingDimensions = order.shipping?.dimensions || {
            length: 10,
            breadth: 10,
            height: 10
          };
          const existingWeight = order.shipping?.weight || 0.5;
          
          // Ensure shipping object exists
          if (!order.shipping) {
            order.shipping = {};
          }
          
          // Update order with Shiprocket details - using explicit assignment
          order.shipping.shiprocket_order_id = shipmentResult.shiprocket_order_id;
          order.shipping.shipment_id = shipmentResult.shipment_id;
          order.shipping.awb_code = shipmentResult.awb_code;
          order.shipping.courier_company_id = shipmentResult.courier_company_id;
          order.shipping.courier_name = shipmentResult.courier_name;
          order.shipping.method = 'Shiprocket';
          order.shipping.carrier = shipmentResult.courier_name;
          order.shipping.trackingNumber = shipmentResult.awb_code;
          order.shipping.shippedAt = new Date();
          order.shipping.weight = existingWeight;
          order.shipping.dimensions = existingDimensions;

          order.status = 'ready_to_ship';
          
          order.tracking.push({
            status: 'ready_to_ship',
            message: `Bulk Shiprocket order created via ${shipmentResult.courier_name}. AWB: ${shipmentResult.awb_code}. Ready to ship.`,
            timestamp: new Date(),
            updatedBy: req.user?.id
          });

          await order.save();

          // Send shipped email notification
          if (order.user?.email) {
            await sendOrderShippedEmail(
              order.user.email,
              order.user.name,
              order,
              shipmentResult.awb_code
            );
          }

          results.push({
            orderId,
            awb_code: shipmentResult.awb_code,
            courier_name: shipmentResult.courier_name
          });
        } else {
          errors.push({ orderId, error: shipmentResult.error });
        }

      } catch (error) {
        errors.push({ orderId, error: error.message });
      }
    }

    res.status(200).json({
      success: true,
      message: `${results.length} shipments created successfully`,
      results,
      errors: errors.length > 0 ? errors : undefined
    });

  } catch (error) {
    console.error('Bulk create shipments error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create bulk shipments',
      error: error.message
    });
  }
};

// Handle Shiprocket webhook
exports.handleShiprocketWebhook = async (req, res) => {
  try {
    const signature = req.headers['x-shiprocket-signature'];
    const payload = JSON.stringify(req.body);
    
    // Verify webhook signature (you should set SHIPROCKET_WEBHOOK_SECRET in env)
    const webhookSecret = process.env.SHIPROCKET_WEBHOOK_SECRET;
    if (webhookSecret && signature) {
      const isValid = shiprocketService.verifyWebhookSignature(payload, signature, webhookSecret);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid webhook signature' });
      }
    }

    const { awb, current_status, shipment_status } = req.body;
    
    if (!awb) {
      return res.status(400).json({ error: 'AWB code is required' });
    }

    // Find order by AWB code
    const order = await Order.findOne({ 'shipping.awb_code': awb });
    if (!order) {
      console.log('Order not found for AWB:', awb);
      return res.status(404).json({ error: 'Order not found' });
    }

    // Update order status based on webhook data
    let orderStatus = order.status;
    
    if (shipment_status === 'DELIVERED') {
      orderStatus = 'delivered';
      if (!order.deliveredAt) {
        order.deliveredAt = new Date();
        order.shipping.actualDelivery = new Date();
      }
    } else if (shipment_status === 'OUT FOR DELIVERY') {
      orderStatus = 'out_for_delivery';
    } else if (shipment_status === 'IN TRANSIT') {
      orderStatus = 'shipped';
    } else if (shipment_status === 'RETURNED') {
      orderStatus = 'returned';
    }

    // Update order if status changed
    if (orderStatus !== order.status) {
      order.status = orderStatus;
      order.tracking.push({
        status: orderStatus,
        message: current_status || `Status updated via Shiprocket webhook`,
        timestamp: new Date()
      });
      await order.save();
      
      console.log(`Order ${order.orderNumber} status updated to ${orderStatus}`);
    }

    res.status(200).json({ message: 'Webhook processed successfully' });

  } catch (error) {
    console.error('Shiprocket webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
};

// Get pickup locations
exports.getPickupLocations = async (req, res) => {
  try {
    const result = await shiprocketService.getPickupLocations();
    
    if (result.success) {
      res.status(200).json({
        success: true,
        pickup_locations: result.pickup_locations
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to fetch pickup locations',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Get pickup locations error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch pickup locations',
      error: error.message
    });
  }
};

// Create pickup location
exports.createPickupLocation = async (req, res) => {
  try {
    const result = await shiprocketService.createPickupLocation();
    
    if (result.success) {
      res.status(201).json({
        success: true,
        message: result.message,
        pickup_id: result.pickup_id
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Failed to create pickup location',
        error: result.error
      });
    }

  } catch (error) {
    console.error('Create pickup location error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create pickup location',
      error: error.message
    });
  }
};
