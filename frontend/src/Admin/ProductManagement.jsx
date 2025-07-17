import React, { useState, useMemo, useEffect, useContext } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaShoppingCart } from 'react-icons/fa';
import { productsAPI } from '../services/apiServices';
import { CartContext } from '../contexts/CartContext';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';


const StockStatusBadge = ({ stock }) => {
    if (stock > 10) return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">In Stock</span>;
    if (stock > 0) return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">Low Stock</span>;
    return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>;
};

const ProductManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            setLoading(true);
            const response = await productsAPI.getProducts({ limit: 100 }); // Get more products for admin
            setProducts(response.data.products);
        } catch (error) {
            console.error('Error fetching products:', error);
            toast.error('Failed to load products');
        } finally {
            setLoading(false);
        }
    };

    const filteredProducts = useMemo(() => 
        products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [products, searchTerm]
    );    const handleOpenProductForm = (productId = null) => {
        setEditingProductId(productId);
        setShowProductForm(true);
    };

    const handleCloseProductForm = () => {
        setShowProductForm(false);
        setEditingProductId(null);
    };

    const handleSaveProduct = () => {
        handleCloseProductForm();
        fetchProducts(); // Refresh the products list
    };

    const handleAddToCart = (product) => {
        try {
            addToCart(product, 1);
            toast.success(`${product.name} added to cart!`);
        } catch (error) {
            console.error('Error adding to cart:', error);
            toast.error('Failed to add product to cart');
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (window.confirm('Are you sure you want to delete this product?')) {
            try {
                await productsAPI.deleteProduct(productId);
                toast.success('Product deleted successfully');
                fetchProducts(); // Refresh the products list
            } catch (error) {
                console.error('Error deleting product:', error);
                toast.error('Failed to delete product');
            }
        }
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow-lg animate-pulse">
                    <div className="h-10 bg-gray-300 rounded mb-4"></div>
                    <div className="space-y-3">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="h-16 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Product Management</h1>
                    <p className="text-slate-500 mt-1 text-sm sm:text-base">
                        Add, edit, and manage all products. Total: {products.length} products
                    </p>
                </div>
                <button 
                    onClick={() => handleOpenProductForm()} 
                    className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                    <FaPlus className="mr-2" /> Add New Product
                </button>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search products by name, brand, or category..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider hidden sm:table-cell">Category</th>
                                <th className="px-3 sm:px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Price</th>
                                <th className="px-3 sm:px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider hidden md:table-cell">Stock</th>
                                <th className="px-3 sm:px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50">
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                                                {product.images && product.images.length > 0 ? (
                                                    <img 
                                                        className="h-full w-full object-cover" 
                                                        src={product.images[0].url || product.images[0]} 
                                                        alt={product.name}
                                                        onError={(e) => {
                                                            e.target.style.display = 'none';
                                                            e.target.nextSibling.style.display = 'flex';
                                                        }}
                                                    />
                                                ) : null}
                                                <div className="text-xs text-gray-500 text-center" style={{ display: product.images && product.images.length > 0 ? 'none' : 'flex' }}>
                                                    No Image
                                                </div>
                                            </div>
                                            <div className="ml-2 sm:ml-4 min-w-0">
                                                <div className="font-medium text-slate-900 text-sm sm:text-base truncate">{product.name}</div>
                                                <div className="text-xs sm:text-sm text-slate-500 truncate">{product.brand}</div>
                                                <div className="sm:hidden text-xs text-slate-500 mt-1">{product.category?.name || 'Uncategorized'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-slate-500 hidden sm:table-cell">
                                        {product.category?.name || 'Uncategorized'}
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-sm text-slate-700">
                                        <div className="font-medium">{formatCurrency(product.price)}</div>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <div className="text-xs text-slate-400 line-through">
                                                {formatCurrency(product.originalPrice)}
                                            </div>
                                        )}
                                        <div className="sm:hidden mt-1">
                                            <StockStatusBadge stock={product.stock} />
                                            <div className="text-xs text-slate-500 mt-1">{product.stock} units</div>
                                        </div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4 text-center hidden md:table-cell">
                                        <StockStatusBadge stock={product.stock} />
                                        <div className="text-xs text-slate-500 mt-1">{product.stock} units</div>
                                    </td>
                                    <td className="px-3 sm:px-6 py-4">
                                        <div className="flex items-center justify-center space-x-1 sm:space-x-2">
                                            <button 
                                                onClick={() => handleOpenProductForm(product._id)} 
                                                className="text-blue-600 hover:text-blue-900 p-1 sm:p-2" 
                                                title="Edit"
                                            >
                                                <FaPencilAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleAddToCart(product)}
                                                className="text-green-600 hover:text-green-900 p-1 sm:p-2" 
                                                title="Add to Cart"
                                                disabled={product.stock === 0}
                                            >
                                                <FaShoppingCart className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900 p-1 sm:p-2" 
                                                title="Delete"
                                            >
                                                <FaTrashAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    
                    {filteredProducts.length === 0 && (
                        <div className="text-center py-8 text-gray-500">
                            {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                        </div>
                    )}
                </div>
            </div>

            {/* Product Form Modal */}
            {showProductForm && (
                <ProductForm
                    productId={editingProductId}
                    onClose={handleCloseProductForm}
                    onSuccess={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default ProductManagement;