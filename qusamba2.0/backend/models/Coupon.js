const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  
  // Discount details
  discountType: {
    type: String,
    enum: ['percentage', 'fixed'],
    required: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0
  },
  maxDiscount: {
    type: Number, // For percentage coupons
    min: 0
  },
  
  // Usage limits
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumOrderAmount: {
    type: Number,
    min: 0
  },
  usageLimit: {
    type: Number,
    default: null // null means unlimited
  },
  usageLimitPerUser: {
    type: Number,
    default: 1
  },
  currentUsage: {
    type: Number,
    default: 0
  },
  
  // Validity
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  
  // Restrictions
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  
  // User restrictions
  applicableUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }], // Empty means all users
  firstTimeUsersOnly: {
    type: Boolean,
    default: false
  },
  
  // Status
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Usage tracking
  usedBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    usedAt: {
      type: Date,
      default: Date.now
    },
    discountAmount: Number
  }],
  
  // Admin fields
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastModifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

// Validation for discount value
couponSchema.pre('validate', function(next) {
  if (this.discountType === 'percentage' && this.discountValue > 100) {
    return next(new Error('Percentage discount cannot be more than 100%'));
  }
  if (this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  next();
});

// Instance methods
couponSchema.methods.isValid = function() {
  const now = new Date();
  return this.isActive && 
         now >= this.startDate && 
         now <= this.endDate &&
         (!this.usageLimit || this.currentUsage < this.usageLimit);
};

couponSchema.methods.canBeUsedBy = function(userId, orderTotal) {
  if (!this.isValid()) return false;
  
  // Check minimum order amount
  if (orderTotal < this.minimumOrderAmount) return false;
  
  // Check maximum order amount
  if (this.maximumOrderAmount && orderTotal > this.maximumOrderAmount) return false;
  
  // Check if user-specific
  if (this.applicableUsers.length > 0 && !this.applicableUsers.includes(userId)) {
    return false;
  }
  
  // Check usage limit per user
  const userUsage = this.usedBy.filter(usage => 
    usage.user.toString() === userId.toString()).length;
  
  if (userUsage >= this.usageLimitPerUser) return false;
  
  return true;
};

couponSchema.methods.calculateDiscount = function(orderTotal) {
  if (this.discountType === 'percentage') {
    const discount = (orderTotal * this.discountValue) / 100;
    return this.maxDiscount ? Math.min(discount, this.maxDiscount) : discount;
  } else {
    return Math.min(this.discountValue, orderTotal);
  }
};

couponSchema.methods.markAsUsed = function(userId, orderId, discountAmount) {
  this.usedBy.push({
    user: userId,
    order: orderId,
    discountAmount,
    usedAt: new Date()
  });
  this.currentUsage += 1;
  return this.save();
};

// Virtual for remaining usage
couponSchema.virtual('remainingUsage').get(function() {
  if (!this.usageLimit) return null;
  return Math.max(0, this.usageLimit - this.currentUsage);
});

// Virtual for usage percentage
couponSchema.virtual('usagePercentage').get(function() {
  if (!this.usageLimit) return null;
  return Math.round((this.currentUsage / this.usageLimit) * 100);
});

// Indexes
couponSchema.index({ code: 1 });
couponSchema.index({ isActive: 1 });
couponSchema.index({ startDate: 1, endDate: 1 });
couponSchema.index({ createdBy: 1 });

module.exports = mongoose.model('Coupon', couponSchema);
