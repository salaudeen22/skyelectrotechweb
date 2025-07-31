const Order = require('../models/Order');
const { 
  generateRazorpayOrderId, 
  verifyPaymentSignature, 
  getPaymentDetails,
  refundPayment 
} = require('../config/razorpay');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Create Razorpay order
// @route   POST /api/payments/create-order
// @access  Private (User)
const createPaymentOrder = asyncHandler(async (req, res) => {
  const { amount, currency = 'INR', orderData } = req.body;

  if (!amount || amount <= 0) {
    return sendError(res, 400, 'Invalid amount');
  }

  try {
    // Generate Razorpay order
    const razorpayOrder = await generateRazorpayOrderId(
      amount, 
      currency, 
      `order_${Date.now()}`
    );

    sendResponse(res, 200, {
      orderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID
    }, 'Payment order created successfully');
  } catch (error) {
    console.error('Payment order creation error:', error);
    sendError(res, 500, 'Failed to create payment order');
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
    // Verify payment signature
    const isValidSignature = verifyPaymentSignature(
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    );

    if (!isValidSignature) {
      return sendError(res, 400, 'Invalid payment signature');
    }

    // Get payment details from Razorpay
    const paymentDetails = await getPaymentDetails(razorpay_payment_id);

    sendResponse(res, 200, {
      paymentId: razorpay_payment_id,
      orderId: razorpay_order_id,
      status: 'success',
      paymentDetails
    }, 'Payment verified successfully');
  } catch (error) {
    console.error('Payment verification error:', error);
    sendError(res, 500, 'Failed to verify payment');
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

// @desc    Get payment methods
// @route   GET /api/payments/methods
// @access  Public
const getPaymentMethods = asyncHandler(async (req, res) => {
  // COD can be enabled/disabled via environment variable
  const codEnabled = process.env.ENABLE_COD === 'true';
  
  const paymentMethods = [
    {
      id: 'card',
      name: 'Credit / Debit Card',
      description: 'Pay with Visa, MasterCard, RuPay',
      icon: 'credit-card',
      enabled: true
    },
    {
      id: 'upi',
      name: 'UPI',
      description: 'Pay with any UPI app',
      icon: 'smartphone',
      enabled: true
    },
    {
      id: 'netbanking',
      name: 'Net Banking',
      description: 'Pay with your bank account',
      icon: 'bank',
      enabled: true
    },
    {
      id: 'wallet',
      name: 'Digital Wallets',
      description: 'Pay with Paytm, PhonePe, etc.',
      icon: 'wallet',
      enabled: true
    }
  ];

  // Add COD only if enabled
  if (codEnabled) {
    paymentMethods.push({
      id: 'cod',
      name: 'Cash on Delivery',
      description: 'Pay when you receive your order',
      icon: 'cash',
      enabled: true
    });
  }

  sendResponse(res, 200, { paymentMethods }, 'Payment methods retrieved successfully');
});

module.exports = {
  createPaymentOrder,
  verifyPayment,
  getPaymentInfo,
  processRefund,
  getPaymentMethods
}; 