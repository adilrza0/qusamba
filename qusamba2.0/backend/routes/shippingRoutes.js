const express = require('express');
const router = express.Router();
const {
  createShipment,
  shipOrder,
  trackShipment,
  getShippingRates,
  cancelShipment,
  bulkCreateShipments,
  bulkShipOrders,
  handleShiprocketWebhook,
  getPickupLocations,
  createPickupLocation
} = require('../controllers/shippingController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

// Public routes
router.get('/rates', getShippingRates); // Get shipping rates by pincode
router.post('/webhook', handleShiprocketWebhook); // Shiprocket webhook

// Protected routes (user must be logged in)
router.use(protect);

// User routes
router.post('/create/:orderId', createShipment); // Create shipment for specific order
router.get('/track/:orderId', trackShipment); // Track shipment by order ID
router.post('/cancel/:orderId', cancelShipment); // Cancel shipment

// Admin routes
router.use(adminOnly);

router.post('/bulk-create', bulkCreateShipments); // Bulk create shipments
router.post('/ship/:orderId', shipOrder); // Mark order as shipped
router.post('/bulk-ship', bulkShipOrders); // Bulk ship orders
router.get('/pickup-locations', getPickupLocations); // Get pickup locations
router.post('/pickup-location', createPickupLocation); // Create pickup location

module.exports = router;
