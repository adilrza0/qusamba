const express = require('express');
const { 
  placeOrder, 
  getOrders, 
  updateOrderStatus, 
  getAllOrders,
  getOrderById,
  bulkUpdateOrderStatus,
  getShippingStats,
  trackOrder,
  approveOrder,
  bulkApproveOrders,
  getOrdersPendingApproval
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/track/:orderNumber', trackOrder);

// User routes
router.post('/', protect, placeOrder);
router.get('/', protect, getOrders);
router.get('/:orderId', protect, getOrderById); 

// Admin routes
router.get('/admin/all', protect, adminOnly, getAllOrders);
router.get('/admin/stats', protect, adminOnly, getShippingStats);
router.get('/admin/pending-approval', protect, adminOnly, getOrdersPendingApproval);
router.get('/admin/:orderId', protect, adminOnly, getOrderById);
router.patch('/admin/:orderId/status', protect, adminOnly, updateOrderStatus);
router.post('/admin/:orderId/approve', protect, adminOnly, approveOrder);
router.patch('/admin/bulk-update', protect, adminOnly, bulkUpdateOrderStatus);
router.post('/admin/bulk-approve', protect, adminOnly, bulkApproveOrders);

module.exports = router;
