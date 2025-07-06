const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const addressSchema = new mongoose.Schema({
  type: { type: String, enum: ['shipping', 'billing'], default: 'shipping' },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  address: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'India' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
});

const cartItemSchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true, min: 1 },
  color: String,
  size: String,
  addedAt: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  phone: String,
  role: { type: String, enum: ['customer', 'admin'], default: 'customer' },
  isActive: { type: Boolean, default: true },
  
  // Cart and Wishlist
  cart: [cartItemSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
  
  // Addresses
  addresses: [addressSchema],
  
  // User preferences
  preferences: {
    currency: { type: String, default: 'INR' },
    language: { type: String, default: 'en' },
    notifications: {
      email: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    }
  },
  
  // Profile information
  avatar: String,
  dateOfBirth: Date,
  gender: { type: String, enum: ['male', 'female', 'other'] },
  
  // Security
  emailVerified: { type: Boolean, default: false },
  phoneVerified: { type: Boolean, default: false },
  lastLogin: Date,
  passwordResetToken: String,
  passwordResetExpires: Date
}, { timestamps: true });

// Password hashing middleware
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Instance methods
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes
  return resetToken;
};

userSchema.methods.getFullName = function () {
  return `${this.firstName} ${this.lastName}`;
};

// Virtual for cart total
userSchema.virtual('cartTotal').get(function () {
  return this.cart.reduce((total, item) => total + (item.quantity * item.product.price), 0);
});

// Indexes for better performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'cart.product': 1 });

module.exports = mongoose.model('User', userSchema);
