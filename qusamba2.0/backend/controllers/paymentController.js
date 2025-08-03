const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');
const Product = require('../models/Product');
const AdminSettings = require('../models/AdminSettings');
const { validationResult } = require('express-validator');
const { body } = require('express-validator');
const { sendPaymentConfirmationEmail } = require('../utils/email');
const { autoCreateShipment } = require('./shippingController');

// Create Payment Intent
exports.createPaymentIntent = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { amount, currency = 'usd', orderId } = req.body;

    // Verify order exists and belongs to user
    const order = await Order.findById(orderId).populate('user');
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (order.user._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      metadata: {
        orderId: orderId,
        userId: req.user.id,
        customerEmail: req.user.email
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    // Update order with payment intent ID
    order.paymentIntentId = paymentIntent.id;
    order.paymentStatus = 'pending';
    await order.save();

    res.status(200).json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (error) {
    console.error('Payment Intent Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment processing failed',
      error: error.message
    });
  }
};

// Confirm Payment
exports.confirmPayment = async (req, res) => {
  try {
    const { paymentIntentId } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update order status
      const order = await Order.findOne({ paymentIntentId });
      if (order) {
        order.paymentStatus = 'completed';
        order.status = 'confirmed';
        order.paidAt = new Date();
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
          // Don't fail the payment confirmation if email fails
        }

        // Check admin settings before auto-creating shipment
        try {
          const settings = await AdminSettings.getSettings();
          if (settings.autoCreateShipment && !settings.requireOrderApproval) {
            await autoCreateShipment(order._id);
            console.log(`Auto-shipment created for order ${order._id} (automation enabled)`);
          } else {
            console.log(`Shipment creation skipped for order ${order._id} (requires admin approval)`);
          }
        } catch (shipmentError) {
          console.error('Auto-shipment creation failed:', shipmentError);
          // Don't fail the payment confirmation if shipment creation fails
        }

        res.status(200).json({
          success: true,
          message: 'Payment confirmed successfully',
          order
        });
      } else {
        res.status(404).json({
          success: false,
          message: 'Order not found'
        });
      }
    } else {
      res.status(400).json({
        success: false,
        message: 'Payment not completed',
        status: paymentIntent.status
      });
    }

  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Payment confirmation failed',
      error: error.message
    });
  }
};

// Handle Stripe Webhook
exports.handleStripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      await handlePaymentSuccess(paymentIntent);
      break;
    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      await handlePaymentFailure(failedPayment);
      break;
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

// Helper function to handle successful payment
const handlePaymentSuccess = async (paymentIntent) => {
  try {
    const order = await Order.findOne({ 
      paymentIntentId: paymentIntent.id 
    }).populate('user');

    if (order) {
      order.paymentStatus = 'completed';
      order.status = 'confirmed';
      order.paidAt = new Date();
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
        console.log(`Payment confirmation email sent to ${order.user.email} via webhook`);
      } catch (emailError) {
        console.error('Payment confirmation email failed in webhook:', emailError);
      }

      // Check admin settings before auto-creating shipment
      try {
        const settings = await AdminSettings.getSettings();
        if (settings.autoCreateShipment && !settings.requireOrderApproval) {
          await autoCreateShipment(order._id);
          console.log(`Auto-shipment created for order ${order._id} via webhook (automation enabled)`);
        } else {
          console.log(`Shipment creation skipped for order ${order._id} via webhook (requires admin approval)`);
        }
      } catch (shipmentError) {
        console.error('Auto-shipment creation failed in webhook:', shipmentError);
      }

      console.log(`Payment succeeded for order ${order._id}`);
    }
  } catch (error) {
    console.error('Error handling payment success:', error);
  }
};

// Helper function to handle failed payment
const handlePaymentFailure = async (paymentIntent) => {
  try {
    const order = await Order.findOne({ 
      paymentIntentId: paymentIntent.id 
    });

    if (order) {
      order.paymentStatus = 'failed';
      order.status = 'cancelled';
      await order.save();

      console.log(`Payment failed for order ${order._id}`);
    }
  } catch (error) {
    console.error('Error handling payment failure:', error);
  }
};

// Get Payment History
exports.getPaymentHistory = async (req, res) => {
  try {
    const orders = await Order.find({ 
      user: req.user.id,
      paymentStatus: { $in: ['completed', 'failed'] }
    })
    .populate('items.product', 'name price images')
    .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });

  } catch (error) {
    console.error('Get Payment History Error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch payment history',
      error: error.message
    });
  }
};

// Refund Payment
exports.refundPayment = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { amount, reason } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    if (!order.paymentIntentId) {
      return res.status(400).json({
        success: false,
        message: 'No payment found for this order'
      });
    }

    // Create refund in Stripe
    const refund = await stripe.refunds.create({
      payment_intent: order.paymentIntentId,
      amount: amount ? Math.round(amount * 100) : undefined, // Partial or full refund
      reason: reason || 'requested_by_customer'
    });

    // Update order status
    order.paymentStatus = 'refunded';
    order.status = 'refunded';
    order.refundId = refund.id;
    order.refundedAt = new Date();
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

// Validation rules
exports.paymentValidationRules = [
  body('amount')
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('orderId')
    .isMongoId()
    .withMessage('Invalid order ID'),
  body('currency')
    .optional()
    .isIn(['usd', 'eur', 'gbp'])
    .withMessage('Invalid currency')
];

exports.refundValidationRules = [
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Amount must be a number')
    .isFloat({ min: 0.01 })
    .withMessage('Amount must be greater than 0'),
  body('reason')
    .optional()
    .isString()
    .withMessage('Reason must be a string')
];
