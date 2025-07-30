import React, { useState, useEffect } from 'react';
import { FaTruck, FaPlus, FaEdit, FaTrash, FaSave, FaTimes } from 'react-icons/fa';
import toast from 'react-hot-toast';

const ShippingFees = () => {
  const [shippingFees, setShippingFees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingFee, setEditingFee] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'fixed', // fixed, percentage, weight_based, distance_based
    value: '',
    minOrderAmount: '',
    maxOrderAmount: '',
    description: '',
    isActive: true
  });

  useEffect(() => {
    fetchShippingFees();
  }, []);

  const fetchShippingFees = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual API call
      // const response = await shippingAPI.getShippingFees();
      // setShippingFees(response.data.shippingFees);
      
      // Mock data for now
      setShippingFees([
        {
          id: '1',
          name: 'Standard Shipping',
          type: 'fixed',
          value: 50,
          minOrderAmount: 0,
          maxOrderAmount: 1000,
          description: 'Standard delivery within 3-5 business days',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '2',
          name: 'Free Shipping',
          type: 'fixed',
          value: 0,
          minOrderAmount: 1000,
          maxOrderAmount: null,
          description: 'Free shipping for orders above ₹1000',
          isActive: true,
          createdAt: new Date().toISOString()
        },
        {
          id: '3',
          name: 'Express Shipping',
          type: 'fixed',
          value: 100,
          minOrderAmount: 0,
          maxOrderAmount: null,
          description: 'Next day delivery',
          isActive: true,
          createdAt: new Date().toISOString()
        }
      ]);
    } catch (error) {
      console.error('Error fetching shipping fees:', error);
      toast.error('Failed to load shipping fees');
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
    
    if (!formData.name || !formData.value) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      if (editingFee) {
        // Update existing fee
        // await shippingAPI.updateShippingFee(editingFee.id, formData);
        setShippingFees(prev => 
          prev.map(fee => 
            fee.id === editingFee.id 
              ? { ...fee, ...formData, updatedAt: new Date().toISOString() }
              : fee
          )
        );
        toast.success('Shipping fee updated successfully!');
      } else {
        // Add new fee
        // const response = await shippingAPI.createShippingFee(formData);
        const newFee = {
          id: Date.now().toString(),
          ...formData,
          createdAt: new Date().toISOString()
        };
        setShippingFees(prev => [...prev, newFee]);
        toast.success('Shipping fee added successfully!');
      }
      
      resetForm();
    } catch (error) {
      console.error('Error saving shipping fee:', error);
      toast.error('Failed to save shipping fee');
    }
  };

  const handleEdit = (fee) => {
    setEditingFee(fee);
    setFormData({
      name: fee.name,
      type: fee.type,
      value: fee.value,
      minOrderAmount: fee.minOrderAmount || '',
      maxOrderAmount: fee.maxOrderAmount || '',
      description: fee.description || '',
      isActive: fee.isActive
    });
    setShowAddForm(true);
  };

  const handleDelete = async (feeId) => {
    if (window.confirm('Are you sure you want to delete this shipping fee?')) {
      try {
        // await shippingAPI.deleteShippingFee(feeId);
        setShippingFees(prev => prev.filter(fee => fee.id !== feeId));
        toast.success('Shipping fee deleted successfully!');
      } catch (error) {
        console.error('Error deleting shipping fee:', error);
        toast.error('Failed to delete shipping fee');
      }
    }
  };

  const handleToggleActive = async (feeId, currentStatus) => {
    try {
      // await shippingAPI.updateShippingFee(feeId, { isActive: !currentStatus });
      setShippingFees(prev => 
        prev.map(fee => 
          fee.id === feeId 
            ? { ...fee, isActive: !currentStatus }
            : fee
        )
      );
      toast.success(`Shipping fee ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
    } catch (error) {
      console.error('Error updating shipping fee status:', error);
      toast.error('Failed to update shipping fee status');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'fixed',
      value: '',
      minOrderAmount: '',
      maxOrderAmount: '',
      description: '',
      isActive: true
    });
    setEditingFee(null);
    setShowAddForm(false);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'fixed': return 'Fixed Amount';
      case 'percentage': return 'Percentage';
      case 'weight_based': return 'Weight Based';
      case 'distance_based': return 'Distance Based';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
              <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-300 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-300 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-800">Shipping Fees Management</h1>
          <p className="text-slate-500 mt-1">Configure shipping fees and delivery options</p>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition flex items-center space-x-2"
        >
          <FaPlus className="w-4 h-4" />
          <span>Add Shipping Fee</span>
        </button>
      </div>

      {/* Add/Edit Form */}
      {showAddForm && (
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-slate-800">
              {editingFee ? 'Edit Shipping Fee' : 'Add New Shipping Fee'}
            </h2>
            <button
              onClick={resetForm}
              className="text-gray-500 hover:text-gray-700"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Standard Shipping"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="fixed">Fixed Amount</option>
                  <option value="percentage">Percentage</option>
                  <option value="weight_based">Weight Based</option>
                  <option value="distance_based">Distance Based</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Value *
                </label>
                <input
                  type="number"
                  name="value"
                  value={formData.value}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder={formData.type === 'percentage' ? '5' : '50'}
                  min="0"
                  step={formData.type === 'percentage' ? '0.1' : '1'}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.type === 'percentage' ? 'Percentage of order total' : 'Amount in INR'}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Min Order Amount
                </label>
                <input
                  type="number"
                  name="minOrderAmount"
                  value={formData.minOrderAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Max Order Amount
                </label>
                <input
                  type="number"
                  name="maxOrderAmount"
                  value={formData.maxOrderAmount}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="No limit"
                  min="0"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="3"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Describe the shipping service..."
              />
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
                Active (available for customers)
              </label>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center space-x-2"
              >
                <FaSave className="w-4 h-4" />
                <span>{editingFee ? 'Update' : 'Add'} Shipping Fee</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Shipping Fees List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {shippingFees.map((fee) => (
          <div key={fee.id} className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaTruck className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800">{fee.name}</h3>
                  <p className="text-sm text-slate-500">{getTypeLabel(fee.type)}</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(fee)}
                  className="text-blue-600 hover:text-blue-700"
                >
                  <FaEdit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(fee.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <FaTrash className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span className="text-sm text-slate-600">Fee:</span>
                <span className="font-semibold text-slate-800">
                  {fee.type === 'percentage' ? `${fee.value}%` : formatCurrency(fee.value)}
                </span>
              </div>
              
              {fee.minOrderAmount > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Min Order:</span>
                  <span className="text-sm text-slate-800">{formatCurrency(fee.minOrderAmount)}</span>
                </div>
              )}
              
              {fee.maxOrderAmount && (
                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">Max Order:</span>
                  <span className="text-sm text-slate-800">{formatCurrency(fee.maxOrderAmount)}</span>
                </div>
              )}
            </div>

            {fee.description && (
              <p className="text-sm text-slate-600 mb-4">{fee.description}</p>
            )}

            <div className="flex justify-between items-center">
              <button
                onClick={() => handleToggleActive(fee.id, fee.isActive)}
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  fee.isActive 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {fee.isActive ? 'Active' : 'Inactive'}
              </button>
              
              <span className="text-xs text-slate-500">
                {new Date(fee.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {shippingFees.length === 0 && (
        <div className="text-center py-12">
          <FaTruck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No shipping fees configured</h3>
          <p className="text-gray-500 mb-4">Get started by adding your first shipping fee rule.</p>
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Add Shipping Fee
          </button>
        </div>
      )}
    </div>
  );
};

export default ShippingFees; 