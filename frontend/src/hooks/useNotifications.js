import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import api from '../services/api';

export const useNotifications = () => {
  const { isAuthenticated, user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch notifications
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch unread count only
  const fetchUnreadCount = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const response = await api.get('/notifications/unread-count');
      setUnreadCount(response.data.unreadCount);
    } catch (err) {
      console.error('Error fetching unread count:', err);
    }
  }, [isAuthenticated]);

  // Mark notifications as read
  const markAsRead = useCallback(async (notificationIds) => {
    if (!isAuthenticated) return;

    try {
      await api.patch('/notifications/mark-read', { notificationIds });
      await fetchUnreadCount();
      
      // Update local state
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification._id) 
            ? { ...notification, isRead: true }
            : notification
        )
      );
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      throw err;
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      await api.delete(`/notifications/${notificationId}`);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      await fetchUnreadCount();
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [isAuthenticated, fetchUnreadCount]);

  // Subscribe to push notifications
  const subscribeToPushNotifications = useCallback(async (subscription) => {
    if (!isAuthenticated) return;

    try {
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        browser: getBrowserInfo(),
        version: getBrowserVersion()
      };

      await api.post('/notifications/subscribe', {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
        },
        deviceInfo,
        preferences: {
          orderUpdates: true,
          priceDrops: true,
          stockAlerts: true,
          promotional: true,
          system: true
        }
      });
    } catch (err) {
      console.error('Error subscribing to push notifications:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Unsubscribe from push notifications
  const unsubscribeFromPushNotifications = useCallback(async (endpoint) => {
    if (!isAuthenticated) return;

    try {
      await api.post('/notifications/unsubscribe', { endpoint });
    } catch (err) {
      console.error('Error unsubscribing from push notifications:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Update notification preferences
  const updatePreferences = useCallback(async (preferences) => {
    if (!isAuthenticated) return;

    try {
      await api.patch('/notifications/preferences', { preferences });
    } catch (err) {
      console.error('Error updating notification preferences:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Get notification preferences
  const getPreferences = useCallback(async () => {
    if (!isAuthenticated) return null;

    try {
      const response = await api.get('/notifications/preferences');
      return response.data.preferences;
    } catch (err) {
      console.error('Error getting notification preferences:', err);
      return null;
    }
  }, [isAuthenticated]);

  // Add new notification to local state
  const addNotification = useCallback((notification) => {
    setNotifications(prev => [notification, ...prev.slice(0, 9)]); // Keep only 10 most recent
    setUnreadCount(prev => prev + 1);
  }, []);

  // Initialize
  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    } else {
      setNotifications([]);
      setUnreadCount(0);
    }
  }, [isAuthenticated, fetchNotifications]);

  // Set up real-time notifications via Socket.IO
  useEffect(() => {
    if (!isAuthenticated || !window.io) return;

    const socket = window.io;

    // Join user room
    socket.emit('join-user', user?.id);

    // Listen for new notifications
    const handleNewNotification = (data) => {
      if (data.type === 'new_notification') {
        addNotification(data.notification);
      }
    };

    socket.on('notification', handleNewNotification);

    return () => {
      socket.off('notification', handleNewNotification);
    };
  }, [isAuthenticated, user?.id, addNotification]);

  return {
    notifications,
    unreadCount,
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    deleteNotification,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    updatePreferences,
    getPreferences,
    addNotification,
    refetch: fetchNotifications
  };
};

// Helper functions
function getBrowserInfo() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
}

function getBrowserVersion() {
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/(chrome|firefox|safari|edge)\/(\d+)/i);
  return match ? match[2] : 'Unknown';
}
