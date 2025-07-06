const express = require('express');
const { placeOrder, getOrders, updateOrderStatus, getAllOrders } = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// User routes
router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.patch('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;
