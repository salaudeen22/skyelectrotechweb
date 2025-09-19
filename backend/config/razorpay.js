const Razorpay = require('razorpay');
const crypto = require('crypto');

// Check if Razorpay credentials are configured
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.error('Razorpay credentials not configured Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET environment variables.');
}

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
    if (!orderId || !paymentId || !signature) {
      console.error('Missing parameters for signature verification:', {
        orderId: !!orderId,
        paymentId: !!paymentId,
        signature: !!signature
      });
      return false;
    }

    const text = `${orderId}|${paymentId}`;
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex');

    const isValid = generatedSignature === signature;
    
    if (!isValid) {
      console.error('Signature mismatch:', {
        expected: generatedSignature,
        received: signature,
        text
      });
    }

    return isValid;
  } catch (error) {
    console.error('Error verifying payment signature:', error);
    return false;
  }
};

// Get payment details with timeout and retry
const getPaymentDetails = async (paymentId, timeout = 10000) => {
  try {
    // Create a promise that rejects after timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Payment details fetch timeout')), timeout);
    });
    
    // Race between actual API call and timeout
    const payment = await Promise.race([
      razorpay.payments.fetch(paymentId),
      timeoutPromise
    ]);
    
    return payment;
  } catch (error) {
    console.error('Error fetching payment details:', error);
    
    // Retry once with shorter timeout if first attempt fails
    if (error.message.includes('timeout')) {
      try {
        console.log('Retrying payment details fetch with shorter timeout');
        const retryTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Payment details retry timeout')), 5000);
        });
        
        const payment = await Promise.race([
          razorpay.payments.fetch(paymentId),
          retryTimeout
        ]);
        
        return payment;
      } catch (retryError) {
        throw new Error('Failed to fetch payment details after retry');
      }
    }
    
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