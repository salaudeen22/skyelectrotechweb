import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  FiTrash2, 
  FiEdit, 
  FiEye, 
  FiEyeOff,
  FiCheck,
  FiX,
  FiDollarSign
} from 'react-icons/fi';
import { bulkUploadAPI } from '../services/apiServices';

const BulkActions = ({ selectedProducts, onClose, onSuccess, products }) => {
  const [action, setAction] = useState('');
  const [loading, setLoading] = useState(false);
  const [bulkEditData, setBulkEditData] = useState({
    price: '',
    originalPrice: '',
    discount: '',
    isActive: true,
    isFeatured: false
  });

  const handleBulkDelete = async () => {
    if (!window.confirm(`Are you sure you want to delete ${selectedProducts.length} products?`)) {
      return;
    }

    try {
      setLoading(true);
      const response = await bulkUploadAPI.deleteProducts(selectedProducts);
      
      if (response.success) {
        toast.success(`Successfully deleted ${response.data.deletedCount} products`);
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to delete products');
      }
    } catch (error) {
      console.error('Bulk delete error:', error);
      toast.error('Failed to delete products: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkEdit = async () => {
    if (!action) {
      toast.error('Please select an action');
      return;
    }

    try {
      setLoading(true);
      const updates = selectedProducts.map(productId => {
        const updateData = { id: productId };
        
        switch (action) {
          case 'updatePrice':
            if (bulkEditData.price) updateData.price = parseFloat(bulkEditData.price);
            if (bulkEditData.originalPrice) updateData.originalPrice = parseFloat(bulkEditData.originalPrice);
            if (bulkEditData.discount) updateData.discount = parseFloat(bulkEditData.discount);
            break;
          case 'toggleActive':
            updateData.isActive = bulkEditData.isActive;
            break;
          case 'toggleFeatured':
            updateData.isFeatured = bulkEditData.isFeatured;
            break;
          default:
            break;
        }
        
        return updateData;
      });

      const response = await bulkUploadAPI.updateProducts(updates);
      
      if (response.success) {
        toast.success(`Successfully updated ${response.data.successful} products`);
        if (response.data.failed > 0) {
          toast.warning(`${response.data.failed} products failed to update`);
        }
        onSuccess && onSuccess();
        onClose();
      } else {
        throw new Error(response.message || 'Failed to update products');
      }
    } catch (error) {
      console.error('Bulk edit error:', error);
      toast.error('Failed to update products: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setBulkEditData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const getSelectedProductNames = () => {
    return selectedProducts.map(id => {
      const product = products.find(p => p._id === id);
      return product ? product.name : 'Unknown Product';
    }).join(', ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Bulk Actions</h2>
              <p className="text-gray-600 mt-1">
                {selectedProducts.length} products selected
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <FiX className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Selected Products Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">Selected Products:</h3>
            <p className="text-gray-700 text-sm max-h-20 overflow-y-auto">
              {getSelectedProductNames()}
            </p>
          </div>

          {/* Action Selection */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Select Action:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => setAction('updatePrice')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  action === 'updatePrice' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FiDollarSign className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">Update Pricing</p>
                    <p className="text-gray-600 text-sm">Change prices for selected products</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction('toggleActive')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  action === 'toggleActive' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FiEye className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900">Toggle Visibility</p>
                    <p className="text-gray-600 text-sm">Show/hide products</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setAction('toggleFeatured')}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  action === 'toggleFeatured' 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FiCheck className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-gray-900">Toggle Featured</p>
                    <p className="text-gray-600 text-sm">Mark as featured/unfeatured</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Action-specific Forms */}
          {action === 'updatePrice' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Price Update</h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    New Price
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={bulkEditData.price}
                    onChange={handleInputChange}
                    placeholder="Enter new price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Original Price
                  </label>
                  <input
                    type="number"
                    name="originalPrice"
                    value={bulkEditData.originalPrice}
                    onChange={handleInputChange}
                    placeholder="Enter original price"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Discount %
                  </label>
                  <input
                    type="number"
                    name="discount"
                    value={bulkEditData.discount}
                    onChange={handleInputChange}
                    placeholder="Enter discount"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>
          )}

          {action === 'toggleActive' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Visibility Settings</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={bulkEditData.isActive}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-gray-700">
                  Make products visible (active)
                </label>
              </div>
            </div>
          )}

          {action === 'toggleFeatured' && (
            <div className="border border-gray-200 rounded-lg p-4">
              <h4 className="font-medium text-gray-900 mb-4">Featured Settings</h4>
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  name="isFeatured"
                  checked={bulkEditData.isFeatured}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label className="text-gray-700">
                  Mark products as featured
                </label>
              </div>
            </div>
          )}

          {/* Danger Zone */}
          <div className="border border-red-200 rounded-lg p-4 bg-red-50">
            <h4 className="font-medium text-red-900 mb-2">Danger Zone</h4>
            <p className="text-red-700 text-sm mb-4">
              This action cannot be undone. This will permanently delete the selected products.
            </p>
            <button
              onClick={handleBulkDelete}
              disabled={loading}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
            >
              <FiTrash2 className="w-4 h-4" />
              <span>Delete Selected Products</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            {action && action !== 'delete' && (
              <button
                onClick={handleBulkEdit}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Processing...' : 'Apply Changes'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkActions;
