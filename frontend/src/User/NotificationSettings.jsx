import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiArrowLeft, FiBell, FiBellOff, FiSave, FiCheck, FiPlay } from 'react-icons/fi';
import { useNotifications } from '../hooks/useNotifications';
import { toast } from 'react-hot-toast';
import LoadingSpinner from '../Components/LoadingSpinner';
import { testNotificationSystem, sendTestNotification, enablePushNotifications } from '../utils/notificationTest';
import { testMobileNotifications, testMobilePushNotification, sendMobileTestNotification } from '../utils/mobileNotificationTest';

const NotificationSettings = () => {
  const { updatePreferences, getPreferences } = useNotifications();
  
  const [preferences, setPreferences] = useState({
    orderUpdates: true,
    priceDrops: true,
    stockAlerts: true,
    promotional: true,
    system: true
  });
  
  const [pushEnabled, setPushEnabled] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [testing, setTesting] = useState(false);

  useEffect(() => {
    loadPreferences();
    checkPushStatus();
  }, []);

  const loadPreferences = async () => {
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
  };

  const checkPushStatus = async () => {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        setPushEnabled(!!subscription);
      } catch (error) {
        console.error('Error checking push status:', error);
      }
    }
  };

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

  const handleEnablePush = async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      toast.error('Push notifications are not supported in this browser');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        toast.error('Notification permission denied');
        return;
      }

      // Get VAPID public key
      const response = await fetch('/api/notifications/vapid-public-key');
      const { publicKey } = await response.json();

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: publicKey
      });

      // Send subscription to server
      const deviceInfo = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        browser: getBrowserInfo(),
        version: getBrowserVersion()
      };

      await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          endpoint: subscription.endpoint,
          keys: {
            p256dh: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('p256dh')))),
            auth: btoa(String.fromCharCode.apply(null, new Uint8Array(subscription.getKey('auth'))))
          },
          deviceInfo,
          preferences
        })
      });

      setPushEnabled(true);
      toast.success('Push notifications enabled successfully');
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast.error('Failed to enable push notifications');
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

  const handleTestNotificationSystem = async () => {
    setTesting(true);
    try {
      console.log('🧪 Testing notification system...');
      const results = await testNotificationSystem();
      console.log('Test results:', results);
      
      if (results.socketIO) {
        toast.success('Socket.IO connected! Real-time notifications working.');
      } else {
        toast.error('Socket.IO not connected. Check console for details.');
      }
      
      if (results.subscription) {
        toast.success('Push notifications enabled!');
      } else {
        toast.error('Push notifications not enabled. Please enable them first.');
      }
    } catch (error) {
      console.error('Test failed:', error);
      toast.error('Test failed. Check console for details.');
    } finally {
      setTesting(false);
    }
  };

  const handleSendTestNotification = async () => {
    setTesting(true);
    try {
      const success = await sendTestNotification();
      if (success) {
        toast.success('Test notification sent! Check your notifications.');
      } else {
        toast.error('Failed to send test notification.');
      }
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast.error('Error sending test notification.');
    } finally {
      setTesting(false);
    }
  };

  const handleEnablePushNotifications = async () => {
    setTesting(true);
    try {
      const success = await enablePushNotifications();
      if (success) {
        setPushEnabled(true);
        toast.success('Push notifications enabled successfully!');
      } else {
        toast.error('Failed to enable push notifications.');
      }
    } catch (error) {
      console.error('Error enabling push notifications:', error);
      toast.error('Error enabling push notifications.');
    } finally {
      setTesting(false);
    }
  };

  const handleTestMobileNotifications = async () => {
    setTesting(true);
    try {
      const results = await testMobileNotifications();
      console.log('Mobile test results:', results);
      
      if (results.isMobile) {
        toast.success(`Mobile device detected! Chrome: ${results.isChrome ? 'Yes' : 'No'}`);
      } else {
        toast.info('Not a mobile device');
      }
      
      if (results.https) {
        toast.success('HTTPS/SSL: OK');
      } else {
        toast.error('HTTPS required for production');
      }
      
      if (results.serviceWorker && results.pushManager) {
        toast.success('Mobile notifications supported!');
      } else {
        toast.error('Mobile notifications not supported');
      }
    } catch (error) {
      console.error('Mobile test failed:', error);
      toast.error('Mobile test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleTestMobilePushNotification = async () => {
    setTesting(true);
    try {
      const success = await testMobilePushNotification();
      if (success) {
        toast.success('Mobile push notification setup successful!');
      } else {
        toast.error('Mobile push notification setup failed');
      }
    } catch (error) {
      console.error('Mobile push test failed:', error);
      toast.error('Mobile push test failed');
    } finally {
      setTesting(false);
    }
  };

  const handleSendMobileTestNotification = async () => {
    setTesting(true);
    try {
      const success = await sendMobileTestNotification();
      if (success) {
        toast.success('Mobile test notification sent!');
      } else {
        toast.error('Failed to send mobile test notification');
      }
    } catch (error) {
      console.error('Mobile notification send failed:', error);
      toast.error('Mobile notification send failed');
    } finally {
      setTesting(false);
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
              </div>
              <button
                onClick={pushEnabled ? handleDisablePush : handleEnablePush}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
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
                    <span>Enable</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">
                {pushEnabled 
                  ? '✅ Push notifications are enabled. You\'ll receive notifications even when the app is closed.'
                  : '⚠️ Push notifications are disabled. You\'ll only see notifications when the app is open.'
                }
              </p>
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
                  icon: '📦'
                },
                {
                  key: 'priceDrops',
                  title: 'Price Drops',
                  description: 'Be the first to know when items in your wishlist go on sale',
                  icon: '💰'
                },
                {
                  key: 'stockAlerts',
                  title: 'Stock Alerts',
                  description: 'Get notified when out-of-stock items become available again',
                  icon: '⚠️'
                },
                {
                  key: 'promotional',
                  title: 'Promotional Offers',
                  description: 'Receive updates about sales, discounts, and special offers',
                  icon: '🎉'
                },
                {
                  key: 'system',
                  title: 'System Notifications',
                  description: 'Important account updates and security notifications',
                  icon: '🔔'
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

        {/* Test Section */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-yellow-900 mb-4">🧪 Test Notifications</h4>
          <div className="space-y-3">
            <button
              onClick={handleTestNotificationSystem}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
            >
              <FiPlay className="w-4 h-4" />
              <span>{testing ? 'Testing...' : 'Test System'}</span>
            </button>
            
            <button
              onClick={handleSendTestNotification}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              <span>{testing ? 'Sending...' : 'Send Test Notification'}</span>
            </button>
            
            <button
              onClick={handleEnablePushNotifications}
              disabled={testing || pushEnabled}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 disabled:opacity-50 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              <span>{testing ? 'Enabling...' : 'Enable Push Notifications'}</span>
            </button>
          </div>
          <p className="text-sm text-yellow-800 mt-3">
            Use these buttons to test your notification system. Check the browser console for detailed results.
          </p>
        </div>

        {/* Mobile Test Section */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-4">📱 Mobile Notifications</h4>
          <div className="space-y-3">
            <button
              onClick={handleTestMobileNotifications}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <FiPlay className="w-4 h-4" />
              <span>{testing ? 'Testing...' : 'Test Mobile Compatibility'}</span>
            </button>
            
            <button
              onClick={handleTestMobilePushNotification}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              <span>{testing ? 'Setting up...' : 'Setup Mobile Push'}</span>
            </button>
            
            <button
              onClick={handleSendMobileTestNotification}
              disabled={testing}
              className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 transition-colors"
            >
              <FiBell className="w-4 h-4" />
              <span>{testing ? 'Sending...' : 'Send Mobile Test'}</span>
            </button>
          </div>
          <p className="text-sm text-blue-800 mt-3">
            Test mobile-specific notification features. Works best on Chrome mobile with HTTPS.
          </p>
        </div>

        {/* Additional Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-blue-900 mb-2">💡 Tips</h4>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• You can change these settings at any time</li>
            <li>• Push notifications work best when the app is installed on your device</li>
            <li>• Some notifications are important and cannot be disabled</li>
            <li>• You can also manage notifications in your browser settings</li>
          </ul>
        </div>
      </div>
    </div>
  );
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

export default NotificationSettings;
