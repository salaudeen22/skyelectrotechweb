import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes } from 'react-icons/fa';
import { productsAPI, categoriesAPI } from '../services/apiServices';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';

const StockStatusBadge = ({ stock }) => {
    if (stock > 10) return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">In Stock</span>;
    if (stock > 0) return <span className="px-2 py-1 text-xs font-semibold text-orange-800 bg-orange-100 rounded-full">Low Stock</span>;
    return <span className="px-2 py-1 text-xs font-semibold text-red-800 bg-red-100 rounded-full">Out of Stock</span>;
};

// --- Product Modal Component ---
const ProductModal = ({ product, categories, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: product?.name || '',
        description: product?.description || '',
        price: product?.price || '',
        originalPrice: product?.originalPrice || '',
        category: product?.category?._id || product?.category || '',
        brand: product?.brand || '',
        stock: product?.stock || '',
        lowStockThreshold: product?.lowStockThreshold || 10,
        isFeatured: product?.isFeatured || false,
        specifications: product?.specifications || [],
        features: product?.features || [],
        tags: product?.tags || []
    });
    const [loading, setLoading] = useState(false);

    const isEditing = !!product;

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleArrayChange = (field, value) => {
        const array = value.split(',').map(item => item.trim()).filter(item => item);
        setFormData(prev => ({
            ...prev,
            [field]: array
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const productData = {
                ...formData,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold)
            };

            if (isEditing) {
                await productsAPI.updateProduct(product._id, productData);
                toast.success('Product updated successfully');
            } else {
                await productsAPI.createProduct(productData);
                toast.success('Product created successfully');
            }
            
            onSave();
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.response?.data?.message || 'Failed to save product');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-slate-800">
                            {isEditing ? 'Edit Product' : 'Add New Product'}
                        </h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                            <FaTimes size={20} />
                        </button>
                    </div>
                    
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700">Product Name *</label>
                            <input 
                                type="text" 
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Description</label>
                            <textarea 
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows={3}
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Price (₹) *</label>
                                <input 
                                    type="number" 
                                    name="price"
                                    value={formData.price}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Original Price (₹)</label>
                                <input 
                                    type="number" 
                                    name="originalPrice"
                                    value={formData.originalPrice}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Stock *</label>
                                <input 
                                    type="number" 
                                    name="stock"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    required
                                    min="0"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Low Stock Threshold</label>
                                <input 
                                    type="number" 
                                    name="lowStockThreshold"
                                    value={formData.lowStockThreshold}
                                    onChange={handleChange}
                                    min="0"
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Category *</label>
                                <select 
                                    name="category"
                                    value={formData.category}
                                    onChange={handleChange}
                                    required
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {categories.map(category => (
                                        <option key={category._id} value={category._id}>
                                            {category.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-700">Brand</label>
                                <input 
                                    type="text" 
                                    name="brand"
                                    value={formData.brand}
                                    onChange={handleChange}
                                    className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Features (comma-separated)</label>
                            <input 
                                type="text" 
                                value={formData.features.join(', ')}
                                onChange={(e) => handleArrayChange('features', e.target.value)}
                                placeholder="Feature 1, Feature 2, Feature 3"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700">Tags (comma-separated)</label>
                            <input 
                                type="text" 
                                value={formData.tags.join(', ')}
                                onChange={(e) => handleArrayChange('tags', e.target.value)}
                                placeholder="tag1, tag2, tag3"
                                className="mt-1 block w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" 
                            />
                        </div>

                        <div className="flex items-center">
                            <input 
                                type="checkbox" 
                                name="isFeatured"
                                checked={formData.isFeatured}
                                onChange={handleChange}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <label className="ml-2 block text-sm text-slate-700">
                                Featured Product
                            </label>
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button 
                                type="button" 
                                onClick={onClose} 
                                className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
                                disabled={loading}
                            >
                                Cancel
                            </button>
                            <button 
                                type="submit" 
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : 'Save Product'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

const ProductManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showProductForm, setShowProductForm] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [editingProductId, setEditingProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
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

    const fetchCategories = async () => {
        try {
            const response = await categoriesAPI.getCategories();
            setCategories(response.data.categories);
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    };

    const filteredProducts = useMemo(() => 
        products.filter(p => 
            p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category?.name?.toLowerCase().includes(searchTerm.toLowerCase())
        ),
        [products, searchTerm]
    );

    const handleOpenModal = (product = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedProduct(null);
    };

    const handleOpenProductForm = (productId = null) => {
        setEditingProductId(productId);
        setShowProductForm(true);
    };

    const handleCloseProductForm = () => {
        setShowProductForm(false);
        setEditingProductId(null);
    };
    
    const handleSaveProduct = () => {
        handleCloseModal();
        fetchProducts(); // Refresh the products list
    };

    const handleProductFormSuccess = () => {
        handleCloseProductForm();
        fetchProducts(); // Refresh the products list
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
            {isModalOpen && (
                <ProductModal 
                    product={selectedProduct} 
                    categories={categories}
                    onClose={handleCloseModal} 
                    onSave={handleSaveProduct}
                />
            )}
            
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Product Management</h1>
                    <p className="text-slate-500 mt-1">
                        Add, edit, and manage all products. Total: {products.length} products
                    </p>
                </div>
                <button 
                    onClick={() => handleOpenProductForm()} 
                    className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors"
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
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Stock</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden">
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
                                            <div className="ml-4">
                                                <div className="font-medium text-slate-900">{product.name}</div>
                                                <div className="text-sm text-slate-500">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {product.category?.name || 'Uncategorized'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        {formatCurrency(product.price)}
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <div className="text-xs text-slate-400 line-through">
                                                {formatCurrency(product.originalPrice)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <StockStatusBadge stock={product.stock} />
                                        <div className="text-xs text-slate-500 mt-1">{product.stock} units</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-4">
                                            <button 
                                                onClick={() => handleOpenProductForm(product._id)} 
                                                className="text-blue-600 hover:text-blue-900" 
                                                title="Edit"
                                            >
                                                <FaPencilAlt />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900" 
                                                title="Delete"
                                            >
                                                <FaTrashAlt />
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <ProductForm
                            productId={editingProductId}
                            onClose={handleCloseProductForm}
                            onSuccess={handleProductFormSuccess}
                        />
                    </div>
                </div>
            )}

            {/* Old Modal - keeping for compatibility */}
            {isModalOpen && (
                <ProductModal 
                    product={selectedProduct} 
                    categories={categories} 
                    onClose={handleCloseModal} 
                    onSave={handleSaveProduct} 
                />
            )}
        </div>
    );
};

export default ProductManagement;