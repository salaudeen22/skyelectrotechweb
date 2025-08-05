import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';

export const usePWA = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
  const [registration, setRegistration] = useState(null);

  // Check if PWA is installed
  const checkInstallation = useCallback(() => {
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    } else if (window.navigator.standalone === true) {
      setIsInstalled(true);
    }
  }, []);

  // Register service worker
  const registerSW = useCallback(async () => {
    if ('serviceWorker' in navigator) {
      try {
        const reg = await navigator.serviceWorker.register('/sw.js');
        setRegistration(reg);

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing;
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setIsUpdateAvailable(true);
              toast.success('New version available! Refresh to update.');
            }
          });
        });

        // Handle controller change
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          window.location.reload();
        });

        console.log('Service Worker registered successfully');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
        return true;
      } else {
        toast.error('Notification permission denied');
        return false;
      }
    }
    return false;
  }, []);

  // Send push notification
  const sendNotification = useCallback((title, options = {}) => {
    if ('Notification' in window && Notification.permission === 'granted') {
      const notification = new Notification(title, {
        icon: '/favicon_io (1)/android-chrome-192x192.png',
        badge: '/favicon_io (1)/favicon-32x32.png',
        ...options
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return notification;
    }
  }, []);

  // Install PWA
  const installPWA = useCallback(async () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  }, [registration]);

  // Update PWA
  const updatePWA = useCallback(() => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }, [registration]);

  // Check online/offline status
  const updateOnlineStatus = useCallback(() => {
    setIsOnline(navigator.onLine);
    if (!navigator.onLine) {
      toast.error('You are offline. Some features may not work.');
    } else {
      toast.success('You are back online!');
    }
  }, []);

  // Initialize PWA
  useEffect(() => {
    registerSW();
    checkInstallation();

    // Listen for online/offline events
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);

    // Listen for beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setIsInstalled(false);
    });

    // Listen for appinstalled
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      toast.success('SkyElectroTech installed successfully!');
    });

    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
    };
  }, [registerSW, checkInstallation, updateOnlineStatus]);

  return {
    isOnline,
    isInstalled,
    isUpdateAvailable,
    registration,
    requestNotificationPermission,
    sendNotification,
    installPWA,
    updatePWA
  };
}; 