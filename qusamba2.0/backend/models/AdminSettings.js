const mongoose = require('mongoose');

const adminSettingsSchema = new mongoose.Schema({
  // Shipping Settings
  autoCreateShipment: {
    type: Boolean,
    default: false, // Changed to false so admin approval is required by default
    description: 'Automatically create Shiprocket shipment after payment confirmation'
  },
  requireOrderApproval: {
    type: Boolean,
    default: true, // Require admin approval before shipping
    description: 'Require admin approval before creating shipments'
  },
  
  // Email Settings
  sendOrderConfirmationEmail: {
    type: Boolean,
    default: true,
    description: 'Send order confirmation emails to customers'
  },
  sendShipmentNotificationEmail: {
    type: Boolean,
    default: true,
    description: 'Send shipment notification emails to customers'
  },
  
  // Order Settings
  defaultOrderStatus: {
    type: String,
    enum: ['placed', 'confirmed', 'processing'],
    default: 'placed',
    description: 'Default status for new orders after payment'
  },
  autoConfirmOrders: {
    type: Boolean,
    default: true,
    description: 'Automatically confirm orders after payment'
  },
  
  // Inventory Settings
  autoReduceStock: {
    type: Boolean,
    default: true,
    description: 'Automatically reduce product stock after payment'
  },
  reduceStockOn: {
    type: String,
    enum: ['payment', 'shipment', 'approval'],
    default: 'payment',
    description: 'When to reduce product stock'
  },
  
  // Shiprocket Settings
  shiprocketAutoPickup: {
    type: Boolean,
    default: true,
    description: 'Automatically schedule pickup with Shiprocket'
  },
  defaultShipmentWeight: {
    type: Number,
    default: 0.5,
    description: 'Default weight for shipments (in kg)'
  },
  
  // Business Settings
  businessName: {
    type: String,
    default: 'Qusamba Creations',
    description: 'Business name for shipping labels'
  },
  supportEmail: {
    type: String,
    default: 'support@qusamba.com',
    description: 'Support email for customer communications'
  },
  
  // Notification Settings
  adminNotifications: {
    newOrder: {
      type: Boolean,
      default: true,
      description: 'Notify admin of new orders'
    },
    paymentReceived: {
      type: Boolean,
      default: true,
      description: 'Notify admin when payment is received'
    },
    lowStock: {
      type: Boolean,
      default: true,
      description: 'Notify admin when product stock is low'
    },
    shipmentCreated: {
      type: Boolean,
      default: false,
      description: 'Notify admin when shipment is created'
    }
  },
  
  // Advanced Settings
  enableWebhooks: {
    type: Boolean,
    default: true,
    description: 'Enable webhook processing'
  },
  webhookRetryAttempts: {
    type: Number,
    default: 3,
    description: 'Number of webhook retry attempts'
  },
  
  // Timestamps
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { 
  timestamps: true,
  // Ensure only one settings document exists
  collection: 'admin_settings'
});

// Static method to get settings (creates default if doesn't exist)
adminSettingsSchema.statics.getSettings = async function() {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

// Instance method to update specific setting
adminSettingsSchema.methods.updateSetting = async function(key, value, updatedBy) {
  // Handle nested properties like 'adminNotifications.newOrder'
  if (key.includes('.')) {
    const keys = key.split('.');
    let current = this;
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) current[keys[i]] = {};
      current = current[keys[i]];
    }
    current[keys[keys.length - 1]] = value;
  } else {
    this[key] = value;
  }
  
  this.lastUpdatedBy = updatedBy;
  return await this.save();
};

// Virtual for easy access to shipping automation status
adminSettingsSchema.virtual('isShipmentAutomationEnabled').get(function() {
  return this.autoCreateShipment && !this.requireOrderApproval;
});

// Index for faster queries
adminSettingsSchema.index({ createdAt: 1 });

module.exports = mongoose.model('AdminSettings', adminSettingsSchema);
