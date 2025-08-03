const User = require('../models/User');
const { validationResult, body } = require('express-validator');

// Validation rules for addresses
exports.addressValidationRules = [
  body('firstName').notEmpty().withMessage('First name is required'),
  body('lastName').notEmpty().withMessage('Last name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('city').notEmpty().withMessage('City is required'),
  body('state').notEmpty().withMessage('State is required'),
  body('zipCode').notEmpty().withMessage('ZIP code is required'),
  body('country').notEmpty().withMessage('Country is required'),
  body('phone').notEmpty().withMessage('Phone number is required'),
];

// Get all addresses for the authenticated user
exports.getAddresses = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('addresses');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.status(200).json({ success: true, addresses: user.addresses });
  } catch (error) {
    console.error('Error fetching addresses:', error);
    res.status(500).json({ success: false, message: 'Could not fetch addresses' });
  }
};

// Add a new address to the user's account
exports.addAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const newAddress = req.body;
    user.addresses.push(newAddress);
    await user.save();

    res.status(201).json({ success: true, message: 'Address added successfully', addresses: user.addresses });
  } catch (error) {
    console.error('Error adding address:', error);
    res.status(500).json({ success: false, message: 'Could not add address' });
  }
};

// Update an existing address
exports.updateAddress = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }

  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === req.params.addressId);

    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses[addressIndex] = { ...user.addresses[addressIndex], ...req.body };
    await user.save();

    res.status(200).json({ success: true, message: 'Address updated successfully', addresses: user.addresses });
  } catch (error) {
    console.error('Error updating address:', error);
    res.status(500).json({ success: false, message: 'Could not update address' });
  }
};

// Delete an address
exports.deleteAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === req.params.addressId);

    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses.splice(addressIndex, 1);
    await user.save();

    res.status(200).json({ success: true, message: 'Address deleted successfully', addresses: user.addresses });
  } catch (error) {
    console.error('Error deleting address:', error);
    res.status(500).json({ success: false, message: 'Could not delete address' });
  }
};

// Set an address as default
exports.setDefaultAddress = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const addressIndex = user.addresses.findIndex((addr) => addr._id.toString() === req.params.addressId);

    if (addressIndex === -1) {
      return res.status(404).json({ success: false, message: 'Address not found' });
    }

    user.addresses.forEach((addr, index) => {
      user.addresses[index].isDefault = false;
    });

    user.addresses[addressIndex].isDefault = true;
    await user.save();

    res.status(200).json({ success: true, message: 'Default address set successfully', addresses: user.addresses });
  } catch (error) {
    console.error('Error setting default address:', error);
    res.status(500).json({ success: false, message: 'Could not set default address' });
  }
};

