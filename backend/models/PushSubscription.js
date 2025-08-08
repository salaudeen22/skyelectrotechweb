const mongoose = require('mongoose');

const pushSubscriptionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  endpoint: {
    type: String,
    required: true
  },
  keys: {
    p256dh: {
      type: String,
      required: true
    },
    auth: {
      type: String,
      required: true
    }
  },
  deviceInfo: {
    userAgent: String,
    platform: String,
    browser: String,
    version: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastUsed: {
    type: Date,
    default: Date.now
  },
  preferences: {
    orderUpdates: { type: Boolean, default: true },
    priceDrops: { type: Boolean, default: true },
    stockAlerts: { type: Boolean, default: true },
    promotional: { type: Boolean, default: true },
    system: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Index for efficient queries
pushSubscriptionSchema.index({ user: 1 });
pushSubscriptionSchema.index({ endpoint: 1 }, { unique: true });
pushSubscriptionSchema.index({ isActive: 1 });

// Method to update last used timestamp
pushSubscriptionSchema.methods.updateLastUsed = async function() {
  this.lastUsed = new Date();
  return await this.save();
};

// Method to deactivate subscription
pushSubscriptionSchema.methods.deactivate = async function() {
  this.isActive = false;
  return await this.save();
};

// Static method to get active subscriptions for a user
pushSubscriptionSchema.statics.getActiveSubscriptions = async function(userId) {
  try {
    return await this.find({ 
      user: userId, 
      isActive: true 
    });
  } catch (error) {
    console.error('Error getting active subscriptions:', error);
    throw error;
  }
};

// Static method to cleanup inactive subscriptions
pushSubscriptionSchema.statics.cleanupInactiveSubscriptions = async function(daysInactive = 30) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
    
    const result = await this.updateMany(
      { 
        lastUsed: { $lt: cutoffDate },
        isActive: true
      },
      { isActive: false }
    );
    
    return result;
  } catch (error) {
    console.error('Error cleaning up inactive subscriptions:', error);
    throw error;
  }
};

module.exports = mongoose.model('PushSubscription', pushSubscriptionSchema);
