import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiX, FiEye, FiCalendar, FiCreditCard, FiRotateCcw, FiClock, FiAlertCircle } from 'react-icons/fi';
import { ordersAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import ReturnOrderModal from './ReturnOrderModal';
import CancelOrderModal from './CancelOrderModal';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [returnModalOpen, setReturnModalOpen] = useState(false);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [returnRequests, setReturnRequests] = useState({});
  const [expandedOrders, setExpandedOrders] = useState({});
  // Pickup schedule modal state
  const [pickupModalOpen, setPickupModalOpen] = useState(false);
  const [pickupRequest, setPickupRequest] = useState(null);
  const [pickupForm, setPickupForm] = useState({ date: '', address: '' });

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const response = await ordersAPI.getMyOrders();
        setOrders(response.data.orders || []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load order history');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" />;
      case 'confirmed':
        return <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500" />;
      case 'packed':
        return <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-500" />;
      case 'shipped':
        return <FiTruck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'cancelled':
        return <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
      case 'returned':
        return <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
      default:
        return <FiPackage className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-blue-100 text-blue-800';
      case 'packed':
        return 'bg-indigo-100 text-indigo-800';
      case 'shipped':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'returned':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Check if order can be cancelled (pending or confirmed status)
  const canCancelOrder = (order) => {
    return ['pending', 'confirmed'].includes(order.orderStatus);
  };

  // Check if order can be returned (shipped/delivered within 2 days)
  const canReturnOrder = (order) => {
    if (order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered') return false;
    
    const shippedDate = new Date(order.updatedAt || order.createdAt);
    const currentDate = new Date();
    const daysDifference = (currentDate - shippedDate) / (1000 * 60 * 60 * 24);
    
    return daysDifference <= 2;
  };

  // Check if order is within contact period (2-7 days)
  const showContactInfo = (order) => {
    if (order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered') return false;
    
    const shippedDate = new Date(order.updatedAt || order.createdAt);
    const currentDate = new Date();
    const daysDifference = (currentDate - shippedDate) / (1000 * 60 * 60 * 24);
    
    return daysDifference > 2 && daysDifference <= 7;
  };

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.orderStatus === filter;
  });

  const handleCancelOrder = async (orderId, formData) => {
    try {
      await ordersAPI.cancelOrder(orderId, formData);
      toast.success('Order cancelled successfully');
      // Refresh orders
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.orders || []);
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error(error.response?.data?.message || 'Failed to cancel order');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const handleReturnOrder = async (orderId, formData) => {
    try {
      await ordersAPI.returnOrder(orderId, formData);
      toast.success('Return request submitted successfully');
      // Refresh orders
      const response = await ordersAPI.getMyOrders();
      setOrders(response.data.orders || []);
      // Refresh return requests for this order
      await fetchReturnRequests(orderId);
    } catch (error) {
      console.error('Error returning order:', error);
      toast.error(error.response?.data?.message || 'Failed to submit return request');
      throw error; // Re-throw to let modal handle the error
    }
  };

  const openCancelModal = (order) => {
    setSelectedOrder(order);
    setCancelModalOpen(true);
  };

  const closeCancelModal = () => {
    setCancelModalOpen(false);
    setSelectedOrder(null);
  };

  const openReturnModal = (order) => {
    setSelectedOrder(order);
    setReturnModalOpen(true);
  };

  const closeReturnModal = () => {
    setReturnModalOpen(false);
    setSelectedOrder(null);
  };

  const fetchReturnRequests = async (orderId) => {
    try {
      const response = await ordersAPI.getOrderReturnRequests(orderId);
      setReturnRequests(prev => ({
        ...prev,
        [orderId]: response.data.returnRequests
      }));
    } catch (error) {
      console.error('Error fetching return requests:', error);
    }
  };

  const schedulePickup = async (requestId, date) => {
    try {
      if (!date) {
        toast.error('Please select a pickup date');
        return;
      }
      await ordersAPI.scheduleReturnPickup(requestId, { pickupDate: date });
      toast.success('Pickup scheduled successfully');
      // Refresh current order's requests
      if (selectedOrder?._id) {
        await fetchReturnRequests(selectedOrder._id);
      }
    } catch (error) {
      console.error('Error scheduling pickup:', error);
      toast.error(error.response?.data?.message || 'Failed to schedule pickup');
    }
  };

  const markHandedOver = async (requestId) => {
    try {
      await ordersAPI.markUserReturned(requestId);
      toast.success('Marked as handed over');
      if (selectedOrder?._id) {
        await fetchReturnRequests(selectedOrder._id);
      }
    } catch (error) {
      console.error('Error marking handed over:', error);
      toast.error(error.response?.data?.message || 'Failed to update return status');
    }
  };

  // Pickup Modal UI
  const PickupModal = () => (
    pickupModalOpen && pickupRequest ? (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
        <div className="bg-white rounded-xl w-full max-w-md shadow-xl">
          <div className="px-5 py-4 border-b flex items-center justify-between">
            <h3 className="text-lg font-semibold">Schedule Pickup</h3>
            <button
              onClick={() => setPickupModalOpen(false)}
              className="text-gray-500 hover:text-gray-700 text-xl"
            >
              ×
            </button>
          </div>
          <div className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Date</label>
              <input
                type="date"
                value={pickupForm.date}
                onChange={(e) => setPickupForm({ ...pickupForm, date: e.target.value })}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Address (optional)</label>
              <textarea
                rows={3}
                value={pickupForm.address}
                onChange={(e) => setPickupForm({ ...pickupForm, address: e.target.value })}
                placeholder="Enter a different pickup address if needed"
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="px-5 py-4 border-t flex items-center justify-end gap-2">
            <button
              onClick={() => setPickupModalOpen(false)}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={async () => {
                await schedulePickup(pickupRequest._id, pickupForm.date);
                setPickupModalOpen(false);
              }}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    ) : null
  );

  const toggleOrderExpansion = (orderId) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
    
    // Fetch return requests if not already loaded
    if (!returnRequests[orderId]) {
      fetchReturnRequests(orderId);
    }
  };

  const getReturnStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-8 py-4 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Order History</h1>
          <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Track and manage your orders</p>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg shadow-sm mb-4 sm:mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex overflow-x-auto scrollbar-hide px-3 sm:px-6">
              <div className="flex space-x-4 sm:space-x-8 min-w-full">
                {[
                  { id: 'all', name: 'All Orders' },
                  { id: 'pending', name: 'Pending' },
                  { id: 'confirmed', name: 'Confirmed' },
                  { id: 'packed', name: 'Packed' },
                  { id: 'shipped', name: 'Shipped' },
                  { id: 'cancelled', name: 'Cancelled' },
                  { id: 'returned', name: 'Returned' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`py-3 sm:py-4 px-2 sm:px-1 border-b-2 font-medium text-xs sm:text-sm whitespace-nowrap flex-shrink-0 ${
                      filter === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.name}
                  </button>
                ))}
              </div>
            </nav>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-6 sm:p-8 text-center">
            <FiPackage className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400 mx-auto mb-3 sm:mb-4" />
            <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </h3>
            <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">
              {filter === 'all' 
                ? "When you place your first order, it will appear here." 
                : `You don't have any ${filter} orders at the moment.`
              }
            </p>
            {filter === 'all' && (
              <Link
                to="/products"
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-2 rounded-lg font-medium transition-colors text-sm sm:text-base"
              >
                Start Shopping
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredOrders.map((order) => (
              <div key={order._id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4 sm:p-6">
                  {/* Header Section */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 space-y-2 sm:space-y-0">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(order.orderStatus)}
                        <span
                          className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium ${getStatusColor(order.orderStatus)}`}
                        >
                          {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                        </span>
                      </div>
                      <div className="text-xs sm:text-sm text-gray-600">
                        Order #{order._id.slice(-8)}
                      </div>
                    </div>
                    <Link
                      to={`/user/orders/${order._id}`}
                      className="flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base self-start sm:self-auto"
                    >
                      <FiEye className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                      View Details
                    </Link>
                  </div>

                  {/* Order Info Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="flex items-center space-x-2">
                      <FiCalendar className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <FiCreditCard className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        ₹{order.totalPrice.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                      <FiPackage className="w-3 h-3 sm:w-4 sm:h-4 text-gray-400 flex-shrink-0" />
                      <span className="text-xs sm:text-sm text-gray-600">
                        {order.orderItems.length} item{order.orderItems.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  {/* Tracking Information for Shipped Orders */}
                  {order.orderStatus === 'shipped' && order.trackingNumber && (
                    <div className="border-t border-gray-200 pt-3 sm:pt-4">
                      <div className="flex items-center space-x-2">
                        <FiTruck className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs sm:text-sm text-gray-600">Tracking Number</p>
                          <p className="text-xs sm:text-sm font-mono font-semibold text-blue-600">
                            {order.trackingNumber}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Order Items Preview */}
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-4">
                      <div className="flex items-center space-x-2 sm:space-x-4 overflow-x-auto scrollbar-hide">
                        {order.orderItems.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex-shrink-0">
                            <img
                              src={item.image || '/placeholder-image.jpg'}
                              alt={item.name || 'Product'}
                              className="w-10 h-10 sm:w-12 sm:h-12 object-cover rounded-lg bg-gray-100"
                            />
                          </div>
                        ))}
                        {order.orderItems.length > 3 && (
                          <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                            <span className="text-xs sm:text-sm text-gray-600">
                              +{order.orderItems.length - 3}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs sm:text-sm text-gray-600 truncate">
                          {order.orderItems.map(item => item.name).join(', ')}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Return Requests Section */}
                  <div className="border-t border-gray-200 pt-3 sm:pt-4">
                    <div className="flex items-center justify-between">
                      <button
                        onClick={() => toggleOrderExpansion(order._id)}
                        className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        <FiClock className="w-4 h-4" />
                        <span>Return Requests</span>
                        {returnRequests[order._id] && returnRequests[order._id].length > 0 && (
                          <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {returnRequests[order._id].length}
                          </span>
                        )}
                        {returnRequests[order._id] === undefined && (
                          <span className="text-xs text-gray-500">(Click to load)</span>
                        )}
                      </button>
                      
                      {/* Action Buttons */}
                      <div className="flex items-center space-x-2">
                        {/* Cancel Button - Only show for pending/confirmed orders */}
                        {canCancelOrder(order) && (
                          <button
                            onClick={() => openCancelModal(order)}
                            className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors text-xs sm:text-sm font-medium"
                          >
                            <FiX className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                        
                        {/* Return Button - Only show for shipped/delivered orders within 2 days */}
                        {canReturnOrder(order) && (
                          <button
                            onClick={() => openReturnModal(order)}
                            className="flex items-center space-x-1 px-3 py-1 bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors text-xs sm:text-sm font-medium"
                          >
                            <FiRotateCcw className="w-3 h-3 sm:w-4 sm:h-4" />
                            <span>Request Return</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Contact Info - Show when return period has passed */}
                      {showContactInfo(order) && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3">
                          <div className="flex items-center space-x-2">
                            <FiAlertCircle className="w-4 h-4 text-yellow-600" />
                            <div className="text-xs">
                              <p className="text-yellow-800 font-medium">Return period expired</p>
                              <p className="text-yellow-700">
                                Contact support for assistance: 
                                <a href="mailto:skyelectrotechblr@gmail.com" className="text-blue-600 hover:text-blue-800 ml-1">
                                  skyelectrotechblr@gmail.com
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Expanded Return Requests */}
                    {expandedOrders[order._id] && (
                      <div className="mt-3 space-y-2">
                        {returnRequests[order._id] ? (
                          returnRequests[order._id].length > 0 ? (
                            returnRequests[order._id].map((request) => (
                              <div key={request._id} className="bg-gray-50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                  <div className="flex items-center space-x-2">
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getReturnStatusColor(request.status)}`}>
                                      {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                    </span>
                                    <span className="text-xs text-gray-600">
                                      Request #{request.requestNumber}
                                    </span>
                                  </div>
                                  <span className="text-xs text-gray-500">
                                    {new Date(request.requestedAt).toLocaleDateString()}
                                  </span>
                                </div>
                                <p className="text-xs text-gray-700 mb-1">
                                  <strong>Reason:</strong> {request.reason.replace('_', ' ')}
                                </p>
                                <p className="text-xs text-gray-600 line-clamp-2">
                                  {request.description}
                                </p>
                                {request.adminNotes && (
                                  <p className="text-xs text-gray-600 mt-1">
                                    <strong>Admin Notes:</strong> {request.adminNotes}
                                  </p>
                                )}

                                {/* Allow user to schedule pickup when approved and not yet scheduled */}
                                {request.status === 'approved' && !request.pickupScheduled && (
                                  <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="text-xs text-blue-800">Return approved • Schedule a pickup</div>
                                      <button
                                        onClick={() => {
                                          setPickupRequest(request);
                                          setPickupForm({ date: '', address: (selectedOrder?.shippingInfo?.address || '') });
                                          setPickupModalOpen(true);
                                        }}
                                        className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                      >
                                        Schedule Pickup
                                      </button>
                                    </div>
                                  </div>
                                )}

                                {request.pickupScheduled && request.pickupDate && (
                                  <div className="mt-2 text-xs text-green-700 bg-green-50 border border-green-200 rounded p-2">
                                    Pickup scheduled on {new Date(request.pickupDate).toLocaleDateString()}
                                  </div>
                                )}

                                {/* Allow user to mark handed over after pickup scheduled */}
                                {request.status === 'approved' && request.pickupScheduled && !request.userHandedOver && (
                                  <div className="mt-2">
                                    <button
                                      onClick={() => markHandedOver(request._id)}
                                      className="px-3 py-1 text-xs bg-emerald-600 text-white rounded hover:bg-emerald-700"
                                    >
                                      I have handed over the package
                                    </button>
                                  </div>
                                )}

                                {request.userHandedOver && (
                                  <div className="mt-2 text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded p-2">
                                    You marked the package as handed over
                                  </div>
                                )}
                              </div>
                            ))
                          ) : (
                            <p className="text-xs text-gray-500 text-center py-2">
                              No return requests for this order
                            </p>
                          )
                        ) : (
                          <div className="flex items-center justify-center py-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Return Order Modal */}
      {selectedOrder && (
        <ReturnOrderModal
          order={selectedOrder}
          isOpen={returnModalOpen}
          onClose={closeReturnModal}
          onReturnSubmit={handleReturnOrder}
        />
      )}

      <PickupModal />

      {/* Cancel Order Modal */}
      {selectedOrder && (
        <CancelOrderModal
          order={selectedOrder}
          isOpen={cancelModalOpen}
          onClose={closeCancelModal}
          onCancelSubmit={handleCancelOrder}
        />
      )}
    </div>
  );
};

export default OrderHistory;
