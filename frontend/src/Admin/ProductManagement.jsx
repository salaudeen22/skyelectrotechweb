import React, { useState, useMemo, useEffect } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaUpload, FaCog, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { productsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';
import ProductForm from './ProductForm';
import BulkUpload from './BulkUpload';
import BulkActions from './BulkActions';

const ProductManagement = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [showProductForm, setShowProductForm] = useState(false);
    const [showBulkUpload, setShowBulkUpload] = useState(false);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

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
    );

    // Pagination logic
    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
    const paginatedProducts = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return filteredProducts.slice(startIndex, endIndex);
    }, [filteredProducts, currentPage, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        setSelectedProducts([]); // Clear selections when changing pages
    };

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
        setCurrentPage(1); // Reset to first page when searching
    };    const handleOpenProductForm = (productId = null) => {
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

    const handleOpenBulkUpload = () => {
        setShowBulkUpload(true);
    };

    const handleCloseBulkUpload = () => {
        setShowBulkUpload(false);
    };

    const handleBulkUploadSuccess = () => {
        fetchProducts(); // Refresh the products list
    };

    const handleOpenBulkActions = () => {
        setShowBulkActions(true);
    };

    const handleCloseBulkActions = () => {
        setShowBulkActions(false);
        setSelectedProducts([]);
    };

    const handleBulkActionsSuccess = () => {
        fetchProducts(); // Refresh the products list
        setSelectedProducts([]);
    };

    const handleSelectProduct = (productId) => {
        setSelectedProducts(prev => 
            prev.includes(productId) 
                ? prev.filter(id => id !== productId)
                : [...prev, productId]
        );
    };

    const handleSelectAll = () => {
        const currentPageProductIds = paginatedProducts.map(p => p._id);
        const allCurrentPageSelected = currentPageProductIds.every(id => selectedProducts.includes(id));
        
        if (allCurrentPageSelected) {
            // Deselect all products on current page
            setSelectedProducts(prev => prev.filter(id => !currentPageProductIds.includes(id)));
        } else {
            // Select all products on current page
            setSelectedProducts(prev => [
                ...prev.filter(id => !currentPageProductIds.includes(id)), // Remove any existing from current page
                ...currentPageProductIds // Add all from current page
            ]);
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
                <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                    {selectedProducts.length > 0 && (
                        <button 
                            onClick={handleOpenBulkActions}
                            className="flex items-center justify-center bg-purple-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:bg-purple-700 transition-colors text-sm sm:text-base"
                        >
                            <FaCog className="mr-1 sm:mr-2 w-4 h-4" /> 
                            <span className="hidden sm:inline">Bulk Actions</span>
                            <span className="sm:hidden">Bulk</span> ({selectedProducts.length})
                        </button>
                    )}
                    <button 
                        onClick={handleOpenBulkUpload}
                        className="flex items-center justify-center bg-green-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:bg-green-700 transition-colors text-sm sm:text-base"
                    >
                        <FaUpload className="mr-1 sm:mr-2 w-4 h-4" /> 
                        <span className="hidden sm:inline">Bulk Upload</span>
                        <span className="sm:hidden">Upload</span>
                    </button>
                    <button 
                        onClick={() => handleOpenProductForm()} 
                        className="flex items-center justify-center bg-blue-600 text-white font-semibold py-2 px-3 sm:px-4 rounded-lg shadow-md hover:bg-blue-700 transition-colors text-sm sm:text-base"
                    >
                        <FaPlus className="mr-1 sm:mr-2 w-4 h-4" /> 
                        <span className="hidden sm:inline">Add New Product</span>
                        <span className="sm:hidden">Add Product</span>
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-lg">
                <div className="relative">
                    <FaSearch className="absolute top-1/2 left-3 -translate-y-1/2 text-slate-400" />
                    <input 
                        type="text" 
                        placeholder="Search products by name, brand, or category..." 
                        value={searchTerm}
                        onChange={handleSearchChange}
                        className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-3 py-3 text-center">
                                    <input
                                        type="checkbox"
                                        checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p._id))}
                                        onChange={handleSelectAll}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Category</th>
                                <th className="px-6 py-3 text-left text-xs font-bold text-slate-600 uppercase tracking-wider">Price</th>
                                <th className="px-6 py-3 text-center text-xs font-bold text-slate-600 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {paginatedProducts.map((product) => (
                                <tr key={product._id} className="hover:bg-slate-50">
                                    <td className="px-3 py-4 text-center">
                                        <input
                                            type="checkbox"
                                            checked={selectedProducts.includes(product._id)}
                                            onChange={() => handleSelectProduct(product._id)}
                                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                        />
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                            <div className="ml-4 min-w-0">
                                                <div className="font-medium text-slate-900 truncate">{product.name}</div>
                                                <div className="text-sm text-slate-500 truncate">{product.brand}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-500">
                                        {product.category?.name || 'Uncategorized'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-700">
                                        <div className="font-medium">{formatCurrency(product.price)}</div>
                                        {product.originalPrice && product.originalPrice > product.price && (
                                            <div className="text-xs text-slate-400 line-through">
                                                {formatCurrency(product.originalPrice)}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button 
                                                onClick={() => handleOpenProductForm(product._id)} 
                                                className="text-blue-600 hover:text-blue-900 p-2" 
                                                title="Edit"
                                            >
                                                <FaPencilAlt className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteProduct(product._id)}
                                                className="text-red-600 hover:text-red-900 p-2" 
                                                title="Delete"
                                            >
                                                <FaTrashAlt className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden">
                    {/* Mobile Select All */}
                    <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center">
                        <input
                            type="checkbox"
                            checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedProducts.includes(p._id))}
                            onChange={handleSelectAll}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-3"
                        />
                        <span className="text-sm font-medium text-slate-600">
                            Select All ({selectedProducts.length} selected)
                        </span>
                    </div>

                    {/* Mobile Product Cards */}
                    <div className="divide-y divide-slate-200">
                        {paginatedProducts.map((product) => (
                            <div key={product._id} className="p-4 hover:bg-slate-50">
                                <div className="flex items-start space-x-3">
                                    <input
                                        type="checkbox"
                                        checked={selectedProducts.includes(product._id)}
                                        onChange={() => handleSelectProduct(product._id)}
                                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 mt-1"
                                    />
                                    
                                    <div className="h-16 w-16 rounded-md bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
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
                                    
                                    <div className="flex-1 min-w-0">
                                        <div className="font-medium text-slate-900 text-base truncate">{product.name}</div>
                                        <div className="text-sm text-slate-500 truncate">{product.brand}</div>
                                        <div className="text-sm text-slate-500 mt-1">{product.category?.name || 'Uncategorized'}</div>
                                        
                                        <div className="mt-2 flex items-center justify-between">
                                            <div>
                                                <div className="font-medium text-slate-700">{formatCurrency(product.price)}</div>
                                                {product.originalPrice && product.originalPrice > product.price && (
                                                    <div className="text-xs text-slate-400 line-through">
                                                        {formatCurrency(product.originalPrice)}
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="flex items-center space-x-2">
                                                <button 
                                                    onClick={() => handleOpenProductForm(product._id)} 
                                                    className="text-blue-600 hover:text-blue-900 p-2 rounded-md hover:bg-blue-50" 
                                                    title="Edit"
                                                >
                                                    <FaPencilAlt className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDeleteProduct(product._id)}
                                                    className="text-red-600 hover:text-red-900 p-2 rounded-md hover:bg-red-50" 
                                                    title="Delete"
                                                >
                                                    <FaTrashAlt className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                {filteredProducts.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                        {searchTerm ? 'No products found matching your search.' : 'No products available.'}
                    </div>
                )}
            </div>
                
            {/* Pagination Controls */}
            {filteredProducts.length > 0 && (
                <div className="bg-white border-t border-slate-200 px-4 py-4 sm:px-6">
                    {/* Mobile Pagination */}
                    <div className="md:hidden">
                        <div className="text-sm text-slate-500 text-center mb-3">
                            Page {currentPage} of {totalPages} ({filteredProducts.length} products)
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center justify-center space-x-3">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <FaChevronLeft className="w-3 h-3 mr-1" />
                                    Previous
                                </button>
                                
                                <span className="text-sm text-slate-600 font-medium">
                                    {currentPage} / {totalPages}
                                </span>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <FaChevronRight className="w-3 h-3 ml-1" />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Desktop Pagination */}
                    <div className="hidden md:flex items-center justify-between">
                        <div className="text-sm text-slate-500">
                            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredProducts.length)} of {filteredProducts.length} products
                        </div>
                        
                        {totalPages > 1 && (
                            <div className="flex items-center space-x-2">
                                <button
                                    onClick={() => handlePageChange(currentPage - 1)}
                                    disabled={currentPage === 1}
                                    className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    <FaChevronLeft className="w-3 h-3 mr-1" />
                                    Previous
                                </button>
                                
                                <div className="flex items-center space-x-1">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => {
                                        // Show first page, last page, current page, and pages around current
                                        const showPage = page === 1 || 
                                                        page === totalPages || 
                                                        (page >= currentPage - 1 && page <= currentPage + 1);
                                        
                                        if (!showPage) {
                                            // Show ellipsis if there's a gap
                                            if (page === currentPage - 2 || page === currentPage + 2) {
                                                return <span key={page} className="px-2 text-slate-400">...</span>;
                                            }
                                            return null;
                                        }
                                        
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => handlePageChange(page)}
                                                className={`px-3 py-1 text-sm border rounded-md ${
                                                    currentPage === page
                                                        ? 'bg-blue-600 text-white border-blue-600'
                                                        : 'border-slate-300 hover:bg-slate-50'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    })}
                                </div>
                                
                                <button
                                    onClick={() => handlePageChange(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                    className="px-3 py-1 text-sm border border-slate-300 rounded-md hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                                >
                                    Next
                                    <FaChevronRight className="w-3 h-3 ml-1" />
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Product Form Modal */}
            {showProductForm && (
                <ProductForm
                    productId={editingProductId}
                    onClose={handleCloseProductForm}
                    onSuccess={handleSaveProduct}
                />
            )}

            {/* Bulk Upload Modal */}
            {showBulkUpload && (
                <BulkUpload
                    onClose={handleCloseBulkUpload}
                    onSuccess={handleBulkUploadSuccess}
                />
            )}

            {/* Bulk Actions Modal */}
            {showBulkActions && (
                <BulkActions
                    selectedProducts={selectedProducts}
                    products={products}
                    onClose={handleCloseBulkActions}
                    onSuccess={handleBulkActionsSuccess}
                />
            )}
        </div>
    );
};

export default ProductManagement;