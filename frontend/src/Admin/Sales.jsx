import React, { useState, useEffect, useMemo } from 'react';
import { FaDollarSign, FaShoppingCart, FaEye, FaSearch, FaSpinner } from 'react-icons/fa';
import { ordersAPI, analyticsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const OrderStatus = ({ status }) => {
    const styles = {
        Completed: 'bg-green-100 text-green-800',
        Shipped: 'bg-blue-100 text-blue-800',
        Pending: 'bg-yellow-100 text-yellow-800',
        Cancelled: 'bg-red-100 text-red-800',
    };
    return <span className={`px-3 py-1 text-xs font-semibold rounded-full ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status}</span>;
};

const Sales = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [orders, setOrders] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalRevenue: 0,
        totalOrders: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Fetch orders and analytics data in parallel
            const [ordersResponse, analyticsResponse] = await Promise.all([
                ordersAPI.getAllOrders(),
                analyticsAPI.getDashboardStats()
            ]);

            if (ordersResponse.success) {
                setOrders(ordersResponse.data.orders || []);
            } else {
                throw new Error(ordersResponse.message || 'Failed to fetch orders');
            }

            if (analyticsResponse.success) {
                const analyticsData = analyticsResponse.data.stats;
                setAnalytics({
                    totalRevenue: analyticsData.overview?.totalRevenue || 0,
                    totalOrders: analyticsData.overview?.totalOrders || 0
                });
            } else {
                // Non-critical error for analytics
                console.warn('Failed to fetch analytics:', analyticsResponse.message);
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
            setError(error.message);
            toast.error(`Failed to load sales data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };
    
    const filteredOrders = useMemo(() => 
        orders.filter(order => {
            const customerName = order.user?.name || order.user?.email || 'Unknown Customer';
            const orderId = order._id || order.id;
            return customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                   orderId.toLowerCase().includes(searchTerm.toLowerCase());
        }),
        [orders, searchTerm]
    );

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
                <span className="ml-2 text-lg">Loading sales data...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Sales Data</h2>
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchData}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Sales & Orders</h1>
        <p className="text-slate-500 mt-1">Review orders and track sales performance.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100"><FaDollarSign className="w-6 h-6 text-green-600" /></div>
            <div>
                <p className="text-sm text-slate-500">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-800">{formatCurrency(analytics.totalRevenue)}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100"><FaShoppingCart className="w-6 h-6 text-blue-600" /></div>
            <div>
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="text-2xl font-bold text-slate-800">{analytics.totalOrders}</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100"><FaEye className="w-6 h-6 text-purple-600" /></div>
            <div>
                <p className="text-sm text-slate-500">Average Order Value</p>
                <p className="text-2xl font-bold text-slate-800">
                    {analytics.totalOrders > 0 ? formatCurrency(analytics.totalRevenue / analytics.totalOrders) : '₹0.00'}
                </p>
            </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-4 border-b">
            <div className="relative">
                <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                <input 
                    type="text" 
                    placeholder="Search by Order ID or Customer..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Order ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {filteredOrders.length > 0 ? filteredOrders.map((order) => (
                  <tr key={order._id || order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">#{order._id?.slice(-6) || order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">
                        {order.user?.name || order.user?.email || 'Unknown Customer'}
                    </td>
                    <td className="px-6 py-4 text-slate-700">{formatCurrency(order.totalAmount || order.total || 0)}</td>
                    <td className="px-6 py-4 text-slate-500">{formatDate(order.createdAt || order.date)}</td>
                    <td className="px-6 py-4"><OrderStatus status={order.status} /></td>
                    <td className="px-6 py-4 text-center">
                        <button 
                            className="text-blue-600 hover:text-blue-900" 
                            title="View Details"
                            onClick={() => {
                                // Navigate to order details or show modal
                                toast.info(`Order details for #${order._id?.slice(-6) || order.id} - Feature coming soon!`);
                            }}
                        >
                            <FaEye />
                        </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                        <div className="flex flex-col items-center">
                            <FaShoppingCart className="text-4xl mb-4 text-slate-300" />
                            <p className="text-lg font-semibold">No orders found</p>
                            <p className="text-sm">Try adjusting your search criteria</p>
                        </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;