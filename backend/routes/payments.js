const express = require('express');
const { body } = require('express-validator');
const {
  createPaymentOrder,
  verifyPayment,
  verifyPaymentFast,
  getPaymentInfo,
  processRefund,
  getPaymentMethods,
  testRazorpayConfig,
  synchronizePaymentStatus,
  retryPayment,
  getPaymentStats,
  processExpiredPayments,
  retryFailedPayments
} = require('../controllers/payments');
const { auth, adminOnly, userAccess } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('amount')
    .isFloat({ min: 1 })
    .withMessage('Amount must be greater than 0'),
  body('currency')
    .optional()
    .isIn(['INR', 'USD'])
    .withMessage('Currency must be INR or USD'),
  body('orderId')
    .optional()
    .isString()
    .withMessage('Order ID must be a string')
];

const verifyPaymentValidation = [
  body('razorpay_order_id')
    .notEmpty()
    .withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id')
    .notEmpty()
    .withMessage('Razorpay payment ID is required'),
  body('razorpay_signature')
    .notEmpty()
    .withMessage('Razorpay signature is required'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid order ID')
];

const refundValidation = [
  body('paymentId')
    .notEmpty()
    .withMessage('Payment ID is required'),
  body('amount')
    .optional()
    .isFloat({ min: 1 })
    .withMessage('Refund amount must be greater than 0'),
  body('reason')
    .optional()
    .isString()
    .isLength({ max: 200 })
    .withMessage('Reason must be less than 200 characters'),
  body('orderId')
    .optional()
    .isMongoId()
    .withMessage('Invalid order ID')
];

// Public routes
router.get('/methods', getPaymentMethods);
router.get('/test', testRazorpayConfig);

// User routes
router.post('/create-order', 
  auth, 
  userAccess, 
  createOrderValidation, 
  validate, 
  logActivity('create_payment_order', 'payment'),
  createPaymentOrder
);

router.post('/verify', 
  auth, 
  userAccess, 
  verifyPaymentValidation, 
  validate, 
  logActivity('verify_payment', 'payment'),
  verifyPayment
);

router.post('/verify-fast', 
  auth, 
  userAccess, 
  verifyPaymentValidation, 
  validate, 
  logActivity('verify_payment_fast', 'payment'),
  verifyPaymentFast
);

// User/Admin routes
router.post('/retry/:paymentId', 
  auth, 
  [body('delayMinutes').optional().isInt({ min: 1, max: 60 })], 
  validate, 
  logActivity('retry_payment', 'payment'),
  retryPayment
);

// Admin routes
router.get('/:paymentId', 
  auth, 
  adminOnly, 
  logActivity('view_payment_details', 'payment'),
  getPaymentInfo
);

router.post('/sync/:paymentId', 
  auth, 
  adminOnly, 
  logActivity('sync_payment_status', 'payment'),
  synchronizePaymentStatus
);

router.get('/stats/overview', 
  auth, 
  adminOnly, 
  getPaymentStats
);

router.post('/process-expired', 
  auth, 
  adminOnly, 
  logActivity('process_expired_payments', 'payment'),
  processExpiredPayments
);

router.post('/retry-failed', 
  auth, 
  adminOnly, 
  logActivity('retry_failed_payments', 'payment'),
  retryFailedPayments
);

router.post('/refund', 
  auth, 
  adminOnly, 
  refundValidation, 
  validate, 
  logActivity('process_refund', 'payment'),
  processRefund
);

module.exports = router; 