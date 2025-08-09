const Order = require('../models/Order');
const Payment = require('../models/Payment');
const { 
  razorpay,
  generateRazorpayOrderId, 
  verifyPaymentSignature, 
  getPaymentDetails,
  refundPayment 
} = require('../config/razorpay');
const paymentService = require('../utils/paymentService');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (User)
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderData, orderId } = req.body;

  if (!amount || amount <= 0) {
    return sendError(res, 400, 'Invalid amount');
  }

  try {
    console.log('Creating payment order with data:', { amount, currency, orderId });
    
    // Create payment record with timeout
    const payment = await paymentService.createPayment(
      orderId,
      req.user._id,
      amount,
      currency,
      'card'
    );

    console.log('Payment record created:', payment._id);

    // Generate Razorpay order
    const razorpayOrder = await generateRazorpayOrderId(
      amount, 
      currency, 
      `order_${payment._id}`
    );

    console.log('Razorpay order created:', razorpayOrder.id);

    // Update payment with Razorpay order ID
    await paymentService.updatePaymentWithOrderId(payment._id, razorpayOrder.id);

    console.log('Payment updated with Razorpay order ID');

    sendResponse(res, 200, {
      paymentId: payment._id,
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
      timeoutAt: payment.timeoutAt
    }, 'Payment order created successfully');
  } catch (error) {
    console.error('Payment order creation error:', error);
    console.error('Error stack:', error.stack);
    sendError(res, 500, `Failed to create payment order: ${error.message}`);
  }
});

// @desc    Verify payment
// @route   POST /api/payments/verify
// @access  Private (User)
const verifyPayment = asyncHandler(async (req, res) => {
  const { 
    razorpay_order_id, 
    razorpay_payment_id, 
    razorpay_signature
  } = req.body;

  if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
    return sendError(res, 400, 'Missing payment verification parameters');
  }

  try {
    console.log('Payment verification request:', {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature: razorpay_signature ? 'present' : 'missing'
    });

    // Verify payment with retry mechanism
    const verificationResult = await paymentService.verifyPaymentWithRetry(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      3 // max attempts
    );

    console.log('Payment verification successful:', verificationResult);

    sendResponse(res, 200, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'success',
      paymentDetails: verificationResult.paymentDetails,
      attempts: verificationResult.attempts
    }, 'Payment verified successfully');
  } catch (error) {
    console.error('Payment verification error:', error);
    sendError(res, 500, `Failed to verify payment: ${error.message}`);
  }
});

// @desc    Get payment details
// @route   GET /api/payments/:paymentId
// @access  Private (Admin)
const getPaymentInfo = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const paymentDetails = await getPaymentDetails(paymentId);
    
    sendResponse(res, 200, { paymentDetails }, 'Payment details retrieved successfully');
  } catch (error) {
    console.error('Get payment details error:', error);
    sendError(res, 500, 'Failed to get payment details');
  }
});

// @desc    Process refund
// @route   POST /api/payments/refund
// @access  Private (Admin)
const processRefund = asyncHandler(async (req, res) => {
  const { paymentId, amount, reason, orderId } = req.body;

  if (!paymentId) {
    return sendError(res, 400, 'Payment ID is required');
  }

  try {
    // Process refund through Razorpay
    const refundDetails = await refundPayment(paymentId, amount, reason);

    // Update order if provided
    if (orderId) {
      const order = await Order.findById(orderId);
      
      if (order) {
        order.orderStatus = 'refunded';
        order.statusHistory.push({
          status: 'refunded',
          updatedBy: req.user._id,
          note: `Refund processed: ${reason}`
        });

        await order.save();
      }
    }

    sendResponse(res, 200, { refundDetails }, 'Refund processed successfully');
  } catch (error) {
    console.error('Refund processing error:', error);
    sendError(res, 500, 'Failed to process refund');
  }
});

// @desc    Test Razorpay configuration
// @route   GET /api/payments/test
// @access  Public
const testRazorpayConfig = asyncHandler(async (req, res) => {
  try {
    // Test if Razorpay credentials are configured
    if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
      return sendError(res, 500, 'Razorpay credentials not configured');
    }

    // Test if we can create a minimal order (this will fail but we can catch the error)
    try {
      await razorpay.orders.create({
        amount: 100,
        currency: 'INR',
        receipt: 'test_receipt'
      });
    } catch (error) {
      // This is expected to fail in test mode, but it means the connection works
      if (error.error && error.error.description) {
        console.log('Razorpay test connection successful (expected error):', error.error.description);
      }
    }

    sendResponse(res, 200, {
      configured: true,
      keyId: process.env.RAZORPAY_KEY_ID ? 'Set' : 'Not set',
      keySecret: process.env.RAZORPAY_KEY_SECRET ? 'Set' : 'Not set'
    }, 'Razorpay configuration test completed');
  } catch (error) {
    console.error('Razorpay config test error:', error);
    sendError(res, 500, 'Razorpay configuration test failed');
  }
});

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = asyncHandler(async (req, res) => {
  // Prefer dynamic settings; fall back to environment flag for COD
  const Settings = require('../models/Settings');
  let settings;
  try {
    settings = await Settings.findOne().sort('-createdAt');
  } catch (_) {
    settings = null;
  }

  const onlineEnabled = settings?.payment?.paymentMethods?.online?.enabled ?? true;
  const configuredOnlineList = settings?.payment?.paymentMethods?.online?.methods;
  const defaultOnlineList = ['card', 'upi', 'netbanking', 'wallet'];
  const onlineList = Array.isArray(configuredOnlineList) && configuredOnlineList.length > 0
    ? configuredOnlineList
    : defaultOnlineList;
  const codEnabledFromSettings = settings?.payment?.paymentMethods?.cod?.enabled;
  const codEnabled = codEnabledFromSettings !== undefined ? codEnabledFromSettings : (process.env.ENABLE_COD === 'true');

  const methodMetaMap = {
    card: {
      id: 'card',
      name: 'Credit / Debit Card',
      description: 'Pay with Visa, MasterCard, RuPay',
      icon: 'credit-card'
    },
    upi: {
      id: 'upi',
      name: 'UPI',
      description: 'Pay with any UPI app',
      icon: 'smartphone'
    },
    netbanking: {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay with your bank account',
      icon: 'bank'
    },
    wallet: {
      id: 'wallet',
      name: 'Digital Wallets',
      description: 'Pay with Paytm, PhonePe, etc.',
      icon: 'wallet'
    },
    cod: {
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: 'cash'
    }
  };

  const paymentMethods = [];

  if (onlineEnabled) {
    for (const methodId of onlineList) {
      if (methodMetaMap[methodId]) {
        paymentMethods.push({ ...methodMetaMap[methodId], enabled: true });
      }
    }
  }

  if (codEnabled) {
    const codLimits = {
      minOrderAmount: settings?.payment?.paymentMethods?.cod?.minOrderAmount ?? 0,
      maxOrderAmount: settings?.payment?.paymentMethods?.cod?.maxOrderAmount ?? 5000
    };
    paymentMethods.push({ ...methodMetaMap.cod, enabled: true, ...codLimits });
  }

  sendResponse(res, 200, { paymentMethods }, 'Payment methods retrieved successfully');
});

// @desc    Synchronize payment status
// @route   POST /api/payments/sync/:paymentId
// @access  Private (Admin)
const synchronizePaymentStatus = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;

  try {
    const result = await paymentService.synchronizePaymentStatus(paymentId);
    
    sendResponse(res, 200, result, 'Payment status synchronized successfully');
  } catch (error) {
    console.error('Payment synchronization error:', error);
    sendError(res, 500, `Failed to synchronize payment: ${error.message}`);
  }
});

// @desc    Retry failed payment
// @route   POST /api/payments/retry/:paymentId
// @access  Private (User/Admin)
const retryPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.params;
  const { delayMinutes = 5 } = req.body;

  try {
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return sendError(res, 404, 'Payment not found');
    }

    // Check if user has permission to retry this payment
    if (req.user.role !== 'admin' && payment.user.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Access denied');
    }

    if (!payment.canRetry) {
      return sendError(res, 400, 'Payment cannot be retried');
    }

    await payment.scheduleRetry(delayMinutes);
    
    sendResponse(res, 200, {
      paymentId: payment._id,
      nextRetryAt: payment.nextRetryAt,
      retryCount: payment.retryCount
    }, 'Payment retry scheduled successfully');
  } catch (error) {
    console.error('Payment retry error:', error);
    sendError(res, 500, `Failed to retry payment: ${error.message}`);
  }
});

// @desc    Get payment statistics
// @route   GET /api/payments/stats
// @access  Private (Admin)
const getPaymentStats = asyncHandler(async (req, res) => {
  try {
    const stats = await paymentService.getPaymentStats();
    sendResponse(res, 200, stats, 'Payment statistics retrieved successfully');
  } catch (error) {
    console.error('Get payment stats error:', error);
    sendError(res, 500, 'Failed to get payment statistics');
  }
});

// @desc    Process expired payments (cron job endpoint)
// @route   POST /api/payments/process-expired
// @access  Private (Admin)
const processExpiredPayments = asyncHandler(async (req, res) => {
  try {
    const processedCount = await paymentService.processExpiredPayments();
    sendResponse(res, 200, { processedCount }, `${processedCount} expired payments processed`);
  } catch (error) {
    console.error('Process expired payments error:', error);
    sendError(res, 500, 'Failed to process expired payments');
  }
});

// @desc    Retry failed payments (cron job endpoint)
// @route   POST /api/payments/retry-failed
// @access  Private (Admin)
const retryFailedPayments = asyncHandler(async (req, res) => {
  try {
    const retriedCount = await paymentService.retryFailedPayments();
    sendResponse(res, 200, { retriedCount }, `${retriedCount} failed payments retried`);
  } catch (error) {
    console.error('Retry failed payments error:', error);
    sendError(res, 500, 'Failed to retry failed payments');
  }
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentInfo,
  processRefund,
  getPaymentMethods,
  testRazorpayConfig,
  synchronizePaymentStatus,
  retryPayment,
  getPaymentStats,
  processExpiredPayments,
  retryFailedPayments
}; 