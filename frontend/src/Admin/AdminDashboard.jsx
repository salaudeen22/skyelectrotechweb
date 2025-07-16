import React from 'react';
import { Link } from 'react-router-dom';
import { FaDollarSign, FaShoppingCart, FaBoxOpen, FaUsers, FaArrowRight } from 'react-icons/fa';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Data for the page ---

// Stats with Icons
const dummyStats = [
  { label: 'Total Sales', value: '₹1,20,000', change: '+12.5%', icon: FaDollarSign, iconBg: 'bg-green-100', iconColor: 'text-green-600' },
  { label: 'New Orders', value: '320', change: '+8.2%', icon: FaShoppingCart, iconBg: 'bg-blue-100', iconColor: 'text-blue-600' },
  { label: 'Total Products', value: '1,540', change: '-2.1%', icon: FaBoxOpen, iconBg: 'bg-indigo-100', iconColor: 'text-indigo-600' },
  { label: 'Team Members', value: '6', change: '+1 new', icon: FaUsers, iconBg: 'bg-orange-100', iconColor: 'text-orange-600' },
];

// Data for the Recharts graph
const salesData = [
  { name: 'Jan', Sales: 12000 },
  { name: 'Feb', Sales: 19000 },
  { name: 'Mar', Sales: 15000 },
  { name: 'Apr', Sales: 21000 },
  { name: 'May', Sales: 25000 },
  { name: 'Jun', Sales: 23000 },
  { name: 'Jul', Sales: 28000 },
];

// Dummy data for a recent orders table
const recentOrders = [
    { id: '#876364', product: 'Arduino Uno R3', total: '₹550', status: 'Completed' },
    { id: '#876365', product: 'Raspberry Pi 4', total: '₹4500', status: 'Pending' },
    { id: '#876366', product: 'Sensor Kit (37-in-1)', total: '₹1999', status: 'Completed' },
    { id: '#876367', product: '2WD Robot Chassis', total: '₹800', status: 'Shipped' },
    { id: '#876368', product: 'ESP32 Dev Board', total: '₹750', status: 'Cancelled' },
];

const AdminDashboard = () => {
    // Helper to get status badge colors
    const getStatusColor = (status) => {
        switch (status) {
            case 'Completed': return 'bg-green-100 text-green-800';
            case 'Pending': return 'bg-yellow-100 text-yellow-800';
            case 'Shipped': return 'bg-blue-100 text-blue-800';
            case 'Cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-800">Admin Dashboard</h1>
        <p className="text-slate-500 mt-1">Welcome back, Admin! Here's what's happening today.</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {dummyStats.map((stat) => (
          <div key={stat.label} className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4 transition-transform transform hover:-translate-y-1">
            <div className={`p-3 rounded-full ${stat.iconBg}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
            <div>
              <p className="text-sm text-slate-500">{stat.label}</p>
              <p className="text-2xl font-bold text-slate-800">{stat.value}</p>
              <p className={`text-xs mt-1 font-semibold ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{stat.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sales Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
          <h2 className="text-xl font-bold text-slate-800 mb-4">Sales Overview</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <BarChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip wrapperClassName="!bg-white !border-slate-300 !rounded-lg !shadow-xl" />
                <Legend />
                <Bar dataKey="Sales" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white p-6 rounded-xl shadow-lg flex flex-col">
            <h2 className="text-xl font-bold text-slate-800 mb-4">Recent Orders</h2>
            <div className="flex-grow overflow-y-auto">
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
                            <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                                <td className="px-4 py-3 font-medium text-slate-900">{order.id}</td>
                                <td className="px-4 py-3">{order.total}</td>
                                <td className="px-4 py-3">
                                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
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