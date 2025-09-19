import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiBellOff, FiSave, FiCheck } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../Components/LoadingSpinner';
import { setupPushNotifications, getPermissionStatus, showBrowserSettingsInstructions } from '../utils/notificationPermission';

const NotificationSettings = () => {
  const { updatePreferences, getPreferences } = useNotifications();
  
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    priceDrops: true,
    promotional: true,
    system: true
  });
  
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [permissionStatus, setPermissionStatus] = useState(null);

  useEffect(() => {
    loadPreferences();
    checkPushStatus();
    checkPermissionStatus();
  }, []);

  const checkPermissionStatus = useCallback(() => {
    const status = getPermissionStatus();
    setPermissionStatus(status);
    console.log('Permission status:', status);
    
    // Additional debugging
    console.log('Notification.permission:', Notification.permission);
    console.log('Service Worker support:', 'serviceWorker' in navigator);
    console.log('Push Manager support:', 'PushManager' in window);
    console.log('HTTPS/SSL:', window.location.protocol === 'https:' || window.location.hostname === 'localhost');
  }, []);

  const loadPreferences = useCallback(async () => {
    try {
      const prefs = await getPreferences();
      if (prefs) {
        setPreferences(prefs);
      }
    } catch (err) {
      console.error('Error loading preferences:', err);
    } finally {
      setLoading(false);
    }
  }, [getPreferences]);

  const checkPushStatus = useCallback(async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setPushEnabled(!!subscription);
      } catch (error) {
        console.error('Error checking push status:', error);
      }
    }
  }, []);

  const handlePreferenceChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
    setHasChanges(true);
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    try {
      await updatePreferences(preferences);
      setHasChanges(false);
      toast.success('Notification preferences saved successfully');
    } catch {
      toast.error('Failed to save preferences');
    } finally {
      setSaving(false);
    }
  };



  const handleDisablePush = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      
      if (subscription) {
        await subscription.unsubscribe();
        await fetch('/api/notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });
      }
      
      setPushEnabled(false);
      toast.success('Push notifications disabled');
    } catch (error) {
      console.error('Error disabling push notifications:', error);
      toast.error('Failed to disable push notifications');
    }
  };



  const handleEnablePushNotifications = async () => {
    setSaving(true);
    try {
      // First check current permission status
      const currentPermission = Notification.permission;
      console.log('Current notification permission:', currentPermission);
      
      if (currentPermission === 'denied') {
        toast.error('Notification permission is blocked. Please enable it in your browser settings and refresh the page.');
        return;
      }
      
      const success = await setupPushNotifications();
      if (success) {
        setPushEnabled(true);
        checkPermissionStatus();
        toast.success('Push notifications enabled successfully!');
      } else {
        toast.error('Failed to enable push notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      
      if (error.message.includes('denied')) {
        toast.error('Permission denied. Please allow notifications in your browser settings and try again.');
      } else if (error.message.includes('not supported')) {
        toast.error('Push notifications are not supported in this browser.');
      } else if (error.message.includes('HTTPS')) {
        toast.error('Push notifications require HTTPS. Please use a secure connection.');
      } else {
        toast.error(error.message || 'Error enabling push notifications. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleShowInstructions = () => {
    const instructions = showBrowserSettingsInstructions();
    alert(instructions);
  };

  const handleRefreshPermissionStatus = async () => {
    console.log('Refreshing permission status...');
    
    // Force a page reload to clear any cached permission states
    if (Notification.permission === 'denied') {
      const shouldReload = confirm(
        'The notification permission appears to be cached. Would you like to refresh the page to apply the new browser settings?\n\nThis will reload the page to clear any cached permission states.'
      );
      if (shouldReload) {
        // Clear any cached data and reload
        if ('caches' in window) {
          try {
            await caches.delete('notification-cache');
          } catch {
            console.log('No notification cache to clear');
          }
        }
        window.location.reload();
        return;
      }
    }
    
    // Re-check permission status
    checkPermissionStatus();
    checkPushStatus();
    
    toast.success('Permission status refreshed');
  };

  const handleForcePermissionReset = async () => {
    console.log('Force resetting notification permission...');
    
    try {
      // Try to request permission again to trigger browser dialog
      const permission = await Notification.requestPermission();
      console.log('New permission result:', permission);
      
      if (permission === 'granted') {
        toast.success('Notification permission granted!');
        checkPermissionStatus();
        checkPushStatus();
      } else if (permission === 'denied') {
        toast.error('Permission still denied. Please check browser settings and try again.');
      } else {
        toast.info('Permission request was dismissed. Please try again.');
      }
    } catch (error) {
      console.error('Error requesting permission:', error);
      toast.error('Error requesting permission. Please try refreshing the page.');
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
      <div className="max-w-2xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-center space-x-4 mb-6">
            <Link
              to="/notifications"
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiArrowLeft className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Notification Settings</h1>
              <p className="text-gray-600 mt-1">Manage how you receive notifications</p>
            </div>
          </div>

          {/* Push Notification Toggle */}
          <div className="border-b border-gray-200 pb-6 mb-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Push Notifications</h3>
                <p className="text-gray-600 mt-1">
                  Receive notifications even when the app is closed
                </p>
                {permissionStatus && (
                  <p className={`text-sm mt-1 ${
                    permissionStatus.status === 'granted' ? 'text-green-600' :
                    permissionStatus.status === 'denied' ? 'text-red-600' :
                    'text-yellow-600'
                  }`}>
                    Status: {permissionStatus.message}
                  </p>
                )}
              </div>
              <button
                onClick={pushEnabled ? handleDisablePush : handleEnablePushNotifications}
                disabled={saving}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors disabled:opacity-50 ${
                  pushEnabled
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {pushEnabled ? (
                  <>
                    <FiBellOff className="w-4 h-4" />
                    <span>Disable</span>
                  </>
                ) : (
                  <>
                    <FiBell className="w-4 h-4" />
                    <span>{saving ? 'Enabling...' : 'Enable'}</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {pushEnabled 
                  ? 'Push notifications are enabled. You\'ll receive notifications even when the app is closed.'
                  : 'Push notifications are disabled. You\'ll only see notifications when the app is open.'
                }
              </p>
              {permissionStatus?.status === 'denied' && (
                <button
                  onClick={handleShowInstructions}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  How to enable notifications in browser settings
                </button>
              )}
            </div>
          </div>

          {/* Notification Types */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Types</h3>
            <div className="space-y-4">
              {[
                {
                  key: 'orderUpdates',
                  title: 'Order Updates',
                  description: 'Get notified about order status changes, shipping updates, and delivery confirmations',
                  icon: ''
                },
                {
                  key: 'priceDrops',
                  title: 'Price Drops',
                  description: 'Be the first to know when items in your wishlist go on sale',
                  icon: ''
                },
                
                {
                  key: 'promotional',
                  title: 'Promotional Offers',
                  description: 'Receive updates about sales, discounts, and special offers',
                  icon: ''
                },
                {
                  key: 'system',
                  title: 'System Notifications',
                  description: 'Important account updates and security notifications',
                  icon: ''
                }
              ].map((type) => (
                <div key={type.key} className="flex items-start space-x-3 p-4 border border-gray-200 rounded-lg">
                  <span className="text-2xl">{type.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{type.title}</h4>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={preferences[type.key]}
                          onChange={(e) => handlePreferenceChange(type.key, e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                    <p className="text-sm text-gray-600">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Save Button */}
        {hasChanges && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">You have unsaved changes</p>
              <button
                onClick={handleSavePreferences}
                disabled={saving}
                className="flex items-center space-x-2 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <FiSave className="w-4 h-4" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}



        {/* Debug Info (only in development) */}
        {import.meta.env.DEV && (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Debug Information</h4>
            <div className="text-xs text-gray-600 space-y-1">
              <p>Notification.permission: <span className="font-mono">{Notification.permission}</span></p>
              <p>Service Worker: <span className="font-mono">{'serviceWorker' in navigator ? 'Supported' : 'Not supported'}</span></p>
              <p>Push Manager: <span className="font-mono">{'PushManager' in window ? 'Supported' : 'Not supported'}</span></p>
              <p>HTTPS/SSL: <span className="font-mono">{window.location.protocol === 'https:' || window.location.hostname === 'localhost' ? 'Yes' : 'No'}</span></p>
              <p>Push Enabled: <span className="font-mono">{pushEnabled ? 'Yes' : 'No'}</span></p>
            </div>
          </div>
        )}

        {/* Troubleshooting Section */}
        {permissionStatus?.status === 'denied' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <h4 className="font-medium text-red-900 mb-2">Troubleshooting</h4>
            <div className="text-sm text-red-800 space-y-2">
              <p><strong>Notifications are blocked in your browser.</strong></p>
              <p>To fix this:</p>
              <ol className="list-decimal list-inside space-y-1 ml-4">
                <li>Click the lock/shield icon in your browser's address bar</li>
                <li>Find "Notifications" in the site settings</li>
                <li>Change it from "Block" to "Allow"</li>
                <li>Refresh this page and try again</li>
              </ol>
              <button
                onClick={handleShowInstructions}
                className="mt-3 text-sm text-blue-600 hover:text-blue-800 underline"
              >
                View detailed instructions for your browser
              </button>
              <button
                onClick={handleRefreshPermissionStatus}
                className="mt-2 text-sm text-green-600 hover:text-green-800 underline block"
              >
                Refresh permission status
              </button>
              <button
                onClick={handleForcePermissionReset}
                className="mt-2 text-sm text-orange-600 hover:text-orange-800 underline block"
              >
                Force permission request
              </button>
            </div>
          </div>
        )}

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
                      <h4 className="font-medium text-blue-900 mb-2">Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can change these settings at any time</li>
            <li>• Push notifications work best when the app is installed on your device</li>
            <li>• Some notifications are important and cannot be disabled</li>
            <li>• You can also manage notifications in your browser settings</li>
            <li>• Make sure you're using HTTPS for push notifications to work</li>
          </ul>
        </div>
      </div>
    </div>
  );
};



export default NotificationSettings;
