const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
  addressValidationRules
} = require('../controllers/addressController');

// All routes require authentication
router.use(protect);

// Get all addresses for the authenticated user
router.get('/', getAddresses);

// Add a new address
router.post('/', addressValidationRules, addAddress);

// Update an existing address
router.put('/:addressId', addressValidationRules, updateAddress);

// Delete an address
router.delete('/:addressId', deleteAddress);

// Set default address
router.patch('/:addressId/default', setDefaultAddress);

module.exports = router;
