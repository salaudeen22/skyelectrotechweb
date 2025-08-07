const mongoose = require('mongoose');

const returnRequestSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  requestNumber: {
    type: Number,
    required: false // Will be set by pre-save hook
  },
  reason: {
    type: String,
    enum: ['defective', 'wrong_item', 'not_as_described', 'quality_issue', 'incompatible', 'missing_parts', 'changed_mind', 'duplicate_order', 'other'],
    required: true
  },
  description: {
    type: String,
    required: true
  },
  condition: {
    type: String,
    enum: ['good', 'fair', 'poor'],
    required: true
  },
  images: [{
    type: String
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  adminNotes: {
    type: String
  },
  processedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  processedAt: {
    type: Date
  },
  returnShippingCost: {
    type: Number,
    default: 0
  },
  pickupScheduled: {
    type: Boolean,
    default: false
  },
  pickupDate: {
    type: Date
  },
  pickupAddress: {
    type: String
  },
  deliveryPartner: {
    type: String
  },
  trackingNumber: {
    type: String
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
returnRequestSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Auto-generate request number before saving (handled in controller)

// Index for efficient queries
returnRequestSchema.index({ order: 1 });
returnRequestSchema.index({ user: 1 });
returnRequestSchema.index({ status: 1 });
returnRequestSchema.index({ requestedAt: -1 });
returnRequestSchema.index({ order: 1, requestNumber: 1 });

module.exports = mongoose.model('ReturnRequest', returnRequestSchema); 