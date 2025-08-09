// Service Worker for Push Notifications
const CACHE_NAME = 'skyelectrotech-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  event.waitUntil((async () => {
    const cache = await caches.open(STATIC_CACHE);
    const urlsToCache = [
      '/',
      '/index.html',
      '/logo.svg',
      '/vite.svg'
    ];

    // Cache each resource individually so one failure doesn't break install
    await Promise.allSettled(
      urlsToCache.map(async (url) => {
        try {
          const request = new Request(url, { cache: 'reload' });
          const response = await fetch(request);
          if (response && response.ok) {
            await cache.put(request, response);
          } else {
            console.warn('Skipping cache for', url, '- response not OK');
          }
        } catch (err) {
          console.warn('Failed to cache', url, err);
        }
      })
    );
  })());
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  let notificationData = {
    title: 'SkyElectroTech',
    body: 'You have a new notification',
    icon: '/logo.svg',
    badge: '/logo.svg',
    data: {
      url: '/notifications',
      timestamp: Date.now()
    }
  };

  if (event.data) {
    try {
      const data = event.data.json();
      notificationData = {
        ...notificationData,
        ...data
      };
    } catch (error) {
      console.error('Error parsing push data:', error);
    }
  }

  const options = {
    body: notificationData.body,
    icon: notificationData.icon,
    badge: notificationData.badge,
    data: notificationData.data,
    requireInteraction: notificationData.requireInteraction || false,
    silent: notificationData.silent || false,
    tag: notificationData.tag || 'default',
    actions: notificationData.actions || [],
    vibrate: [200, 100, 200],
    timestamp: notificationData.data.timestamp
  };

  event.waitUntil(
    self.registration.showNotification(notificationData.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/notifications';

  event.waitUntil(
    self.clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Check if there's already a window/tab open with the target URL
      for (const client of clientList) {
        if (client.url.includes(urlToOpen) && 'focus' in client) {
          return client.focus();
        }
      }
      
      // If no window/tab is open, open a new one
      if (self.clients.openWindow) {
        return self.clients.openWindow(urlToOpen);
      }
    })
  );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event);
  
  // Track notification close for analytics
  if (event.notification.data?.notificationId) {
    // You can send analytics data here
    console.log('Notification closed:', event.notification.data.notificationId);
  }
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync event:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

// Fetch event for caching
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') {
    return;
  }

  // Skip API requests
  if (event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache the response for future use
        return caches.open(DYNAMIC_CACHE).then((cache) => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      });
    }).catch(() => {
      // Return offline page if available
      return caches.match('/');
    })
  );
});

// Background sync function
async function doBackgroundSync() {
  try {
    // Perform background tasks here
    console.log('Performing background sync...');
    
    // Example: Sync offline data
    const offlineData = await getOfflineData();
    if (offlineData.length > 0) {
      await syncOfflineData(offlineData);
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Helper function to get offline data
async function getOfflineData() {
  // Implementation depends on your app's offline storage strategy
  return [];
}

// Helper function to sync offline data
async function syncOfflineData(data) {
  // Implementation depends on your app's sync strategy
  console.log('Syncing offline data:', data);
}

// Message event for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME });
  }
});

// Error event
self.addEventListener('error', (event) => {
  console.error('Service Worker error:', event.error);
});

// Unhandled rejection event
self.addEventListener('unhandledrejection', (event) => {
  console.error('Service Worker unhandled rejection:', event.reason);
});
