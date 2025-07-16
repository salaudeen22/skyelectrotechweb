import React, { useState, useMemo } from 'react';
import { 
    FaPlus, 
    FaSearch, 
    FaCheckCircle, 
    FaExclamationTriangle, 
    FaPencilAlt, 
    FaTrashAlt 
} from 'react-icons/fa';

// --- Updated Dummy Data with Images ---
const dummyInventory = [
  { id: 1, name: 'Arduino Uno R3', sku: 'SKU-UNO-R3', stock: 58, threshold: 10, imageUrl: 'https://www.theengineerstore.in/cdn/shop/products/arduino-uno-r3-1.png?v=1701086206' },
  { id: 2, name: 'Raspberry Pi 4 (2GB)', sku: 'SKU-RPI4-2G', stock: 4, threshold: 5, imageUrl: 'https://m.media-amazon.com/images/I/6120PfrjBqL.jpg' },
  { id: 3, name: 'ESP32-WROOM-32 Dev Board', sku: 'SKU-ESP32-DEV', stock: 35, threshold: 15, imageUrl: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSuBZkNT4gPIhsPepZy6C4e-SZ_0Y7T4St__g&s' },
  { id: 4, name: 'SG90 Micro Servo Motor', sku: 'SKU-SG90-SRV', stock: 150, threshold: 20, imageUrl: 'https://5.imimg.com/data5/SELLER/Default/2024/12/471505966/XG/QI/MP/562456/sg90-tower-pro-micro-servo-motor.jpg' },
  { id: 5, name: '37-in-1 Sensor Kit', sku: 'SKU-SENS-37', stock: 12, threshold: 10, imageUrl: 'https://m.media-amazon.com/images/I/71rwFl8vLEL.jpg' },
  { id: 6, name: '2WD Robot Car Chassis', sku: 'SKU-ROBO-2WD', stock: 0, threshold: 5, imageUrl: 'https://ibots.in/wp-content/uploads/2023/06/ibots-711919-01.jpg' },
];

// --- Helper Components ---
const StockStatus = ({ stock, threshold }) => {
    const isLow = stock <= threshold;
    const isOutOfStock = stock === 0;

    if (isOutOfStock) {
        return (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">
                <FaExclamationTriangle className="mr-2" /> Out of Stock
            </span>
        );
    }
    
    if (isLow) {
        return (
            <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-orange-100 text-orange-800">
                <FaExclamationTriangle className="mr-2" /> Low Stock
            </span>
        );
    }

    return (
        <span className="inline-flex items-center px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
            <FaCheckCircle className="mr-2" /> In Stock
        </span>
    );
};

const Inventory = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState('All'); // 'All', 'In Stock', 'Low Stock', 'Out of Stock'

    const filteredInventory = useMemo(() => {
        return dummyInventory.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            
            const stockStatus = item.stock === 0 ? 'Out of Stock' : (item.stock <= item.threshold ? 'Low Stock' : 'In Stock');
            const matchesFilter = filterStatus === 'All' || stockStatus === filterStatus;
            
            return matchesSearch && matchesFilter;
        });
    }, [searchTerm, filterStatus]);

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
            <p className="text-slate-500 mt-1">Track and manage product stock levels.</p>
        </div>
        <button className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors">
            <FaPlus className="mr-2" /> Add New Product
        </button>
      </div>

      {/* Search and Filter Controls */}
      <div className="bg-white p-4 rounded-lg shadow-lg flex items-center justify-between">
        <div className="relative w-1/3">
            <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
            <input 
                type="text" 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
        </div>
        <div className="flex items-center space-x-2">
            {['All', 'In Stock', 'Low Stock', 'Out of Stock'].map(status => (
                <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                        filterStatus === status 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                >
                    {status}
                </button>
            ))}
        </div>
      </div>
      
      {/* Inventory Table */}
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
            <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                    <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">SKU</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Stock Level</th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                    {filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                                <div className="flex-shrink-0 h-12 w-12">
                                <img className="h-12 w-12 rounded-md object-cover" src={item.imageUrl} alt={item.name} />
                                </div>
                                <div className="ml-4">
                                <div className="text-sm font-medium text-slate-900">{item.name}</div>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">{item.sku}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900 font-bold">{item.stock} units</div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                <div 
                                    className={`h-1.5 rounded-full ${item.stock <= item.threshold ? 'bg-red-500' : 'bg-green-500'}`} 
                                    style={{ width: `${Math.min((item.stock / (item.threshold * 2)) * 100, 100)}%` }}
                                ></div>
                            </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                            <StockStatus stock={item.stock} threshold={item.threshold} />
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                            <div className="flex items-center justify-center space-x-4">
                                <button className="text-blue-600 hover:text-blue-900" title="Edit Product">
                                    <FaPencilAlt size={16} />
                                </button>
                                <button className="text-red-600 hover:text-red-900" title="Delete Product">
                                    <FaTrashAlt size={16} />
                                </button>
                            </div>
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
            {filteredInventory.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                    <p className="font-semibold">No products found.</p>
                    <p className="text-sm">Try adjusting your search or filter.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default Inventory;