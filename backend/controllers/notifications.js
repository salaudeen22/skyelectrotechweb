const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');
const notificationService = require('../services/notificationService');
const { validationResult } = require('express-validator');

// Get user notifications
const getUserNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly = false } = req.query;
    const userId = req.user.id;

    const query = { user: userId };
    if (unreadOnly === 'true') {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('user', 'name email');

    const total = await Notification.countDocuments(query);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      unreadCount
    });
  } catch (error) {
    console.error('Error getting user notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Mark notifications as read
const markNotificationsAsRead = async (req, res) => {
  try {
    const { notificationIds } = req.body;
    const userId = req.user.id;

    await Notification.markAsRead(userId, notificationIds);
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({ 
      message: 'Notifications marked as read',
      unreadCount 
    });
  } catch (error) {
    console.error('Error marking notifications as read:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete notification
const deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });

    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({ 
      message: 'Notification deleted',
      unreadCount 
    });
  } catch (error) {
    console.error('Error deleting notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get unread count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;
    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({ unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Subscribe to push notifications
const subscribeToPushNotifications = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const userId = req.user.id;
    const { endpoint, keys, deviceInfo, preferences } = req.body;

    // Check if subscription already exists
    let subscription = await PushSubscription.findOne({ endpoint });

    if (subscription) {
      // Update existing subscription
      subscription.user = userId;
      subscription.keys = keys;
      subscription.deviceInfo = deviceInfo;
      subscription.preferences = { ...subscription.preferences, ...preferences };
      subscription.isActive = true;
      subscription.lastUsed = new Date();
      await subscription.save();
    } else {
      // Create new subscription
      subscription = new PushSubscription({
        user: userId,
        endpoint,
        keys,
        deviceInfo,
        preferences
      });
      await subscription.save();
    }

    res.json({ 
      message: 'Successfully subscribed to push notifications',
      subscription 
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unsubscribe from push notifications
const unsubscribeFromPushNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { endpoint } = req.body;

    const subscription = await PushSubscription.findOne({ 
      endpoint, 
      user: userId 
    });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    await subscription.deactivate();

    res.json({ message: 'Successfully unsubscribed from push notifications' });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Update notification preferences
const updateNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;
    const { preferences } = req.body;

    const subscriptions = await PushSubscription.find({ user: userId, isActive: true });

    for (const subscription of subscriptions) {
      subscription.preferences = { ...subscription.preferences, ...preferences };
      await subscription.save();
    }

    res.json({ 
      message: 'Notification preferences updated',
      preferences: subscriptions[0]?.preferences || {}
    });
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get notification preferences
const getNotificationPreferences = async (req, res) => {
  try {
    const userId = req.user.id;

    const subscription = await PushSubscription.findOne({ 
      user: userId, 
      isActive: true 
    });

  const preferences = subscription?.preferences || {
      orderUpdates: true,
      priceDrops: true,
      promotional: true,
      system: true
    };

    res.json({ preferences });
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get VAPID public key
const getVapidPublicKey = async (req, res) => {
  try {
    const publicKey = notificationService.getVapidPublicKey();
    res.json({ publicKey });
  } catch (error) {
    console.error('Error getting VAPID public key:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Test notification (admin only)
const sendTestNotification = async (req, res) => {
  try {
    const userId = req.user.id;
    const { title, message, type = 'system' } = req.body;

    const notification = await notificationService.sendSystemNotification(
      userId,
      title || 'Test Notification',
      message || 'This is a test notification',
      'normal'
    );

    res.json({ 
      message: 'Test notification sent',
      notification 
    });
  } catch (error) {
    console.error('Error sending test notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Bulk delete notifications
const bulkDeleteNotifications = async (req, res) => {
  try {
    const userId = req.user.id;
    const { notificationIds } = req.body;

    if (!notificationIds || !Array.isArray(notificationIds)) {
      return res.status(400).json({ message: 'Invalid notification IDs' });
    }

    const result = await Notification.deleteMany({
      _id: { $in: notificationIds },
      user: userId
    });

    const unreadCount = await Notification.getUnreadCount(userId);

    res.json({ 
      message: `${result.deletedCount} notifications deleted`,
      deletedCount: result.deletedCount,
      unreadCount 
    });
  } catch (error) {
    console.error('Error bulk deleting notifications:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
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
};
