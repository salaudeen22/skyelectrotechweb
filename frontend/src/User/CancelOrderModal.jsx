import React, { useState } from 'react';
import { FiX, FiAlertTriangle, FiPackage } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

const CancelOrderModal = ({ order, isOpen, onClose, onCancelSubmit }) => {
  const [submitting, setSubmitting] = useState(false);
  const [reason, setReason] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!reason.trim()) {
      toast.error('Please provide a cancellation reason');
      return;
    }

    setSubmitting(true);
    try {
      await onCancelSubmit(order._id, { reason: reason.trim() });
      onClose();
    } catch {
      // Error is handled by the parent component
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-bold text-gray-900">Cancel Order</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <FiAlertTriangle className="text-2xl text-red-600" />
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900">Cancel Order #{order._id.slice(-8)}</h4>
                <p className="text-sm text-gray-600">This action cannot be undone</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-4">
              <div className="flex items-center space-x-2 mb-2">
                <FiPackage className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Order Details</span>
              </div>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Total Amount:</strong> ₹{order.totalPrice.toLocaleString()}</p>
                <p><strong>Items:</strong> {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}</p>
                <p><strong>Status:</strong> <span className="capitalize">{order.orderStatus}</span></p>
              </div>
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cancellation Reason <span className="text-red-500">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
              placeholder="Please provide a reason for cancelling this order..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
            />
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start space-x-2">
              <FiAlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Important:</p>
                <ul className="space-y-1 text-xs">
                  <li>• Order cancellation is irreversible</li>
                  <li>• Refund will be processed according to payment method</li>
                  <li>• Product stock will be restored automatically</li>
                </ul>
              </div>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              {submitting ? 'Cancelling...' : 'Cancel Order'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Keep Order
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CancelOrderModal;
