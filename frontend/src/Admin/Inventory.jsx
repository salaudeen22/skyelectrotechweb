import React, { useState, useEffect, useMemo } from 'react';
import { 
    FaPlus, 
    FaSearch, 
    FaCheckCircle, 
    FaExclamationTriangle, 
    FaPencilAlt, 
    FaTrashAlt,
    FaSpinner
} from 'react-icons/fa';
import { productsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

// --- Helper Components ---
const StockStatus = ({ stock, threshold = 10 }) => {
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
    const [filterStatus, setFilterStatus] = useState('All');
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            setError(null);
            
            const response = await productsAPI.getProducts();
            
            if (response.success) {
                setProducts(response.data.products || []);
            } else {
                throw new Error(response.message || 'Failed to fetch products');
            }
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message);
            toast.error(`Failed to load inventory: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm('Are you sure you want to delete this product?')) {
            return;
        }

        try {
            const response = await productsAPI.deleteProduct(productId);
            
            if (response.success) {
                setProducts(prev => prev.filter(product => product._id !== productId));
                toast.success('Product deleted successfully');
            } else {
                throw new Error(response.message || 'Failed to delete product');
            }
        } catch (error) {
            console.error('Error deleting product:', error);
            toast.error(`Failed to delete product: ${error.message}`);
        }
    };

    const filteredInventory = useMemo(() => {
        return products.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                                 item.sku?.toLowerCase().includes(searchTerm.toLowerCase());
            
            const threshold = item.lowStockThreshold || 10;
            const stockStatus = item.stockQuantity === 0 ? 'Out of Stock' : 
                               (item.stockQuantity <= threshold ? 'Low Stock' : 'In Stock');
            const matchesFilter = filterStatus === 'All' || stockStatus === filterStatus;
            
            return matchesSearch && matchesFilter;
        });
    }, [products, searchTerm, filterStatus]);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <FaSpinner className="animate-spin text-4xl text-blue-600" />
                <span className="ml-2 text-lg">Loading inventory...</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Inventory</h2>
                <p className="text-red-600">{error}</p>
                <button 
                    onClick={fetchProducts}
                    className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

  return (
    <div className="space-y-6">
      {/* Header with Title and Action Button */}
      <div className="flex items-center justify-between">
        <div>
            <h1 className="text-3xl font-bold text-slate-800">Inventory Management</h1>
            <p className="text-slate-500 mt-1">Track and manage product stock levels.</p>
        </div>
        <button 
            className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
            onClick={() => {
                // Navigate to add product page or open modal
                toast.info('Add product feature - redirecting to product management...');
            }}
        >
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
                    {filteredInventory.length > 0 ? filteredInventory.map((item) => {
                        const threshold = item.lowStockThreshold || 10;
                        const stockQuantity = item.stockQuantity || 0;
                        const progressPercentage = Math.min((stockQuantity / (threshold * 2)) * 100, 100);
                        
                        return (
                            <tr key={item._id} className="hover:bg-slate-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0 h-12 w-12">
                                            <img 
                                                className="h-12 w-12 rounded-md object-cover" 
                                                src={item.images?.[0]?.url || '/placeholder-product.png'} 
                                                alt={item.name}
                                                onError={(e) => {
                                                    e.target.src = '/placeholder-product.png';
                                                }}
                                            />
                                        </div>
                                        <div className="ml-4">
                                            <div className="text-sm font-medium text-slate-900">{item.name}</div>
                                            <div className="text-xs text-slate-500">{item.category?.name || 'Uncategorized'}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                    {item.sku || `SKU-${item._id.slice(-6).toUpperCase()}`}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm text-slate-900 font-bold">{stockQuantity} units</div>
                                    <div className="w-full bg-slate-200 rounded-full h-1.5 mt-1">
                                        <div 
                                            className={`h-1.5 rounded-full ${stockQuantity <= threshold ? 'bg-red-500' : 'bg-green-500'}`} 
                                            style={{ width: `${progressPercentage}%` }}
                                        ></div>
                                    </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <StockStatus stock={stockQuantity} threshold={threshold} />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                    <div className="flex items-center justify-center space-x-4">
                                        <button 
                                            className="text-blue-600 hover:text-blue-900" 
                                            title="Edit Product"
                                            onClick={() => {
                                                toast.info(`Edit product: ${item.name} - Feature coming soon!`);
                                            }}
                                        >
                                            <FaPencilAlt size={16} />
                                        </button>
                                        <button 
                                            className="text-red-600 hover:text-red-900" 
                                            title="Delete Product"
                                            onClick={() => handleDeleteProduct(item._id)}
                                        >
                                            <FaTrashAlt size={16} />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        );
                    }) : (
                        <tr>
                            <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                                <div className="flex flex-col items-center">
                                    <FaSearch className="text-4xl mb-4 text-slate-300" />
                                    <p className="text-lg font-semibold">No products found</p>
                                    <p className="text-sm">Try adjusting your search or filter criteria</p>
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

export default Inventory;