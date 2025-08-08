let cron;
try {
  cron = require('node-cron');
} catch (error) {
  console.log('node-cron not installed, cron jobs will not run');
  cron = null;
}

const mongoose = require('mongoose');
const paymentService = require('../utils/paymentService');
require('dotenv').config();

// Connect to MongoDB
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected for payment cron jobs');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Process expired payments every 5 minutes
const processExpiredPaymentsJob = cron ? cron.schedule('*/5 * * * *', async () => {
  try {
    console.log('Running expired payments job:', new Date().toISOString());
    const processedCount = await paymentService.processExpiredPayments();
    console.log(`Processed ${processedCount} expired payments`);
  } catch (error) {
    console.error('Error in expired payments job:', error);
  }
}, {
  scheduled: false
}) : null;

// Retry failed payments every 10 minutes
const retryFailedPaymentsJob = cron ? cron.schedule('*/10 * * * *', async () => {
  try {
    console.log('Running failed payments retry job:', new Date().toISOString());
    const retriedCount = await paymentService.retryFailedPayments();
    console.log(`Retried ${retriedCount} failed payments`);
  } catch (error) {
    console.error('Error in failed payments retry job:', error);
  }
}, {
  scheduled: false
}) : null;

// Synchronize payment status every 15 minutes
const synchronizePaymentStatusJob = cron ? cron.schedule('*/15 * * * *', async () => {
  try {
    console.log('Running payment status synchronization job:', new Date().toISOString());
    
    // Get all pending payments
    const Payment = require('../models/Payment');
    const pendingPayments = await Payment.find({ 
      status: { $in: ['pending', 'processing'] },
      razorpayOrderId: { $exists: true }
    }).limit(50); // Process in batches

    let synchronizedCount = 0;
    for (const payment of pendingPayments) {
      try {
        const result = await paymentService.synchronizePaymentStatus(payment._id);
        if (result.synchronized) {
          synchronizedCount++;
        }
      } catch (error) {
        console.error(`Error synchronizing payment ${payment._id}:`, error.message);
      }
    }

    console.log(`Synchronized ${synchronizedCount} payments`);
  } catch (error) {
    console.error('Error in payment status synchronization job:', error);
  }
}, {
  scheduled: false
}) : null;

// Clean up old payment records (older than 30 days) every day at 2 AM
const cleanupOldPaymentsJob = cron ? cron.schedule('0 2 * * *', async () => {
  try {
    console.log('Running payment cleanup job:', new Date().toISOString());
    
    const Payment = require('../models/Payment');
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    
    const result = await Payment.deleteMany({
      createdAt: { $lt: thirtyDaysAgo },
      status: { $in: ['completed', 'failed', 'timeout'] }
    });

    console.log(`Cleaned up ${result.deletedCount} old payment records`);
  } catch (error) {
    console.error('Error in payment cleanup job:', error);
  }
}, {
  scheduled: false
}) : null;

// Start all cron jobs
const startPaymentCronJobs = () => {
  if (!cron) {
    console.log('node-cron not available, skipping payment cron jobs');
    return;
  }
  
  console.log('Starting payment cron jobs...');
  
  if (processExpiredPaymentsJob) processExpiredPaymentsJob.start();
  if (retryFailedPaymentsJob) retryFailedPaymentsJob.start();
  if (synchronizePaymentStatusJob) synchronizePaymentStatusJob.start();
  if (cleanupOldPaymentsJob) cleanupOldPaymentsJob.start();
  
  console.log('Payment cron jobs started successfully');
};

// Stop all cron jobs
const stopPaymentCronJobs = () => {
  if (!cron) {
    console.log('node-cron not available, no cron jobs to stop');
    return;
  }
  
  console.log('Stopping payment cron jobs...');
  
  if (processExpiredPaymentsJob) processExpiredPaymentsJob.stop();
  if (retryFailedPaymentsJob) retryFailedPaymentsJob.stop();
  if (synchronizePaymentStatusJob) synchronizePaymentStatusJob.stop();
  if (cleanupOldPaymentsJob) cleanupOldPaymentsJob.stop();
  
  console.log('Payment cron jobs stopped');
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('Received SIGINT, shutting down gracefully...');
  stopPaymentCronJobs();
  await mongoose.connection.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  stopPaymentCronJobs();
  await mongoose.connection.close();
  process.exit(0);
});

// Export functions for manual execution
module.exports = {
  startPaymentCronJobs,
  stopPaymentCronJobs,
  processExpiredPaymentsJob,
  retryFailedPaymentsJob,
  synchronizePaymentStatusJob,
  cleanupOldPaymentsJob
};

// If this file is run directly, start the cron jobs
if (require.main === module) {
  connectDB().then(() => {
    startPaymentCronJobs();
  });
}
