import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTrash2, FiCheck, FiSettings, FiFilter, FiSearch } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../Components/LoadingSpinner';

const Notifications = () => {
  const { 
    notifications, 
    loading, 
    markAsRead, 
    deleteNotification, 
    unreadCount,
    refetch 
  } = useNotifications();
  
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // all, unread, read
  const [searchTerm, setSearchTerm] = useState('');
  const [isMarkingRead, setIsMarkingRead] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filter notifications based on current filter and search term
  const filteredNotifications = notifications.filter(notification => {
    const matchesFilter = filter === 'all' || 
      (filter === 'unread' && !notification.isRead) ||
      (filter === 'read' && notification.isRead);
    
    const matchesSearch = !searchTerm || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

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
    if (selectedNotifications.length === filteredNotifications.length) {
      setSelectedNotifications([]);
    } else {
      setSelectedNotifications(filteredNotifications.map(n => n._id));
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
              <p className="text-gray-600 mt-1">
                {unreadCount} unread • {notifications.length} total
              </p>
            </div>
            <div className="flex items-center space-x-3">
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAsRead}
                  disabled={isMarkingRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{isMarkingRead ? 'Marking...' : 'Mark All as Read'}</span>
                </button>
              )}
              <Link
                to="/notifications/settings"
                className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                <FiSettings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>

          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center space-x-2">
              <FiFilter className="text-gray-400 w-4 h-4" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Notifications</option>
                <option value="unread">Unread Only</option>
                <option value="read">Read Only</option>
              </select>
            </div>
          </div>
        </div>

        {/* Actions */}
        {selectedNotifications.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleMarkAsRead}
                  disabled={isMarkingRead}
                  className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>{isMarkingRead ? 'Marking...' : 'Mark as Read'}</span>
                </button>
                <button
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50 transition-colors"
                >
                  <FiTrash2 className="w-4 h-4" />
                  <span>{isDeleting ? 'Deleting...' : 'Delete'}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notifications List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          {filteredNotifications.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-6xl mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {searchTerm || filter !== 'all' ? 'No matching notifications' : 'No notifications yet'}
              </h3>
              <p className="text-gray-600">
                {searchTerm || filter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'We\'ll notify you about important updates, order status, and exclusive offers'
                }
              </p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {/* Select All */}
              <div className="p-4 border-b border-gray-100">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={selectedNotifications.length === filteredNotifications.length && filteredNotifications.length > 0}
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    Select All ({filteredNotifications.length})
                  </span>
                </label>
              </div>

              {/* Notifications */}
              {filteredNotifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`p-6 hover:bg-gray-50 transition-colors ${
                    selectedNotifications.includes(notification._id) ? 'bg-blue-50' : ''
                  } ${!notification.isRead ? 'bg-blue-50/50 border-l-4 border-blue-500' : ''}`}
                >
                  <div className="flex items-start space-x-4">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification._id)}
                      onChange={() => handleSelectNotification(notification._id)}
                      className="mt-1 h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                    />
                    
                    {/* Notification Icon */}
                    <div className="flex-shrink-0">
                      <span className="text-3xl">{getNotificationIcon(notification.type)}</span>
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-2">
                            <h3 className={`text-lg font-semibold ${
                              !notification.isRead ? 'text-gray-900' : 'text-gray-700'
                            }`}>
                              {notification.title}
                            </h3>
                            {!notification.isRead && (
                              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                                New
                              </span>
                            )}
                          </div>
                          <p className="text-gray-600 mb-3 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span className="text-sm text-gray-400">
                                {notification.timeAgo}
                              </span>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                notification.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                notification.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {notification.priority}
                              </span>
                            </div>
                            {notification.actionUrl && (
                              <Link
                                to={notification.actionUrl}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View Details →
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
      </div>
    </div>
  );
};

export default Notifications;
