// Mobile notification test utility
export const testMobileNotifications = async () => {
  console.log('📱 Testing mobile notification compatibility...');
  
  const results = {
    isMobile: false,
    isChrome: false,
    serviceWorker: false,
    pushManager: false,
    permission: false,
    https: false,
    standalone: false
  };

  // Check if mobile
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  results.isMobile = isMobile;
  console.log(`📱 Mobile device: ${isMobile ? 'Yes' : 'No'}`);

  // Check if Chrome
  const isChrome = /Chrome/.test(navigator.userAgent) && !/Edge/.test(navigator.userAgent);
  results.isChrome = isChrome;
  console.log(`🌐 Chrome browser: ${isChrome ? 'Yes' : 'No'}`);

  // Check HTTPS
  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  results.https = isHttps;
  console.log(`🔒 HTTPS/SSL: ${isHttps ? 'Yes' : 'No'}`);

  // Check if app is installed (standalone mode)
  const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
                      window.navigator.standalone === true;
  results.standalone = isStandalone;
  console.log(`📱 App installed: ${isStandalone ? 'Yes' : 'No'}`);

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

  // Mobile-specific recommendations
  if (isMobile) {
    console.log('\n📱 Mobile Recommendations:');
    
    if (!isHttps) {
      console.log('⚠️  Push notifications require HTTPS in production');
    }
    
    if (!isStandalone) {
      console.log('💡 Consider adding the app to home screen for better experience');
    }
    
    if (isChrome) {
      console.log('✅ Chrome mobile supports all notification features');
    } else {
      console.log('⚠️  Some features may not work in other mobile browsers');
    }
  }

  return results;
};

// Test mobile push notification
export const testMobilePushNotification = async () => {
  try {
    console.log('📱 Testing mobile push notification...');
    
    // Check mobile compatibility first
    const compatibility = await testMobileNotifications();
    
    if (!compatibility.serviceWorker || !compatibility.pushManager) {
      throw new Error('Push notifications not supported on this device');
    }

    if (!compatibility.https && !window.location.hostname.includes('localhost')) {
      throw new Error('Push notifications require HTTPS in production');
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

    console.log('✅ Mobile push notification subscription successful');
    console.log('📱 Subscription endpoint:', subscription.endpoint);

    // Send subscription to server
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      browser: getMobileBrowserInfo(),
      version: getMobileBrowserVersion(),
      isMobile: true,
      isStandalone: window.matchMedia('(display-mode: standalone)').matches
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

    console.log('✅ Mobile push notification setup complete');
    return true;
  } catch (error) {
    console.error('❌ Mobile push notification test failed:', error);
    return false;
  }
};

// Send test notification for mobile
export const sendMobileTestNotification = async () => {
  try {
    const response = await fetch('/api/notifications/test', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        title: '📱 Mobile Test Notification',
        message: 'This is a test notification for mobile Chrome!',
        type: 'system',
        data: {
          mobile: true,
          timestamp: new Date().toISOString()
        }
      })
    });

    if (response.ok) {
      console.log('✅ Mobile test notification sent successfully');
      return true;
    } else {
      console.error('❌ Failed to send mobile test notification:', response.status);
      return false;
    }
  } catch (error) {
    console.error('❌ Error sending mobile test notification:', error);
    return false;
  }
};

// Helper functions for mobile
function getMobileBrowserInfo() {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome Mobile';
  if (userAgent.includes('Safari')) return 'Safari Mobile';
  if (userAgent.includes('Firefox')) return 'Firefox Mobile';
  if (userAgent.includes('Edge')) return 'Edge Mobile';
  return 'Mobile Browser';
}

function getMobileBrowserVersion() {
  const userAgent = navigator.userAgent;
  const match = userAgent.match(/(chrome|safari|firefox|edge)\/(\d+)/i);
  return match ? match[2] : 'Unknown';
}

// Check if device supports mobile notifications
export const isMobileNotificationSupported = () => {
  const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const isHttps = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  const hasServiceWorker = 'serviceWorker' in navigator;
  const hasPushManager = 'PushManager' in window;
  
  return isMobile && isHttps && hasServiceWorker && hasPushManager;
};
