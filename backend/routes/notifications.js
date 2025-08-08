const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const { auth } = require('../middleware/auth');
const {
  getUserNotifications,
  markNotificationsAsRead,
  deleteNotification,
  getUnreadCount,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  updateNotificationPreferences,
  getNotificationPreferences,
  getVapidPublicKey,
  sendTestNotification,
  bulkDeleteNotifications
} = require('../controllers/notifications');

// Validation middleware
const validatePushSubscription = [
  body('endpoint').isURL().withMessage('Valid endpoint URL is required'),
  body('keys.p256dh').isString().notEmpty().withMessage('p256dh key is required'),
  body('keys.auth').isString().notEmpty().withMessage('auth key is required'),
  body('deviceInfo').optional().isObject(),
  body('preferences').optional().isObject()
];

const validateNotificationPreferences = [
  body('preferences.orderUpdates').optional().isBoolean(),
  body('preferences.priceDrops').optional().isBoolean(),
  body('preferences.stockAlerts').optional().isBoolean(),
  body('preferences.promotional').optional().isBoolean(),
  body('preferences.system').optional().isBoolean()
];

const validateTestNotification = [
  body('title').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('message').optional().isString().trim().isLength({ min: 1, max: 500 }),
  body('type').optional().isIn(['order_update', 'price_drop', 'stock_alert', 'promotional', 'system', 'payment', 'delivery'])
];

// Public routes
router.get('/vapid-public-key', getVapidPublicKey);

// Protected routes (require authentication)
router.use(auth);

// Get user notifications
router.get('/', getUserNotifications);

// Get unread count
router.get('/unread-count', getUnreadCount);

// Mark notifications as read
router.patch('/mark-read', markNotificationsAsRead);

// Delete single notification
router.delete('/:notificationId', deleteNotification);

// Bulk delete notifications
router.delete('/bulk/delete', bulkDeleteNotifications);

// Push notification subscription
router.post('/subscribe', validatePushSubscription, subscribeToPushNotifications);

// Push notification unsubscription
router.post('/unsubscribe', unsubscribeFromPushNotifications);

// Get notification preferences
router.get('/preferences', getNotificationPreferences);

// Update notification preferences
router.patch('/preferences', validateNotificationPreferences, updateNotificationPreferences);

// Test notification (for testing purposes)
router.post('/test', validateTestNotification, sendTestNotification);

module.exports = router;
