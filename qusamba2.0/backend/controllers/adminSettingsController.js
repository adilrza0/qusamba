const AdminSettings = require('../models/AdminSettings');

// @desc    Get admin settings
// @route   GET /api/admin/settings
// @access  Private/Admin
exports.getSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch settings',
      error: error.message
    });
  }
};

// @desc    Update admin settings
// @route   PUT /api/admin/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // List of allowed settings to update
    const allowedSettings = [
      'autoCreateShipment',
      'requireOrderApproval',
      'sendOrderConfirmationEmail',
      'sendShipmentNotificationEmail',
      'defaultOrderStatus',
      'autoConfirmOrders',
      'autoReduceStock',
      'reduceStockOn',
      'shiprocketAutoPickup',
      'defaultShipmentWeight',
      'businessName',
      'supportEmail',
      'enableWebhooks',
      'webhookRetryAttempts'
    ];
    
    // Update settings
    let updated = false;
    for (const key in req.body) {
      if (allowedSettings.includes(key)) {
        settings[key] = req.body[key];
        updated = true;
      }
    }
    
    // Handle nested adminNotifications updates
    if (req.body.adminNotifications) {
      const notifications = req.body.adminNotifications;
      for (const notifKey in notifications) {
        if (settings.adminNotifications[notifKey] !== undefined) {
          settings.adminNotifications[notifKey] = notifications[notifKey];
          updated = true;
        }
      }
    }
    
    if (updated) {
      settings.lastUpdatedBy = req.user.id;
      await settings.save();
    }
    
    res.status(200).json({
      success: true,
      message: 'Settings updated successfully',
      data: settings
    });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update settings',
      error: error.message
    });
  }
};

// @desc    Update specific setting
// @route   PATCH /api/admin/settings/:key
// @access  Private/Admin
exports.updateSetting = async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    const settings = await AdminSettings.getSettings();
    await settings.updateSetting(key, value, req.user.id);
    
    res.status(200).json({
      success: true,
      message: `Setting '${key}' updated successfully`,
      data: {
        [key]: value,
        updatedAt: settings.updatedAt
      }
    });
  } catch (error) {
    console.error('Update setting error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update setting',
      error: error.message
    });
  }
};

// @desc    Reset settings to default
// @route   POST /api/admin/settings/reset
// @access  Private/Admin
exports.resetSettings = async (req, res) => {
  try {
    // Delete existing settings
    await AdminSettings.deleteMany({});
    
    // Create new default settings
    const settings = await AdminSettings.create({
      lastUpdatedBy: req.user.id
    });
    
    res.status(200).json({
      success: true,
      message: 'Settings reset to default values',
      data: settings
    });
  } catch (error) {
    console.error('Reset settings error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reset settings',
      error: error.message
    });
  }
};

// @desc    Get shipping automation status
// @route   GET /api/admin/settings/shipping-automation
// @access  Private/Admin
exports.getShippingAutomationStatus = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    res.status(200).json({
      success: true,
      data: {
        autoCreateShipment: settings.autoCreateShipment,
        requireOrderApproval: settings.requireOrderApproval,
        isAutomationEnabled: settings.isShipmentAutomationEnabled,
        description: settings.isShipmentAutomationEnabled 
          ? 'Shipments are created automatically after payment'
          : 'Shipments require manual admin approval'
      }
    });
  } catch (error) {
    console.error('Get shipping automation status error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get shipping automation status',
      error: error.message
    });
  }
};

// @desc    Toggle shipping automation
// @route   POST /api/admin/settings/toggle-shipping-automation
// @access  Private/Admin
exports.toggleShippingAutomation = async (req, res) => {
  try {
    const settings = await AdminSettings.getSettings();
    
    // Toggle the automation
    const newAutomationState = !settings.isShipmentAutomationEnabled;
    
    settings.autoCreateShipment = newAutomationState;
    settings.requireOrderApproval = !newAutomationState;
    settings.lastUpdatedBy = req.user.id;
    
    await settings.save();
    
    res.status(200).json({
      success: true,
      message: `Shipping automation ${newAutomationState ? 'enabled' : 'disabled'}`,
      data: {
        autoCreateShipment: settings.autoCreateShipment,
        requireOrderApproval: settings.requireOrderApproval,
        isAutomationEnabled: settings.isShipmentAutomationEnabled,
        description: settings.isShipmentAutomationEnabled 
          ? 'Shipments will be created automatically after payment'
          : 'Shipments will require manual admin approval'
      }
    });
  } catch (error) {
    console.error('Toggle shipping automation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle shipping automation',
      error: error.message
    });
  }
};

// @desc    Get settings schema/documentation
// @route   GET /api/admin/settings/schema
// @access  Private/Admin
exports.getSettingsSchema = async (req, res) => {
  try {
    const schema = {
      shippingSettings: {
        autoCreateShipment: {
          type: 'boolean',
          default: false,
          description: 'Automatically create Shiprocket shipment after payment confirmation'
        },
        requireOrderApproval: {
          type: 'boolean',
          default: true,
          description: 'Require admin approval before creating shipments'
        },
        shiprocketAutoPickup: {
          type: 'boolean',
          default: true,
          description: 'Automatically schedule pickup with Shiprocket'
        },
        defaultShipmentWeight: {
          type: 'number',
          default: 0.5,
          description: 'Default weight for shipments (in kg)'
        }
      },
      emailSettings: {
        sendOrderConfirmationEmail: {
          type: 'boolean',
          default: true,
          description: 'Send order confirmation emails to customers'
        },
        sendShipmentNotificationEmail: {
          type: 'boolean',
          default: true,
          description: 'Send shipment notification emails to customers'
        }
      },
      orderSettings: {
        defaultOrderStatus: {
          type: 'string',
          enum: ['placed', 'confirmed', 'processing'],
          default: 'placed',
          description: 'Default status for new orders after payment'
        },
        autoConfirmOrders: {
          type: 'boolean',
          default: true,
          description: 'Automatically confirm orders after payment'
        }
      },
      inventorySettings: {
        autoReduceStock: {
          type: 'boolean',
          default: true,
          description: 'Automatically reduce product stock after payment'
        },
        reduceStockOn: {
          type: 'string',
          enum: ['payment', 'shipment', 'approval'],
          default: 'payment',
          description: 'When to reduce product stock'
        }
      }
    };
    
    res.status(200).json({
      success: true,
      data: schema
    });
  } catch (error) {
    console.error('Get settings schema error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get settings schema',
      error: error.message
    });
  }
};
