const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  action: {
    type: String,
    required: true,
    enum: [
      'login',
      'logout',
      'product_created',
      'product_updated',
      'product_deleted',
      'order_status_updated',
      'user_created',
      'user_updated',
      'user_deleted',
      'category_created',
      'category_updated',
      'category_deleted',
      // Payments
      'create_payment_order',
      'verify_payment',
      'retry_payment',
      'view_payment_details',
      'sync_payment_status',
      'process_expired_payments',
      'retry_failed_payments',
      'process_refund',
      // Bulk operations
      'bulk_upload_products',
      'bulk_update_products',
      'bulk_delete_products'
    ]
  },
  resource: {
    type: String,
    required: true,
    enum: ['user', 'product', 'order', 'category', 'system', 'payment']
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId
  },
  description: {
    type: String,
    required: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed
  },
  ipAddress: String,
  userAgent: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient queries
activityLogSchema.index({ user: 1, createdAt: -1 });
activityLogSchema.index({ action: 1 });
activityLogSchema.index({ resource: 1 });
activityLogSchema.index({ createdAt: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
