import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage, FiTruck, FiCheck, FiX, FiEye, FiCalendar, FiCreditCard } from 'react-icons/fi';
import { ordersAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';

const OrderHistory = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

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
      case 'shipped':
        return <FiTruck className="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />;
      case 'delivered':
        return <FiCheck className="w-4 h-4 sm:w-5 sm:h-5 text-green-500" />;
      case 'cancelled':
        return <FiX className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />;
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

  const filteredOrders = orders.filter(order => {
    if (filter === 'all') return true;
    return order.orderStatus === filter;
  });

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
                  { id: 'shipped', name: 'Shipped' },
                  { id: 'delivered', name: 'Delivered' },
                  { id: 'cancelled', name: 'Cancelled' }
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
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderHistory;
