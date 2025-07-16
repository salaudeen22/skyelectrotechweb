import React, { useState, useMemo } from 'react';
import { FaDollarSign, FaShoppingCart, FaEye, FaSearch } from 'react-icons/fa';

// --- Updated Dummy Data ---
const dummyOrders = [
  { id: 101, customer: 'Amit Kumar', total: 1200.50, status: 'Completed', date: '2025-07-01' },
  { id: 102, customer: 'Priya Singh', total: 450.00, status: 'Pending', date: '2025-07-02' },
  { id: 103, customer: 'Rahul Verma', total: 3200.00, status: 'Shipped', date: '2025-07-03' },
  { id: 104, customer: 'Sneha Patil', total: 800.00, status: 'Cancelled', date: '2025-07-03' },
  { id: 105, customer: 'Vikram Rathod', total: 5550.75, status: 'Completed', date: '2025-07-04' },
];

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
    
    const filteredOrders = useMemo(() => 
        dummyOrders.filter(o => 
            o.customer.toLowerCase().includes(searchTerm.toLowerCase()) || 
            `#${o.id}`.includes(searchTerm)
        ),
        [searchTerm]
    );

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
                <p className="text-2xl font-bold text-slate-800">₹1,09,000.25</p>
            </div>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-lg flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100"><FaShoppingCart className="w-6 h-6 text-blue-600" /></div>
            <div>
                <p className="text-sm text-slate-500">Total Orders</p>
                <p className="text-2xl font-bold text-slate-800">5</p>
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
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-sm text-slate-700">#{order.id}</td>
                    <td className="px-6 py-4 font-medium text-slate-900">{order.customer}</td>
                    <td className="px-6 py-4 text-slate-700">₹{order.total.toFixed(2)}</td>
                    <td className="px-6 py-4 text-slate-500">{order.date}</td>
                    <td className="px-6 py-4"><OrderStatus status={order.status} /></td>
                    <td className="px-6 py-4 text-center">
                        <button className="text-blue-600 hover:text-blue-900" title="View Details">
                            <FaEye />
                        </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

export default Sales;