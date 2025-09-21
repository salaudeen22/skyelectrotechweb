import React, { createContext, useContext, useState, useEffect } from 'react';
import { settingsAPI } from '../services/apiServices';

const SettingsContext = createContext();

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default settings fallback
  const defaultSettings = {
    storeInfo: {
      name: 'SkyElectroTech',
      description: 'Your trusted electronics store',
      email: 'skyelectrotechblr@gmail.com',
      phone: '+91 1234567890',
      address: '2nd Floor, No 140, Sadar Patrappa Rd, Thigalarpet, Kumbarpet, Dodpete, Nagarathpete, Bengaluru, Karnataka 560002',
      logo: '',
      favicon: ''
    },
    shipping: {
      enabled: true,
      freeShippingThreshold: 1000,
      defaultShippingCost: 15,
      shippingMethods: [],
      zones: []
    },
    payment: {
      currency: 'INR',
      currencySymbol: '₹',
      taxRate: 18,
      paymentMethods: {
        cod: { enabled: true, minOrderAmount: 0, maxOrderAmount: 5000 },
        online: { enabled: true, methods: ['card', 'upi', 'netbanking', 'wallet'] }
      }
    },
    order: {
      autoConfirm: false,
      requireApproval: false,
      maxOrderQuantity: 10,
      orderPrefix: 'SKY'
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await settingsAPI.getPublicSettings();
      setSettings(response.data.settings);
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err.message);
      // Use default settings if fetch fails
      setSettings(defaultSettings);
    } finally {
      setLoading(false);
    }
  };

  const refreshSettings = async () => {
    await fetchSettings();
  };

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
  }, []);

  const value = {
    settings: settings || defaultSettings,
    loading,
    error,
    refreshSettings,
    defaultSettings
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}; 