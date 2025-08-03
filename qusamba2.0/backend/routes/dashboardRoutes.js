const express = require('express');
const {
  getDashboardStats,
  getSalesAnalytics,
  getInventoryOverview,
  getOrderAnalytics,
  getCustomerAnalytics,
  getRecentActivities
} = require('../controllers/dashboardController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication and admin authorization to all routes
router.use(protect);
router.use(adminOnly);

// Dashboard routes
router.get('/stats', getDashboardStats);
router.get('/sales', getSalesAnalytics);
router.get('/inventory', getInventoryOverview);
router.get('/orders', getOrderAnalytics);
router.get('/customers', getCustomerAnalytics);
router.get('/activities', getRecentActivities);

module.exports = router;
