const Razorpay = require('razorpay');
const crypto = require('crypto');

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

// Generate order ID for Razorpay
const generateRazorpayOrderId = async (amount, currency = 'INR', receipt = null) => {
  try {
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1, // Auto capture payment
    };

    const order = await razorpay.orders.create(options);
    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new Error('Failed to create payment order');
  }
};

// Verify payment signature
const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    return generatedSignature === signature;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Get payment details
const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpay.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    throw new Error('Failed to fetch payment details');
  }
};

// Refund payment
const refundPayment = async (paymentId, amount = null, reason = 'Customer request') => {
  try {
    const refundOptions = {
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to paise
      speed: 'normal',
      notes: {
        reason: reason,
      },
    };

    const refund = await razorpay.payments.refund(paymentId, refundOptions);
    return refund;
  } catch (error) {
    console.error('Error processing refund:', error);
    throw new Error('Failed to process refund');
  }
};

module.exports = {
  razorpay,
  generateRazorpayOrderId,
  verifyPaymentSignature,
  getPaymentDetails,
  refundPayment,
}; 