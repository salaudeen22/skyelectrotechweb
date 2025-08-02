import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiX, FiCalendar, FiCreditCard, FiMapPin, FiPhone, FiMail, FiTruck as FiTruckIcon } from 'react-icons/fi';
import { ordersAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getOrder(id);
        setOrder(response.data.order);
      } catch (error) {
        console.error('Error fetching order:', error);
        toast.error('Order not found');
        navigate('/user/orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [id, navigate]);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiPackage className="w-6 h-6 text-yellow-500" />;
      case 'confirmed':
        return <FiPackage className="w-6 h-6 text-blue-500" />;
      case 'shipped':
        return <FiTruck className="w-6 h-6 text-orange-500" />;
      case 'delivered':
        return <FiCheck className="w-6 h-6 text-green-500" />;
      case 'cancelled':
        return <FiX className="w-6 h-6 text-red-500" />;
      default:
        return <FiPackage className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'shipped':
        return 'bg-orange-100 text-orange-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getOrderTimeline = () => {
    const timeline = [
      { status: 'pending', label: 'Order Placed', completed: true },
      { status: 'confirmed', label: 'Order Confirmed', completed: ['confirmed', 'packed', 'shipped'].includes(order?.orderStatus) },
      { status: 'packed', label: 'Packed', completed: ['packed', 'shipped'].includes(order?.orderStatus) },
      { status: 'shipped', label: 'Shipped', completed: order?.orderStatus === 'shipped' }
    ];

    if (order?.orderStatus === 'cancelled') {
      return [
        { status: 'pending', label: 'Order Placed', completed: true },
        { status: 'cancelled', label: 'Order Cancelled', completed: true, isLast: true }
      ];
    }

    if (order?.orderStatus === 'returned') {
      return [
        { status: 'pending', label: 'Order Placed', completed: true },
        { status: 'confirmed', label: 'Order Confirmed', completed: true },
        { status: 'packed', label: 'Packed', completed: true },
        { status: 'shipped', label: 'Shipped', completed: true },
        { status: 'returned', label: 'Returned', completed: true, isLast: true }
      ];
    }

    return timeline;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Order not found</h2>
          <button
            onClick={() => navigate('/user/orders')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/user/orders')}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
            >
              <FiArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Order #{order._id.slice(-8)}
              </h1>
              <p className="text-gray-600 mt-1">
                Placed on {new Date(order.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            {getStatusIcon(order.orderStatus)}
            <span
              className={`px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.orderStatus)}`}
            >
              {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Order Timeline */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Timeline</h2>
              <div className="space-y-4">
                {getOrderTimeline().map((step, index) => (
                  <div key={step.status} className="flex items-center">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                      step.completed 
                        ? step.status === 'cancelled' 
                          ? 'bg-red-100' 
                          : 'bg-green-100'
                        : 'bg-gray-100'
                    }`}>
                      {step.completed ? (
                        step.status === 'cancelled' ? (
                          <FiX className="w-4 h-4 text-red-600" />
                        ) : (
                          <FiCheck className="w-4 h-4 text-green-600" />
                        )
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div className="ml-4 flex-1">
                      <p className={`font-medium ${step.completed ? 'text-gray-900' : 'text-gray-500'}`}>
                        {step.label}
                      </p>
                      {step.completed && step.status === order.orderStatus && (
                        <p className="text-sm text-gray-600">
                          {(() => {
                            // Find the status history entry for this status
                            const statusEntry = order.statusHistory?.find(h => h.status === step.status);
                            if (statusEntry && statusEntry.updatedAt) {
                              return new Date(statusEntry.updatedAt).toLocaleString();
                            }
                            // Fallback to order creation date
                            return new Date(order.createdAt).toLocaleString();
                          })()}
                        </p>
                      )}
                      {step.completed && step.status === 'shipped' && order.trackingNumber && (
                        <div className="mt-1">
                          <p className="text-sm text-blue-600 font-mono">
                            Tracking: {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>
                    {!step.isLast && index < getOrderTimeline().length - 1 && (
                      <div className={`absolute left-4 top-8 w-0.5 h-8 ${
                        step.completed ? 'bg-green-200' : 'bg-gray-200'
                      }`} style={{ marginLeft: '15px' }}></div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-4">
                {order.orderItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 py-4 border-b border-gray-100 last:border-b-0">
                    <img
                      src={item.image || '/placeholder-image.jpg'}
                      alt={item.name || 'Product'}
                      className="w-16 h-16 object-cover rounded-lg bg-gray-100"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-gray-900 truncate">
                        {item.name || 'Product Name'}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Quantity: {item.quantity}
                      </p>
                      <p className="text-sm text-gray-600">
                        ₹{item.price.toLocaleString()} each
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        ₹{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Order Summary & Shipping Info */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-900">
                    ₹{order.itemsPrice.toLocaleString()}
                  </span>
                </div>
                {order.shippingPrice > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="text-gray-900">₹{order.shippingPrice.toLocaleString()}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-3">
                  <div className="flex justify-between font-semibold">
                    <span className="text-gray-900">Total</span>
                    <span className="text-gray-900">₹{order.totalPrice.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Shipping Information</h2>
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <FiMapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-gray-900">{order.shippingInfo?.name}</p>
                    <p className="text-gray-600 text-sm">
                      {order.shippingInfo?.address}<br />
                      {order.shippingInfo?.city}, {order.shippingInfo?.state} {order.shippingInfo?.zipCode}<br />
                      {order.shippingInfo?.country}
                    </p>
                  </div>
                </div>
                {order.shippingInfo?.phone && (
                  <div className="flex items-center space-x-3">
                    <FiPhone className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 text-sm">{order.shippingInfo.phone}</span>
                  </div>
                )}
                {order.user?.email && (
                  <div className="flex items-center space-x-3">
                    <FiMail className="w-5 h-5 text-gray-400" />
                    <span className="text-gray-600 text-sm">{order.user.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Tracking Information */}
            {(order.trackingNumber || order.estimatedDelivery) && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <FiTruckIcon className="w-5 h-5 mr-2 text-blue-500" />
                  Tracking Information
                </h2>
                <div className="space-y-3">
                  {order.trackingNumber && (
                    <div className="flex items-center space-x-3">
                      <FiTruck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Tracking Number</p>
                        <p className="font-mono font-semibold text-gray-900">{order.trackingNumber}</p>
                      </div>
                    </div>
                  )}
                  {order.estimatedDelivery && (
                    <div className="flex items-center space-x-3">
                      <FiCalendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600">Estimated Delivery</p>
                        <p className="font-semibold text-gray-900">
                          {(() => {
                            try {
                              const date = new Date(order.estimatedDelivery);
                              if (isNaN(date.getTime())) {
                                return 'Date not available';
                              }
                              return date.toLocaleDateString('en-IN', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                              });
                            } catch {
                              return 'Date not available';
                            }
                          })()}
                        </p>
                      </div>
                    </div>
                  )}
                  {order.orderStatus === 'shipped' && (
                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        Your order is on its way! You can track your package using the tracking number above.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Payment Information */}
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h2>
              <div className="flex items-center space-x-3">
                <FiCreditCard className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900 capitalize">
                    {order.paymentInfo?.method || 'Cash on Delivery'}
                  </p>
                  <p className="text-sm text-gray-600">
                    {order.paymentInfo?.status === 'completed' ? 'Payment Completed' : 'Payment Pending'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetails;
