import React, { useState, useEffect } from 'react';
import { 
    FaSpinner, 
    FaEdit, 
    FaTimes,
    FaCheck,
    FaTruck,
    FaBox,
    FaShippingFast,
    FaCheckCircle,
    FaUndo,
    FaBan,
    FaClock
} from 'react-icons/fa';
import { ordersAPI } from '../services/apiServices';
import toast from 'react-hot-toast';
import OrderStatus from '../Components/OrderStatus';



const OrderStatusManagement = ({ order, isOpen, onClose, onStatusUpdate }) => {
    const [status, setStatus] = useState(order?.orderStatus || '');
    const [note, setNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (order) {
            setStatus(order.orderStatus || '');
            setTrackingNumber(order.trackingNumber || '');
            setNote('');
            setEstimatedDelivery('');
        }
    }, [order]);

    const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['processing', 'cancelled'],
        processing: ['packed', 'cancelled'],
        packed: ['shipped', 'cancelled'],
        shipped: ['delivered', 'returned'],
        delivered: ['returned'],
        cancelled: [],
        returned: []
    };

    const currentValidStatuses = validTransitions[order?.orderStatus] || [];

    const getStatusIcon = (status) => {
        const icons = {
            pending: FaClock,
            confirmed: FaCheck,
            processing: FaBox,
            packed: FaBox,
            shipped: FaTruck,
            delivered: FaCheckCircle,
            cancelled: FaBan,
            returned: FaUndo
        };
        return icons[status] || FaClock;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!status || status === order?.orderStatus) {
            toast.error('Please select a different status');
            return;
        }

        setLoading(true);
        try {
            const statusData = {
                status,
                note: note.trim() || undefined,
                trackingNumber: trackingNumber.trim() || undefined,
                estimatedDelivery: estimatedDelivery || undefined
            };

            await ordersAPI.updateOrderStatus(order._id, statusData);
            toast.success('Order status updated successfully');
            onStatusUpdate();
            onClose();
        } catch (error) {
            console.error('Error updating order status:', error);
            toast.error(error.response?.data?.message || 'Failed to update order status');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !order) return null;

    const StatusIcon = getStatusIcon(order.orderStatus);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Update Order Status</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-600 mb-2">Order ID: #{order._id?.slice(-6)}</p>
                        <p className="text-sm text-gray-600 mb-2">Customer: {order.user?.name || order.user?.email}</p>
                        <div className="flex items-center space-x-2">
                            <StatusIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-sm text-gray-600">Current Status:</span>
                            <OrderStatus status={order.orderStatus} />
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                New Status *
                            </label>
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            >
                                <option value="">Select Status</option>
                                {currentValidStatuses.map((validStatus) => {
                                    const Icon = getStatusIcon(validStatus);
                                    return (
                                        <option key={validStatus} value={validStatus}>
                                            {validStatus.charAt(0).toUpperCase() + validStatus.slice(1)}
                                        </option>
                                    );
                                })}
                            </select>
                            {currentValidStatuses.length === 0 && (
                                <p className="text-xs text-red-500 mt-1">No valid status transitions available</p>
                            )}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tracking Number
                            </label>
                            <input
                                type="text"
                                value={trackingNumber}
                                onChange={(e) => setTrackingNumber(e.target.value)}
                                placeholder="Enter tracking number"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Estimated Delivery
                            </label>
                            <input
                                type="date"
                                value={estimatedDelivery}
                                onChange={(e) => setEstimatedDelivery(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Note (Optional)
                            </label>
                            <textarea
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                placeholder="Add a note about this status change"
                                rows="3"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>

                        <div className="flex space-x-3 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading || !status || status === order.orderStatus}
                                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {loading ? <FaSpinner className="animate-spin mx-auto" /> : 'Update Status'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default OrderStatusManagement; 