import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit3, FiTrash2, FiPercent, FiTag, FiCalendar, FiUsers, FiEye, FiToggleLeft, FiToggleRight, FiX, FiBarChart, FiUserPlus } from 'react-icons/fi';
import { couponsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';
import CouponUserUsage from './CouponUserUsage';

const CouponManagement = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [viewingCoupon, setViewingCoupon] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [usageTrackingCoupon, setUsageTrackingCoupon] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [issuingCoupon, setIssuingCoupon] = useState(null);
  const [showIssuanceModal, setShowIssuanceModal] = useState(false);
  const [issuanceUserEmails, setIssuanceUserEmails] = useState('');
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrderAmount: '',
    maximumDiscountAmount: '',
    expirationDate: '',
    usageLimit: '',
    userUsageLimit: 1,
    issuanceLimit: '',
    isActive: true
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const response = await couponsAPI.getAllCoupons();
      if (response.success) {
        setCoupons(response.data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const couponData = {
        ...formData,
        code: formData.code.toUpperCase(),
        discountValue: parseFloat(formData.discountValue),
        minimumOrderAmount: formData.minimumOrderAmount ? parseFloat(formData.minimumOrderAmount) : 0,
        maximumDiscountAmount: (formData.maximumDiscountAmount && formData.maximumDiscountAmount.trim() !== '') ? parseFloat(formData.maximumDiscountAmount) : null,
        usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
        userUsageLimit: parseInt(formData.userUsageLimit),
        issuanceLimit: formData.issuanceLimit ? parseInt(formData.issuanceLimit) : null
      };

      if (editingCoupon) {
        const response = await couponsAPI.updateCoupon(editingCoupon._id, couponData);
        if (response.success) {
          toast.success('Coupon updated successfully');
          fetchCoupons();
        }
      } else {
        const response = await couponsAPI.createCoupon(couponData);
        if (response.success) {
          toast.success('Coupon created successfully');
          fetchCoupons();
        }
      }
      
      resetForm();
      setShowCreateModal(false);
      setEditingCoupon(null);
    } catch (error) {
      console.error('Error saving coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to save coupon';
      toast.error(errorMessage);
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'percentage',
      discountValue: '',
      minimumOrderAmount: '',
      maximumDiscountAmount: '',
      expirationDate: '',
      usageLimit: '',
      userUsageLimit: 1,
      issuanceLimit: '',
      isActive: true
    });
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      name: coupon.name,
      description: coupon.description || '',
      discountType: coupon.discountType,
      discountValue: coupon.discountValue.toString(),
      minimumOrderAmount: coupon.minimumOrderAmount.toString(),
      maximumDiscountAmount: coupon.maximumDiscountAmount?.toString() || '',
      expirationDate: coupon.expirationDate.split('T')[0],
      usageLimit: coupon.usageLimit?.toString() || '',
      userUsageLimit: coupon.userUsageLimit.toString(),
      issuanceLimit: coupon.issuanceLimit?.toString() || '',
      isActive: coupon.isActive
    });
    setShowCreateModal(true);
  };

  const handleDelete = async (couponId) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) {
      return;
    }

    try {
      const response = await couponsAPI.deleteCoupon(couponId);
      if (response.success) {
        toast.success('Coupon deleted successfully');
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error deleting coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete coupon';
      toast.error(errorMessage);
    }
  };

  const handleToggleActive = async (couponId, currentStatus) => {
    try {
      const response = await couponsAPI.updateCoupon(couponId, {
        isActive: !currentStatus
      });
      
      if (response.success) {
        toast.success(`Coupon ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error toggling coupon status:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update coupon status';
      toast.error(errorMessage);
    }
  };

  const handleViewCoupon = async (couponId) => {
    try {
      const response = await couponsAPI.getCouponById(couponId);
      if (response.success) {
        setViewingCoupon(response.data.coupon);
        setShowViewModal(true);
      }
    } catch (error) {
      console.error('Error fetching coupon details:', error);
      toast.error('Failed to load coupon details');
    }
  };

  const handleViewUsageTracking = (coupon) => {
    setUsageTrackingCoupon(coupon);
    setShowUsageModal(true);
  };

  const handleIssueCoupon = (coupon) => {
    setIssuingCoupon(coupon);
    setIssuanceUserEmails('');
    setShowIssuanceModal(true);
  };

  const handleSubmitIssuance = async (e) => {
    e.preventDefault();
    
    if (!issuanceUserEmails.trim()) {
      toast.error('Please enter at least one user email');
      return;
    }

    try {
      const emails = issuanceUserEmails
        .split(',')
        .map(email => email.trim())
        .filter(email => email);

      // For demo purposes, we'll assume we have user IDs 
      // In a real app, you'd look up users by email first
      const response = await couponsAPI.issueCoupon(issuingCoupon._id, {
        userIds: emails, // This would be actual user IDs after lookup
        channel: 'admin'
      });

      if (response.success) {
        toast.success(`Coupon issued to ${emails.length} user(s)`);
        fetchCoupons();
        setShowIssuanceModal(false);
        setIssuingCoupon(null);
        setIssuanceUserEmails('');
      }
    } catch (error) {
      console.error('Error issuing coupon:', error);
      const errorMessage = error.response?.data?.message || 'Failed to issue coupon';
      toast.error(errorMessage);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCouponStatus = (coupon) => {
    if (!coupon.isActive) return { text: 'Inactive', color: 'bg-gray-500' };
    if (new Date(coupon.expirationDate) <= new Date()) return { text: 'Expired', color: 'bg-red-500' };
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) return { text: 'Used Up', color: 'bg-orange-500' };
    return { text: 'Active', color: 'bg-green-500' };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Coupon Management</h1>
        <button
          onClick={() => {
            resetForm();
            setEditingCoupon(null);
            setShowCreateModal(true);
          }}
          className="w-full sm:w-auto bg-blue-600 text-white px-4 py-3 sm:py-2 rounded-lg hover:bg-blue-700 flex items-center justify-center font-medium"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Create Coupon
        </button>
      </div>

      {/* Desktop Table View */}
      <div className="hidden lg:block bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Code
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Discount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Usage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Expires
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {coupons.map((coupon) => {
                const status = getCouponStatus(coupon);
                return (
                  <tr key={coupon._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiTag className="w-4 h-4 text-blue-500 mr-2" />
                        <span className="font-mono font-semibold text-gray-900">{coupon.code}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{coupon.name}</div>
                      {coupon.description && (
                        <div className="text-sm text-gray-500 truncate max-w-xs">{coupon.description}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiPercent className="w-4 h-4 text-green-500 mr-1" />
                        <span className="text-sm font-medium text-gray-900">
                          {coupon.discountType === 'percentage' 
                            ? `${coupon.discountValue}%`
                            : `₹${coupon.discountValue}`}
                        </span>
                      </div>
                      {coupon.minimumOrderAmount > 0 && (
                        <div className="text-xs text-gray-500">Min: ₹{coupon.minimumOrderAmount}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <FiUsers className="w-4 h-4 text-gray-400 mr-1" />
                        <span className="text-sm text-gray-900">
                          {coupon.usedCount}/{coupon.usageLimit || '∞'}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500">
                        Issued: {coupon.issuedCount}/{coupon.issuanceLimit || '∞'}
                      </div>
                      <div className="text-xs text-gray-500">
                        Max {coupon.userUsageLimit}/user
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${status.color}`}>
                        {status.text}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center text-sm text-gray-900">
                        <FiCalendar className="w-4 h-4 text-gray-400 mr-1" />
                        {formatDate(coupon.expirationDate)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => handleViewCoupon(coupon._id)}
                          className="text-gray-600 hover:text-gray-900"
                          title="View coupon details"
                        >
                          <FiEye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleViewUsageTracking(coupon)}
                          className="text-purple-600 hover:text-purple-900"
                          title="View user usage statistics"
                        >
                          <FiBarChart className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleIssueCoupon(coupon)}
                          className="text-orange-600 hover:text-orange-900"
                          title="Issue coupon to users"
                          disabled={coupon.issuanceLimit && coupon.issuedCount >= coupon.issuanceLimit}
                        >
                          <FiUserPlus className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                          className={`${coupon.isActive ? 'text-green-600 hover:text-green-900' : 'text-gray-400 hover:text-gray-600'}`}
                          title={coupon.isActive ? 'Deactivate coupon' : 'Activate coupon'}
                        >
                          {coupon.isActive ? <FiToggleRight className="w-5 h-5" /> : <FiToggleLeft className="w-5 h-5" />}
                        </button>
                        <button
                          onClick={() => handleEdit(coupon)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit coupon"
                        >
                          <FiEdit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(coupon._id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete coupon"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden space-y-4">
        {coupons.map((coupon) => {
          const status = getCouponStatus(coupon);
          return (
            <div key={coupon._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              {/* Coupon Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center mb-1">
                    <FiTag className="w-4 h-4 text-blue-500 mr-2" />
                    <span className="font-mono font-bold text-gray-900">{coupon.code}</span>
                  </div>
                  <h3 className="text-sm font-medium text-gray-900 mb-1">{coupon.name}</h3>
                  {coupon.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{coupon.description}</p>
                  )}
                </div>
                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full text-white ${status.color} ml-2`}>
                  {status.text}
                </span>
              </div>

              {/* Discount Info */}
              <div className="grid grid-cols-2 gap-4 mb-3">
                <div>
                  <div className="flex items-center mb-1">
                    <FiPercent className="w-4 h-4 text-green-500 mr-1" />
                    <span className="text-sm font-medium text-gray-900">
                      {coupon.discountType === 'percentage' 
                        ? `${coupon.discountValue}%`
                        : `₹${coupon.discountValue}`}
                    </span>
                  </div>
                  {coupon.minimumOrderAmount > 0 && (
                    <div className="text-xs text-gray-500">Min: ₹{coupon.minimumOrderAmount}</div>
                  )}
                </div>
                <div>
                  <div className="flex items-center text-sm text-gray-900 mb-1">
                    <FiCalendar className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-xs">{formatDate(coupon.expirationDate)}</span>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
                <div>
                  <div className="flex items-center mb-1">
                    <FiUsers className="w-4 h-4 text-gray-400 mr-1" />
                    <span className="text-xs font-medium text-gray-900">
                      Used: {coupon.usedCount}/{coupon.usageLimit || '∞'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Max {coupon.userUsageLimit}/user
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-gray-900 mb-1">
                    Issued: {coupon.issuedCount}/{coupon.issuanceLimit || '∞'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => handleViewCoupon(coupon._id)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 active:bg-gray-300"
                >
                  <FiEye className="w-4 h-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => handleViewUsageTracking(coupon)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-purple-700 bg-purple-100 rounded-lg hover:bg-purple-200 active:bg-purple-300"
                >
                  <FiBarChart className="w-4 h-4 mr-1" />
                  Stats
                </button>
                <button
                  onClick={() => handleIssueCoupon(coupon)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-orange-700 bg-orange-100 rounded-lg hover:bg-orange-200 active:bg-orange-300 disabled:opacity-50"
                  disabled={coupon.issuanceLimit && coupon.issuedCount >= coupon.issuanceLimit}
                >
                  <FiUserPlus className="w-4 h-4 mr-1" />
                  Issue
                </button>
              </div>

              {/* Secondary Actions */}
              <div className="grid grid-cols-3 gap-2 mt-2">
                <button
                  onClick={() => handleToggleActive(coupon._id, coupon.isActive)}
                  className={`flex items-center justify-center px-3 py-2 text-xs font-medium rounded-lg ${
                    coupon.isActive 
                      ? 'text-green-700 bg-green-100 hover:bg-green-200 active:bg-green-300' 
                      : 'text-gray-700 bg-gray-100 hover:bg-gray-200 active:bg-gray-300'
                  }`}
                >
                  {coupon.isActive ? <FiToggleRight className="w-4 h-4 mr-1" /> : <FiToggleLeft className="w-4 h-4 mr-1" />}
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </button>
                <button
                  onClick={() => handleEdit(coupon)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-blue-700 bg-blue-100 rounded-lg hover:bg-blue-200 active:bg-blue-300"
                >
                  <FiEdit3 className="w-4 h-4 mr-1" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(coupon._id)}
                  className="flex items-center justify-center px-3 py-2 text-xs font-medium text-red-700 bg-red-100 rounded-lg hover:bg-red-200 active:bg-red-300"
                >
                  <FiTrash2 className="w-4 h-4 mr-1" />
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create/Edit Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-lg">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                {editingCoupon ? 'Edit Coupon' : 'Create New Coupon'}
              </h2>
            </div>
            
            <div className="p-4 sm:p-6">
            
            <form id="couponForm" onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Coupon Code *
                  </label>
                  <input
                    type="text"
                    name="code"
                    value={formData.code}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase font-mono"
                    required
                    maxLength={20}
                    pattern="[A-Z0-9]+"
                    title="Only letters and numbers allowed"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Type *
                  </label>
                  <select
                    name="discountType"
                    value={formData.discountType}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  >
                    <option value="percentage">Percentage</option>
                    <option value="fixed">Fixed Amount</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Coupon Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  required
                  maxLength={100}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  maxLength={500}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount Value *
                  </label>
                  <input
                    type="number"
                    name="discountValue"
                    value={formData.discountValue}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min="0"
                    max={formData.discountType === 'percentage' ? "100" : undefined}
                    step="0.01"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    {formData.discountType === 'percentage' ? 'Percentage (0-100)' : 'Amount in ₹'}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expiration Date *
                  </label>
                  <input
                    type="date"
                    name="expirationDate"
                    value={formData.expirationDate}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Order Amount
                  </label>
                  <input
                    type="number"
                    name="minimumOrderAmount"
                    value={formData.minimumOrderAmount}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="0"
                    step="0.01"
                  />
                </div>

                {formData.discountType === 'percentage' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Maximum Discount Amount
                    </label>
                    <input
                      type="number"
                      name="maximumDiscountAmount"
                      value={formData.maximumDiscountAmount}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="0"
                      step="0.01"
                      placeholder="No limit"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Optional: Cap the maximum discount amount
                    </div>
                  </div>
                )}

                {formData.discountType === 'fixed' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Usage Limit
                    </label>
                    <input
                      type="number"
                      name="usageLimit"
                      value={formData.usageLimit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      min="1"
                      placeholder="Unlimited"
                    />
                  </div>
                )}
              </div>

              {formData.discountType === 'percentage' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Usage Limit
                  </label>
                  <input
                    type="number"
                    name="usageLimit"
                    value={formData.usageLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    placeholder="Unlimited"
                  />
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User Usage Limit
                  </label>
                  <input
                    type="number"
                    name="userUsageLimit"
                    value={formData.userUsageLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    required
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    How many times each user can use this coupon
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Issuance Limit
                  </label>
                  <input
                    type="number"
                    name="issuanceLimit"
                    value={formData.issuanceLimit}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    min="1"
                    placeholder="Unlimited"
                  />
                  <div className="text-xs text-gray-500 mt-1">
                    Total number of coupons that can be issued to users
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="ml-2 text-sm text-gray-700">
                  Active (users can use this coupon)
                </label>
              </div>

            </form>
            
            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setEditingCoupon(null);
                    resetForm();
                  }}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="couponForm"
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  {editingCoupon ? 'Update' : 'Create'} Coupon
                </button>
              </div>
            </div>
            </div>
          </div>
        </div>
      )}

      {/* View Coupon Modal */}
      {showViewModal && viewingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Coupon Details</h2>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingCoupon(null);
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Code</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg font-mono font-bold text-blue-600">
                    {viewingCoupon.code}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Name</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                    {viewingCoupon.name}
                  </div>
                </div>

                {viewingCoupon.description && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                      {viewingCoupon.description}
                    </div>
                  </div>
                )}

                <div>
                  <label className="text-sm font-medium text-gray-600">Status</label>
                  <div className="mt-1 flex items-center">
                    {viewingCoupon.isActive ? (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white bg-green-500">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-3 py-1 text-sm font-semibold rounded-full text-white bg-gray-500">
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Discount Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Discount Settings</h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Discount Type</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg flex items-center">
                    <FiPercent className="w-4 h-4 mr-2 text-blue-500" />
                    {viewingCoupon.discountType === 'percentage' ? 'Percentage' : 'Fixed Amount'}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Discount Value</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg font-bold text-green-600">
                    {viewingCoupon.discountType === 'percentage' 
                      ? `${viewingCoupon.discountValue}%` 
                      : `₹${viewingCoupon.discountValue}`}
                  </div>
                </div>

                {viewingCoupon.minimumOrderAmount > 0 && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Minimum Order Amount</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                      ₹{viewingCoupon.minimumOrderAmount}
                    </div>
                  </div>
                )}

                {viewingCoupon.maximumDiscountAmount && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Maximum Discount Amount</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                      ₹{viewingCoupon.maximumDiscountAmount}
                    </div>
                  </div>
                )}
              </div>

              {/* Usage Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Usage Information</h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Expiration Date</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg flex items-center">
                    <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
                    {formatDate(viewingCoupon.expirationDate)}
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Usage Statistics</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg flex items-center">
                    <FiUsers className="w-4 h-4 mr-2 text-gray-500" />
                    {viewingCoupon.usedCount} / {viewingCoupon.usageLimit || '∞'} uses
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Per User Limit</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg">
                    {viewingCoupon.userUsageLimit} use(s) per user
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-600">Issuance Statistics</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg flex items-center">
                    <FiUsers className="w-4 h-4 mr-2 text-gray-500" />
                    {viewingCoupon.issuedCount} / {viewingCoupon.issuanceLimit || '∞'} issued
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-800 border-b pb-2">Additional Info</h3>
                
                <div>
                  <label className="text-sm font-medium text-gray-600">Created</label>
                  <div className="mt-1 p-2 bg-gray-50 rounded-lg text-sm">
                    {formatDate(viewingCoupon.createdAt)}
                  </div>
                </div>

                {viewingCoupon.updatedAt !== viewingCoupon.createdAt && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Last Updated</label>
                    <div className="mt-1 p-2 bg-gray-50 rounded-lg text-sm">
                      {formatDate(viewingCoupon.updatedAt)}
                    </div>
                  </div>
                )}

                {viewingCoupon.isFirstTimeUserOnly && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Special Conditions</label>
                    <div className="mt-1 p-2 bg-yellow-50 rounded-lg text-yellow-800 text-sm">
                      First-time users only
                    </div>
                  </div>
                )}
              </div>
            </div>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingCoupon(null);
                  }}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowViewModal(false);
                    setViewingCoupon(null);
                    handleEdit(viewingCoupon);
                  }}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                >
                  Edit Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* User Usage Tracking Modal */}
      <CouponUserUsage
        coupon={usageTrackingCoupon}
        isOpen={showUsageModal}
        onClose={() => {
          setShowUsageModal(false);
          setUsageTrackingCoupon(null);
        }}
      />

      {/* Issue Coupon Modal */}
      {showIssuanceModal && issuingCoupon && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-lg max-h-screen overflow-y-auto">
            {/* Sticky Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 rounded-t-lg">
              <div className="flex justify-between items-center">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">Issue Coupon</h2>
                <button
                  onClick={() => {
                    setShowIssuanceModal(false);
                    setIssuingCoupon(null);
                    setIssuanceUserEmails('');
                  }}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <FiX className="w-5 h-5" />
                </button>
              </div>
            </div>
            
            <div className="p-4 sm:p-6">
            
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <div className="flex items-center mb-2">
                <FiTag className="w-4 h-4 text-blue-500 mr-2" />
                <span className="font-semibold text-blue-900">{issuingCoupon.code}</span>
              </div>
              <p className="text-sm text-blue-700">{issuingCoupon.name}</p>
              <div className="mt-2 text-xs text-blue-600">
                Issued: {issuingCoupon.issuedCount} / {issuingCoupon.issuanceLimit || '∞'}
                {issuingCoupon.issuanceLimit && (
                  <span className="ml-2">
                    ({issuingCoupon.issuanceLimit - issuingCoupon.issuedCount} remaining)
                  </span>
                )}
              </div>
            </div>

            <form id="issuanceForm" onSubmit={handleSubmitIssuance} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  User Emails (comma-separated)
                </label>
                <textarea
                  value={issuanceUserEmails}
                  onChange={(e) => setIssuanceUserEmails(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  rows={4}
                  placeholder="user1@example.com, user2@example.com, user3@example.com"
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Enter email addresses of users to issue this coupon to, separated by commas.
                </div>
              </div>

            </form>
            </div>

            {/* Sticky Footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 rounded-b-lg">
              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
                <button
                  type="button"
                  onClick={() => {
                    setShowIssuanceModal(false);
                    setIssuingCoupon(null);
                    setIssuanceUserEmails('');
                  }}
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  form="issuanceForm"
                  className="w-full sm:w-auto px-4 py-3 sm:py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 flex items-center justify-center font-medium disabled:opacity-50"
                  disabled={issuingCoupon.issuanceLimit && issuingCoupon.issuedCount >= issuingCoupon.issuanceLimit}
                >
                  <FiUserPlus className="w-4 h-4 mr-2" />
                  Issue Coupon
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponManagement;