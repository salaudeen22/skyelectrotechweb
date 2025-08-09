import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiLock, FiPackage, FiHeart, FiPlus, FiTrash2, FiStar, FiCamera, FiTrash } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Profile = () => {
  const navigate = useNavigate();
  const { 
    user, 
    requestProfileUpdateOTP, 
    updateProfile, 
    getAddresses, 
    addAddress, 
    updateAddress, 
    deleteAddress, 
    setDefaultAddress,
    uploadAvatar,
    deleteAvatar
  } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [showAddresses, setShowAddresses] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    otp: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  });
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    country: 'India',
    zipCode: '',
    isDefault: false
  });

  // Avatar related state
  const [avatarLoading, setAvatarLoading] = useState(false);
  const fileInputRef = useRef(null);


  // Get default address from addresses array
  const defaultAddress = addresses.find(addr => addr.isDefault) || addresses[0];

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        address: {
          street: defaultAddress?.street || '',
          city: defaultAddress?.city || '',
          state: defaultAddress?.state || '',
          zipCode: defaultAddress?.zipCode || '',
          country: defaultAddress?.country || 'India'
        }
      });
    }
  }, [user, defaultAddress]);

  const fetchAddresses = useCallback(async () => {
    const result = await getAddresses();
    if (result.success) {
      setAddresses(result.data);
    }
  }, [getAddresses]);

  useEffect(() => {
    if (showAddresses) {
      fetchAddresses();
    }
  }, [showAddresses, fetchAddresses]);

  // Fetch addresses on component mount to get default address
  useEffect(() => {
    if (user) {
      fetchAddresses();
    }
  }, [user, fetchAddresses]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddressFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setAddressFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleRequestOTP = async () => {
    const result = await requestProfileUpdateOTP();
    if (result.success) {
      setOtpSent(true);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const result = await updateProfile(formData);
      if (result.success) {
        setIsEditing(false);
        setOtpSent(false);
        setFormData(prev => ({ ...prev, otp: '' }));
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original user data
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        otp: '',
        address: {
          street: user.address?.street || '',
          city: user.address?.city || '',
          state: user.address?.state || '',
          zipCode: user.address?.zipCode || '',
          country: user.address?.country || 'India'
        }
      });
    }
    setIsEditing(false);
    setOtpSent(false);
  };

  const handleAddAddress = async () => {
    // If this is the first address, ensure it's set as default
    const finalAddressData = {
      ...addressFormData,
      isDefault: addressFormData.isDefault || addresses.length === 0
    };
    
    const result = await addAddress(finalAddressData);
    if (result.success) {
      setShowAddressForm(false);
      setAddressFormData({
        name: '',
        street: '',
        city: '',
        state: '',
        country: 'India',
        zipCode: '',
        isDefault: false
      });
      fetchAddresses();
    }
  };

  const handleUpdateAddress = async () => {
    if (editingAddress) {
      const result = await updateAddress(editingAddress.id, addressFormData);
      if (result.success) {
        setEditingAddress(null);
        setShowAddressForm(false);
        fetchAddresses();
      }
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      const result = await deleteAddress(addressId);
      if (result.success) {
        fetchAddresses();
      }
    }
  };

  const handleSetDefault = async (addressId) => {
    const result = await setDefaultAddress(addressId);
    if (result.success) {
      fetchAddresses();
    }
  };

  const startEditAddress = (address) => {
    setEditingAddress(address);
    setAddressFormData({
      name: address.name,
      street: address.street,
      city: address.city,
      state: address.state,
      country: address.country,
      zipCode: address.zipCode,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  // Avatar handling functions
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return;
    }

    try {
      setAvatarLoading(true);
      const result = await uploadAvatar(file);
      if (result.success) {
        // Avatar will be updated in context automatically
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
    } finally {
      setAvatarLoading(false);
    }
  };

  const handleAvatarDelete = async () => {
    if (!user.avatar) return;

    if (window.confirm('Are you sure you want to delete your avatar?')) {
      try {
        setAvatarLoading(true);
        const result = await deleteAvatar();
        if (result.success) {
          // Avatar will be removed from context automatically
        }
      } catch (error) {
        console.error('Avatar delete error:', error);
      } finally {
        setAvatarLoading(false);
      }
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account information</p>
        </div>

        {/* Avatar Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <div className="flex items-center space-x-6">
            {/* Avatar Display */}
            <div className="relative">
              {user.avatar && user.avatar.url ? (
                <img
                  src={user.avatar.url}
                  alt={user.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
                  onError={(e) => {
                    // Hide the broken image and show fallback
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              
              {/* Fallback Avatar - Always present but hidden when image loads successfully */}
              <div 
                className={`w-24 h-24 rounded-full bg-blue-500 flex items-center justify-center text-white text-3xl font-bold border-4 border-gray-200 ${
                  user.avatar && user.avatar.url ? 'hidden' : ''
                }`}
              >
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              
              {/* Avatar Loading Overlay */}
              {avatarLoading && (
                <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>

            {/* Avatar Actions */}
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Profile Picture</h3>
              <p className="text-gray-600 mb-4">
                {user.avatar ? 'Update your profile picture' : 'Add a profile picture to personalize your account'}
              </p>
              
              <div className="flex space-x-3">
                <button
                  onClick={triggerFileInput}
                  disabled={avatarLoading}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <FiCamera className="w-4 h-4 mr-2" />
                  {user.avatar ? 'Change Photo' : 'Upload Photo'}
                </button>
                
                {user.avatar && (
                  <button
                    onClick={handleAvatarDelete}
                    disabled={avatarLoading}
                    className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <FiTrash className="w-4 h-4 mr-2" />
                    Remove
                  </button>
                )}
              </div>
              
              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-sm">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Personal Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium"
                    >
                      <FiEdit2 className="w-4 h-4 mr-1" />
                      Edit
                    </button>
                  ) : (
                    <div className="flex flex-col space-y-2">
                      {!otpSent ? (
                        <button
                          onClick={handleRequestOTP}
                          disabled={loading}
                          className="flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                        >
                          <FiMail className="w-4 h-4 mr-1" />
                          {loading ? 'Sending OTP...' : 'Send OTP'}
                        </button>
                      ) : (
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={handleSave}
                            disabled={loading || !formData.otp}
                            className="flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium disabled:opacity-50"
                          >
                            <FiSave className="w-4 h-4 mr-1" />
                            {loading ? 'Saving...' : 'Save'}
                          </button>
                          <button
                            onClick={handleCancel}
                            className="flex items-center text-gray-600 hover:text-gray-700 px-4 py-2 rounded-lg font-medium"
                          >
                            <FiX className="w-4 h-4 mr-1" />
                            Cancel
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FiUser className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{user?.name || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiMail className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">{user?.email}</span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    ) : (
                      <div className="flex items-center space-x-2">
                        <FiPhone className="w-5 h-5 text-gray-400" />
                        <span className="text-gray-900">{user?.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  {isEditing && otpSent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        OTP Verification
                      </label>
                      <input
                        type="text"
                        name="otp"
                        value={formData.otp}
                        onChange={handleInputChange}
                        placeholder="Enter 6-digit OTP sent to your email"
                        maxLength="6"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-xs text-blue-600 mt-1">
                        Check your email for the OTP. It expires in 10 minutes.
                      </p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Member Since
                    </label>
                    <div className="flex items-center space-x-2">
                      <FiPackage className="w-5 h-5 text-gray-400" />
                      <span className="text-gray-900">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">Address Information</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Street Address
                      </label>
                      {isEditing ? (
                        <input
                          type="text"
                          name="address.street"
                          value={formData.address.street}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      ) : (
                        <div className="flex items-start space-x-2">
                          <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900 break-words">{defaultAddress?.street || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          City
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address.city"
                            value={formData.address.city}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-900 break-words">{defaultAddress?.city || 'Not provided'}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          State
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address.state"
                            value={formData.address.state}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-900 break-words">{defaultAddress?.state || 'Not provided'}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          ZIP Code
                        </label>
                        {isEditing ? (
                          <input
                            type="text"
                            name="address.zipCode"
                            value={formData.address.zipCode}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        ) : (
                          <span className="text-gray-900 break-words">{defaultAddress?.zipCode || 'Not provided'}</span>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Country
                        </label>
                        {isEditing ? (
                          <select
                            name="address.country"
                            value={formData.address.country}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="India">India</option>
                            <option value="USA">United States</option>
                            <option value="UK">United Kingdom</option>
                            <option value="Canada">Canada</option>
                            <option value="Australia">Australia</option>
                          </select>
                        ) : (
                          <span className="text-gray-900 break-words">{defaultAddress?.country || 'Not provided'}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Account Stats */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Overview</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Account Status</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-medium">
                    Active
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Role</span>
                  <span className="text-gray-900 capitalize">{user?.role || 'User'}</span>
                </div>
              </div>
            </div>

            {/* Address Management */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  My Addresses
                  {addresses.length > 0 && (
                    <span className="ml-2 bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                      {addresses.length}
                    </span>
                  )}
                </h3>
                <button
                  onClick={() => setShowAddresses(!showAddresses)}
                  className="text-blue-600 hover:text-blue-700 font-medium"
                >
                  {showAddresses ? 'Hide' : 'Manage'}
                </button>
              </div>

              {showAddresses && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowAddressForm(true)}
                    className="w-full flex items-center justify-center p-3 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
                  >
                    <FiPlus className="w-5 h-5 mr-2 text-gray-400" />
                    <span className="text-gray-600">Add New Address</span>
                  </button>

                  {addresses.length === 0 && (
                    <div className="text-center py-8">
                      <FiMapPin className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">No addresses saved yet</p>
                      <p className="text-gray-400 text-xs mt-1">Add your first address to get started</p>
                    </div>
                  )}

                  {addresses.map((address) => (
                    <div key={address.id} className="border border-gray-200 rounded-lg p-4 overflow-hidden">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <h4 className="font-medium text-gray-900 break-words">{address.name}</h4>
                              {address.isDefault && (
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium flex items-center flex-shrink-0">
                                  <FiStar className="w-3 h-3 mr-1" />
                                  Default
                                </span>
                              )}
                            </div>
                            <p className="text-gray-600 text-sm break-words">
                              {address.street}, {address.city}, {address.state} {address.zipCode}, {address.country}
                            </p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0 whitespace-nowrap">
                            {!address.isDefault && (
                              <button
                                onClick={() => handleSetDefault(address.id)}
                                className="text-blue-600 hover:text-blue-700 text-sm whitespace-nowrap"
                              >
                                Set Default
                              </button>
                            )}
                            <button
                              onClick={() => startEditAddress(address)}
                              className="text-gray-600 hover:text-gray-700 p-1"
                            >
                              <FiEdit2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteAddress(address.id)}
                              className="text-red-600 hover:text-red-700 p-1"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                    </div>
                  ))}

                  {/* Address Form Modal */}
                  {showAddressForm && (
                    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-4">
                      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">
                          {editingAddress ? 'Edit Address' : 'Add New Address'}
                        </h3>
                        <div className="space-y-6">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              <label className="block text-sm font-medium text-gray-700 mb-2">
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
                              checked={addressFormData.isDefault || addresses.length === 0}
                              onChange={handleAddressFormChange}
                              disabled={addresses.length === 0}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <label className="ml-2 text-sm text-gray-700">
                              Set as default address
                              {addresses.length === 0 && (
                                <span className="text-blue-600"> (First address will be default)</span>
                              )}
                            </label>
                          </div>
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 mt-6">
                          <button
                            onClick={() => {
                              setShowAddressForm(false);
                              setEditingAddress(null);
                            }}
                            className="w-full sm:w-auto px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          <button
                            onClick={editingAddress ? handleUpdateAddress : handleAddAddress}
                            className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            {editingAddress ? 'Update' : 'Add'} Address
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button 
                  onClick={() => setShowAddresses(true)}
                  className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <FiMapPin className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Manage Addresses</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/auth/change-password')}
                  className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <FiLock className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Change Password</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/orders')}
                  className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <FiPackage className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Order History</span>
                  </div>
                </button>
                <button 
                  onClick={() => navigate('/wishlist')}
                  className="w-full flex items-center justify-between text-left p-3 rounded-lg hover:bg-gray-50 border border-gray-200"
                >
                  <div className="flex items-center space-x-3">
                    <FiHeart className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-700">Wishlist</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
