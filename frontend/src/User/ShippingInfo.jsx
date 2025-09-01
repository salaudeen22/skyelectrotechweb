import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, 
  FiMail, 
  FiPhone, 
  FiMapPin, 
  FiShoppingCart, 
  FiArrowRight,
  FiPlus,
  FiChevronDown
} from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAuth } from '../hooks/useAuth';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

// Helper Component for Form Inputs
const FormInput = ({ id, name, type, label, value, placeholder, error, onChange, onBlur, icon, isRequired = false }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-700 mb-1">
      {label} {isRequired && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
        {icon}
      </div>
      <input
        type={type}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        className={`block w-full rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm pl-10 pr-3 py-2 ${
            error ? 'border-red-400 text-red-900 placeholder-red-400 focus:ring-red-500 focus:border-red-500' : 'border-slate-300'
        }`}
        required={isRequired}
      />
    </div>
    {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
  </div>
);

// Address Selection Component
const AddressSelector = ({ addresses, selectedAddress, onAddressSelect, onAddNewAddress }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <label className="block text-sm font-medium text-slate-700 mb-2">
        Select Address <span className="text-red-500">*</span>
      </label>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full flex items-center justify-between px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
        >
          <span className="text-slate-900">
            {selectedAddress ? `${selectedAddress.name} - ${selectedAddress.street}` : 'Select an address'}
          </span>
          <FiChevronDown className={`w-5 h-5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        
        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-slate-300 rounded-md shadow-lg max-h-60 overflow-auto">
            {addresses.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() => {
                  onAddressSelect(address);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 border-b border-slate-200 last:border-b-0 ${
                  selectedAddress?.id === address.id ? 'bg-blue-50 border-blue-200' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-slate-900 flex items-center">
                      {address.name}
                      {selectedAddress?.id === address.id && (
                        <FiCheck className="w-4 h-4 ml-2 text-blue-600" />
                      )}
                    </div>
                    <div className="text-sm text-slate-600">{address.street}</div>
                    <div className="text-sm text-slate-600">{address.city}, {address.state} {address.zipCode}</div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    {address.isDefault && (
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">Default</span>
                    )}
                    {selectedAddress?.id === address.id && (
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">Selected</span>
                    )}
                  </div>
                </div>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                onAddNewAddress();
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 text-blue-600 font-medium flex items-center border-t border-slate-200"
            >
              <FiPlus className="w-4 h-4 mr-2" />
              Add New Address
            </button>
          </div>
        )}
      </div>
      
      {/* Selected Address Summary */}
      {selectedAddress && (
        <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-green-800">Selected Address</h4>
              <p className="text-sm text-green-700">{selectedAddress.name}</p>
              <p className="text-sm text-green-700">{selectedAddress.street}</p>
              <p className="text-sm text-green-700">{selectedAddress.city}, {selectedAddress.state} {selectedAddress.zipCode}</p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="text-green-600 hover:text-green-700 text-sm underline"
            >
              Change
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Add New Address Modal
const AddAddressModal = ({ isOpen, onClose, onSave, formData }) => {
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    isDefault: false
  });

  useEffect(() => {
    if (isOpen) {
      setAddressFormData({
        name: formData.name || '',
        street: formData.address || '',
        city: formData.city || '',
        state: formData.state || '',
        country: formData.country || 'India',
        zipCode: formData.zipCode || '',
        isDefault: false
      });
    }
  }, [isOpen, formData]);

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSave = () => {
    onSave(addressFormData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Address</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address Name
            </label>
            <input
              type="text"
              name="name"
              value={addressFormData.name}
              onChange={handleAddressFormChange}
              placeholder="e.g., Home, Office"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              name="street"
              value={addressFormData.street}
              onChange={handleAddressFormChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={addressFormData.city}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <input
                type="text"
                name="state"
                value={addressFormData.state}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                name="zipCode"
                value={addressFormData.zipCode}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Country
              </label>
              <select
                name="country"
                value={addressFormData.country}
                onChange={handleAddressFormChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="India">India</option>
                <option value="USA">United States</option>
                <option value="UK">United Kingdom</option>
                <option value="Canada">Canada</option>
                <option value="Australia">Australia</option>
              </select>
            </div>
          </div>
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isDefault"
              checked={addressFormData.isDefault}
              onChange={handleAddressFormChange}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Set as default address
            </label>
          </div>
        </div>
        <div className="flex items-center justify-end space-x-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Address
          </button>
        </div>
      </div>
    </div>
  );
};

const ShippingInfo = () => {
  const navigate = useNavigate();
  const { items: cart, totalPrice: cartTotal } = useCart();
  const { user, getAddresses, addAddress } = useAuth();
  const { trackClick } = useAnalytics();
  const { settings } = useSettings();
  
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India'
  });
  
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Address management state
  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [showAddressModal, setShowAddressModal] = useState(false);

  // --- Effects ---
  useEffect(() => {
    if (!cart || cart.length === 0) {
      toast.error("Your cart is empty. Redirecting...");
      navigate('/user/cart');
    }
    loadUserAddresses();
    loadPersistedData();
  }, [cart, navigate]);

  // Load persisted data from localStorage
  const loadPersistedData = () => {
    try {
      const persistedFormData = localStorage.getItem('checkout_shipping_info');
      const persistedSelectedAddress = localStorage.getItem('checkout_selected_address');
      
      if (persistedFormData) {
        const parsedFormData = JSON.parse(persistedFormData);
        setFormData(parsedFormData);
      } else if (user) {
        // Auto-fill with user profile data if no persisted data
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
          phone: user.phone || ''
        }));
      }
      
      if (persistedSelectedAddress) {
        const parsedAddress = JSON.parse(persistedSelectedAddress);
        setSelectedAddress(parsedAddress);
      }
    } catch (error) {
      console.error('Error loading persisted data:', error);
    }
  };

  // Save data to localStorage whenever form data changes
  useEffect(() => {
    if (formData.name || formData.email || formData.phone || formData.address) {
      localStorage.setItem('checkout_shipping_info', JSON.stringify(formData));
    }
  }, [formData]);

  // Save selected address to localStorage
  useEffect(() => {
    if (selectedAddress) {
      localStorage.setItem('checkout_selected_address', JSON.stringify(selectedAddress));
    }
  }, [selectedAddress]);

  // Load user addresses
  const loadUserAddresses = async () => {
    if (!user) return;
    
    try {
      const result = await getAddresses();
      if (result.success) {
        setAddresses(result.data);
        // Auto-select default address if available
        const defaultAddress = result.data.find(addr => addr.isDefault);
        if (defaultAddress) {
          handleAddressSelect(defaultAddress);
        }
      }
    } catch (error) {
      console.error('Error loading addresses:', error);
    }
  };

  // Handle address selection
  const handleAddressSelect = (address) => {
    setSelectedAddress(address);
    
    // Auto-fill form with address data and user info
    setFormData(prev => ({
      ...prev,
      // Use user's name/email/phone if available, otherwise use address name
      name: user?.name || address.name || prev.name,
      email: user?.email || prev.email,
      phone: user?.phone || prev.phone,
      // Address fields from selected address
      address: address.street,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country
    }));
  };

  // Handle adding new address
  const handleAddNewAddress = async (addressData) => {
    try {
      const result = await addAddress(addressData);
      if (result.success) {
        // Reload addresses and select the new one
        await loadUserAddresses();
        const newAddress = result.data;
        handleAddressSelect(newAddress);
        toast.success('Address added successfully!');
      }
    } catch (error) {
      console.error('Error adding address:', error);
      toast.error('Failed to add address');
    }
  };

  // --- Form Validation ---
  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Full Name is required.';
        if (value.trim().length < 2) return 'Name must be at least 2 characters.';
        return '';
      case 'email':
        if (!value.trim()) return 'Email is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Invalid email format.';
        return '';
      case 'phone':
        if (!value.trim()) return 'Phone number is required.';
        if (!/^[+]?[1-9][\d]{9,14}$/.test(value.replace(/[\s\-()]/g, ''))) return 'Invalid phone number.';
        return '';
      case 'address':
        if (!value.trim()) return 'Address is required.';
        if (value.trim().length < 10) return 'Address seems too short.';
        return '';
      case 'city':
        if (!value.trim()) return 'City is required.';
        return '';
      case 'zipCode':
        if (!value.trim()) return 'PIN Code is required.';
        if (!/^\d{6}$/.test(value.trim())) return 'Invalid PIN code format (must be 6 digits).';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
        isValid = false;
      }
    });
    setErrors(newErrors);
    return isValid;
  };
  
  // --- Input Handlers ---
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleInputBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const formatAmount = (num) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);

  const handleProceedToPayment = () => {
    if (!validateForm()) {
      toast.error('Please fix the errors in your information.');
      const firstErrorKey = Object.keys(errors).find(key => errors[key]);
      if (firstErrorKey) {
        const errorElement = document.getElementById(firstErrorKey);
        errorElement?.focus();
      }
      return;
    }

    setIsSubmitting(true);

    // Store shipping info in localStorage for the payment page
    localStorage.setItem('shippingInfo', JSON.stringify(formData));
    localStorage.setItem('selectedAddress', JSON.stringify(selectedAddress));
    
    // Track the shipping step
    trackClick('shipping_info_completed', 'shipping');

    // Navigate to shipping method selection page
    navigate('/user/shipping-method');
  };

  // Clear all checkout data
  const clearCheckoutData = () => {
    if (window.confirm('Are you sure you want to clear all checkout data? This will reset your shipping information.')) {
      localStorage.removeItem('checkout_shipping_info');
      localStorage.removeItem('checkout_selected_address');
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('selectedAddress');
      
      // Reset form data
      setFormData({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
        address: '',
        city: '',
        state: '',
        zipCode: '',
        country: 'India'
      });
      setSelectedAddress(null);
      setErrors({});
      
      toast.success('Checkout data cleared successfully!');
    }
  };

  // Fill form with user profile information
  const fillWithProfileInfo = () => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || ''
      }));
      toast.success('Profile information filled successfully!');
    }
  };

  if (!cart || cart.length === 0) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="ml-2 text-sm font-medium text-blue-600">Shipping Information</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Shipping Method</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight sm:text-5xl">Shipping Information</h1>
          <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600">
            Please provide your shipping details to continue with your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          
          {/* Left Side: Shipping Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <FiMapPin className="w-6 h-6 mr-3 text-blue-600" />
                Shipping Information
              </h2>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mb-6">
                <div className="flex justify-between items-center">
                  <p className="text-sm text-blue-800"><span className="text-red-500 font-semibold">*</span> Indicates a required field</p>
                  <div className="flex space-x-3">
                    {user && (
                      <button
                        type="button"
                        onClick={fillWithProfileInfo}
                        className="text-sm text-blue-600 hover:text-blue-700 underline"
                      >
                        Use My Profile Info
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={clearCheckoutData}
                      className="text-sm text-red-600 hover:text-red-700 underline"
                    >
                      Clear All Data
                    </button>
                  </div>
                </div>
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormInput id="name" name="name" type="text" label="Full Name" value={formData.name} placeholder="John Doe" error={errors.name} onChange={handleInputChange} onBlur={handleInputBlur} icon={<FiUser className="text-slate-400"/>} isRequired />
                  <FormInput id="email" name="email" type="email" label="Email Address" value={formData.email} placeholder="you@example.com" error={errors.email} onChange={handleInputChange} onBlur={handleInputBlur} icon={<FiMail className="text-slate-400"/>} isRequired />
                </div>
                <FormInput id="phone" name="phone" type="tel" label="Phone Number" value={formData.phone} placeholder="9876543210" error={errors.phone} onChange={handleInputChange} onBlur={handleInputBlur} icon={<FiPhone className="text-slate-400"/>} isRequired />
                
                {/* Address Selection */}
                {addresses.length > 0 && (
                  <AddressSelector 
                    addresses={addresses}
                    selectedAddress={selectedAddress}
                    onAddressSelect={handleAddressSelect}
                    onAddNewAddress={() => setShowAddressModal(true)}
                  />
                )}
                
                <FormInput id="address" name="address" type="text" label="Street Address" value={formData.address} placeholder="123, Main Street, Apartment 4B" error={errors.address} onChange={handleInputChange} onBlur={handleInputBlur} icon={<FiMapPin className="text-slate-400"/>} isRequired />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormInput id="city" name="city" type="text" label="City" value={formData.city} placeholder="Mumbai" error={errors.city} onChange={handleInputChange} onBlur={handleInputBlur} icon={<span className="text-slate-400 text-xs font-bold">City</span>} isRequired />
                  <FormInput id="state" name="state" type="text" label="State" value={formData.state} placeholder="Maharashtra" error={errors.state} onChange={handleInputChange} onBlur={handleInputBlur} icon={<span className="text-slate-400 text-xs font-bold">State</span>} isRequired />
                  <FormInput id="zipCode" name="zipCode" type="text" label="PIN Code" value={formData.zipCode} placeholder="400001" error={errors.zipCode} onChange={handleInputChange} onBlur={handleInputBlur} icon={<span className="text-slate-400 text-xs font-bold">PIN</span>} isRequired />
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg lg:sticky lg:top-8">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiShoppingCart className="mr-3 text-gray-500"/>
                  Order Summary
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product._id} className="flex items-center space-x-4">
                    <img 
                      src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'} 
                      alt={item.product.name} 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.product.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-slate-900">{formatAmount((item.product.price || 0) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t space-y-3">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatAmount(cartTotal)}</span></div>
                <div className="flex justify-between text-slate-600 mb-4"><span>Tax ({settings.payment.taxRate}%)</span><span>{formatAmount(Math.round(cartTotal * (settings.payment.taxRate / 100)))}</span></div>
                <div className="border-t-2 border-dashed pt-4">
                  <div className="flex justify-between font-bold text-xl text-slate-900">
                    <span>Total</span>
                    <span>{formatAmount(cartTotal + Math.round(cartTotal * (settings.payment.taxRate / 100)))}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <button 
                  onClick={handleProceedToPayment} 
                  disabled={isSubmitting} 
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center ${
                    isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      Continue to Shipping Method
                      <FiArrowRight className="ml-2 w-5 h-5" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Add Address Modal */}
        <AddAddressModal 
          isOpen={showAddressModal}
          onClose={() => setShowAddressModal(false)}
          onSave={handleAddNewAddress}
          formData={formData}
        />
      </div>
    </div>
  );
};

export default ShippingInfo; 