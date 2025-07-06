const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: { type: String, required: true }, // Store product name for history
  image: String, // Store primary image for history
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true
  },
  salePrice: Number,
  color: String,
  size: String,
  sku: String,
  subtotal: {
    type: Number,
    required: true
  }
});

const shippingAddressSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  phone: { type: String, required: true }
});

const paymentSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['stripe', 'razorpay', 'paypal', 'cod', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  transactionId: String,
  paymentIntentId: String, // For Stripe
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  paidAt: Date,
  failureReason: String,
  refundAmount: {
    type: Number,
    default: 0
  },
  refundReason: String
});

const trackingSchema = new mongoose.Schema({
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    required: true
  },
  message: String,
  location: String,
  timestamp: {
    type: Date,
    default: Date.now
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
});

const orderSchema = new mongoose.Schema({
  // Order identification
  orderNumber: {
    type: String,
    unique: true,
    required: true
  },
  
  // Customer information
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  guestEmail: String, // For guest checkout
  
  // Order items
  items: [orderItemSchema],
  
  // Pricing breakdown
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  discount: {
    amount: { type: Number, default: 0 },
    couponCode: String,
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Coupon'
    }
  },
  totalAmount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  
  // Order status
  status: {
    type: String,
    enum: ['placed', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned'],
    default: 'placed'
  },
  
  // Addresses
  shippingAddress: {
    type: shippingAddressSchema,
    required: true
  },
  billingAddress: shippingAddressSchema,
  
  // Payment information
  payment: paymentSchema,
  
  // Shipping information
  shipping: {
    method: String,
    carrier: String,
    trackingNumber: String,
    estimatedDelivery: Date,
    actualDelivery: Date,
    shippedAt: Date
  },
  
  // Tracking history
  tracking: [trackingSchema],
  
  // Special instructions
  notes: String,
  adminNotes: String,
  
  // Dates
  placedAt: {
    type: Date,
    default: Date.now
  },
  confirmedAt: Date,
  shippedAt: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  
  // Cancellation/Return
  cancellationReason: String,
  returnReason: String,
  isGift: {
    type: Boolean,
    default: false
  },
  giftMessage: String,
  
  // Admin fields
  lastUpdatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Generate order number before saving
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const count = await this.constructor.countDocuments();
    this.orderNumber = `QUS${Date.now().toString().slice(-6)}${(count + 1).toString().padStart(4, '0')}`;
  }
  next();
});

// Add tracking entry when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.tracking.push({
      status: this.status,
      message: `Order status changed to ${this.status}`,
      timestamp: new Date()
    });
    
    // Update relevant date fields
    switch(this.status) {
      case 'confirmed':
        this.confirmedAt = new Date();
        break;
      case 'shipped':
        this.shippedAt = new Date();
        this.shipping.shippedAt = new Date();
        break;
      case 'delivered':
        this.deliveredAt = new Date();
        this.shipping.actualDelivery = new Date();
        break;
      case 'cancelled':
        this.cancelledAt = new Date();
        break;
    }
  }
  next();
});

// Instance methods
orderSchema.methods.addTrackingUpdate = function(status, message, location, updatedBy) {
  this.tracking.push({
    status,
    message,
    location,
    updatedBy,
    timestamp: new Date()
  });
  return this.save();
};

orderSchema.methods.canBeCancelled = function() {
  return ['placed', 'confirmed', 'processing'].includes(this.status);
};

orderSchema.methods.canBeReturned = function() {
  return this.status === 'delivered' && 
         this.deliveredAt && 
         (Date.now() - this.deliveredAt.getTime()) <= (7 * 24 * 60 * 60 * 1000); // 7 days
};

// Virtual for display status
orderSchema.virtual('displayStatus').get(function() {
  const statusMap = {
    'placed': 'Order Placed',
    'confirmed': 'Order Confirmed',
    'processing': 'Processing',
    'shipped': 'Shipped',
    'out_for_delivery': 'Out for Delivery',
    'delivered': 'Delivered',
    'cancelled': 'Cancelled',
    'returned': 'Returned'
  };
  return statusMap[this.status] || this.status;
});

// Virtual for order age
orderSchema.virtual('orderAge').get(function() {
  return Math.floor((Date.now() - this.placedAt.getTime()) / (1000 * 60 * 60 * 24));
});

// Indexes for better performance
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ placedAt: -1 });
orderSchema.index({ 'payment.status': 1 });
orderSchema.index({ 'shipping.trackingNumber': 1 });

module.exports = mongoose.model('Order', orderSchema);
