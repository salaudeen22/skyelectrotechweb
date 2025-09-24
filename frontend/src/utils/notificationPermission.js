// Notification permission utility with better user experience
export const requestNotificationPermission = async () => {
  
  // Check if notifications are supported
  if (!('Notification' in window)) {
    throw new Error('Notifications are not supported in this browser');
  }

  // Check current permission status
  const currentPermission = Notification.permission;

  if (currentPermission === 'granted') {
    return true;
  }

  if (currentPermission === 'denied') {
    throw new Error('Notification permission was previously denied. Please enable it in your browser setting.');
  }

  // Check if we're on HTTPS or localhost
  const isSecure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';
  if (!isSecure) {
    throw new Error('Notifications require HTTPS (except for localhost)');
  }

  // Request permission with better user experience
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      return true;
    } else if (permission === 'denied') {
      throw new Error('Notification permission denied by user');
    } else {
      throw new Error('Notification permission request was dismissed');
    }
  } catch (error) {
    console.error('Permission request failed:', error);
    throw error;
  }
};

// Check if push notifications are supported
export const checkPushSupport = () => {
  const support = {
    notifications: false,
    serviceWorker: false,
    pushManager: false,
    secure: false,
    permission: 'default'
  };

  // Check Notification API
  if ('Notification' in window) {
    support.notifications = true;
    support.permission = Notification.permission;
  }

  // Check Service Worker
  if ('serviceWorker' in navigator) {
    support.serviceWorker = true;
  }

  // Check Push Manager
  if ('PushManager' in window) {
    support.pushManager = true;
  }

  // Check HTTPS
  support.secure = window.location.protocol === 'https:' || window.location.hostname === 'localhost';

  return support;
};

// Get permission status with detailed information
export const getPermissionStatus = () => {
  const support = checkPushSupport();
  
  if (!support.notifications) {
    return {
      status: 'not-supported',
      message: 'Notifications are not supported in this browser',
      canRequest: false
    };
  }

  if (!support.secure) {
    return {
      status: 'not-secure',
      message: 'Notifications require HTTPS (except for localhost)',
      canRequest: false
    };
  }

  if (!support.serviceWorker || !support.pushManager) {
    return {
      status: 'push-not-supported',
      message: 'Push notifications are not supported in this browser',
      canRequest: false
    };
  }

  switch (support.permission) {
    case 'granted':
      return {
        status: 'granted',
        message: 'Notification permission granted',
        canRequest: false
      };
    case 'denied':
      return {
        status: 'denied',
        message: 'Notification permission denied. Please enable it in browser settings.',
        canRequest: false
      };
    case 'default':
    default:
      return {
        status: 'default',
        message: 'Notification permission not yet requested',
        canRequest: true
      };
  }
};

// Show browser settings instructions
export const showBrowserSettingsInstructions = () => {
  const browser = getBrowserInfo();
  let instructions = '';

  switch (browser) {
    case 'Chrome':
      instructions = `
        To enable notifications in Chrome:
        1. Click the lock icon in the address bar
        2. Click "Site settings"
        3. Find "Notifications" and change to "Allow"
        4. Refresh the page
      `;
      break;
    case 'Firefox':
      instructions = `
        To enable notifications in Firefox:
        1. Click the shield icon in the address bar
        2. Click "Site permissions"
        3. Find "Send notifications" and change to "Allow"
        4. Refresh the page
      `;
      break;
    case 'Safari':
      instructions = `
        To enable notifications in Safari:
        1. Go to Safari > Preferences > Websites
        2. Click "Notifications" in the sidebar
        3. Find this website and change to "Allow"
        4. Refresh the page
      `;
      break;
    case 'Edge':
      instructions = `
        To enable notifications in Edge:
        1. Click the lock icon in the address bar
        2. Click "Site permissions"
        3. Find "Notifications" and change to "Allow"
        4. Refresh the page
      `;
      break;
    default:
      instructions = `
        To enable notifications:
        1. Look for a lock or shield icon in the address bar
        2. Click it to access site settings
        3. Find "Notifications" and change to "Allow"
        4. Refresh the page
      `;
  }

  return instructions;
};

// Enhanced push notification setup
export const setupPushNotifications = async () => {
  try {

    // Step 1: Check support
    const support = checkPushSupport();
    if (!support.notifications || !support.serviceWorker || !support.pushManager) {
      throw new Error('Push notifications are not supported in this browser');
    }

    if (!support.secure) {
      throw new Error('Push notifications require HTTPS (except for localhost)');
    }

    // Step 2: Request permission
    await requestNotificationPermission();

    // Step 3: Get VAPID public key
    const response = await fetch('/api/notifications/vapid-public-key');
    if (!response.ok) {
      throw new Error('Failed to get VAPID public key');
    }
    const { publicKey } = await response.json();

    // Step 4: Subscribe to push notifications
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey
    });

    // Step 5: Send subscription to server
    const deviceInfo = {
      userAgent: navigator.userAgent,
      platform: navigator.userAgentData?.platform || 'unknown',
      browser: getBrowserInfo(),
      version: getBrowserVersion(),
      isMobile: /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)
    };

    const subscribeResponse = await fetch('/api/notifications/subscribe', {
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
          promotional: true,
          system: true
        }
      })
    });

    if (!subscribeResponse.ok) {
      throw new Error('Failed to subscribe to push notifications');
    }

    return true;
  } catch (error) {
    console.error('Push notification setup failed:', error);
    throw error;
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
