const express = require('express');
const router = express.Router();
const {
  createRazorpayOrder,
  verifyRazorpayPayment,
  handleRazorpayWebhook,
  getRazorpayPaymentDetails,
  refundRazorpayPayment,
  razorpayOrderValidationRules,
  razorpayVerificationValidationRules
} = require('../controllers/razorpayController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public route for Razorpay webhook
router.post('/webhook', express.raw({type: 'application/json'}), handleRazorpayWebhook);

// Protected routes for authenticated users
router.use(protect); // All routes below require authentication

// Create Razorpay order
router.post('/create-order', razorpayOrderValidationRules, createRazorpayOrder);

// Verify Razorpay payment
router.post('/verify-payment', razorpayVerificationValidationRules, verifyRazorpayPayment);

// Get payment details
router.get('/payment/:paymentId', getRazorpayPaymentDetails);

// Admin only routes
router.use(adminOnly); // All routes below require admin access

// Refund payment (admin only)
router.post('/refund/:orderId', refundRazorpayPayment);

module.exports = router;
