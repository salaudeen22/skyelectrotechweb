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
    const [note, setNote] = useState('');
    const [trackingNumber, setTrackingNumber] = useState(order?.trackingNumber || '');
    const [estimatedDelivery, setEstimatedDelivery] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (order) {
            setTrackingNumber(order.trackingNumber || '');
            setNote('');
            setEstimatedDelivery('');
        }
    }, [order]);

    // Standardized status transitions - only show next logical step
    const getNextStatus = (currentStatus) => {
        const transitions = {
            pending: 'confirmed',
            confirmed: 'packed',
            packed: 'shipped',
            shipped: null, // No next status (can only return)
            cancelled: null,
            returned: null
        };
        return transitions[currentStatus];
    };

    const nextStatus = getNextStatus(order?.orderStatus);

    const getStatusIcon = (status) => {
        const icons = {
            pending: FaClock,
            confirmed: FaCheck,
            packed: FaBox,
            shipped: FaTruck,
            cancelled: FaBan,
            returned: FaUndo
        };
        return icons[status] || FaClock;
    };

    const getStatusDescription = (status) => {
        const descriptions = {
            pending: 'Order is waiting for confirmation',
            confirmed: 'Order has been confirmed and is ready for packing',
            packed: 'Order has been packed and is ready for shipping',
            shipped: 'Order has been shipped with tracking information',
            cancelled: 'Order has been cancelled',
            returned: 'Order has been returned'
        };
        return descriptions[status] || '';
    };

    const getNextStatusDescription = (nextStatus) => {
        const descriptions = {
            confirmed: 'Confirm the order and mark it as ready for packing',
            packed: 'Mark order as packed and ready for shipping',
            shipped: 'Mark order as shipped and add tracking information'
        };
        return descriptions[nextStatus] || '';
    };

    // Check if tracking number should be shown (only for shipped status)
    const shouldShowTrackingNumber = nextStatus === 'shipped';

    // Check if notes should be shown (for shipped and delivered statuses)
    const shouldShowNotes = nextStatus === 'shipped' || nextStatus === 'delivered';

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!nextStatus) {
            toast.error('No valid status transition available');
            return;
        }

        // Validate tracking number for shipped status
        if (nextStatus === 'shipped' && !trackingNumber.trim()) {
            toast.error('Tracking number is required when marking order as shipped');
            return;
        }

        setLoading(true);
        try {
            const statusData = {
                status: nextStatus,
                note: shouldShowNotes ? note.trim() || undefined : undefined,
                trackingNumber: shouldShowTrackingNumber ? trackingNumber.trim() : undefined,
                estimatedDelivery: estimatedDelivery || undefined
            };

            await ordersAPI.updateOrderStatus(order._id, statusData);
            toast.success(`Order status updated to ${nextStatus} successfully`);
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
    const NextStatusIcon = getStatusIcon(nextStatus);

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
                        <p className="text-xs text-gray-500 mt-2">{getStatusDescription(order.orderStatus)}</p>
                    </div>

                    {!nextStatus ? (
                        <div className="text-center py-6">
                            <p className="text-gray-500">This order cannot be updated further.</p>
                            <p className="text-sm text-gray-400 mt-1">Status: {order.orderStatus}</p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-center space-x-2 mb-2">
                                    <NextStatusIcon className="w-5 h-5 text-blue-600" />
                                    <span className="font-medium text-blue-900">
                                        Update to: {nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700">{getNextStatusDescription(nextStatus)}</p>
                            </div>

                            {/* Tracking Number - Only show when next status is "shipped" */}
                            {shouldShowTrackingNumber && (
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Tracking Number *
                                    </label>
                                    <input
                                        type="text"
                                        value={trackingNumber}
                                        onChange={(e) => setTrackingNumber(e.target.value)}
                                        placeholder="Enter tracking number"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Required when marking order as shipped</p>
                                </div>
                            )}

                            {/* Estimated Delivery - Only show for shipped status */}
                            {shouldShowTrackingNumber && (
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
                            )}

                            {/* Notes - Only show for shipped and delivered statuses */}
                            {shouldShowNotes && (
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
                            )}

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
                                    disabled={loading || (nextStatus === 'shipped' && !trackingNumber.trim())}
                                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {loading ? <FaSpinner className="animate-spin mx-auto" /> : `Update to ${nextStatus.charAt(0).toUpperCase() + nextStatus.slice(1)}`}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OrderStatusManagement; 