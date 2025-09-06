const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    minlength: 3,
    maxlength: 20,
    match: [/^[A-Z0-9]+$/, 'Coupon code can only contain letters and numbers']
    // unique: true - removed to avoid duplicate index warning, handled in schema.index()
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  discountType: {
    type: String,
    required: true,
    enum: ['percentage', 'fixed'],
    lowercase: true
  },
  discountValue: {
    type: Number,
    required: true,
    min: 0,
    validate: {
      validator: function(value) {
        if (this.discountType === 'percentage') {
          return value > 0 && value <= 100;
        }
        return value > 0;
      },
      message: function() {
        if (this.discountType === 'percentage') {
          return 'Percentage discount must be between 0 and 100';
        }
        return 'Fixed discount must be greater than 0';
      }
    }
  },
  minimumOrderAmount: {
    type: Number,
    default: 0,
    min: 0
  },
  maximumDiscountAmount: {
    type: Number,
    default: null,
    min: 0,
    validate: {
      validator: function(value) {
        // Only validate if value is provided (not null, not undefined, not empty string)
        if (value !== null && value !== undefined && value !== '') {
          return value > 0;
        }
        return true; // Allow null, undefined, or empty values
      },
      message: 'Maximum discount amount must be greater than 0 when specified'
    }
  },
  expirationDate: {
    type: Date,
    required: true,
    validate: {
      validator: function(value) {
        // Allow dates from today onwards (not just future dates)
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Set to start of today
        const expirationDate = new Date(value);
        expirationDate.setHours(0, 0, 0, 0); // Set to start of expiration date
        return expirationDate >= today;
      },
      message: 'Expiration date must be today or in the future'
    }
  },
  usageLimit: {
    type: Number,
    default: null,
    min: 1,
    validate: {
      validator: function(value) {
        return value === null || (Number.isInteger(value) && value > 0);
      },
      message: 'Usage limit must be a positive integer or null for unlimited'
    }
  },
  usedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  issuanceLimit: {
    type: Number,
    default: null,
    min: 1,
    validate: {
      validator: function(value) {
        return value === null || (Number.isInteger(value) && value > 0);
      },
      message: 'Issuance limit must be a positive integer or null for unlimited'
    }
  },
  issuedCount: {
    type: Number,
    default: 0,
    min: 0
  },
  issuedTo: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    issuedAt: {
      type: Date,
      default: Date.now
    },
    issuedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    channel: {
      type: String,
      enum: ['admin', 'auto', 'api', 'promotion', 'referral', 'loyalty'],
      default: 'admin'
    },
    status: {
      type: String,
      enum: ['issued', 'used', 'expired'],
      default: 'issued'
    }
  }],
  userUsageLimit: {
    type: Number,
    default: 1,
    min: 1,
    validate: {
      validator: function(value) {
        return Number.isInteger(value) && value > 0;
      },
      message: 'User usage limit must be a positive integer'
    }
  },
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  excludedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  excludedCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFirstTimeUserOnly: {
    type: Boolean,
    default: false
  },
  allowedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  excludedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  usageHistory: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true
    },
    discountAmount: {
      type: Number,
      required: true,
      min: 0
    },
    usedAt: {
      type: Date,
      default: Date.now
    }
  }],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for efficient queries
couponSchema.index({ code: 1 }, { unique: true });
couponSchema.index({ isActive: 1 });
couponSchema.index({ expirationDate: 1 });
couponSchema.index({ 'usageHistory.user': 1 });
couponSchema.index({ createdAt: -1 });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
  return this.expirationDate && new Date() > this.expirationDate;
});

// Virtual for checking if coupon usage limit is exceeded
couponSchema.virtual('isUsageLimitExceeded').get(function() {
  return this.usageLimit !== null && this.usedCount >= this.usageLimit;
});

// Virtual for remaining uses
couponSchema.virtual('remainingUses').get(function() {
  if (this.usageLimit === null) return null;
  return Math.max(0, this.usageLimit - this.usedCount);
});

// Virtual for checking if issuance limit is exceeded
couponSchema.virtual('isIssuanceLimitExceeded').get(function() {
  return this.issuanceLimit !== null && this.issuedCount >= this.issuanceLimit;
});

// Virtual for remaining issuances
couponSchema.virtual('remainingIssuances').get(function() {
  if (this.issuanceLimit === null) return null;
  return Math.max(0, this.issuanceLimit - this.issuedCount);
});

// Pre-save middleware to update timestamp
couponSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Method to check if coupon is valid
couponSchema.methods.isValid = function() {
  return this.isActive && !this.isExpired && !this.isUsageLimitExceeded;
};

// Method to check if coupon can be issued
couponSchema.methods.canBeIssued = function() {
  return this.isActive && !this.isExpired && !this.isIssuanceLimitExceeded;
};

// Method to issue coupon to a user
couponSchema.methods.issueCoupon = function(userId, issuedBy, channel = 'admin') {
  if (!this.canBeIssued()) {
    throw new Error('Coupon cannot be issued');
  }
  
  // Check if user already has this coupon
  const alreadyIssued = this.issuedTo.some(issue => issue.user.toString() === userId.toString());
  if (alreadyIssued) {
    throw new Error('Coupon already issued to this user');
  }
  
  this.issuedTo.push({
    user: userId,
    issuedBy: issuedBy,
    channel: channel,
    issuedAt: new Date(),
    status: 'issued'
  });
  
  this.issuedCount += 1;
  return this.save();
};

// Method to check if user has been issued this coupon
couponSchema.methods.isIssuedToUser = function(userId) {
  return this.issuedTo.some(issue => 
    issue.user.toString() === userId.toString() && 
    issue.status === 'issued'
  );
};

// Method to check if user can use the coupon
couponSchema.methods.canUserUseCoupon = function(userId) {
  if (!this.isValid()) return { canUse: false, reason: 'Coupon is not valid' };
  
  // Check if coupon has issuance restrictions
  if (this.issuanceLimit !== null && !this.isIssuedToUser(userId)) {
    return { canUse: false, reason: 'This coupon was not issued to you' };
  }
  
  // Check if user is excluded
  if (this.excludedUsers.includes(userId)) {
    return { canUse: false, reason: 'You are not eligible to use this coupon' };
  }
  
  // Check if coupon is restricted to specific users
  if (this.allowedUsers.length > 0 && !this.allowedUsers.includes(userId)) {
    return { canUse: false, reason: 'This coupon is not available for your account' };
  }
  
  // Check user usage limit
  const userUsageCount = this.usageHistory.filter(usage => 
    usage.user.toString() === userId.toString()
  ).length;
  
  if (userUsageCount >= this.userUsageLimit) {
    return { canUse: false, reason: 'You have already used this coupon the maximum number of times' };
  }
  
  return { canUse: true };
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(orderAmount, applicableAmount = orderAmount) {
  if (!this.isValid()) return 0;
  
  // Check minimum order amount
  if (orderAmount < this.minimumOrderAmount) return 0;
  
  let discountAmount = 0;
  
  if (this.discountType === 'percentage') {
    // Calculate percentage discount
    discountAmount = (applicableAmount * this.discountValue) / 100;
    
    // Apply maximum discount cap if set
    if (this.maximumDiscountAmount && discountAmount > this.maximumDiscountAmount) {
      discountAmount = this.maximumDiscountAmount;
    }
  } else if (this.discountType === 'fixed') {
    // For fixed discount, use the discount value but don't exceed the applicable amount
    discountAmount = Math.min(this.discountValue, applicableAmount);
  }
  
  // Ensure discount doesn't exceed the order amount
  discountAmount = Math.min(discountAmount, orderAmount);
  
  return Math.round(discountAmount * 100) / 100; // Round to 2 decimal places
};

// Method to apply coupon to an order
couponSchema.methods.applyCoupon = function(userId, orderId, discountAmount) {
  this.usedCount += 1;
  this.usageHistory.push({
    user: userId,
    order: orderId,
    discountAmount: discountAmount,
    usedAt: new Date()
  });
  return this.save();
};

// Static method to find valid coupons
couponSchema.statics.findValidCoupons = function() {
  return this.find({
    isActive: true,
    expirationDate: { $gt: new Date() },
    $expr: {
      $or: [
        { $eq: ['$usageLimit', null] },
        { $lt: ['$usedCount', '$usageLimit'] }
      ]
    }
  });
};

// Static method to find coupon by code
couponSchema.statics.findByCode = function(code) {
  return this.findOne({ code: code.toUpperCase() });
};

module.exports = mongoose.model('Coupon', couponSchema);