const express = require('express');
const router = express.Router();
const {
  createPaymentIntent,
  confirmPayment,
  handleStripeWebhook,
  getPaymentHistory,
  refundPayment,
  paymentValidationRules,
  refundValidationRules
} = require('../controllers/paymentController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route for Stripe webhook (must be raw body)
router.post('/webhook', express.raw({type: 'application/json'}), handleStripeWebhook);

// Protected routes for authenticated users
router.use(protect); // All routes below require authentication

// Create payment intent
router.post('/create-payment-intent', paymentValidationRules, createPaymentIntent);

// Confirm payment
router.post('/confirm-payment', confirmPayment);

// Get payment history for user
router.get('/history', getPaymentHistory);

// Admin only routes
router.use(adminOnly); // All routes below require admin access

// Refund payment (admin only)
router.post('/refund/:orderId', refundValidationRules, refundPayment);

module.exports = router;
