const webpush = require('web-push');
const Notification = require('../models/Notification');
const PushSubscription = require('../models/PushSubscription');

// Configure web-push with VAPID keys
const vapidKeys = webpush.generateVAPIDKeys();
webpush.setVapidDetails(
  'mailto:skyelectrotechblr@gmail.com',
  process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey,
  process.env.VAPID_PRIVATE_KEY || vapidKeys.privateKey
);

class NotificationService {
  constructor(io = null) {
    this.io = io;
  }

  // Set Socket.IO instance
  setIO(io) {
    this.io = io;
  }

  // Create and send notification
  async createAndSendNotification(userId, notificationData) {
    try {
      // Create notification in database
      const notification = await Notification.createNotification(userId, notificationData);
      
      // Send real-time notification via Socket.IO
      if (this.io) {
        this.io.to(`user_${userId}`).emit('notification', {
          type: 'new_notification',
          notification: notification
        });
      }

      // Send push notification if enabled
      if (notificationData.sendPush !== false) {
        await this.sendPushNotification(userId, notification);
      }

      return notification;
    } catch (error) {
      console.error('Error creating and sending notification:', error);
      throw error;
    }
  }

  // Send push notification to user
  async sendPushNotification(userId, notification) {
    try {
      const subscriptions = await PushSubscription.getActiveSubscriptions(userId);
      
      if (subscriptions.length === 0) {
        return { sent: 0, failed: 0 };
      }

      const payload = JSON.stringify({
        title: notification.title,
        body: notification.message,
        icon: notification.icon || '/logo.svg',
        badge: '/logo.svg',
        data: {
          url: notification.actionUrl || '/notifications',
          notificationId: notification._id.toString(),
          type: notification.type
        },
        actions: notification.data.actions || [],
        tag: notification.type,
        requireInteraction: notification.priority === 'urgent',
        silent: false
      });

      let sent = 0;
      let failed = 0;

      for (const subscription of subscriptions) {
        try {
          // Check if user has enabled this type of notification
          if (!subscription.preferences[this.getPreferenceKey(notification.type)]) {
            continue;
          }

          await webpush.sendNotification(
            {
              endpoint: subscription.endpoint,
              keys: subscription.keys
            },
            payload
          );

          sent++;
          await subscription.updateLastUsed();
        } catch (error) {
          console.error('Push notification failed:', error);
          failed++;
          
          // If subscription is invalid, deactivate it
          if (error.statusCode === 410 || error.statusCode === 404) {
            await subscription.deactivate();
          }
        }
      }

      return { sent, failed };
    } catch (error) {
      console.error('Error sending push notifications:', error);
      throw error;
    }
  }

  // Get preference key for notification type
  getPreferenceKey(type) {
    const preferenceMap = {
      'order_update': 'orderUpdates',
      'payment': 'orderUpdates',
      'delivery': 'orderUpdates',
      'price_drop': 'priceDrops',
      'promotional': 'promotional',
      'system': 'system'
    };
    return preferenceMap[type] || 'system';
  }

  // Send order update notification
  async sendOrderUpdateNotification(userId, order, status, additionalData = {}) {
    const statusMessages = {
      'pending': 'Your order has been placed successfully!',
      'confirmed': 'Your order has been confirmed and is being processed.',
      'processing': 'Your order is being prepared for shipment.',
      'shipped': 'Your order has been shipped! Track your delivery.',
      'delivered': 'Your order has been delivered! Enjoy your purchase.',
      'cancelled': 'Your order has been cancelled.',
      'returned': 'Your order return has been processed.'
    };

    const notificationData = {
      title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
      message: statusMessages[status] || `Your order status has been updated to ${status}`,
      type: 'order_update',
      priority: status === 'cancelled' ? 'high' : 'normal',
      actionUrl: `/orders/${order._id}`,
      data: {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: status,
        ...additionalData
      },
      icon: '/logo.svg'
    };

    return await this.createAndSendNotification(userId, notificationData);
  }

  // Send price drop notification
  async sendPriceDropNotification(userId, product, oldPrice, newPrice) {
    const discount = Math.round(((oldPrice - newPrice) / oldPrice) * 100);
    
    const notificationData = {
      title: 'Price Drop Alert! 🎉',
      message: `${product.name} is now ${discount}% off! Save ₹${(oldPrice - newPrice).toLocaleString()}`,
      type: 'price_drop',
      priority: 'high',
      actionUrl: `/products/${product._id}`,
      data: {
        productId: product._id,
        oldPrice: oldPrice,
        newPrice: newPrice,
        discount: discount
      },
      icon: product.images?.[0] || '/logo.svg'
    };

    return await this.createAndSendNotification(userId, notificationData);
  }

  // Stock alert notifications removed (no inventory management)

  // Send promotional notification
  async sendPromotionalNotification(userId, title, message, actionUrl = '/', data = {}) {
    const notificationData = {
      title,
      message,
      type: 'promotional',
      priority: 'normal',
      actionUrl,
      data,
      icon: '/logo.svg'
    };

    return await this.createAndSendNotification(userId, notificationData);
  }

  // Send system notification
  async sendSystemNotification(userId, title, message, priority = 'normal', data = {}) {
    const notificationData = {
      title,
      message,
      type: 'system',
      priority,
      data
    };

    return await this.createAndSendNotification(userId, notificationData);
  }

  // Send bulk notifications to multiple users
  async sendBulkNotifications(userIds, notificationData) {
    const results = [];
    
    for (const userId of userIds) {
      try {
        const result = await this.createAndSendNotification(userId, notificationData);
        results.push({ userId, success: true, notification: result });
      } catch (error) {
        console.error(`Failed to send notification to user ${userId}:`, error);
        results.push({ userId, success: false, error: error.message });
      }
    }

    return results;
  }

  // Get VAPID public key
  getVapidPublicKey() {
    return process.env.VAPID_PUBLIC_KEY || vapidKeys.publicKey;
  }

  // Cleanup old notifications
  async cleanupOldNotifications(daysOld = 30) {
    try {
      const result = await Notification.cleanupOldNotifications(daysOld);
      console.log(`Cleaned up ${result.deletedCount} old notifications`);
      return result;
    } catch (error) {
      console.error('Error cleaning up old notifications:', error);
      throw error;
    }
  }

  // Cleanup inactive push subscriptions
  async cleanupInactiveSubscriptions(daysInactive = 30) {
    try {
      const result = await PushSubscription.cleanupInactiveSubscriptions(daysInactive);
      console.log(`Deactivated ${result.modifiedCount} inactive push subscriptions`);
      return result;
    } catch (error) {
      console.error('Error cleaning up inactive subscriptions:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
