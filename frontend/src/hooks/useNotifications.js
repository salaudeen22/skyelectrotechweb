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
  const fetchNotifications = useCallback(async (updateCount = true) => {
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);
    try {
      const response = await api.get('/notifications?limit=10');
      setNotifications(response.data.notifications);
      if (updateCount) {
        console.log('fetchNotifications: Updating count to:', response.data.unreadCount);
        setUnreadCount(response.data.unreadCount);
      } else {
        console.log('fetchNotifications: Skipping count update');
      }
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
      console.log('markAsRead: Marking notifications as read:', notificationIds);
      const response = await api.patch('/notifications/mark-read', { notificationIds });
      console.log('markAsRead: Server response:', response.data);
      
      // Update local state first for immediate UI feedback
      setNotifications(prev => 
        prev.map(notification => 
          notificationIds.includes(notification._id) 
            ? { ...notification, isRead: true }
            : notification
        )
      );
      
      // Use the server response for accurate count
      const newCount = response.data.unreadCount || 0;
      console.log('markAsRead: Setting unread count to:', newCount);
      setUnreadCount(newCount);
    } catch (err) {
      console.error('Error marking notifications as read:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      console.log('markAllAsRead: Starting mark all as read');
      // First get all unread notifications
      const response = await api.get('/notifications?unreadOnly=true&limit=1000');
      const allUnreadIds = response.data.notifications.map(n => n._id);
      console.log('markAllAsRead: Found unread IDs:', allUnreadIds);
      
      if (allUnreadIds.length === 0) {
        console.log('markAllAsRead: No unread notifications found');
        return;
      }
      
      // Mark them all as read using the existing endpoint
      const markResponse = await api.patch('/notifications/mark-read', { notificationIds: allUnreadIds });
      console.log('markAllAsRead: Server response:', markResponse.data);
      
      // Update local state - mark all notifications as read
      setNotifications(prev => 
        prev.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Set unread count from server response immediately
      const newCount = markResponse.data.unreadCount || 0;
      console.log('markAllAsRead: Setting unread count to:', newCount);
      setUnreadCount(newCount);
    } catch (err) {
      console.error('Error marking all notifications as read:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Delete notification
  const deleteNotification = useCallback(async (notificationId) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.delete(`/notifications/${notificationId}`);
      
      // Update local state
      setNotifications(prev => prev.filter(n => n._id !== notificationId));
      
      // Use the server response for accurate count
      setUnreadCount(response.data.unreadCount || 0);
    } catch (err) {
      console.error('Error deleting notification:', err);
      throw err;
    }
  }, [isAuthenticated]);

  // Bulk delete notifications
  const bulkDeleteNotifications = useCallback(async (notificationIds) => {
    if (!isAuthenticated) return;

    try {
      const response = await api.delete('/notifications/bulk/delete', {
        data: { notificationIds }
      });
      
      // Update local state
      setNotifications(prev => prev.filter(n => !notificationIds.includes(n._id)));
      
      // Use the server response for accurate count
      setUnreadCount(response.data.unreadCount || 0);
      
      return response.data;
    } catch (err) {
      console.error('Error bulk deleting notifications:', err);
      throw err;
    }
  }, [isAuthenticated]);

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

  // Debug unreadCount changes
  useEffect(() => {
    console.log('useNotifications: unreadCount changed to:', unreadCount);
  }, [unreadCount]);

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
    markAllAsRead,
    deleteNotification,
    bulkDeleteNotifications,
    subscribeToPushNotifications,
    unsubscribeFromPushNotifications,
    updatePreferences,
    getPreferences,
    addNotification,
    refetch: () => fetchNotifications(false),
    refetchWithCount: fetchNotifications
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
