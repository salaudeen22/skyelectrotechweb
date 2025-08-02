import React, { useState } from 'react';
import { FiX, FiUpload, FiAlertCircle } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const ReturnOrderModal = ({ order, isOpen, onClose, onReturnSubmit }) => {
  const [formData, setFormData] = useState({
    reason: '',
    description: '',
    condition: 'good',
    images: []
  });
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState([]);

  const returnReasons = [
    { value: 'defective', label: 'Product is defective/damaged' },
    { value: 'wrong_item', label: 'Wrong item received' },
    { value: 'not_as_described', label: 'Product not as described' },
    { value: 'size_issue', label: 'Size doesn\'t fit' },
    { value: 'quality_issue', label: 'Quality not satisfactory' },
    { value: 'changed_mind', label: 'Changed my mind' },
    { value: 'duplicate_order', label: 'Duplicate order' },
    { value: 'other', label: 'Other reason' }
  ];

  const productConditions = [
    { value: 'good', label: 'Good - Like new condition' },
    { value: 'fair', label: 'Fair - Minor wear/tear' },
    { value: 'poor', label: 'Poor - Significant damage' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      
      if (!isValidType) {
        toast.error(`${file.name} is not a valid image format`);
      }
      if (!isValidSize) {
        toast.error(`${file.name} is too large (max 5MB)`);
      }
      
      return isValidType && isValidSize;
    });

    if (validFiles.length + imageFiles.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setImageFiles(prev => [...prev, ...validFiles]);
  };

  const removeImage = (index) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.reason) {
      toast.error('Please select a return reason');
      return;
    }

    if (!formData.description.trim()) {
      toast.error('Please provide a detailed description');
      return;
    }

    setLoading(true);
    try {
      // Create FormData for file upload
      const submitData = new FormData();
      submitData.append('reason', formData.reason);
      submitData.append('description', formData.description);
      submitData.append('condition', formData.condition);
      
      imageFiles.forEach((file, index) => {
        submitData.append('images', file);
      });

      await onReturnSubmit(order._id, submitData);
      onClose();
      toast.success('Return request submitted successfully');
    } catch (error) {
      console.error('Error submitting return:', error);
      toast.error('Failed to submit return request');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-800">Return Order</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Order Info */}
        <div className="p-6 border-b bg-gray-50">
          <h3 className="font-semibold text-gray-800 mb-3">Order Details</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Order ID:</span>
              <span className="ml-2 font-medium">{order.orderId}</span>
            </div>
            <div>
              <span className="text-gray-600">Order Date:</span>
              <span className="ml-2 font-medium">
                {new Date(order.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-600">Total Amount:</span>
              <span className="ml-2 font-medium">₹{order.totalPrice}</span>
            </div>
            <div>
              <span className="text-gray-600">Items:</span>
              <span className="ml-2 font-medium">{order.orderItems.length}</span>
            </div>
          </div>
        </div>

        {/* Return Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Return Reason */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Return Reason <span className="text-red-500">*</span>
            </label>
            <select
              name="reason"
              value={formData.reason}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              <option value="">Select a reason</option>
              {returnReasons.map(reason => (
                <option key={reason.value} value={reason.value}>
                  {reason.label}
                </option>
              ))}
            </select>
          </div>

          {/* Product Condition */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Product Condition <span className="text-red-500">*</span>
            </label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              required
            >
              {productConditions.map(condition => (
                <option key={condition.value} value={condition.value}>
                  {condition.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Description <span className="text-red-500">*</span>
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              placeholder="Please provide detailed information about why you want to return this order..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              required
            />
          </div>

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload Images (Optional)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                id="image-upload"
              />
              <label htmlFor="image-upload" className="cursor-pointer">
                <FiUpload className="w-8 h-8 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload images (max 5, 5MB each)
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  JPG, PNG, WebP accepted
                </p>
              </label>
            </div>

            {/* Image Preview */}
            {imageFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">
                  Uploaded Images ({imageFiles.length}/5)
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Upload ${index + 1}`}
                        className="w-full h-24 object-cover rounded-lg border"
                      />
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
                      >
                        <FiX className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Return Policy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start">
              <FiAlertCircle className="w-5 h-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Return Policy</p>
                <ul className="space-y-1 text-xs">
                  <li>• Returns must be requested within 2 days of shipping/delivery</li>
                  <li>• Products must be in original condition</li>
                  <li>• Return shipping costs may apply</li>
                  <li>• Refunds will be processed within 5-7 business days</li>
                  <li>• Multiple return requests allowed per order</li>
                  <li>• After 2 days, contact support for assistance</li>
                  <li>• Each order can have multiple return requests</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                'Submit Return Request'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ReturnOrderModal; 