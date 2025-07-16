import React, { useState, useEffect, useCallback } from 'react';
import { 
    FaUpload, 
    FaTimes, 
    FaPlus, 
    FaImage,
    FaSpinner,
    FaSave,
    FaArrowLeft
} from 'react-icons/fa';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const ProductForm = ({ productId = null, onClose, onSuccess }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: '',
        originalPrice: '',
        discount: 0,
        category: '',
        brand: '',
        stock: '',
        lowStockThreshold: 10,
        sku: '',
        specifications: [{ name: '', value: '' }],
        features: [''],
        tags: [],
        warranty: '',
        isFeatured: false
    });

    const [images, setImages] = useState([]);
    const [imageFiles, setImageFiles] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadingImages, setUploadingImages] = useState(false);
    const [errors, setErrors] = useState({});

    const isEdit = Boolean(productId);

    const fetchCategories = useCallback(async () => {
        try {
            const response = await categoriesAPI.getCategories();
            if (response.success) {
                setCategories(response.data.categories || []);
            }
        } catch (error) {
            console.error('Error fetching categories:', error);
            toast.error('Failed to load categories');
        }
    }, []);

    const fetchProduct = useCallback(async () => {
        if (!productId) return;
        
        try {
            const response = await productsAPI.getProduct(productId);
            if (response.success) {
                const product = response.data.product;
                setFormData({
                    name: product.name || '',
                    description: product.description || '',
                    price: product.price || '',
                    originalPrice: product.originalPrice || '',
                    discount: product.discount || 0,
                    category: product.category?._id || '',
                    brand: product.brand || '',
                    stock: product.stock || '',
                    lowStockThreshold: product.lowStockThreshold || 10,
                    sku: product.sku || '',
                    specifications: product.specifications?.length ? product.specifications : [{ name: '', value: '' }],
                    features: product.features?.length ? product.features : [''],
                    tags: product.tags || [],
                    warranty: product.warranty || '',
                    isFeatured: product.isFeatured || false
                });
                setImages(product.images || []);
            }
        } catch (error) {
            console.error('Error fetching product:', error);
            toast.error('Failed to load product');
        }
    }, [productId]);

    useEffect(() => {
        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
    }, [fetchCategories, fetchProduct, isEdit]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        // Limit to 3 images
        if (files.length + images.length > 3) {
            toast.error('Maximum 3 images allowed');
            return;
        }

        // Validate file types and sizes
        const validFiles = files.filter(file => {
            if (!file.type.startsWith('image/')) {
                toast.error(`${file.name} is not an image file`);
                return false;
            }
            if (file.size > 5 * 1024 * 1024) { // 5MB
                toast.error(`${file.name} is too large (max 5MB)`);
                return false;
            }
            return true;
        });

        setImageFiles(prev => [...prev, ...validFiles]);
        
        // Create preview URLs
        validFiles.forEach(file => {
            const reader = new FileReader();
            reader.onload = (e) => {
                setImages(prev => [...prev, { 
                    url: e.target.result, 
                    public_id: `temp_${Date.now()}`,
                    isTemp: true 
                }]);
            };
            reader.readAsDataURL(file);
        });
    };

    const removeImage = (index) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setImageFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];

        setUploadingImages(true);
        try {
            console.log('Uploading files:', imageFiles.map(f => ({ name: f.name, size: f.size, type: f.type })));
            const response = await uploadAPI.uploadMultiple(imageFiles, 'products');
            console.log('Upload response:', response);
            
            if (response.success) {
                console.log('Upload successful, images:', response.data.images);
                return response.data.images;
            } else {
                throw new Error(response.message || 'Failed to upload images');
            }
        } catch (error) {
            console.error('Error uploading images:', error);
            toast.error('Failed to upload images: ' + error.message);
            throw error;
        } finally {
            setUploadingImages(false);
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Product name is required';
        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (!formData.price || formData.price <= 0) newErrors.price = 'Valid price is required';
        if (!formData.category) newErrors.category = 'Category is required';
        if (!formData.stock || formData.stock < 0) newErrors.stock = 'Valid stock quantity is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }

        setLoading(true);
        try {
            // Upload new images if any
            let uploadedImages = [];
            if (imageFiles.length > 0) {
                console.log('Starting image upload process...');
                uploadedImages = await uploadImages();
                console.log('Image upload completed:', uploadedImages);
            }

            // Combine existing images with newly uploaded ones
            const existingImages = images.filter(img => !img.isTemp);
            const allImages = [...existingImages, ...uploadedImages];
            console.log('Final images array:', allImages);

            const productData = {
                ...formData,
                images: allImages,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                discount: parseFloat(formData.discount) || 0
            };

            console.log('Submitting product data:', productData);

            let response;
            if (isEdit) {
                response = await productsAPI.updateProduct(productId, productData);
            } else {
                response = await productsAPI.createProduct(productData);
            }

            if (response.success) {
                toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully`);
                onSuccess && onSuccess(response.data.product);
                onClose && onClose();
            } else {
                throw new Error(response.message || `Failed to ${isEdit ? 'update' : 'create'} product`);
            }
        } catch (error) {
            console.error('Error saving product:', error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    const addSpecification = () => {
        setFormData(prev => ({
            ...prev,
            specifications: [...prev.specifications, { name: '', value: '' }]
        }));
    };

    const removeSpecification = (index) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.filter((_, i) => i !== index)
        }));
    };

    const updateSpecification = (index, field, value) => {
        setFormData(prev => ({
            ...prev,
            specifications: prev.specifications.map((spec, i) => 
                i === index ? { ...spec, [field]: value } : spec
            )
        }));
    };

    const addFeature = () => {
        setFormData(prev => ({
            ...prev,
            features: [...prev.features, '']
        }));
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const updateFeature = (index, value) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.map((feature, i) => i === index ? value : feature)
        }));
    };

    return (
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <button 
                            onClick={onClose}
                            className="text-white hover:text-gray-200 transition-colors"
                        >
                            <FaArrowLeft size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-white">
                            {isEdit ? 'Edit Product' : 'Add New Product'}
                        </h2>
                    </div>
                    <button
                        type="submit"
                        form="product-form"
                        disabled={loading || uploadingImages}
                        className="bg-white text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center space-x-2"
                    >
                        {loading ? (
                            <FaSpinner className="animate-spin" />
                        ) : (
                            <FaSave />
                        )}
                        <span>{loading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </div>

            {/* Form */}
            <form id="product-form" onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Product Name *
                        </label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.name ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="Enter product name"
                        />
                        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Category *
                        </label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.category ? 'border-red-500' : 'border-gray-300'
                            }`}
                        >
                            <option value="">Select category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat._id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                        {errors.category && <p className="mt-1 text-sm text-red-600">{errors.category}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Brand
                        </label>
                        <input
                            type="text"
                            name="brand"
                            value={formData.brand}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Enter brand name"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            SKU
                        </label>
                        <input
                            type="text"
                            name="sku"
                            value={formData.sku}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Auto-generated if empty"
                        />
                    </div>
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Description *
                    </label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                            errors.description ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter product description"
                    />
                    {errors.description && <p className="mt-1 text-sm text-red-600">{errors.description}</p>}
                </div>

                {/* Pricing */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price (₹) *
                        </label>
                        <input
                            type="number"
                            name="price"
                            value={formData.price}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.price ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0.00"
                        />
                        {errors.price && <p className="mt-1 text-sm text-red-600">{errors.price}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Original Price (₹)
                        </label>
                        <input
                            type="number"
                            name="originalPrice"
                            value={formData.originalPrice}
                            onChange={handleInputChange}
                            step="0.01"
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0.00"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Discount (%)
                        </label>
                        <input
                            type="number"
                            name="discount"
                            value={formData.discount}
                            onChange={handleInputChange}
                            min="0"
                            max="100"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                        />
                    </div>
                </div>

                {/* Inventory */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Stock Quantity *
                        </label>
                        <input
                            type="number"
                            name="stock"
                            value={formData.stock}
                            onChange={handleInputChange}
                            min="0"
                            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                                errors.stock ? 'border-red-500' : 'border-gray-300'
                            }`}
                            placeholder="0"
                        />
                        {errors.stock && <p className="mt-1 text-sm text-red-600">{errors.stock}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Low Stock Threshold
                        </label>
                        <input
                            type="number"
                            name="lowStockThreshold"
                            value={formData.lowStockThreshold}
                            onChange={handleInputChange}
                            min="0"
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10"
                        />
                    </div>
                </div>

                {/* Images */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Product Images (Max 3)
                    </label>
                    <div className="space-y-4">
                        {/* Image Preview */}
                        {images.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {images.map((image, index) => (
                                    <div key={index} className="relative">
                                        <img 
                                            src={image.url} 
                                            alt={`Product ${index + 1}`}
                                            className="w-full h-32 object-cover rounded-lg border"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                        >
                                            <FaTimes size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Upload Button */}
                        {images.length < 3 && (
                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                                <div className="text-center">
                                    <FaImage className="mx-auto h-12 w-12 text-gray-400" />
                                    <div className="mt-4">
                                        <label className="cursor-pointer">
                                            <span className="mt-2 block text-sm font-medium text-gray-900">
                                                {uploadingImages ? 'Uploading...' : 'Click to upload images'}
                                            </span>
                                            <input
                                                type="file"
                                                multiple
                                                accept="image/*"
                                                onChange={handleImageChange}
                                                disabled={uploadingImages}
                                                className="hidden"
                                            />
                                        </label>
                                        <p className="mt-1 text-sm text-gray-500">
                                            PNG, JPG, GIF up to 5MB each
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Additional Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Warranty
                        </label>
                        <input
                            type="text"
                            name="warranty"
                            value={formData.warranty}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="e.g., 1 Year"
                        />
                    </div>

                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            name="isFeatured"
                            checked={formData.isFeatured}
                            onChange={handleInputChange}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-900">
                            Featured Product
                        </label>
                    </div>
                </div>

                {/* Features */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Features
                    </label>
                    <div className="space-y-2">
                        {formData.features.map((feature, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={feature}
                                    onChange={(e) => updateFeature(index, e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter feature"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addFeature}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                            <FaPlus size={12} />
                            <span>Add Feature</span>
                        </button>
                    </div>
                </div>

                {/* Specifications */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Specifications
                    </label>
                    <div className="space-y-2">
                        {formData.specifications.map((spec, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <input
                                    type="text"
                                    value={spec.name}
                                    onChange={(e) => updateSpecification(index, 'name', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Specification name"
                                />
                                <input
                                    type="text"
                                    value={spec.value}
                                    onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Specification value"
                                />
                                <button
                                    type="button"
                                    onClick={() => removeSpecification(index)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    <FaTimes />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addSpecification}
                            className="text-blue-600 hover:text-blue-800 flex items-center space-x-1"
                        >
                            <FaPlus size={12} />
                            <span>Add Specification</span>
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default ProductForm;
