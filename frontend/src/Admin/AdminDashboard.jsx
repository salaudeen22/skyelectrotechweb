import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaShoppingCart, FaBoxOpen, FaUsers, FaArrowRight } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { analyticsAPI, ordersAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    salesData: [],
    recentOrders: [],
    loading: true
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));

      // Fetch dashboard stats
      const statsResponse = await analyticsAPI.getDashboardStats();
      const stats = statsResponse.data;

      // Fetch sales analytics for chart
      const salesResponse = await analyticsAPI.getSalesAnalytics({ period: 'month' });
      const salesData = salesResponse.data.chartData || [];

      // Fetch recent orders
      const ordersResponse = await ordersAPI.getAllOrders({ limit: 5, sort: '-createdAt' });
      const recentOrders = ordersResponse.data.orders || [];

      setDashboardData({
        stats,
        salesData,
        recentOrders,
        loading: false
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
    }
  };

  // Helper to get status badge colors
  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered': 
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': 
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Format percentage change
  const formatChange = (current, previous) => {
    if (!previous || previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  if (dashboardData.loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-6 bg-gray-300 rounded w-1/2 mb-1"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/3"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const { stats, salesData, recentOrders } = dashboardData;

  // Prepare stats cards data
  const statsCards = stats ? [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.totalRevenue || 0),
      change: formatChange(stats.todayRevenue, stats.yesterdayRevenue),
      icon: FaDollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600'
    },
    {
      label: 'New Orders',
      value: stats.totalOrders || 0,
      change: formatChange(stats.todayOrders, stats.yesterdayOrders),
      icon: FaShoppingCart,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600'
    },
    {
      label: 'Total Products',
      value: stats.totalProducts || 0,
      change: '+0%', // Products don't change daily typically
      icon: FaBoxOpen,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600'
    },
    {
      label: 'Total Users',
      value: stats.totalUsers || 0,
      change: formatChange(stats.todayUsers, stats.yesterdayUsers),
      icon: FaUsers,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600'
    }
  ] : [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
            <div className={`p-3 rounded-full ${stat.iconBg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className={`text-xs mt-1 font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Sales Overview</h2>
          {salesData.length > 0 ? (
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip 
                    wrapperClassName="!bg-white !border-slate-300 !rounded-lg !shadow-xl"
                    formatter={(value) => [formatCurrency(value), 'Sales']}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-300 flex items-center justify-center text-gray-500">
              No sales data available
            </div>
          )}
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Orders</h2>
          <div className="flex-grow overflow-y-auto">
            {recentOrders.length > 0 ? (
              <table className="w-full text-sm text-left text-slate-500">
                <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                  <tr>
                    <th scope="col" className="px-4 py-3">Order ID</th>
                    <th scope="col" className="px-4 py-3">Total</th>
                    <th scope="col" className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order._id} className="bg-white border-b hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-900">
                        #{order._id.slice(-6).toUpperCase()}
                      </td>
                      <td className="px-4 py-3">
                        {formatCurrency(order.totalPrice || order.totalAmount)}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus || order.status)}`}>
                          {(order.orderStatus || order.status || 'pending').charAt(0).toUpperCase() + (order.orderStatus || order.status || 'pending').slice(1)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent orders
              </div>
            )}
          </div>
          <Link to="/admin/sales" className="mt-4 text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
            View all orders <FaArrowRight className="ml-2"/>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;