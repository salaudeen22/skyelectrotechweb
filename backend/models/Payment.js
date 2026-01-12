const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  razorpayOrderId: {
    type: String
  },
  razorpayPaymentId: {
    type: String
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'INR'
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'timeout', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['card', 'upi', 'netbanking', 'wallet', 'cod', 'online'],
    default: 'online'
  },
  verificationAttempts: {
    type: Number,
    default: 0
  },
  maxVerificationAttempts: {
    type: Number,
    default: 3
  },
  lastVerificationAttempt: Date,
  verificationStatus: {
    type: String,
    enum: ['pending', 'verified', 'failed', 'timeout'],
    default: 'pending'
  },
  timeoutAt: {
    type: Date,
    required: true
  },
  completedAt: Date,
  failedAt: Date,
  failureReason: String,
  metadata: {
    type: Object,
    default: {}
  },
  retryCount: {
    type: Number,
    default: 0
  },
  maxRetries: {
    type: Number,
    default: 3
  },
  nextRetryAt: Date,
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
paymentSchema.index({ order: 1 });
paymentSchema.index({ user: 1 });
paymentSchema.index({ status: 1 });
paymentSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
paymentSchema.index({ razorpayPaymentId: 1 }, { sparse: true });
paymentSchema.index({ timeoutAt: 1 });
paymentSchema.index({ nextRetryAt: 1 });
paymentSchema.index({ createdAt: -1 });

// Compound indexes for optimized querie
paymentSchema.index({ status: 1, timeoutAt: 1 }); // For expired payments
paymentSchema.index({ status: 1, retryCount: 1, nextRetryAt: 1 }); // For retry queries
paymentSchema.index({ status: 1, razorpayOrderId: 1 }); // For verification queries
paymentSchema.index({ user: 1, status: 1, createdAt: -1 }); // For user payment history

// Update timestamp on save
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Virtual for checking if payment is expired
paymentSchema.virtual('isExpired').get(function() {
  return this.timeoutAt && new Date() > this.timeoutAt;
});

// Virtual for checking if payment can be retried
paymentSchema.virtual('canRetry').get(function() {
  return this.retryCount < this.maxRetries && 
         this.status === 'failed' && 
         (!this.nextRetryAt || new Date() >= this.nextRetryAt);
});

// Method to increment verification attempts
paymentSchema.methods.incrementVerificationAttempts = function() {
  this.verificationAttempts += 1;
  this.lastVerificationAttempt = new Date();
  return this.save();
};

// Method to mark payment as verified
paymentSchema.methods.markAsVerified = function(paymentId) {
  this.razorpayPaymentId = paymentId;
  this.status = 'completed';
  this.verificationStatus = 'verified';
  this.completedAt = new Date();
  return this.save();
};

// Method to mark payment as failed
paymentSchema.methods.markAsFailed = function(reason) {
  this.status = 'failed';
  this.verificationStatus = 'failed';
  this.failedAt = new Date();
  this.failureReason = reason;
  return this.save();
};

// Method to schedule retry
paymentSchema.methods.scheduleRetry = function(delayMinutes = 5) {
  this.retryCount += 1;
  this.nextRetryAt = new Date(Date.now() + delayMinutes * 60 * 1000);
  this.status = 'pending';
  this.verificationStatus = 'pending';
  return this.save();
};

// Static method to find expired payments
paymentSchema.statics.findExpiredPayments = function() {
  return this.find({
    status: { $in: ['pending', 'processing'] },
    timeoutAt: { $lt: new Date() }
  });
};

// Static method to find payments ready for retry
paymentSchema.statics.findPaymentsForRetry = function() {
  return this.find({
    status: 'failed',
    $expr: { $lt: ['$retryCount', '$maxRetries'] },
    nextRetryAt: { $lte: new Date() }
  });
};

module.exports = mongoose.model('Payment', paymentSchema);
