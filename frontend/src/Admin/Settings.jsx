import React, { useState, useEffect } from 'react';
import { FaCog, FaStore, FaTruck, FaCreditCard, FaEnvelope, FaGlobe, FaShareAlt, FaTools, FaDatabase, FaSave, FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { settingsAPI } from '../services/apiServices';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const { refreshSettings } = useSettings();

  const [formData, setFormData] = useState({
    storeInfo: {
      name: 'SkyElectroTech',
      description: 'Your trusted electronics store',
      email: 'admin@skyelectro.tech',
      phone: '+91 1234567890',
      address: 'Your store address',
      logo: '',
      favicon: ''
    },
    shipping: {
      enabled: true,
      freeShippingThreshold: 1000,
      defaultShippingCost: 50
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
    email: {
      orderConfirmation: { enabled: true, subject: 'Order Confirmation - {orderId}' },
      orderStatusUpdate: { enabled: true, subject: 'Order Status Update - {orderId}' },
      welcomeEmail: { enabled: true, subject: 'Welcome to {storeName}' }
    },
    seo: {
      metaTitle: 'SkyElectroTech - Your Electronics Store',
      metaDescription: 'Find the best electronics at great prices',
      metaKeywords: 'electronics, gadgets, tech, online store',
      googleAnalytics: '',
      facebookPixel: ''
    },
    socialMedia: {
      facebook: '',
      twitter: '',
      instagram: '',
      linkedin: '',
      youtube: ''
    },
    maintenance: {
      enabled: false,
      message: 'We are currently under maintenance. Please check back soon.',
      allowedIPs: []
    },
    cache: {
      enabled: true,
      duration: 3600
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      const fetchedSettings = response.data.settings;
      setSettings(fetchedSettings);
      setFormData(prev => ({
        storeInfo: { ...prev.storeInfo, ...fetchedSettings.storeInfo },
        shipping: { ...prev.shipping, ...fetchedSettings.shipping },
        payment: { ...prev.payment, ...fetchedSettings.payment },
        order: { ...prev.order, ...fetchedSettings.order },
        email: { ...prev.email, ...fetchedSettings.email },
        seo: { ...prev.seo, ...fetchedSettings.seo },
        socialMedia: { ...prev.socialMedia, ...fetchedSettings.socialMedia },
        maintenance: { ...prev.maintenance, ...fetchedSettings.maintenance },
        cache: { ...prev.cache, ...fetchedSettings.cache }
      }));
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleNestedInputChange = (section, subsection, field, value) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [subsection]: {
          ...prev[section][subsection],
          [field]: value
        }
      }
    }));
  };

  const handleSaveSettings = async () => {
    try {
      setSaving(true);
      await settingsAPI.updateSettings(formData);
      toast.success('Settings saved successfully!');
      await fetchSettings();
      // Refresh global settings to reflect changes immediately
      await refreshSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'store', name: 'Store Info', icon: <FaStore /> },
    { id: 'shipping', name: 'Shipping', icon: <FaTruck /> },
    { id: 'payment', name: 'Payment', icon: <FaCreditCard /> },
    { id: 'order', name: 'Orders', icon: <FaCog /> },
    { id: 'email', name: 'Email', icon: <FaEnvelope /> },
    { id: 'seo', name: 'SEO', icon: <FaGlobe /> },
    { id: 'social', name: 'Social Media', icon: <FaShareAlt /> },
    { id: 'maintenance', name: 'Maintenance', icon: <FaTools /> },
    { id: 'cache', name: 'Cache', icon: <FaDatabase /> }
  ];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Store Settings</h1>
          <p className="text-slate-500 mt-1">Configure your e-commerce store settings</p>
        </div>
        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2 disabled:opacity-50"
        >
          <FaSave className="w-4 h-4" />
          <span>{saving ? 'Saving...' : 'Save Settings'}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl shadow-lg">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6 overflow-x-auto" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.icon}
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
          {/* Store Info Tab */}
          {activeTab === 'store' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Store Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Store Name</label>
                  <input
                    type="text"
                    value={formData.storeInfo.name}
                    onChange={(e) => handleInputChange('storeInfo', 'name', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                  <input
                    type="email"
                    value={formData.storeInfo.email}
                    onChange={(e) => handleInputChange('storeInfo', 'email', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Phone</label>
                  <input
                    type="text"
                    value={formData.storeInfo.phone}
                    onChange={(e) => handleInputChange('storeInfo', 'phone', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Logo URL</label>
                  <input
                    type="text"
                    value={formData.storeInfo.logo}
                    onChange={(e) => handleInputChange('storeInfo', 'logo', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={formData.storeInfo.description}
                    onChange={(e) => handleInputChange('storeInfo', 'description', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                  <textarea
                    value={formData.storeInfo.address}
                    onChange={(e) => handleInputChange('storeInfo', 'address', e.target.value)}
                    rows="2"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Shipping Tab */}
          {activeTab === 'shipping' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Shipping Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Enable Shipping</label>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.shipping.enabled}
                      onChange={(e) => handleInputChange('shipping', 'enabled', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Enabled</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Free Shipping Threshold (₹)</label>
                  <input
                    type="number"
                    value={formData.shipping.freeShippingThreshold}
                    onChange={(e) => handleInputChange('shipping', 'freeShippingThreshold', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Default Shipping Cost (₹)</label>
                  <input
                    type="number"
                    value={formData.shipping.defaultShippingCost}
                    onChange={(e) => handleInputChange('shipping', 'defaultShippingCost', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Shipping Methods */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Shipping Methods</h4>
                {settings?.shipping?.shippingMethods?.map((method) => (
                  <div key={method._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-2">
                    <div>
                      <h5 className="font-medium">{method.name}</h5>
                      <p className="text-sm text-gray-600">₹{method.cost} • {method.estimatedDays}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 text-xs rounded-full ${method.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {method.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Tab */}
          {activeTab === 'payment' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Payment Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency</label>
                  <select
                    value={formData.payment.currency}
                    onChange={(e) => handleInputChange('payment', 'currency', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="INR">Indian Rupee (₹)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Currency Symbol</label>
                  <input
                    type="text"
                    value={formData.payment.currencySymbol}
                    onChange={(e) => handleInputChange('payment', 'currencySymbol', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tax Rate (%)</label>
                  <input
                    type="number"
                    value={formData.payment.taxRate}
                    onChange={(e) => handleInputChange('payment', 'taxRate', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Payment Methods */}
              <div className="border-t pt-6">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Payment Methods</h4>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium">Cash on Delivery (COD)</h5>
                      <p className="text-sm text-gray-600">Pay when you receive your order</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.payment.paymentMethods.cod.enabled}
                        onChange={(e) => handleNestedInputChange('payment', 'paymentMethods', 'cod', {
                          ...formData.payment.paymentMethods.cod,
                          enabled: e.target.checked
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h5 className="font-medium">Online Payment</h5>
                      <p className="text-sm text-gray-600">Credit/Debit cards, UPI, Net Banking</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.payment.paymentMethods.online.enabled}
                        onChange={(e) => handleNestedInputChange('payment', 'paymentMethods', 'online', {
                          ...formData.payment.paymentMethods.online,
                          enabled: e.target.checked
                        })}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Order Tab */}
          {activeTab === 'order' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Order Configuration</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Order Prefix</label>
                  <input
                    type="text"
                    value={formData.order.orderPrefix}
                    onChange={(e) => handleInputChange('order', 'orderPrefix', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Order Quantity</label>
                  <input
                    type="number"
                    value={formData.order.maxOrderQuantity}
                    onChange={(e) => handleInputChange('order', 'maxOrderQuantity', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="space-y-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.order.autoConfirm}
                      onChange={(e) => handleInputChange('order', 'autoConfirm', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Auto-confirm orders</span>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.order.requireApproval}
                      onChange={(e) => handleInputChange('order', 'requireApproval', e.target.checked)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="ml-2 text-sm text-gray-700">Require admin approval</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Email Tab */}
          {activeTab === 'email' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Email Configuration</h3>
              
              <div className="space-y-6">
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Order Confirmation</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.email.orderConfirmation.enabled}
                        onChange={(e) => handleNestedInputChange('email', 'orderConfirmation', 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.email.orderConfirmation.subject}
                    onChange={(e) => handleNestedInputChange('email', 'orderConfirmation', 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email subject"
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Order Status Update</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.email.orderStatusUpdate.enabled}
                        onChange={(e) => handleNestedInputChange('email', 'orderStatusUpdate', 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.email.orderStatusUpdate.subject}
                    onChange={(e) => handleNestedInputChange('email', 'orderStatusUpdate', 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email subject"
                  />
                </div>

                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">Welcome Email</h4>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.email.welcomeEmail.enabled}
                        onChange={(e) => handleNestedInputChange('email', 'welcomeEmail', 'enabled', e.target.checked)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="ml-2 text-sm text-gray-700">Enabled</span>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={formData.email.welcomeEmail.subject}
                    onChange={(e) => handleNestedInputChange('email', 'welcomeEmail', 'subject', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Email subject"
                  />
                </div>
              </div>
            </div>
          )}

          {/* SEO Tab */}
          {activeTab === 'seo' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">SEO Configuration</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Title</label>
                  <input
                    type="text"
                    value={formData.seo.metaTitle}
                    onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Description</label>
                  <textarea
                    value={formData.seo.metaDescription}
                    onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta Keywords</label>
                  <input
                    type="text"
                    value={formData.seo.metaKeywords}
                    onChange={(e) => handleInputChange('seo', 'metaKeywords', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="keyword1, keyword2, keyword3"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Google Analytics ID</label>
                  <input
                    type="text"
                    value={formData.seo.googleAnalytics}
                    onChange={(e) => handleInputChange('seo', 'googleAnalytics', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="G-XXXXXXXXXX"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook Pixel ID</label>
                  <input
                    type="text"
                    value={formData.seo.facebookPixel}
                    onChange={(e) => handleInputChange('seo', 'facebookPixel', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="XXXXXXXXXX"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Social Media Tab */}
          {activeTab === 'social' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Social Media Links</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.socialMedia.facebook}
                    onChange={(e) => handleInputChange('socialMedia', 'facebook', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Twitter</label>
                  <input
                    type="url"
                    value={formData.socialMedia.twitter}
                    onChange={(e) => handleInputChange('socialMedia', 'twitter', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.socialMedia.instagram}
                    onChange={(e) => handleInputChange('socialMedia', 'instagram', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn</label>
                  <input
                    type="url"
                    value={formData.socialMedia.linkedin}
                    onChange={(e) => handleInputChange('socialMedia', 'linkedin', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">YouTube</label>
                  <input
                    type="url"
                    value={formData.socialMedia.youtube}
                    onChange={(e) => handleInputChange('socialMedia', 'youtube', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="https://youtube.com/yourchannel"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Maintenance Tab */}
          {activeTab === 'maintenance' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Maintenance Mode</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.maintenance.enabled}
                    onChange={(e) => handleInputChange('maintenance', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable maintenance mode</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Maintenance Message</label>
                  <textarea
                    value={formData.maintenance.message}
                    onChange={(e) => handleInputChange('maintenance', 'message', e.target.value)}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Message to display during maintenance"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Cache Tab */}
          {activeTab === 'cache' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Cache Configuration</h3>
              
              <div className="space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.cache.enabled}
                    onChange={(e) => handleInputChange('cache', 'enabled', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Enable caching</span>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cache Duration (seconds)</label>
                  <input
                    type="number"
                    value={formData.cache.duration}
                    onChange={(e) => handleInputChange('cache', 'duration', Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings; 