const express = require('express');
const {
  getSettings,
  updateSettings,
  updateSetting,
  resetSettings,
  getShippingAutomationStatus,
  toggleShippingAutomation,
  getSettingsSchema
} = require('../controllers/adminSettingsController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(protect);
router.use(adminOnly);

// Settings management routes
router.get('/', getSettings);                              // GET /api/admin/settings
router.put('/', updateSettings);                           // PUT /api/admin/settings
router.patch('/:key', updateSetting);                      // PATCH /api/admin/settings/:key
router.post('/reset', resetSettings);                      // POST /api/admin/settings/reset

// Specific settings routes
router.get('/shipping-automation', getShippingAutomationStatus);     // GET /api/admin/settings/shipping-automation
router.post('/toggle-shipping-automation', toggleShippingAutomation); // POST /api/admin/settings/toggle-shipping-automation

// Documentation route
router.get('/schema', getSettingsSchema);                  // GET /api/admin/settings/schema

module.exports = router;
