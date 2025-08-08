import React, { useState } from 'react';
import { FiBell } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';
import NotificationDropdown from './NotificationDropdown';

const NotificationBell = () => {
  const { isAuthenticated } = useAuth();
  const { unreadCount } = useNotifications();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Debug logging
  console.log('NotificationBell render:', { isAuthenticated, unreadCount });

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  if (!isAuthenticated) {
    console.log('NotificationBell: User not authenticated, returning null');
    return null;
  }

  return (
    <div className="relative">
      {/* Floating notification indicator */}
      {unreadCount > 0 && (
        <div className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-ping"></div>
      )}
      
      {/* Notification Bell */}
      <button
        onClick={toggleDropdown}
        className={`relative p-2 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-300 rounded-lg ${
          unreadCount > 0 
            ? 'text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100' 
            : 'text-gray-600 hover:text-blue-600'
        }`}
        aria-label="Notifications"
      >
        <FiBell className={`w-6 h-6 ${unreadCount > 0 ? 'animate-pulse' : ''}`} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-semibold animate-bounce">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Dropdown */}
      {isDropdownOpen && (
        <NotificationDropdown 
          onClose={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default NotificationBell;
