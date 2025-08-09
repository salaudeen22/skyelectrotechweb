const Payment = require('../models/Payment');
const Order = require('../models/Order');
const { 
  razorpay, 
  getPaymentDetails, 
  verifyPaymentSignature 
} = require('../config/razorpay');
const { sendPaymentTimeoutEmail } = require('./email');
const logActivity = require('../middleware/activityLogger');

class PaymentService {
  constructor() {
    this.timeoutMinutes = 30; // Payment timeout in minutes
    this.retryDelays = [5, 15, 30]; // Retry delays in minutes
    this.maxRetries = 3;
  }

  /**
   * Create a new payment record with timeout
   */
  async createPayment(orderId, userId, amount, currency = 'INR', paymentMethod = 'card') {
    let paymentData = null;
    try {
      const timeoutAt = new Date(Date.now() + this.timeoutMinutes * 60 * 1000);
      
      // If orderId is a temporary ID, store it in metadata instead of order field
      paymentData = {
        user: userId,
        amount,
        currency,
        paymentMethod,
        timeoutAt,
        status: 'pending'
      };

      // Only set order field if it's a valid MongoDB ObjectId
      if (orderId && !orderId.startsWith('temp_') && orderId.length === 24) {
        paymentData.order = orderId;
      } else {
        // Store temporary order ID in metadata
        paymentData.metadata = {
          tempOrderId: orderId
        };
      }
      
      const payment = new Payment(paymentData);
      await payment.save();
      
      console.log(`Payment created with timeout at ${timeoutAt}`);
      return payment;
    } catch (error) {
      console.error('Error creating payment record:', error);
      console.error('Payment data:', paymentData);
      throw error;
    }
  }

  /**
   * Update payment with Razorpay order ID
   */
  async updatePaymentWithOrderId(paymentId, razorpayOrderId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      // Check if another payment already has this Razorpay order ID
      const existingPayment = await Payment.findOne({ 
        razorpayOrderId: razorpayOrderId,
        _id: { $ne: paymentId }
      });
      
      if (existingPayment) {
        throw new Error('Razorpay order ID already exists in another payment');
      }

      payment.razorpayOrderId = razorpayOrderId;
      payment.status = 'processing';
      await payment.save();

      console.log(`Payment ${paymentId} updated with Razorpay order ID: ${razorpayOrderId}`);
      return payment;
    } catch (error) {
      console.error('Error updating payment with order ID:', error);
      throw error;
    }
  }

  /**
   * Update payment with real order ID after order creation
   */
  async updatePaymentWithOrder(paymentId, orderId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      payment.order = orderId;
      await payment.save();

      console.log(`Payment ${paymentId} updated with order ID: ${orderId}`);
      return payment;
    } catch (error) {
      console.error('Error updating payment with order:', error);
      throw error;
    }
  }

  /**
   * Verify payment with retry mechanism
   */
  async verifyPaymentWithRetry(razorpayOrderId, razorpayPaymentId, razorpaySignature, maxAttempts = 3) {
    let attempt = 0;
    let lastError = null;

    while (attempt < maxAttempts) {
      try {
        attempt++;
        console.log(`Payment verification attempt ${attempt}/${maxAttempts} for order ${razorpayOrderId}`);

        // Verify signature
        const isValidSignature = verifyPaymentSignature(
          razorpayOrderId,
          razorpayPaymentId,
          razorpaySignature
        );

        if (!isValidSignature) {
          throw new Error('Invalid payment signature');
        }

        // Get payment details from Razorpay
        const paymentDetails = await getPaymentDetails(razorpayPaymentId);
        
        if (paymentDetails.status !== 'captured') {
          throw new Error(`Payment not captured. Status: ${paymentDetails.status}`);
        }

        // Update payment record
        const payment = await Payment.findOne({ razorpayOrderId });
        if (!payment) {
          throw new Error('Payment record not found');
        }

        await payment.markAsVerified(razorpayPaymentId);
        
        // Update order payment status only if order exists
        if (payment.order) {
          await this.updateOrderPaymentStatus(payment.order, 'completed', razorpayPaymentId);
        }

        console.log(`Payment verification successful on attempt ${attempt}`);
        return {
          success: true,
          payment,
          paymentDetails,
          attempts: attempt
        };

      } catch (error) {
        lastError = error;
        console.error(`Payment verification attempt ${attempt} failed:`, error.message);

        if (attempt < maxAttempts) {
          // Wait before retry (exponential backoff)
          const delay = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
          await this.sleep(delay);
        }
      }
    }

    // All attempts failed
    const payment = await Payment.findOne({ razorpayOrderId });
    if (payment) {
      await payment.markAsFailed(`Verification failed after ${maxAttempts} attempts: ${lastError.message}`);
    }

    throw new Error(`Payment verification failed after ${maxAttempts} attempts: ${lastError.message}`);
  }

  /**
   * Process expired payments
   */
  async processExpiredPayments() {
    try {
      const expiredPayments = await Payment.findExpiredPayments();
      console.log(`Found ${expiredPayments.length} expired payments`);

      for (const payment of expiredPayments) {
        try {
          payment.status = 'timeout';
          payment.verificationStatus = 'timeout';
          await payment.save();

          // Update order status only if order exists
          if (payment.order) {
            await this.updateOrderPaymentStatus(payment.order, 'failed', null, 'Payment timeout');
          }

          // Notify user about payment timeout
          await this.notifyPaymentTimeout(payment);

          console.log(`Processed expired payment ${payment._id}`);
        } catch (error) {
          console.error(`Error processing expired payment ${payment._id}:`, error);
        }
      }

      return expiredPayments.length;
    } catch (error) {
      console.error('Error processing expired payments:', error);
      throw error;
    }
  }

  /**
   * Retry failed payments
   */
  async retryFailedPayments() {
    try {
      const paymentsForRetry = await Payment.findPaymentsForRetry();
      console.log(`Found ${paymentsForRetry.length} payments ready for retry`);

      for (const payment of paymentsForRetry) {
        try {
          // Check if payment is still valid on Razorpay side
          const razorpayOrder = await razorpay.orders.fetch(payment.razorpayOrderId);
          
          if (razorpayOrder.status === 'paid') {
            // Payment was actually successful, mark as completed
            await payment.markAsVerified(payment.razorpayPaymentId);
            if (payment.order) {
              await this.updateOrderPaymentStatus(payment.order, 'completed', payment.razorpayPaymentId);
            }
            console.log(`Payment ${payment._id} marked as completed during retry`);
          } else {
            // Schedule next retry
            const delayIndex = Math.min(payment.retryCount, this.retryDelays.length - 1);
            const delayMinutes = this.retryDelays[delayIndex];
            await payment.scheduleRetry(delayMinutes);
            console.log(`Payment ${payment._id} scheduled for retry in ${delayMinutes} minutes`);
          }
        } catch (error) {
          console.error(`Error retrying payment ${payment._id}:`, error);
          // Mark as failed if we can't even check the status
          await payment.markAsFailed(`Retry failed: ${error.message}`);
        }
      }

      return paymentsForRetry.length;
    } catch (error) {
      console.error('Error retrying failed payments:', error);
      throw error;
    }
  }

  /**
   * Synchronize payment status with Razorpay
   */
  async synchronizePaymentStatus(paymentId) {
    try {
      const payment = await Payment.findById(paymentId);
      if (!payment) {
        throw new Error('Payment not found');
      }

      if (!payment.razorpayOrderId) {
        throw new Error('No Razorpay order ID found');
      }

      // Get order status from Razorpay
      const razorpayOrder = await razorpay.orders.fetch(payment.razorpayOrderId);
      
      if (razorpayOrder.status === 'paid') {
        // Payment is successful on Razorpay side
        if (payment.status !== 'completed') {
          await payment.markAsVerified(payment.razorpayPaymentId);
          if (payment.order) {
            await this.updateOrderPaymentStatus(payment.order, 'completed', payment.razorpayPaymentId);
          }
          console.log(`Payment ${paymentId} synchronized as completed`);
        }
        return { status: 'completed', synchronized: true };
      } else if (razorpayOrder.status === 'attempted') {
        // Payment was attempted but not captured
        if (payment.status !== 'failed') {
          await payment.markAsFailed('Payment attempted but not captured');
          if (payment.order) {
            await this.updateOrderPaymentStatus(payment.order, 'failed', null, 'Payment not captured');
          }
          console.log(`Payment ${paymentId} synchronized as failed`);
        }
        return { status: 'failed', synchronized: true };
      } else {
        // Payment is still pending
        return { status: 'pending', synchronized: false };
      }
    } catch (error) {
      console.error('Error synchronizing payment status:', error);
      throw error;
    }
  }

  /**
   * Update order payment status
   */
  async updateOrderPaymentStatus(orderId, status, transactionId = null, note = null) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        console.log(`Order ${orderId} not found, skipping payment status update`);
        return;
      }

      order.paymentInfo.status = status;
      if (transactionId) {
        order.paymentInfo.transactionId = transactionId;
      }
      if (status === 'completed') {
        order.paymentInfo.paidAt = new Date();
      }

      // Add status history entry
      order.statusHistory.push({
        status: order.orderStatus,
        updatedAt: new Date(),
        note: note || `Payment status updated to ${status}`
      });

      await order.save();
      console.log(`Order ${orderId} payment status updated to ${status}`);
    } catch (error) {
      console.error('Error updating order payment status:', error);
      // Don't throw error, just log it
    }
  }

  /**
   * Notify user about payment timeout
   */
  async notifyPaymentTimeout(payment) {
    try {
      // Get user directly if no order exists
      let user;
      let orderId;
      let retryUrl;

      if (payment.order) {
        const order = await Order.findById(payment.order).populate('user');
        if (order && order.user) {
          user = order.user;
          orderId = order._id;
          retryUrl = `${process.env.FRONTEND_URL}/user/orders/${order._id}/retry-payment`;
        }
      }

      // If no order, get user directly
      if (!user) {
        const User = require('../models/User');
        user = await User.findById(payment.user);
        if (!user) {
          console.error('User not found for payment timeout notification');
          return;
        }
        orderId = payment.metadata?.tempOrderId || 'Unknown';
        retryUrl = `${process.env.FRONTEND_URL}/user/payment/retry`;
      }

      const emailData = {
        userName: user.name,
        orderId: orderId,
        amount: payment.amount,
        currency: payment.currency,
        retryUrl: retryUrl
      };

      await sendPaymentTimeoutEmail(user.email, emailData);
      console.log(`Payment timeout notification sent to ${user.email}`);
    } catch (error) {
      console.error('Error sending payment timeout notification:', error);
    }
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats() {
    try {
      const stats = await Payment.aggregate([
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        }
      ]);

      const totalPayments = await Payment.countDocuments();
      const pendingPayments = await Payment.countDocuments({ status: 'pending' });
      const expiredPayments = await Payment.countDocuments({ status: 'timeout' });

      return {
        byStatus: stats,
        total: totalPayments,
        pending: pendingPayments,
        expired: expiredPayments
      };
    } catch (error) {
      console.error('Error getting payment stats:', error);
      throw error;
    }
  }

  /**
   * Utility function for delays
   */
  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

module.exports = new PaymentService();
