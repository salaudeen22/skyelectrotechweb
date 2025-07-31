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
    FaClock
} from 'react-icons/fa';
import { ordersAPI } from '../services/apiServices';
import toast from 'react-hot-toast';
import OrderStatusManagement from './OrderStatusManagement';
import OrderDetailsModal from './OrderDetailsModal';
import OrderStatus from '../Components/OrderStatus';





const OrderManagement = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await ordersAPI.getAllOrders();
            
            if (response.success) {
                setOrders(response.data.orders || []);
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-IN');
    };

    const formatCurrency = (amount) => {
        return `₹${Number(amount).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    };

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

    const statusOptions = [
        { value: '', label: 'All Statuses' },
        { value: 'pending', label: 'Pending' },
        { value: 'confirmed', label: 'Confirmed' },
        { value: 'processing', label: 'Processing' },
        { value: 'packed', label: 'Packed' },
        { value: 'shipped', label: 'Shipped' },
        { value: 'delivered', label: 'Delivered' },
        { value: 'cancelled', label: 'Cancelled' },
        { value: 'returned', label: 'Returned' }
    ];

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
                <span className="ml-2 text-lg">Loading orders...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Orders</h2>
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchOrders}
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
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Order Management</h1>
                <p className="text-slate-500 mt-1 text-sm sm:text-base">Manage and update order statuses.</p>
            </div>

            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-lg p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID, Customer Name or Email..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                        <FaFilter className="mr-2" />
                        Filters
                    </button>
                </div>

                {showFilters && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="sm:w-48">
                                <label className="block text-sm font-medium text-slate-700 mb-2">Status Filter</label>
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {statusOptions.map(option => (
                                        <option key={option.value} value={option.value}>
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            {(searchTerm || statusFilter) && (
                                <div className="flex items-end">
                                    <button
                                        onClick={() => {
                                            setSearchTerm('');
                                            setStatusFilter('');
                                        }}
                                        className="px-4 py-2 text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Order</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Customer</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Total</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredOrders.length > 0 ? filteredOrders.map((order) => {
                                const StatusIcon = getStatusIcon(order.orderStatus);
                                return (
                                    <tr key={order._id} className="hover:bg-slate-50">
                                        <td className="px-4 py-4">
                                            <div className="font-mono text-sm text-slate-700">#{order._id?.slice(-6)}</div>
                                            <div className="text-xs text-slate-500 mt-1">
                                                {order.orderItems?.length || 0} items
                                            </div>
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="font-medium text-slate-900">
                                                {order.user?.name || 'N/A'}
                                            </div>
                                            <div className="text-sm text-slate-500">
                                                {order.user?.email || 'N/A'}
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-slate-700 font-medium">
                                            {formatCurrency(order.totalPrice || 0)}
                                        </td>
                                        <td className="px-4 py-4 text-slate-500">
                                            {formatDate(order.createdAt)}
                                        </td>
                                        <td className="px-4 py-4">
                                            <div className="flex items-center space-x-2">
                                                <StatusIcon className="w-4 h-4 text-slate-400" />
                                                <OrderStatus status={order.orderStatus} />
                                            </div>
                                        </td>
                                        <td className="px-4 py-4 text-center">
                                            <div className="flex items-center justify-center space-x-2">
                                                <button 
                                                    className="text-blue-600 hover:text-blue-900 p-2" 
                                                    title="View Details"
                                                    onClick={() => {
                                                        setSelectedOrder(order);
                                                        setShowDetailsModal(true);
                                                    }}
                                                >
                                                    <FaEye className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    className="text-green-600 hover:text-green-900 p-2" 
                                                    title="Update Status"
                                                    onClick={() => openStatusModal(order)}
                                                >
                                                    <FaEdit className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-slate-500">
                                        <div className="flex flex-col items-center">
                                            <FaBox className="text-4xl mb-4 text-slate-300" />
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

            {/* Status Update Modal */}
            <OrderStatusManagement
                order={selectedOrder}
                isOpen={showStatusModal}
                onClose={() => {
                    setShowStatusModal(false);
                    setSelectedOrder(null);
                }}
                onStatusUpdate={handleStatusUpdate}
            />

            {/* Order Details Modal */}
            <OrderDetailsModal
                order={selectedOrder}
                isOpen={showDetailsModal}
                onClose={() => {
                    setShowDetailsModal(false);
                    setSelectedOrder(null);
                }}
            />
        </div>
    );
};

export default OrderManagement; 