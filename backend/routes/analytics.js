const express = require('express');
const {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getOrderAnalytics,
  getActivityLogs,
  getCustomerAnalytics,
  getPerformanceMetrics
} = require('../controllers/analytics');
const { auth, adminOnly, adminOrEmployee } = require('../middleware/auth');

const router = express.Router();

// All analytics routes require authentication
router.use(auth);

// Dashboard stats (available to admin and employees)
router.get('/dashboard', adminOrEmployee, getDashboardStats);

// Sales analytics (admin only)
router.get('/sales', adminOnly, getSalesAnalytics);

// Product analytics (admin only)
router.get('/products', adminOnly, getProductAnalytics);

// Order analytics (admin and employees)
router.get('/orders', adminOrEmployee, getOrderAnalytics);

// Activity logs (admin only)
router.get('/activity-logs', adminOnly, getActivityLogs);

// Customer analytics (admin only)
router.get('/customers', adminOnly, getCustomerAnalytics);

// Performance metrics (admin only)
router.get('/performance', adminOnly, getPerformanceMetrics);

module.exports = router;
