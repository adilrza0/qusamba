const Razorpay = require('razorpay');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const { sendPaymentConfirmationEmail } = require('../utils/email');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Create Razorpay Order
exports.createRazorpayOrder = async (req, res) => {
    console.log('Creating Razorpay order with body:', req.body);
    console.log('Environment - RAZORPAY_KEY_ID:', process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not Set');
    console.log('Environment - RAZORPAY_KEY_SECRET:', process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not Set');
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { amount, currency = 'INR', orderId, shippingAddress, items, subtotal, shippingCost, tax } = req.body;
    
    let order;
    
    // If orderId is not provided or is the placeholder, create a new order
    if (!orderId) {
      // Save shipping address to user's addresses if it's new
      if (shippingAddress && !shippingAddress._id) {
        const User = require('../models/User');
        const user = await User.findById(req.user.id);
        if (user) {
          user.addresses.push(shippingAddress);
          await user.save();
        }
      }
      
      // Create new order
      // Validate items array
      if (!items || items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Order must contain at least one item'
        });
      }

      // Transform frontend cart structure to backend order item structure
      const transformedItems = items.map(item => {
        console.log('Processing item:', item);
        
        // Validate required fields
        if (!item.id) {
          throw new Error(`Item is missing product ID: ${JSON.stringify(item)}`);
        }
        if (!mongoose.Types.ObjectId.isValid(item.id)) {
          throw new Error(`Item has invalid product ID: ${item.id}`);
        }
        if (!item.name) {
          throw new Error(`Item is missing name: ${JSON.stringify(item)}`);
        }
        if (!item.price || item.price <= 0) {
          throw new Error(`Item has invalid price: ${JSON.stringify(item)}`);
        }
        if (!item.quantity || item.quantity <= 0) {
          throw new Error(`Item has invalid quantity: ${JSON.stringify(item)}`);
        }
        
        return {
          product: item.id,
          name: item.name,
          image: item.images ? (Array.isArray(item.images) ? item.images[0] : item.images) : null,
          quantity: item.quantity,
          price: item.price,
          subtotal: item.price * item.quantity,
          color: item.color || null,
          size: item.size || null
        };
      });

      console.log('Transformed items:', transformedItems);
      console.log('Order data:', {
        user: req.user.id,
        items: transformedItems,
        subtotal: subtotal || amount,
        shippingCost: shippingCost || 0,
        tax: tax || 0,
        totalAmount: amount,
        currency,
        shippingAddress
      });

      // Create the new order with required fields
      order = await Order.create({
        user: req.user.id,
        items: transformedItems,
        subtotal: subtotal || amount,
        shippingCost: shippingCost || 0,
        tax: tax || 0,
        totalAmount: amount,
        currency,
        shippingAddress,
        payment: {
          method: 'razorpay',
          status: 'pending',
          amount: amount,
          currency
        }
      });
    } else {
      // Use existing order
      order = await Order.findById(orderId).populate('user');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    }

    // Verify order belongs to user
    if (order.user._id ? order.user._id.toString() !== req.user.id : order.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Create Razorpay order
    const razorpayOrderOptions = {
      amount: Math.round(amount * 100), // Convert to paise (smallest currency unit)
      currency: currency,
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user.id,
        customerEmail: req.user.email
      }
    };

    console.log('Razorpay order options:', razorpayOrderOptions);
    const razorpayOrder = await razorpay.orders.create(razorpayOrderOptions);
    console.log('Razorpay order created:', razorpayOrder);

    // Update order with Razorpay order ID
    order.payment.razorpayOrderId = razorpayOrder.id;
    order.payment.status = 'pending';
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        currency: razorpayOrder.currency,
        amount: razorpayOrder.amount,
      },
      key: process.env.RAZORPAY_KEY_ID,
      orderId: order._id.toString(),
      userDetails: {
        name: req.user.name,
        email: req.user.email,
        contact: req.user.phone || ''
      }
    });

  } catch (error) {
    console.error('Razorpay Order Creation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

// Verify Razorpay Payment
exports.verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Create signature for verification
    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      // Find and update the order
      const order = await Order.findById(orderId).populate('user', 'name email');
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }

      // Update order with payment details
      order.payment.razorpayPaymentId = razorpay_payment_id;
      order.payment.razorpaySignature = razorpay_signature;
      order.payment.status = 'completed';
      order.payment.paidAt = new Date();
      order.status = 'confirmed';
      await order.save();

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }

      // Send payment confirmation email
      try {
        await sendPaymentConfirmationEmail(
          order.user.email,
          order.user.name,
          order
        );
        console.log(`Payment confirmation email sent to ${order.user.email}`);
      } catch (emailError) {
        console.error('Payment confirmation email failed:', emailError);
        // Don't fail the payment verification if email fails
      }

      res.status(200).json({
        success: true,
        message: 'Payment verified successfully',
        paymentId: order.payment.razorpayPaymentId,
        order: {
          _id: order._id,
          orderNumber: order.orderNumber,
          totalAmount: order.totalAmount,
          status: order.status,
          payment: {
            status: order.payment.status,
            paidAt: order.payment.paidAt,
            razorpayPaymentId: order.payment.razorpayPaymentId
          },
          user: {
            name: order.user.name,
            email: order.user.email
          },
          createdAt: order.createdAt
        }
      });

    } else {
      // Payment verification failed
      const order = await Order.findById(orderId);
      if (order) {
        order.payment.status = 'failed';
        order.status = 'cancelled';
        await order.save();
      }

      res.status(400).json({
        success: false,
        message: 'Payment verification failed'
      });
    }

  } catch (error) {
    console.error('Payment Verification Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment verification failed',
      error: error.message
    });
  }
};

// Handle Razorpay Webhook
exports.handleRazorpayWebhook = async (req, res) => {
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookBody = JSON.stringify(req.body);

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET)
      .update(webhookBody)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      });
    }

    const event = req.body.event;
    const paymentEntity = req.body.payload.payment.entity;

    switch (event) {
      case 'payment.captured':
        await handlePaymentCaptured(paymentEntity);
        break;
      case 'payment.failed':
        await handlePaymentFailed(paymentEntity);
        break;
      default:
        console.log(`Unhandled webhook event: ${event}`);
    }

    res.status(200).json({ success: true });

  } catch (error) {
    console.error('Webhook Error:', error);
    res.status(500).json({
      success: false,
      message: 'Webhook processing failed',
      error: error.message
    });
  }
};

// Helper function to handle payment captured
const handlePaymentCaptured = async (paymentEntity) => {
  try {
    const order = await Order.findOne({ 
      'payment.razorpayOrderId': paymentEntity.order_id 
    }).populate('user');

    if (order && order.payment.status !== 'completed') {
      order.payment.razorpayPaymentId = paymentEntity.id;
      order.payment.status = 'completed';
      order.status = 'confirmed';
      order.payment.paidAt = new Date();
      await order.save();

      // Update product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(
          item.product,
          { $inc: { stock: -item.quantity } }
        );
      }

      // Send payment confirmation email
      try {
        await sendPaymentConfirmationEmail(
          order.user.email,
          order.user.name,
          order
        );
        console.log(`Payment confirmation email sent to ${order.user.email} for order ${order._id}`);
      } catch (emailError) {
        console.error('Payment confirmation email failed for webhook:', emailError);
      }

      console.log(`Payment captured for order ${order._id}`);
    }
  } catch (error) {
    console.error('Error handling payment captured:', error);
  }
};

// Helper function to handle payment failed
const handlePaymentFailed = async (paymentEntity) => {
  try {
    const order = await Order.findOne({ 
      'payment.razorpayOrderId': paymentEntity.order_id 
    });

    if (order) {
      order.payment.status = 'failed';
      order.status = 'cancelled';
      await order.save();

      console.log(`Payment failed for order ${order._id}`);
    }
  } catch (error) {
    console.error('Error handling payment failed:', error);
  }
};

// Get Razorpay Payment Details
exports.getRazorpayPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;

    const payment = await razorpay.payments.fetch(paymentId);

    res.status(200).json({
      success: true,
      payment
    });

  } catch (error) {
    console.error('Get Payment Details Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment details',
      error: error.message
    });
  }
};

// Refund Razorpay Payment
exports.refundRazorpayPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, notes = {} } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.payment.razorpayPaymentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this order'
      });
    }

    // Create refund
    const refundOptions = {
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      notes: {
        ...notes,
        orderId: orderId,
        refund_reason: notes.reason || 'requested_by_customer'
      }
    };

    const refund = await razorpay.payments.refund(order.payment.razorpayPaymentId, refundOptions);

    // Update order status
    order.payment.status = 'refunded';
    order.status = 'refunded';
    order.payment.refundId = refund.id;
    order.payment.refundedAt = new Date();
    await order.save();

    res.status(200).json({
      success: true,
      message: 'Refund processed successfully',
      refund: {
        id: refund.id,
        amount: refund.amount / 100,
        status: refund.status
      }
    });

  } catch (error) {
    console.error('Refund Error:', error);
    res.status(500).json({
      success: false,
      message: 'Refund processing failed',
      error: error.message
    });
  }
};

// Validation rules for Razorpay
exports.razorpayOrderValidationRules = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD', 'EUR', 'GBP'])
    .withMessage('Invalid currency')
];

exports.razorpayVerificationValidationRules = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID')
];
