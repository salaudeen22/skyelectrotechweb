import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiX, FiCheck, FiTrash2, FiSettings, FiEye } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';

const NotificationDropdown = ({ onClose }) => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    deleteNotification, 
    unreadCount,
    refetch 
  } = useNotifications();
  
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.notification-dropdown')) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleMarkAsRead = async () => {
    if (selectedNotifications.length === 0) return;
    
    setIsMarkingRead(true);
    try {
      await markAsRead(selectedNotifications);
      setSelectedNotifications([]);
      toast.success('Notifications marked as read');
      refetch();
    } catch (error) {
      toast.error('Failed to mark notifications as read');
    } finally {
      setIsMarkingRead(false);
    }
  };

  const handleDeleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    setIsDeleting(true);
    try {
      await Promise.all(selectedNotifications.map(id => deleteNotification(id)));
      setSelectedNotifications([]);
      toast.success('Notifications deleted');
      refetch();
    } catch (error) {
      toast.error('Failed to delete notifications');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedNotifications.length === notifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(notifications.map(n => n._id));
    }
  };

  const handleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => 
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'order_update':
        return '';
      case 'price_drop':
        return '';
      case 'stock_alert':
        return '';
      case 'promotional':
        return '';
      case 'payment':
        return '';
      case 'delivery':
        return '';
      default:
        return '';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'order_update':
        return 'bg-blue-50 border-blue-200';
      case 'price_drop':
        return 'bg-green-50 border-green-200';
      case 'stock_alert':
        return 'bg-yellow-50 border-yellow-200';
      case 'promotional':
        return 'bg-purple-50 border-purple-200';
      case 'payment':
        return 'bg-indigo-50 border-indigo-200';
      case 'delivery':
        return 'bg-teal-50 border-teal-200';
      default:
        return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="notification-dropdown absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div className="flex items-center space-x-2">
          <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
          {unreadCount > 0 && (
            <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={handleSelectAll}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Select all"
          >
            <FiEye className="w-4 h-4" />
          </button>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
            title="Close"
          >
            <FiX className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Actions */}
      {selectedNotifications.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            {selectedNotifications.length} selected
          </span>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleMarkAsRead}
              disabled={isMarkingRead}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <FiCheck className="w-3 h-3" />
              <span>Mark Read</span>
            </button>
            <button
              onClick={handleDeleteSelected}
              disabled={isDeleting}
              className="flex items-center space-x-1 px-2 py-1 text-xs bg-red-500 text-white rounded hover:bg-red-600 disabled:opacity-50"
            >
              <FiTrash2 className="w-3 h-3" />
              <span>Delete</span>
            </button>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="max-h-64 overflow-y-auto">
        {loading ? (
          <div className="p-4 text-center text-gray-500">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <div className="text-4xl mb-2"></div>
            <p className="text-sm">No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you about important updates</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {notifications.map((notification) => (
              <div
                key={notification._id}
                className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer ${
                  selectedNotifications.includes(notification._id) ? 'bg-blue-50' : ''
                }`}
                onClick={() => handleSelectNotification(notification._id)}
              >
                <div className="flex items-start space-x-3">
                  {/* Checkbox */}
                  <input
                    type="checkbox"
                    checked={selectedNotifications.includes(notification._id)}
                    onChange={() => handleSelectNotification(notification._id)}
                    className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    onClick={(e) => e.stopPropagation()}
                  />
                  
                  {/* Notification Icon */}
                  <div className="flex-shrink-0">
                    <span className="text-2xl">{getNotificationIcon(notification.type)}</span>
                  </div>
                  
                  {/* Notification Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          !notification.isRead ? 'text-gray-900' : 'text-gray-600'
                        }`}>
                          {notification.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {notification.message}
                        </p>
                        <div className="flex items-center justify-between mt-2">
                          <span className="text-xs text-gray-400">
                            {notification.timeAgo}
                          </span>
                          {notification.actionUrl && (
                            <Link
                              to={notification.actionUrl}
                              onClick={(e) => e.stopPropagation()}
                              className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              View Details
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <Link
            to="/notifications"
            onClick={onClose}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
          >
            View All Notifications
          </Link>
          <Link
            to="/notifications/settings"
            onClick={onClose}
            className="flex items-center space-x-1 text-sm text-gray-500 hover:text-gray-700"
          >
            <FiSettings className="w-4 h-4" />
            <span>Settings</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotificationDropdown;
