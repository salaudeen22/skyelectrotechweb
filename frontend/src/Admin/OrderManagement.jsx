import React, { useState, useEffect, useMemo } from 'react';
import { 
    FaSearch, 
    FaSpinner, 
    FaEye, 
    FaEdit, 
    FaFilter, 
    FaTimes,
    FaCheck,
    FaTruck,
    FaBox,
    FaShippingFast,
    FaCheckCircle,
    FaUndo,
    FaBan,
    FaClock,
    FaChartBar,
    FaDollarSign,
    FaShoppingCart,
    FaUsers,
    FaCalendarAlt,
    FaDownload,
    FaFileAlt,
    FaChartLine,
    FaChartPie,
    FaArrowUp,
    FaArrowDown
} from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { ordersAPI, analyticsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';
import OrderStatusManagement from './OrderStatusManagement';
import OrderDetailsModal from './OrderDetailsModal';
import OrderStatus from '../Components/OrderStatus';

const OrdersAndSales = () => {
    const [activeTab, setActiveTab] = useState('orders');
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [showFilters, setShowFilters] = useState(false);


    
    // Date filtering state
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [dateFilterType, setDateFilterType] = useState('custom'); // 'custom', 'today', 'week', 'month'
    
    // Sales Analytics State
    const [salesData, setSalesData] = useState({
        overview: {},
        chartData: [],
        topProducts: [],
        customerMetrics: {}
    });
    const [dateRange, setDateRange] = useState('day');
    const [analyticsLoading, setAnalyticsLoading] = useState(false);
    const [exporting, setExporting] = useState(false);

    // Business Insights State
    const [customerAnalytics, setCustomerAnalytics] = useState({
        newCustomers: 0,
        repeatCustomers: 0,
        customerLifetimeValue: 0
    });
    const [performanceMetrics, setPerformanceMetrics] = useState({
        orderFulfillmentRate: 0,
        averageDeliveryTime: 0,
        returnRate: 0
    });
    const [insightsLoading, setInsightsLoading] = useState(false);

    useEffect(() => {
        fetchOrders();
        if (activeTab === 'sales' || activeTab === 'reports') {
            fetchSalesData();
        }
        if (activeTab === 'reports') {
            fetchBusinessInsights();
        }
    }, [activeTab, dateRange]);

    // Auto-fetch orders when filters change (debounced)
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            if (activeTab === 'orders') {
                fetchOrders();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [searchTerm, statusFilter, dateFrom, dateTo]);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Build query parameters for date filtering
            const queryParams = {};
            if (dateFrom) queryParams.dateFrom = dateFrom;
            if (dateTo) queryParams.dateTo = dateTo;
            if (statusFilter) queryParams.status = statusFilter;
            if (searchTerm) queryParams.search = searchTerm;
            
            const response = await ordersAPI.getAllOrders(queryParams);
            console.log('Orders API response:', response);
            
            if (response.success) {
                const orders = response.data.orders || response.orders || [];
                console.log('Processed orders:', orders);
                setOrders(orders);
            } else {
                throw new Error(response.message || 'Failed to fetch orders');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError(error.message);
            toast.error(`Failed to load orders: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchSalesData = async () => {
        try {
            setAnalyticsLoading(true);
            
            console.log('Fetching sales analytics with dateRange:', dateRange);
            
            const [statsResponse, salesResponse] = await Promise.all([
                analyticsAPI.getDashboardStats(),
                analyticsAPI.getSalesAnalytics({ period: dateRange })
            ]);

            console.log('Analytics responses:', { statsResponse, salesResponse });
            console.log('Sales data structure:', salesResponse.data?.analytics);

            if (statsResponse.success) {
                const stats = statsResponse.data.stats;
                setSalesData({
                    overview: stats.overview || {},
                    chartData: salesResponse.data?.analytics?.chartData || [],
                    topProducts: stats.topSellingProducts || [],
                    customerMetrics: stats.customerMetrics || {},
                    orderStatusDistribution: salesResponse.data?.analytics?.orderStatusDistribution || []
                });
            } else {
                console.error('Failed to fetch dashboard stats:', statsResponse);
                // Set fallback data
                setSalesData({
                    overview: {
                        totalRevenue: 0,
                        totalOrders: 0,
                        avgOrderValue: 0
                    },
                    chartData: [],
                    topProducts: [],
                    customerMetrics: {
                        conversionRate: 0,
                        repeatCustomerRate: 0
                    },
                    orderStatusDistribution: [
                        { name: 'Delivered', value: 0, color: '#10B981' },
                        { name: 'Shipped', value: 0, color: '#3B82F6' },
                        { name: 'Processing', value: 0, color: '#8B5CF6' },
                        { name: 'Pending', value: 0, color: '#F59E0B' }
                    ]
                });
            }
        } catch (error) {
            console.error('Error fetching sales data:', error);
            toast.error('Failed to load sales analytics. Using fallback data.');
            
            // Set fallback data with sample values
            setSalesData({
                overview: {
                    totalRevenue: 150000,
                    totalOrders: 45,
                    avgOrderValue: 3333
                },
                chartData: [
                    { name: 'Jan', sales: 25000, orders: 8, avgOrderValue: 3125 },
                    { name: 'Feb', sales: 30000, orders: 10, avgOrderValue: 3000 },
                    { name: 'Mar', sales: 35000, orders: 12, avgOrderValue: 2917 },
                    { name: 'Apr', sales: 40000, orders: 15, avgOrderValue: 2667 }
                ],
                topProducts: [
                    { productName: 'Sample Product 1', totalSold: 25, revenue: 12500 },
                    { productName: 'Sample Product 2', totalSold: 20, revenue: 10000 },
                    { productName: 'Sample Product 3', totalSold: 15, revenue: 7500 }
                ],
                customerMetrics: {
                    conversionRate: 2.5,
                    repeatCustomerRate: 15.2
                },
                orderStatusDistribution: [
                    { name: 'Delivered', value: 20, color: '#10B981' },
                    { name: 'Shipped', value: 15, color: '#3B82F6' },
                    { name: 'Processing', value: 8, color: '#8B5CF6' },
                    { name: 'Pending', value: 2, color: '#F59E0B' }
                ]
            });
        } finally {
            setAnalyticsLoading(false);
        }
    };

    const fetchBusinessInsights = async () => {
        try {
            setInsightsLoading(true);
            
            console.log('Fetching business insights with dateRange:', dateRange);
            
            const [customerResponse, performanceResponse] = await Promise.all([
                analyticsAPI.getCustomerAnalytics({ period: dateRange }),
                analyticsAPI.getPerformanceMetrics({ period: dateRange })
            ]);

            console.log('Business insights responses:', { customerResponse, performanceResponse });

            if (customerResponse.success) {
                setCustomerAnalytics(customerResponse.data || {
                    newCustomers: 0,
                    repeatCustomers: 0,
                    customerLifetimeValue: 0
                });
            } else {
                console.error('Failed to fetch customer analytics:', customerResponse);
                // Set fallback data
                setCustomerAnalytics({
                    newCustomers: 12,
                    repeatCustomers: 68,
                    customerLifetimeValue: 2500
                });
            }

            if (performanceResponse.success) {
                setPerformanceMetrics(performanceResponse.data || {
                    orderFulfillmentRate: 0,
                    averageDeliveryTime: 0,
                    returnRate: 0
                });
            } else {
                console.error('Failed to fetch performance metrics:', performanceResponse);
                // Set fallback data
                setPerformanceMetrics({
                    orderFulfillmentRate: 98.5,
                    averageDeliveryTime: 2.3,
                    returnRate: 2.1
                });
            }
        } catch (error) {
            console.error('Error fetching business insights:', error);
            toast.error('Failed to load business insights. Using fallback data.');
            
            // Set fallback data
            setCustomerAnalytics({
                newCustomers: 12,
                repeatCustomers: 68,
                customerLifetimeValue: 2500
            });
            
            setPerformanceMetrics({
                orderFulfillmentRate: 98.5,
                averageDeliveryTime: 2.3,
                returnRate: 2.1
            });
        } finally {
            setInsightsLoading(false);
        }
    };

    // Export today's sales invoice
    const exportTodaySalesInvoice = async () => {
        try {
            setExporting(true);
            console.log('Exporting today\'s sales invoice...');
            
            // Show loading message
            toast.loading('Generating PDF invoice... This may take a few seconds.', {
                duration: 0 // Don't auto-dismiss
            });
            
            const response = await ordersAPI.exportTodaySalesInvoice();
            
            console.log('Export response received:', response);
            
            // Check content type to determine if it's PDF or HTML
            const contentType = response.headers?.['content-type'] || '';
            const isPDF = contentType.includes('application/pdf');
            
            console.log('Content type:', contentType, 'Is PDF:', isPDF);
            
            // Create blob with appropriate type
            const blob = new Blob([response.data], { 
                type: isPDF ? 'application/pdf' : 'text/html' 
            });
            
            console.log('Blob created, size:', blob.size);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Today_Sales_Invoice_${new Date().toISOString().split('T')[0]}.${isPDF ? 'pdf' : 'html'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            const fileType = isPDF ? 'PDF' : 'HTML';
            toast.dismiss(); // Dismiss loading toast
            toast.success(`Today's sales invoice exported successfully as ${fileType}!`);
        } catch (error) {
            console.error('Error exporting invoice:', error);
            
            // Dismiss loading toast
            toast.dismiss();
            
            // Provide more specific error messages
            let errorMessage = 'Failed to export sales invoice';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. PDF generation is taking longer than expected. Please try again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'No orders found for today to export';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. Admin privileges required.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error occurred while generating invoice';
            } else if (error.message?.includes('PDF generation')) {
                errorMessage = 'PDF generation failed. Please try again or contact support.';
            }
            
            toast.error(errorMessage);
        } finally {
            setExporting(false);
        }
    };

    // Export individual order invoice
    const exportOrderInvoice = async (orderId) => {
        try {
            console.log('Exporting order invoice for order:', orderId);
            
            // Show loading message
            toast.loading('Generating order invoice... This may take a few seconds.', {
                duration: 0 // Don't auto-dismiss
            });
            
            const response = await ordersAPI.exportOrderInvoice(orderId);
            
            console.log('Order invoice export response received:', response);
            
            // Check content type to determine if it's PDF or HTML
            const contentType = response.headers?.['content-type'] || '';
            const isPDF = contentType.includes('application/pdf');
            
            console.log('Content type:', contentType, 'Is PDF:', isPDF);
            
            // Create blob with appropriate type
            const blob = new Blob([response.data], { 
                type: isPDF ? 'application/pdf' : 'text/html' 
            });
            
            console.log('Blob created, size:', blob.size);
            
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `Order_Invoice_${orderId.slice(-8)}.${isPDF ? 'pdf' : 'html'}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
            
            const fileType = isPDF ? 'PDF' : 'HTML';
            toast.dismiss(); // Dismiss loading toast
            toast.success(`Order invoice exported successfully as ${fileType}!`);
        } catch (error) {
            console.error('Error exporting order invoice:', error);
            
            // Dismiss loading toast
            toast.dismiss();
            
            // Provide more specific error messages
            let errorMessage = 'Failed to export order invoice';
            if (error.code === 'ECONNABORTED') {
                errorMessage = 'Request timed out. PDF generation is taking longer than expected. Please try again.';
            } else if (error.response?.status === 404) {
                errorMessage = 'Order not found';
            } else if (error.response?.status === 403) {
                errorMessage = 'Access denied. Admin privileges required.';
            } else if (error.response?.status >= 500) {
                errorMessage = 'Server error occurred while generating invoice';
            } else if (error.message?.includes('PDF generation')) {
                errorMessage = 'PDF generation failed. Please try again or contact support.';
            }
            
            toast.error(errorMessage);
        }
    };

    const filteredOrders = useMemo(() => 
        orders.filter(order => {
            const matchesSearch = 
                (order.user?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order.user?.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                (order._id || '').toLowerCase().includes(searchTerm.toLowerCase());
            
            const matchesStatus = !statusFilter || order.orderStatus === statusFilter;
            
            return matchesSearch && matchesStatus;
        }),
        [orders, searchTerm, statusFilter]
    );

    const handleStatusUpdate = () => {
        fetchOrders();
        setSelectedOrder(null);
    };

    const openStatusModal = (order) => {
        setSelectedOrder(order);
        setShowStatusModal(true);
    };

    const openDetailsModal = async (order) => {
        try {
            setDetailsLoading(true);
            // Fetch full order details with populated product information
            const response = await ordersAPI.getOrder(order._id);
            if (response.success) {
                setSelectedOrder(response.data.order);
                setShowDetailsModal(true);
            } else {
                throw new Error('Failed to load order details');
            }
        } catch (error) {
            console.error('Error fetching order details:', error);
            toast.error('Failed to load order details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const formatDate = (dateString) => {
        if (!dateString) return { date: 'N/A', time: 'N/A' };
        
        const date = new Date(dateString);
        if (isNaN(date.getTime())) return { date: 'Invalid Date', time: 'Invalid Time' };
        
        return {
            date: date.toLocaleDateString('en-IN', { 
                day: '2-digit', 
                month: 'short', 
                year: 'numeric' 
            }),
            time: date.toLocaleTimeString('en-IN', { 
                hour: '2-digit', 
                minute: '2-digit',
                hour12: true
            })
        };
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

    const getStatusIcon = (status) => {
        const icons = {
            pending: FaClock,
            confirmed: FaCheck,
            packed: FaBox,
            shipped: FaTruck,
            cancelled: FaBan,
            returned: FaUndo
        };
        return icons[status?.toLowerCase()] || FaClock;
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'text-yellow-600',
            confirmed: 'text-blue-600',
            packed: 'text-indigo-600',
            shipped: 'text-green-600',
            cancelled: 'text-red-600',
            returned: 'text-orange-600'
        };
        return colors[status?.toLowerCase()] || 'text-gray-600';
    };

    // Apply date filter presets
    const applyDateFilter = (filterType) => {
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);
        
        switch (filterType) {
            case 'today': {
                setDateFrom(startOfDay.toISOString().split('T')[0]);
                setDateTo(endOfDay.toISOString().split('T')[0]);
                break;
            }
            case 'week': {
                const startOfWeek = new Date(today);
                startOfWeek.setDate(today.getDate() - today.getDay());
                setDateFrom(startOfWeek.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            }
            case 'month': {
                const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                setDateFrom(startOfMonth.toISOString().split('T')[0]);
                setDateTo(today.toISOString().split('T')[0]);
                break;
            }
            case 'custom':
                // Keep existing custom dates
                break;
            default:
                setDateFrom('');
                setDateTo('');
        }
        setDateFilterType(filterType);
    };

    // Clear all filters
    const clearFilters = () => {
        setSearchTerm('');
        setStatusFilter('');
        setDateFrom('');
        setDateTo('');
        setDateFilterType('custom');
        // Fetch orders will be triggered by useEffect
    };

    // Tab Navigation Component
    const TabNavigation = () => (
        <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
                {[
                    { id: 'orders', label: 'Orders', icon: FaShoppingCart },
                    { id: 'sales', label: 'Sales Analytics', icon: FaChartBar },
                    { id: 'reports', label: 'Reports', icon: FaFileAlt }
                ].map((tab) => (
                <button 
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                            activeTab === tab.id
                                ? 'border-indigo-500 text-indigo-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }`}
                    >
                        <tab.icon className="mr-2 h-4 w-4" />
                        {tab.label}
                </button>
                ))}
            </nav>
            </div>
        );

        // Orders Tab Component
    const OrdersTab = () => (
        <div>
            {/* Header with Search and Filters */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex-1 max-w-md">
                    <div className="relative">
                        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search orders by customer or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        />
                    </div>
                </div>
                
                <div className="flex items-center gap-2">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="">All Status</option>
                        <option value="pending">Pending</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="packed">Packed</option>
                        <option value="shipped">Shipped</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="returned">Returned</option>
                    </select>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                    >
                        <FaFilter className="h-4 w-4" />
                    </button>
                    
                    <button
                        onClick={clearFilters}
                        className="flex items-center px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                        title="Clear All Filters"
                    >
                        <FaTimes className="mr-1 h-3 w-3" />
                        Clear
                    </button>
                    
                    <button
                        onClick={exportTodaySalesInvoice}
                        disabled={exporting}
                        className="flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm"
                        title="Export Today's Sales Invoice"
                    >
                        {exporting ? (
                            <FaSpinner className="animate-spin mr-1 h-3 w-3" />
                        ) : (
                            <FaDownload className="mr-1 h-3 w-3" />
                        )}
                        Export Invoice
                    </button>
                    

                </div>
            </div>

            {/* Date Filters */}
            {showFilters && (
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-6">
                    <div className="flex flex-col lg:flex-row gap-4">
                        <div className="flex flex-wrap gap-2">
                            <button
                                onClick={() => applyDateFilter('today')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    dateFilterType === 'today' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Today
                            </button>
                            <button
                                onClick={() => applyDateFilter('week')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    dateFilterType === 'week' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Week
                            </button>
                            <button
                                onClick={() => applyDateFilter('month')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    dateFilterType === 'month' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                This Month
                            </button>
                            <button
                                onClick={() => applyDateFilter('custom')}
                                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                                    dateFilterType === 'custom' 
                                        ? 'bg-blue-100 text-blue-700' 
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                            >
                                Custom Range
                            </button>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-2">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">From Date</label>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">To Date</label>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Orders Table */}
            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                    <span className="ml-2 text-lg">Loading orders...</span>
                </div>
            ) : error ? (
                <div className="text-center py-8">
                    <p className="text-red-600">{error}</p>
                    <button onClick={fetchOrders} className="mt-2 text-blue-600 hover:underline">
                        Try again
                    </button>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Order ID
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Customer
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                            </tr>
                        </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {filteredOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.orderStatus);
                                return (
                                        <tr key={order._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                #{order._id.slice(-8)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {order.user?.name || 'Unknown'}
                                            </div>
                                                    <div className="text-sm text-gray-500">
                                                        {order.user?.email}
                                            </div>
                                            </div>
                                        </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                {formatCurrency(order.totalPrice || order.totalAmount || 0)}
                                        </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <StatusIcon className={`mr-2 h-4 w-4 ${getStatusColor(order.orderStatus)}`} />
                                                <OrderStatus status={order.orderStatus} />
                                            </div>
                                        </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="text-sm font-medium text-gray-900">
                                                    {formatDate(order.createdAt).date}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {formatDate(order.createdAt).time}
                                                </div>
                                            </td>
                                                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex items-center space-x-2">
                                                    <button
                                                        onClick={() => openDetailsModal(order)}
                                                        disabled={detailsLoading}
                                                        className="text-indigo-600 hover:text-indigo-900 disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="View Details"
                                                    >
                                                        {detailsLoading ? (
                                                            <FaSpinner className="h-4 w-4 animate-spin" />
                                                        ) : (
                                                            <FaEye className="h-4 w-4" />
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => openStatusModal(order)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Update Status"
                                                    >
                                                        <FaEdit className="h-4 w-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => exportOrderInvoice(order._id)}
                                                        className="text-green-600 hover:text-green-900"
                                                        title="Export Invoice"
                                                    >
                                                        <FaDownload className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </td>
                                    </tr>
                                );
                                })}
                            </tbody>
                        </table>
                    </div>
                    
                    {filteredOrders.length === 0 && (
                        <div className="text-center py-8">
                            <p className="text-gray-500">No orders found</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Sales Analytics Tab Component
    const SalesAnalyticsTab = () => (
        <div>
            {/* Header with Export Button */}
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Sales Analytics</h2>
                    <p className="text-sm text-gray-600 mt-1">Export today's sales as PDF invoice</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                        <option value="week">Last Week</option>
                        <option value="month">Last Month</option>
                        <option value="quarter">Last Quarter</option>
                        <option value="year">Last Year</option>
                    </select>
                    
                    <button
                        onClick={exportTodaySalesInvoice}
                        disabled={exporting}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {exporting ? (
                            <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        ) : (
                            <FaDownload className="mr-2 h-4 w-4" />
                        )}
                        Export Today's Invoice
                    </button>
                </div>
            </div>

            {analyticsLoading ? (
                <div className="flex items-center justify-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                    <span className="ml-2 text-lg">Loading analytics...</span>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Overview Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-2 bg-green-100 rounded-lg">
                                    <FaDollarSign className="h-6 w-6 text-green-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {formatCurrency(salesData.overview.totalRevenue || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-2 bg-blue-100 rounded-lg">
                                    <FaShoppingCart className="h-6 w-6 text-blue-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Total Orders</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {salesData.overview.totalOrders || 0}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-2 bg-purple-100 rounded-lg">
                                    <FaUsers className="h-6 w-6 text-purple-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Avg Order Value</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {formatCurrency(salesData.overview.avgOrderValue || 0)}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 rounded-lg shadow">
                            <div className="flex items-center">
                                <div className="p-2 bg-orange-100 rounded-lg">
                                    <FaChartLine className="h-6 w-6 text-orange-600" />
                                </div>
                                <div className="ml-4">
                                    <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                                    <p className="text-2xl font-semibold text-gray-900">
                                        {((salesData.customerMetrics.conversionRate || 0) * 100).toFixed(1)}%
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Sales Trend Chart */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales Trend</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <LineChart data={salesData.chartData || []}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip formatter={(value) => formatCurrency(value)} />
                                    <Legend />
                                    <Line type="monotone" dataKey="sales" stroke="#3B82F6" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>

                        {/* Order Status Distribution */}
                        <div className="bg-white p-6 rounded-lg shadow">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Status Distribution</h3>
                            <ResponsiveContainer width="100%" height={300}>
                                <PieChart>
                                    <Pie
                                        data={salesData.orderStatusDistribution || [
                                            { name: 'Delivered', value: 20, color: '#10B981' },
                                            { name: 'Shipped', value: 15, color: '#3B82F6' },
                                            { name: 'Processing', value: 8, color: '#8B5CF6' },
                                            { name: 'Pending', value: 2, color: '#F59E0B' }
                                        ]}
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        dataKey="value"
                                        fill="#8884d8"
                                    >
                                        {(salesData.orderStatusDistribution || [
                                            { name: 'Delivered', value: 20, color: '#10B981' },
                                            { name: 'Shipped', value: 15, color: '#3B82F6' },
                                            { name: 'Processing', value: 8, color: '#8B5CF6' },
                                            { name: 'Pending', value: 2, color: '#F59E0B' }
                                        ]).map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Top Products */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Selling Products</h3>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Units Sold</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {(salesData.topProducts || []).slice(0, 5).map((product, index) => (
                                        <tr key={index}>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-lg object-cover" src={product.productImage || product.image} alt={product.productName || product.name} />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">{product.productName || product.name}</div>
                                                    </div>
                                        </div>
                                    </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.totalSold || product.unitsSold}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(product.revenue)}</td>
                                </tr>
                                    ))}
                        </tbody>
                    </table>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    // Reports Tab Component
    const ReportsTab = () => (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-900">Reports & Analytics</h2>
                    <p className="text-sm text-gray-600 mt-1">Generate and export detailed reports</p>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={exportTodaySalesInvoice}
                        disabled={exporting}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        {exporting ? (
                            <FaSpinner className="animate-spin mr-2 h-4 w-4" />
                        ) : (
                            <FaDownload className="mr-2 h-4 w-4" />
                        )}
                        Export Today's Invoice
                    </button>

                </div>
            </div>

            {insightsLoading ? (
                <div className="flex items-center justify-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-blue-600" />
                    <span className="ml-2 text-lg">Loading business insights...</span>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Customer Analytics */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Analytics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">New Customers</span>
                                <span className="font-semibold">+{customerAnalytics.newCustomers}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Repeat Customers</span>
                                <span className="font-semibold">{customerAnalytics.repeatCustomers}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Customer Lifetime Value</span>
                                <span className="font-semibold">{formatCurrency(customerAnalytics.customerLifetimeValue)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Performance Metrics */}
                    <div className="bg-white p-6 rounded-lg shadow">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Order Fulfillment Rate</span>
                                <span className="font-semibold text-green-600">{performanceMetrics.orderFulfillmentRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Average Delivery Time</span>
                                <span className="font-semibold">{performanceMetrics.averageDeliveryTime} days</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-600">Return Rate</span>
                                <span className="font-semibold text-red-600">{performanceMetrics.returnRate}%</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Orders & Sales</h1>
                <p className="text-gray-600">Manage orders and analyze sales performance</p>
            </div>

            <TabNavigation />

            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'sales' && <SalesAnalyticsTab />}
            {activeTab === 'reports' && <ReportsTab />}

            {/* Modals */}
            {showStatusModal && selectedOrder && (
                <OrderStatusManagement
                    order={selectedOrder}
                    isOpen={showStatusModal}
                    onClose={() => setShowStatusModal(false)}
                    onStatusUpdate={handleStatusUpdate}
                />
            )}

            {showDetailsModal && selectedOrder && (
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={showDetailsModal}
                onClose={() => setShowDetailsModal(false)}
                />
            )}
        </div>
    );
};

export default OrdersAndSales; 