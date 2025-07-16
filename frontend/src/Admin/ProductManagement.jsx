import React, { useState, useMemo, useEffect, useContext } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes, FaUpload, FaSpinner, FaImage, FaShoppingCart } from 'react-icons/fa';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/apiServices';
import { CartContext } from '../contexts/CartContext';
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
        tags: product?.tags || [],
        images: product?.images || []
    });
    const [loading, setLoading] = useState(false);
    const [imagePreviews, setImagePreviews] = useState(product?.images || []);
    const [imageFiles, setImageFiles] = useState([]);
    const [uploading, setUploading] = useState(false);

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

    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        
        if (imageFiles.length + files.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

        const validFiles = [];
        const newPreviews = [];

        files.forEach(file => {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not a valid image file`);
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                toast.error(`${file.name} is too large. Maximum size is 5MB`);
                return;
            }

            validFiles.push(file);
            
            // Create preview
            const reader = new FileReader();
            reader.onload = (e) => {
                newPreviews.push(e.target.result);
                if (newPreviews.length === validFiles.length) {
                    setImagePreviews(prev => [...prev, ...newPreviews]);
                }
            };
            reader.readAsDataURL(file);
        });

        setImageFiles(prev => [...prev, ...validFiles]);
    };

    const removeImage = (index, isExisting = false) => {
        if (isExisting) {
            // Remove from existing images
            setFormData(prev => ({
                ...prev,
                images: prev.images.filter((_, i) => i !== index)
            }));
        } else {
            // Remove from new images
            const existingCount = formData.images.length;
            const newIndex = index - existingCount;
            setImageFiles(prev => prev.filter((_, i) => i !== newIndex));
        }
        setImagePreviews(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];

        setUploading(true);
        const uploadedUrls = [];

        try {
            for (const file of imageFiles) {
                const formData = new FormData();
                formData.append('image', file);

                const response = await uploadAPI.uploadImage(formData);
                uploadedUrls.push(response.imageUrl);
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload some images');
            throw error;
        } finally {
            setUploading(false);
        }

        return uploadedUrls;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Upload new images
            const newImageUrls = await uploadImages();
            
            // Combine existing and new image URLs
            const allImages = [...formData.images, ...newImageUrls];

            const productData = {
                ...formData,
                images: allImages,
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

                        {/* Product Images */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Product Images (Max 5 images)
                            </label>
                            
                            {/* Image Upload Area */}
                            <div className="border-2 border-dashed border-slate-300 rounded-lg p-4 text-center hover:border-slate-400 transition-colors">
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                    id="image-upload"
                                    disabled={uploading || loading}
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center space-y-2"
                                >
                                    {uploading ? (
                                        <FaSpinner className="text-2xl text-slate-400 animate-spin" />
                                    ) : (
                                        <FaUpload className="text-2xl text-slate-400" />
                                    )}
                                    <span className="text-sm text-slate-600">
                                        {uploading ? 'Uploading...' : 'Click to upload images or drag and drop'}
                                    </span>
                                </label>
                            </div>

                            {/* Image Previews */}
                            {imagePreviews.length > 0 && (
                                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {imagePreviews.map((preview, index) => (
                                        <div key={index} className="relative group">
                                            <img
                                                src={preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-32 object-cover rounded-lg border"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index, index < formData.images.length)}
                                                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                                disabled={loading || uploading}
                                            >
                                                <FaTimes className="text-xs" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
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
    const [showProductForm, setShowProductForm] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const { addToCart } = useContext(CartContext);

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
                    product={editingProductId ? products.find(p => p._id === editingProductId) : null}
                    categories={categories}
                    onClose={handleCloseProductForm}
                    onSave={handleSaveProduct}
                />
            )}
        </div>
    );
};

export default ProductManagement;