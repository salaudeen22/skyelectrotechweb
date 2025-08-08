// Notification test utility
export const testNotificationSystem = async () => {
  console.log('🧪 Testing notification system...');
  
  const results = {
    serviceWorker: false,
    pushManager: false,
    permission: false,
    socketIO: false,
    subscription: false
  };

  // Test Service Worker
  if ('serviceWorker' in navigator) {
    results.serviceWorker = true;
    console.log('✅ Service Worker supported');
  } else {
    console.log('❌ Service Worker not supported');
  }

  // Test Push Manager
  if ('PushManager' in window) {
    results.pushManager = true;
    console.log('✅ Push Manager supported');
  } else {
    console.log('❌ Push Manager not supported');
  }

  // Test Notification Permission
  if ('Notification' in window) {
    const permission = Notification.permission;
    results.permission = permission;
    console.log(`📱 Notification permission: ${permission}`);
  } else {
    console.log('❌ Notifications not supported');
  }

  // Test Socket.IO
  if (window.io) {
    results.socketIO = window.io.connected;
    console.log(`🔌 Socket.IO connected: ${window.io.connected}`);
  } else {
    console.log('❌ Socket.IO not initialized');
  }

  // Test Push Subscription
  try {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      results.subscription = !!subscription;
      console.log(`📲 Push subscription: ${subscription ? 'Active' : 'Not subscribed'}`);
    }
  } catch (error) {
    console.error('❌ Error checking push subscription:', error);
  }

  return results;
};

// Test sending a notification
export const sendTestNotification = async () => {
  try {
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title: 'Test Notification',
        message: 'This is a test notification to verify the system is working!',
        type: 'system'
      })
    });

    if (response.ok) {
      console.log('✅ Test notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send test notification:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending test notification:', error);
    return false;
  }
};

// Enable push notifications
export const enablePushNotifications = async () => {
  try {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      throw new Error('Push notifications not supported');
    }

    // Request permission
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }

    // Get VAPID public key
    const response = await fetch('/api/notifications/vapid-public-key');
    const { publicKey } = await response.json();

    // Subscribe to push notifications
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
        preferences: {
          orderUpdates: true,
          priceDrops: true,
          stockAlerts: true,
          promotional: true,
          system: true
        }
      })
    });

    console.log('✅ Push notifications enabled successfully');
    return true;
  } catch (error) {
    console.error('❌ Failed to enable push notifications:', error);
    return false;
  }
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
