import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaDollarSign, 
  FaShoppingCart, 
  FaBoxOpen, 
  FaUsers, 
  FaArrowRight, 
  FaTruck, 
  FaChartBar, 
  FaWarehouse,
  FaEye,
  FaHeart,
  FaStar,
  FaArrowUp,
  FaArrowDown,
  FaPercentage,
  FaClock,
  FaShoppingBag,
  FaUserPlus,
  FaChartLine
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { analyticsAPI, ordersAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState({
    stats: null,
    salesData: [],
    recentOrders: [],
    topProducts: [],
    customerMetrics: null,
    loading: true
  });

  const [chartLoading, setChartLoading] = useState(false);

  // Date filtering state
  const [dateFilter, setDateFilter] = useState({
    period: 'month',
    customStartDate: '',
    customEndDate: '',
    year: new Date().getFullYear()
  });

  useEffect(() => {
    fetchDashboardData();
  }, [dateFilter]);

  const fetchDashboardData = async () => {
    try {
      setDashboardData(prev => ({ ...prev, loading: true }));
      setChartLoading(true);

      // Fetch dashboard stats
      const statsResponse = await analyticsAPI.getDashboardStats();
      const stats = statsResponse.data.stats;

      // Fetch sales analytics for chart with date filter
      const salesParams = {
        period: dateFilter.period,
        year: dateFilter.year
      };
      
      if (dateFilter.period === 'custom' && dateFilter.customStartDate && dateFilter.customEndDate) {
        salesParams.startDate = dateFilter.customStartDate;
        salesParams.endDate = dateFilter.customEndDate;
      }
      
      const salesResponse = await analyticsAPI.getSalesAnalytics(salesParams);
      console.log('Sales response:', salesResponse);
      const salesData = salesResponse.data?.analytics?.chartData || salesResponse.data?.chartData || [];
      console.log('Sales data:', salesData);

      // Fetch recent orders
      const ordersResponse = await ordersAPI.getAllOrders({ limit: 10, sort: '-createdAt' });
      const recentOrders = ordersResponse.data.orders || [];



      // Calculate additional metrics
      const customerMetrics = calculateCustomerMetrics(stats);
      const topSellingProducts = stats.topSellingProducts || [];

      setDashboardData({
        stats,
        salesData,
        recentOrders,
        customerMetrics,
        topSellingProducts,
        loading: false
      });
      setChartLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast.error('Failed to load dashboard data');
      setDashboardData(prev => ({ ...prev, loading: false }));
      setChartLoading(false);
    }
  };

  const calculateCustomerMetrics = (stats) => {
    if (!stats) return null;

    const avgOrderValue = stats.overview?.avgOrderValue || 0;
    const customerMetrics = stats.customerMetrics || {};

    return {
      conversionRate: customerMetrics.conversionRate || 0,
      avgOrderValue: avgOrderValue,
      customerLifetimeValue: customerMetrics.avgCustomerSpent || 0,
      repeatCustomerRate: customerMetrics.repeatCustomerRate || 0,
      customerSatisfaction: '4.6/5', // This would need to be calculated from reviews
      avgCustomerOrders: customerMetrics.avgCustomerOrders || 0
    };
  };

  // Helper to get status badge colors
  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'delivered': 
      case 'completed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': 
      case 'processing': 
      case 'confirmed': return 'bg-blue-100 text-blue-800';
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
    }).format(amount || 0);
  };

  // Format percentage change
  const formatChange = (current, previous) => {
    if (!previous || previous === 0) return '+0%';
    const change = ((current - previous) / previous) * 100;
    return `${change >= 0 ? '+' : ''}${change.toFixed(1)}%`;
  };

  // Get trend icon
  const getTrendIcon = (change) => {
    const isPositive = change.startsWith('+') || parseFloat(change) > 0;
    return isPositive ? 
      <FaArrowUp className="w-4 h-4 text-green-500" /> : 
      <FaArrowDown className="w-4 h-4 text-red-500" />;
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

  const { stats, salesData, recentOrders, customerMetrics, topSellingProducts } = dashboardData;

  // Prepare comprehensive stats cards data
  const statsCards = stats ? [
    {
      label: 'Total Revenue',
      value: formatCurrency(stats.overview?.totalRevenue || 0),
      change: formatChange(stats.today?.revenue || 0, stats.yesterday?.revenue || 0),
      icon: FaDollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      description: 'Lifetime revenue'
    },
    {
      label: 'Total Orders',
      value: stats.overview?.totalOrders || 0,
      change: formatChange(stats.today?.orders || 0, stats.yesterday?.orders || 0),
      icon: FaShoppingCart,
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      description: 'Orders placed'
    },
    {
      label: 'Active Products',
      value: stats.overview?.totalProducts || 0,
      change: '+0%',
      icon: FaBoxOpen,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      description: 'In stock products'
    },
    {
      label: 'Total Customers',
      value: stats.overview?.totalUsers || 0,
      change: formatChange(stats.today?.newCustomers || 0, stats.yesterday?.newCustomers || 0),
      icon: FaUsers,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      description: 'Registered users'
    }
  ] : [];

  // Customer metrics cards
  const customerCards = customerMetrics ? [
    {
      label: 'Conversion Rate',
      value: `${customerMetrics.conversionRate}%`,
      icon: FaPercentage,
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      description: 'Orders per customer'
    },
    {
      label: 'Avg Order Value',
      value: formatCurrency(customerMetrics.avgOrderValue),
      icon: FaShoppingBag,
      iconBg: 'bg-teal-100',
      iconColor: 'text-teal-600',
      description: 'Per order average'
    },
    {
      label: 'Repeat Customer Rate',
      value: `${customerMetrics.repeatCustomerRate}%`,
      icon: FaUserPlus,
      iconBg: 'bg-emerald-100',
      iconColor: 'text-emerald-600',
      description: 'Returning customers'
    },
    {
      label: 'Avg Orders/Customer',
      value: customerMetrics.avgCustomerOrders.toFixed(1),
      icon: FaShoppingCart,
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      description: 'Customer loyalty'
    }
  ] : [];

  // Performance metrics cards
  const performanceCards = stats ? [
    {
      label: 'Monthly Growth',
      value: `${((stats.thisMonth?.revenue || 0) / (stats.overview?.totalRevenue || 1) * 100).toFixed(1)}%`,
      icon: FaChartLine,
      iconBg: 'bg-indigo-100',
      iconColor: 'text-indigo-600',
      description: 'This month vs total'
    },
    {
      label: 'Max Order Value',
      value: formatCurrency(stats.overview?.maxOrderValue || 0),
      icon: FaStar,
      iconBg: 'bg-pink-100',
      iconColor: 'text-pink-600',
      description: 'Highest single order'
    },
    {
      label: 'Today\'s Revenue',
      value: formatCurrency(stats.today?.revenue || 0),
      icon: FaDollarSign,
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      description: 'Daily performance'
    },
    {
      label: 'New Customers Today',
      value: stats.today?.newCustomers || 0,
      icon: FaUsers,
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      description: 'Customer acquisition'
    }
  ] : [];

  // Order status distribution for pie chart
  const orderStatusData = stats?.orderStatusDistribution ? 
    Object.entries(stats.orderStatusDistribution).map(([status, count]) => ({
      name: status.charAt(0).toUpperCase() + status.slice(1),
      value: count
    })) : [];

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back! Here's what's happening with your e-commerce business.</p>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsCards.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-full ${stat.iconBg}`}>
                <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
              </div>
              {getTrendIcon(stat.change)}
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className={`text-xs mt-1 font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>
                {stat.change} from yesterday
              </p>
              <p className="text-xs text-slate-400 mt-1">{stat.description}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {customerCards.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${metric.iconBg}`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-slate-800">{metric.value}</p>
                <p className="text-xs text-slate-400">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {performanceCards.map((metric) => (
          <div key={metric.label} className="bg-white p-6 rounded-xl shadow-lg transition-transform transform hover:-translate-y-1">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${metric.iconBg}`}>
                <metric.icon className={`w-6 h-6 ${metric.iconColor}`} />
              </div>
              <div>
                <p className="text-sm text-slate-500">{metric.label}</p>
                <p className="text-xl font-bold text-slate-800">{metric.value}</p>
                <p className="text-xs text-slate-400">{metric.description}</p>
              </div>
            </div>
          </div>
        ))}
      </div>



      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 lg:gap-8">
        {/* Sales Chart */}
        <div className="xl:col-span-2 bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
            <h2 className="text-lg sm:text-xl font-bold text-slate-800">Sales Overview</h2>
            
            {/* Date Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Period Selector */}
              <select
                value={dateFilter.period}
                onChange={(e) => setDateFilter(prev => ({ ...prev, period: e.target.value }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="day">Daily</option>
                <option value="week">Weekly</option>
                <option value="month">Monthly</option>
                <option value="custom">Custom Range</option>
              </select>

              {/* Year Selector */}
              <select
                value={dateFilter.year}
                onChange={(e) => setDateFilter(prev => ({ ...prev, year: parseInt(e.target.value) }))}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>

              {/* Custom Date Range */}
              {dateFilter.period === 'custom' && (
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={dateFilter.customStartDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, customStartDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <span className="text-gray-500">to</span>
                  <input
                    type="date"
                    value={dateFilter.customEndDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, customEndDate: e.target.value }))}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}
            </div>
          </div>
          {chartLoading ? (
            <div className="h-64 sm:h-72 lg:h-80 xl:h-96 flex items-center justify-center">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-2"></div>
                <p className="text-sm text-gray-500">Loading chart data...</p>
              </div>
            </div>
          ) : salesData.length > 0 ? (
            <div className="w-full h-64 sm:h-72 lg:h-80 xl:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={salesData} 
                  margin={{ top: 10, right: 30, left: 10, bottom: 10 }}
                  style={{ fontSize: '12px' }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#94a3b8" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    angle={-45}
                    textAnchor="end"
                    height={60}
                    interval={0}
                  />
                  <YAxis 
                    stroke="#94a3b8" 
                    fontSize={10}
                    tick={{ fontSize: 10 }}
                    tickFormatter={(value) => formatCurrency(value).replace('₹', '')}
                    width={80}
                  />
                  <Tooltip 
                    wrapperClassName="!bg-white !border-slate-300 !rounded-lg !shadow-xl"
                    formatter={(value) => [formatCurrency(value), 'Sales']}
                    labelStyle={{ fontSize: 12 }}
                    contentStyle={{ fontSize: 11 }}
                    cursor={{ stroke: '#3b82f6', strokeWidth: 1 }}
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#3b82f6" 
                    strokeWidth={2} 
                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
                    activeDot={{ r: 5, stroke: '#3b82f6', strokeWidth: 2 }}
                    connectNulls={true}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-72 lg:h-80 xl:h-96 flex flex-col items-center justify-center text-gray-500">
              <FaChartLine className="w-12 h-12 mb-4 text-gray-300" />
              <p className="text-lg font-medium">No sales data available</p>
              <p className="text-sm text-gray-400 mt-2">Sales will appear here once orders are shipped</p>
            </div>
          )}
        </div>

        {/* Order Status Distribution */}
        <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold text-slate-800 mb-4">Order Status</h2>
          {orderStatusData.length > 0 ? (
            <div className="w-full h-64 sm:h-72 lg:h-80 xl:h-96">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={orderStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={60}
                    innerRadius={20}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {orderStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [value, 'Orders']}
                    contentStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 sm:h-72 lg:h-80 xl:h-96 flex items-center justify-center text-gray-500">
              No order data available
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Orders */}
        <div className="bg-white p-6 rounded-xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-800">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
              View all <FaArrowRight className="ml-1"/>
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.length > 0 ? (
              recentOrders.slice(0, 5).map((order) => (
                <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <FaShoppingCart className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-800">#{order._id.slice(-6).toUpperCase()}</p>
                      <p className="text-sm text-slate-500">
                        {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-slate-800">
                      {formatCurrency(order.totalPrice || order.totalAmount)}
                    </p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.orderStatus || order.status)}`}>
                      {(order.orderStatus || order.status || 'pending').charAt(0).toUpperCase() + (order.orderStatus || order.status || 'pending').slice(1)}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 py-8">
                No recent orders
              </div>
            )}
          </div>
        </div>


      </div>

             {/* Top Selling Products */}
       <div className="bg-white p-6 rounded-xl shadow-lg">
         <div className="flex items-center justify-between mb-4">
           <h2 className="text-xl font-bold text-slate-800">Top Selling Products (Last 30 Days)</h2>
           <Link to="/admin/products" className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center">
             View all products <FaArrowRight className="ml-1"/>
           </Link>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
           {topSellingProducts.length > 0 ? (
             topSellingProducts.slice(0, 6).map((product) => (
               <div key={product._id} className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                 <div className="flex items-center space-x-3">
                   <img 
                     src={product.productImage || '/placeholder-image.jpg'} 
                     alt={product.productName}
                     className="w-12 h-12 object-cover rounded-lg"
                   />
                   <div className="flex-1 min-w-0">
                     <p className="font-medium text-slate-800 truncate">{product.productName}</p>
                     <p className="text-sm text-slate-500">Sold: {product.totalSold} units</p>
                     <div className="flex items-center space-x-2 mt-1">
                       <div className="flex items-center">
                         <FaShoppingCart className="w-3 h-3 text-green-400" />
                         <span className="text-xs text-slate-600 ml-1">
                           {formatCurrency(product.revenue)}
                         </span>
                       </div>
                                               <div className="flex items-center">
                          <FaArrowUp className="w-3 h-3 text-blue-400" />
                          <span className="text-xs text-slate-600 ml-1">
                            {product.totalSold} sold
                          </span>
                        </div>
                     </div>
                   </div>
                 </div>
               </div>
             ))
           ) : (
             <div className="col-span-full text-center text-gray-500 py-8">
               No sales data available
             </div>
           )}
         </div>
       </div>
    </div>
  );
};

export default AdminDashboard;