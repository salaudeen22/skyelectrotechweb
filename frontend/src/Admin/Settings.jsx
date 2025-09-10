import React, { useState, useEffect } from 'react';
import { FaCog, FaStore, FaTruck, FaCreditCard, FaEnvelope, FaGlobe, FaShareAlt, FaTools, FaDatabase, FaSave, FaPlus, FaEdit, FaTrash, FaImage, FaUpload } from 'react-icons/fa';
import { settingsAPI, uploadAPI } from '../services/apiServices';
import { heroSliderService } from '../services/heroSliderService';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Settings = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('store');
  const { refreshSettings } = useSettings();

  // Hero slider states
  const [heroSlides, setHeroSlides] = useState([]);
  const [heroSliderSettings, setHeroSliderSettings] = useState({
    enabled: true,
    autoSlide: true,
    slideInterval: 7000
  });
  const [showSlideForm, setShowSlideForm] = useState(false);
  const [editingSlide, setEditingSlide] = useState(null);
  const [slideForm, setSlideForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    buttonText: '',
    buttonLink: '',
    gradientColor: 'from-blue-900/80 to-blue-700/60',
    order: 0
  });
  const [uploadingImage, setUploadingImage] = useState(false);

  // Shipping method states
  const [showShippingMethodForm, setShowShippingMethodForm] = useState(false);
  const [editingShippingMethod, setEditingShippingMethod] = useState(null);
  const [shippingMethodForm, setShippingMethodForm] = useState({
    name: '',
    cost: 0,
    estimatedDays: '',
    isActive: true
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  const [formData, setFormData] = useState({
    storeInfo: {
      name: 'Sky Electro Tech',
      description: 'Electronics & Components Store',
      email: 'info@skyelectro.tech',
      phone: '+91 98765 43210',
      address: '123 Electronics Street, Mumbai, Maharashtra - 400001',
      gstin: '27AABCS1234Z1Z5',
      city: 'Mumbai',
      state: 'Maharashtra',
      pincode: '400001',
      logo: '',
      favicon: ''
    },
    shipping: {
      enabled: true,
      freeShippingThreshold: 1000,
      defaultShippingCost: 50,
      estimatedDeliveryDays: 3,
      shippingFees: [],
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
      orderPrefix: 'SKY',
      lowStockThreshold: 5,
      autoCancelMinutes: 30,
      allowGuestCheckout: true,
      requirePhoneNumber: true,
      requireAddress: true
    },
    email: {
      orderConfirmation: { enabled: true, subject: 'Order Confirmation - {orderId}' },
      orderStatusUpdate: { enabled: true, subject: 'Order Status Update - {orderId}' },
      welcomeEmail: { enabled: true, subject: 'Welcome to {storeName}' },
      fromName: 'SkyElectroTech',
      fromEmail: 'noreply@skyelectro.tech',
      shippingUpdates: true,
      marketingEmails: false
    },
    seo: {
      metaTitle: 'SkyElectroTech - Your Electronics Store',
      metaDescription: 'Find the best electronics at great prices',
      metaKeywords: 'electronics, gadgets, tech, online store',
      googleAnalytics: '',
      facebookPixel: '',
      googleAnalyticsId: '',
      facebookPixelId: ''
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
    fetchHeroSlides();
  }, []);

  const fetchHeroSlides = async () => {
    try {
      const response = await heroSliderService.getHeroSlides();
      if (response.success) {
        setHeroSlides(response.data.slides || []);
        setHeroSliderSettings({
          enabled: response.data.enabled,
          autoSlide: response.data.autoSlide,
          slideInterval: response.data.slideInterval
        });
      }
    } catch (error) {
      console.error('Error fetching hero slides:', error);
    }
  };

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await settingsAPI.getSettings();
      const fetchedSettings = response.data.settings;
      setSettings(fetchedSettings);
      
      // Ensure email settings have proper structure
      const emailSettings = fetchedSettings.email || {};
      const safeEmailSettings = {
        orderConfirmation: {
          enabled: emailSettings.orderConfirmation?.enabled ?? true,
          subject: emailSettings.orderConfirmation?.subject ?? 'Order Confirmation - {orderId}'
        },
        orderStatusUpdate: {
          enabled: emailSettings.orderStatusUpdate?.enabled ?? true,
          subject: emailSettings.orderStatusUpdate?.subject ?? 'Order Status Update - {orderId}'
        },
        welcomeEmail: {
          enabled: emailSettings.welcomeEmail?.enabled ?? true,
          subject: emailSettings.welcomeEmail?.subject ?? 'Welcome to {storeName}'
        },
        fromName: emailSettings.fromName ?? 'SkyElectroTech',
        fromEmail: emailSettings.fromEmail ?? 'noreply@skyelectro.tech',
        shippingUpdates: emailSettings.shippingUpdates ?? true,
        marketingEmails: emailSettings.marketingEmails ?? false
      };
      
      setFormData(prev => ({
        storeInfo: { ...prev.storeInfo, ...fetchedSettings.storeInfo },
        shipping: { ...prev.shipping, ...fetchedSettings.shipping },
        payment: { ...prev.payment, ...fetchedSettings.payment },
        order: { ...prev.order, ...fetchedSettings.order },
        email: safeEmailSettings,
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
      
      // Sanitize the data before sending
      const sanitizedData = {
        ...formData,
        email: {
          orderConfirmation: {
            enabled: formData.email.orderConfirmation?.enabled ?? true,
            subject: formData.email.orderConfirmation?.subject ?? 'Order Confirmation - {orderId}'
          },
          orderStatusUpdate: {
            enabled: formData.email.orderStatusUpdate?.enabled ?? true,
            subject: formData.email.orderStatusUpdate?.subject ?? 'Order Status Update - {orderId}'
          },
          welcomeEmail: {
            enabled: formData.email.welcomeEmail?.enabled ?? true,
            subject: formData.email.welcomeEmail?.subject ?? 'Welcome to {storeName}'
          },
          fromName: formData.email.fromName ?? 'SkyElectroTech',
          fromEmail: formData.email.fromEmail ?? 'noreply@skyelectro.tech',
          shippingUpdates: formData.email.shippingUpdates ?? true,
          marketingEmails: formData.email.marketingEmails ?? false
        }
      };
      
      console.log('Sending sanitized settings data:', JSON.stringify(sanitizedData, null, 2));
      await settingsAPI.updateSettings(sanitizedData);
      toast.success('Settings saved successfully!');
      await fetchSettings();
      // Refresh global settings to reflect changes immediately
      await refreshSettings();
    } catch (error) {
      console.error('Error saving settings:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  // Hero Slider Management Functions
  const handleAddSlide = async () => {
    try {
      // Upload image first if there's a new image file
      let imageUrl = slideForm.image;
      if (imageFile) {
        imageUrl = await uploadSlideImage();
      }

      if (!imageUrl) {
        toast.error('Please provide an image for the slide');
        return;
      }

      const slideData = {
        ...slideForm,
        image: imageUrl
      };

      const response = await heroSliderService.addHeroSlide(slideData);
      if (response.success) {
        toast.success('Slide added successfully!');
        resetSlideForm();
        await fetchHeroSlides();
      }
    } catch (error) {
      console.error('Error adding slide:', error);
      toast.error('Failed to add slide');
    }
  };

  const handleUpdateSlide = async () => {
    try {
      // Upload image first if there's a new image file
      let imageUrl = slideForm.image;
      if (imageFile) {
        imageUrl = await uploadSlideImage();
      }

      const slideData = {
        ...slideForm,
        image: imageUrl
      };

      const response = await heroSliderService.updateHeroSlide(editingSlide.id, slideData);
      if (response.success) {
        toast.success('Slide updated successfully!');
        resetSlideForm();
        await fetchHeroSlides();
      }
    } catch (error) {
      console.error('Error updating slide:', error);
      toast.error('Failed to update slide');
    }
  };

  const handleDeleteSlide = async (slideId) => {
    if (window.confirm('Are you sure you want to delete this slide?')) {
      try {
        const response = await heroSliderService.deleteHeroSlide(slideId);
        if (response.success) {
          toast.success('Slide deleted successfully!');
          await fetchHeroSlides();
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
        toast.error('Failed to delete slide');
      }
    }
  };

  const handleEditSlide = (slide) => {
    setEditingSlide(slide);
    setSlideForm({
      title: slide.title,
      subtitle: slide.subtitle,
      image: slide.image,
      buttonText: slide.buttonText,
      buttonLink: slide.buttonLink,
      gradientColor: slide.gradientColor,
      order: slide.order
    });
    setImagePreview(slide.image);
    setImageFile(null);
    setShowSlideForm(true);
  };

  // Image handling functions
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }

      // Validate file size (5MB limit)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size must be less than 5MB');
        return;
      }

      setImageFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadSlideImage = async () => {
    if (!imageFile) return slideForm.image;

    try {
      setUploadingImage(true);
      const response = await uploadAPI.uploadSingle(imageFile, 'hero-slides');
      if (response.success) {
        return response.data.url;
      } else {
        throw new Error(response.message || 'Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload image: ' + error.message);
      throw error;
    } finally {
      setUploadingImage(false);
    }
  };

  const resetSlideForm = () => {
    setSlideForm({
      title: '',
      subtitle: '',
      image: '',
      buttonText: '',
      buttonLink: '',
      gradientColor: 'from-blue-900/80 to-blue-700/60',
      order: 0
    });
    setImageFile(null);
    setImagePreview('');
    setEditingSlide(null);
    setShowSlideForm(false);
  };

  const handleSliderSettingsUpdate = async () => {
    try {
      const response = await heroSliderService.updateHeroSliderSettings(heroSliderSettings);
      if (response.success) {
        toast.success('Slider settings updated successfully!');
      }
    } catch (error) {
      console.error('Error updating slider settings:', error);
      toast.error('Failed to update slider settings');
    }
  };

  // Shipping method handlers
  const handleAddOrUpdateShippingMethod = async () => {
    try {
      if (!shippingMethodForm.name.trim()) {
        toast.error('Please enter a method name');
        return;
      }

      if (editingShippingMethod) {
        // Update existing method
        const response = await settingsAPI.updateShippingMethod(editingShippingMethod._id, shippingMethodForm);
        if (response.success) {
          toast.success('Shipping method updated successfully!');
          await fetchSettings(); // Refresh settings
        }
      } else {
        // Add new method
        const response = await settingsAPI.addShippingMethod(shippingMethodForm);
        if (response.success) {
          toast.success('Shipping method added successfully!');
          await fetchSettings(); // Refresh settings
        }
      }

      // Reset form
      setShowShippingMethodForm(false);
      setEditingShippingMethod(null);
      setShippingMethodForm({ name: '', cost: 0, estimatedDays: '', isActive: true });
    } catch (error) {
      console.error('Error managing shipping method:', error);
      toast.error('Failed to save shipping method');
    }
  };

  const handleDeleteShippingMethod = async (methodId) => {
    if (!window.confirm('Are you sure you want to delete this shipping method?')) {
      return;
    }

    try {
      const response = await settingsAPI.deleteShippingMethod(methodId);
      if (response.success) {
        toast.success('Shipping method deleted successfully!');
        await fetchSettings(); // Refresh settings
      }
    } catch (error) {
      console.error('Error deleting shipping method:', error);
      toast.error('Failed to delete shipping method');
    }
  };

  const tabs = [
    { id: 'store', name: 'Store Info', icon: <FaStore /> },
    { id: 'hero', name: 'Hero Slider', icon: <FaImage /> },
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">GSTIN</label>
                  <input
                    type="text"
                    value={formData.storeInfo.gstin}
                    onChange={(e) => handleInputChange('storeInfo', 'gstin', e.target.value)}
                    placeholder="e.g., 27AABCS1234Z1Z5"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                  <input
                    type="text"
                    value={formData.storeInfo.city}
                    onChange={(e) => handleInputChange('storeInfo', 'city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                  <input
                    type="text"
                    value={formData.storeInfo.state}
                    onChange={(e) => handleInputChange('storeInfo', 'state', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.storeInfo.pincode}
                    onChange={(e) => handleInputChange('storeInfo', 'pincode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Hero Slider Tab */}
          {activeTab === 'hero' && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">Hero Slider Management</h3>
                <button
                  onClick={() => {
                    // Set the next available order number
                    const nextOrder = heroSlides.length > 0 ? 
                      Math.max(...heroSlides.map(s => s.order || 0)) + 1 : 0;
                    setSlideForm(prev => ({ ...prev, order: nextOrder }));
                    setShowSlideForm(true);
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <FaPlus /> Add New Slide
                </button>
              </div>

              {/* Slider Settings */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-4">Slider Settings</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={heroSliderSettings.enabled}
                      onChange={(e) => setHeroSliderSettings(prev => ({ ...prev, enabled: e.target.checked }))}
                      className="mr-2"
                    />
                    <label>Enable Slider</label>
                  </div>
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={heroSliderSettings.autoSlide}
                      onChange={(e) => setHeroSliderSettings(prev => ({ ...prev, autoSlide: e.target.checked }))}
                      className="mr-2"
                    />
                    <label>Auto Slide</label>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Slide Interval (ms)</label>
                    <input
                      type="number"
                      value={heroSliderSettings.slideInterval}
                      onChange={(e) => setHeroSliderSettings(prev => ({ ...prev, slideInterval: parseInt(e.target.value) }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1000"
                      max="30000"
                    />
                  </div>
                </div>
                <button
                  onClick={handleSliderSettingsUpdate}
                  className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
                >
                  <FaSave /> Save Settings
                </button>
              </div>

              {/* Slides List */}
              <div className="space-y-4">
                <h4 className="font-medium text-gray-900">Current Slides</h4>
                {heroSlides.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FaImage className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p>No slides added yet. Click "Add New Slide" to get started.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {heroSlides.map((slide) => (
                      <div key={slide.id} className="border rounded-lg p-4 bg-white shadow-sm">
                        <div className="aspect-video mb-3 overflow-hidden rounded-lg">
                          <img
                            src={slide.image}
                            alt={slide.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <h5 className="font-medium text-gray-900 mb-1">{slide.title}</h5>
                        <p className="text-sm text-gray-600 mb-2">{slide.subtitle}</p>
                        <div className="flex justify-between items-center">
                          <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                            Order: {slide.order}
                          </span>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEditSlide(slide)}
                              className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                            >
                              <FaEdit /> Edit
                            </button>
                            <button
                              onClick={() => handleDeleteSlide(slide.id)}
                              className="text-red-600 hover:text-red-800 text-sm flex items-center gap-1"
                            >
                              <FaTrash /> Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Slide Form Modal */}
              {showSlideForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-lg max-w-2xl w-full max-h-screen overflow-y-auto">
                    <div className="p-6">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold">
                          {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                        </h3>
                        <button
                          onClick={resetSlideForm}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          ×
                        </button>
                      </div>

                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                          <input
                            type="text"
                            value={slideForm.title}
                            onChange={(e) => setSlideForm(prev => ({ ...prev, title: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Enter slide title"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                          <textarea
                            value={slideForm.subtitle}
                            onChange={(e) => setSlideForm(prev => ({ ...prev, subtitle: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            rows="2"
                            placeholder="Enter slide subtitle"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Slide Image</label>
                          
                          {/* Image Upload */}
                          <div className="space-y-4">
                            {/* Current/Preview Image */}
                            {(imagePreview || slideForm.image) && (
                              <div className="relative">
                                <img
                                  src={imagePreview || slideForm.image}
                                  alt="Slide preview"
                                  className="w-full h-48 object-cover rounded-lg border"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setImagePreview('');
                                    setImageFile(null);
                                    setSlideForm(prev => ({ ...prev, image: '' }));
                                  }}
                                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600"
                                >
                                  ×
                                </button>
                              </div>
                            )}

                            {/* Upload Button */}
                            <div className="flex items-center gap-4">
                              <label className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                                <FaUpload />
                                {uploadingImage ? 'Uploading...' : 'Upload Image'}
                                <input
                                  type="file"
                                  accept="image/*"
                                  onChange={handleImageChange}
                                  className="hidden"
                                  disabled={uploadingImage}
                                />
                              </label>
                              
                              {/* Manual URL Input */}
                              <span className="text-gray-500">or</span>
                              <div className="flex-1">
                                <input
                                  type="url"
                                  value={slideForm.image}
                                  onChange={(e) => {
                                    const url = e.target.value;
                                    setSlideForm(prev => ({ ...prev, image: url }));
                                    if (url && !imageFile) {
                                      setImagePreview(url);
                                    }
                                  }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  placeholder="Or paste image URL"
                                />
                              </div>
                            </div>
                            
                            <div className="text-sm text-gray-500">
                              Upload a high-quality image (max 5MB) or provide a direct image URL
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Button Text</label>
                            <input
                              type="text"
                              value={slideForm.buttonText}
                              onChange={(e) => setSlideForm(prev => ({ ...prev, buttonText: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Shop Now"
                            />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Button Link</label>
                            <input
                              type="text"
                              value={slideForm.buttonLink}
                              onChange={(e) => setSlideForm(prev => ({ ...prev, buttonLink: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              placeholder="/products"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Gradient Color</label>
                            <select
                              value={slideForm.gradientColor}
                              onChange={(e) => setSlideForm(prev => ({ ...prev, gradientColor: e.target.value }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="">Transparent / No Color</option>
                              <option value="from-blue-900/80 to-blue-700/60">Blue</option>
                              <option value="from-emerald-900/80 to-emerald-700/60">Green</option>
                              <option value="from-purple-900/80 to-purple-700/60">Purple</option>
                              <option value="from-red-900/80 to-red-700/60">Red</option>
                              <option value="from-amber-900/80 to-amber-700/60">Amber</option>
                              <option value="from-gray-900/80 to-gray-700/60">Gray</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Display Order</label>
                            <input
                              type="number"
                              value={slideForm.order}
                              onChange={(e) => setSlideForm(prev => ({ ...prev, order: parseInt(e.target.value) || 0 }))}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              min="0"
                              placeholder="0"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Lower numbers appear first (0, 1, 2...)
                            </p>
                          </div>
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                          <button
                            onClick={resetSlideForm}
                            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={editingSlide ? handleUpdateSlide : handleAddSlide}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            {editingSlide ? 'Update' : 'Add'} Slide
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
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
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-md font-semibold text-gray-900">Shipping Methods</h4>
                  <button
                    onClick={() => setShowShippingMethodForm(true)}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                  >
                    Add Method
                  </button>
                </div>
                
                {/* Shipping Methods List */}
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
                      <button
                        onClick={() => {
                          setEditingShippingMethod(method);
                          setShippingMethodForm({
                            name: method.name,
                            cost: method.cost,
                            estimatedDays: method.estimatedDays,
                            isActive: method.isActive
                          });
                          setShowShippingMethodForm(true);
                        }}
                        className="px-2 py-1 text-xs text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteShippingMethod(method._id)}
                        className="px-2 py-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}

                {/* Add/Edit Shipping Method Form */}
                {showShippingMethodForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
                      <h3 className="text-lg font-semibold mb-4">
                        {editingShippingMethod ? 'Edit Shipping Method' : 'Add Shipping Method'}
                      </h3>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Method Name</label>
                          <input
                            type="text"
                            value={shippingMethodForm.name}
                            onChange={(e) => setShippingMethodForm(prev => ({...prev, name: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., Standard Delivery"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Cost (₹)</label>
                          <input
                            type="number"
                            value={shippingMethodForm.cost}
                            onChange={(e) => setShippingMethodForm(prev => ({...prev, cost: Number(e.target.value)}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Estimated Delivery</label>
                          <input
                            type="text"
                            value={shippingMethodForm.estimatedDays}
                            onChange={(e) => setShippingMethodForm(prev => ({...prev, estimatedDays: e.target.value}))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            placeholder="e.g., 3-5 business days"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={shippingMethodForm.isActive}
                            onChange={(e) => setShippingMethodForm(prev => ({...prev, isActive: e.target.checked}))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="ml-2 text-sm text-gray-700">Active</span>
                        </div>
                      </div>
                      <div className="flex space-x-3 mt-6">
                        <button
                          onClick={() => {
                            setShowShippingMethodForm(false);
                            setEditingShippingMethod(null);
                            setShippingMethodForm({ name: '', cost: 0, estimatedDays: '', isActive: true });
                          }}
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleAddOrUpdateShippingMethod}
                          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                        >
                          {editingShippingMethod ? 'Update' : 'Add'} Method
                        </button>
                      </div>
                    </div>
                  </div>
                )}
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
                      <p className="text-sm text-gray-600">Razorpay - Cards, UPI, Net Banking & Digital Wallets</p>
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