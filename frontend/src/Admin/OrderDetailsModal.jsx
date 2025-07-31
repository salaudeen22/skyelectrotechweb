import React from 'react';
import { FaTimes, FaUser, FaPhone, FaMapMarkerAlt, FaBox, FaTruck, FaCreditCard } from 'react-icons/fa';
import OrderStatus from '../Components/OrderStatus';



const OrderDetailsModal = ({ order, isOpen, onClose }) => {
    if (!isOpen || !order) return null;

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-xl font-semibold text-gray-900">Order Details</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <FaTimes className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Order Header */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <p className="text-sm text-gray-600">Order ID</p>
                                <p className="font-mono font-semibold">#{order._id?.slice(-6)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Order Date</p>
                                <p className="font-semibold">{formatDate(order.createdAt)}</p>
                            </div>
                            <div>
                                <p className="text-sm text-gray-600">Status</p>
                                <OrderStatus status={order.orderStatus} />
                            </div>
                        </div>
                    </div>

                    {/* Customer Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FaUser className="w-4 h-4 mr-2" />
                            Customer Information
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Name</p>
                                    <p className="font-semibold">{order.user?.name || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Email</p>
                                    <p className="font-semibold">{order.user?.email || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Phone</p>
                                    <p className="font-semibold">{order.user?.phone || 'N/A'}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Information */}
                    {order.shippingInfo && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FaMapMarkerAlt className="w-4 h-4 mr-2" />
                                Shipping Information
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-600">Address</p>
                                        <p className="font-semibold">
                                            {order.shippingInfo.address}, {order.shippingInfo.city}, {order.shippingInfo.state} {order.shippingInfo.pincode}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-600">Phone</p>
                                        <p className="font-semibold">{order.shippingInfo.phone || 'N/A'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Order Items */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FaBox className="w-4 h-4 mr-2" />
                            Order Items ({order.orderItems?.length || 0})
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <table className="w-full">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
                                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-200">
                                    {order.orderItems?.map((item, index) => (
                                        <tr key={index}>
                                            <td className="px-4 py-4">
                                                <div className="flex items-center">
                                                    {item.image && (
                                                        <img 
                                                            src={item.image} 
                                                            alt={item.name}
                                                            className="w-12 h-12 object-cover rounded-lg mr-3"
                                                        />
                                                    )}
                                                    <div>
                                                        <p className="font-semibold text-gray-900">{item.name}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-4 text-gray-700">{formatCurrency(item.price)}</td>
                                            <td className="px-4 py-4 text-gray-700">{item.quantity}</td>
                                            <td className="px-4 py-4 text-gray-700 font-semibold">{formatCurrency(item.price * item.quantity)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Payment Information */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FaCreditCard className="w-4 h-4 mr-2" />
                            Payment Information
                        </h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm text-gray-600">Payment Method</p>
                                    <p className="font-semibold">{order.paymentInfo?.method || 'N/A'}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-600">Payment Status</p>
                                    <p className="font-semibold">{order.paymentInfo?.status || 'N/A'}</p>
                                </div>
                                {order.paymentInfo?.transactionId && (
                                    <div>
                                        <p className="text-sm text-gray-600">Transaction ID</p>
                                        <p className="font-mono text-sm">{order.paymentInfo.transactionId}</p>
                                    </div>
                                )}
                                {order.paymentInfo?.paidAt && (
                                    <div>
                                        <p className="text-sm text-gray-600">Paid At</p>
                                        <p className="font-semibold">{formatDate(order.paymentInfo.paidAt)}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h4>
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Items Total:</span>
                                    <span className="font-semibold">{formatCurrency(order.itemsPrice || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Tax:</span>
                                    <span className="font-semibold">{formatCurrency(order.taxPrice || 0)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Shipping:</span>
                                    <span className="font-semibold">{formatCurrency(order.shippingPrice || 0)}</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between">
                                    <span className="text-lg font-semibold">Total:</span>
                                    <span className="text-lg font-bold text-blue-600">{formatCurrency(order.totalPrice || 0)}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tracking Information */}
                    {(order.trackingNumber || order.estimatedDelivery) && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                                <FaTruck className="w-4 h-4 mr-2" />
                                Tracking Information
                            </h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {order.trackingNumber && (
                                        <div>
                                            <p className="text-sm text-gray-600">Tracking Number</p>
                                            <p className="font-mono font-semibold">{order.trackingNumber}</p>
                                        </div>
                                    )}
                                    {order.estimatedDelivery && (
                                        <div>
                                            <p className="text-sm text-gray-600">Estimated Delivery</p>
                                            <p className="font-semibold">{formatDate(order.estimatedDelivery)}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Status History */}
                    {order.statusHistory && order.statusHistory.length > 0 && (
                        <div className="mb-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-4">Status History</h4>
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                                <div className="space-y-3">
                                    {order.statusHistory.map((history, index) => (
                                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                            <div className="flex items-center space-x-3">
                                                <OrderStatus status={history.status} />
                                                <div>
                                                    <p className="text-sm text-gray-600">
                                                        Updated by: {history.updatedBy?.name || 'System'}
                                                    </p>
                                                    {history.note && (
                                                        <p className="text-xs text-gray-500 mt-1">{history.note}</p>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {formatDate(history.updatedAt)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Close Button */}
                    <div className="flex justify-end">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailsModal; 