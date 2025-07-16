import React, { useState, useEffect, useCallback } from 'react';
import { 
    FaTimes, 
    FaSave,
    FaSpinner,
    FaUpload,
    FaExclamationCircle,
    FaStar,
    FaDollarSign,
    FaBoxOpen,
    FaPlus
} from 'react-icons/fa';
import { productsAPI, categoriesAPI, uploadAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

// A reusable styled input component for consistency (no changes needed here)
const FormInput = ({ label, name, icon, error, ...props }) => (
    <div>
        <label htmlFor={name} className="block text-sm font-medium text-gray-600 mb-1">
            {label}
        </label>
        <div className="relative">
            {icon && (
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    {icon}
                </div>
            )}
            <input
                id={name}
                name={name}
                className={`w-full py-2.5 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${
                    icon ? 'pl-10' : 'px-4'
                } ${
                    error
                        ? 'border-red-500 ring-red-500/50 bg-red-50'
                        : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50 bg-gray-50'
                }`}
                {...props}
            />
        </div>
        {error && (
            <p className="mt-1.5 flex items-center text-sm text-red-600">
                <FaExclamationCircle className="mr-1.5" /> {error}
            </p>
        )}
    </div>
);


const ProductForm = ({ productId = null, onClose, onSuccess }) => {
    // ... All existing state and logic functions remain exactly the same ...
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
        setLoading(true);
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
        } finally {
            setLoading(false);
        }
    }, [productId]);

    useEffect(() => {
        // Add a class to the body to prevent scrolling when the modal is open
        document.body.classList.add('overflow-hidden');
        fetchCategories();
        if (isEdit) {
            fetchProduct();
        }
        // Cleanup function to remove the class when the component unmounts
        return () => {
            document.body.classList.remove('overflow-hidden');
        };
    }, [fetchCategories, fetchProduct, isEdit]);


    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files);
        
        if (files.length + images.length > 5) {
            toast.error('Maximum 5 images allowed');
            return;
        }

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
        
        const newImageFiles = [...imageFiles, ...validFiles];
        setImageFiles(newImageFiles);
        
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

    const removeImage = (indexToRemove) => {
        const imageToRemove = images[indexToRemove];
        setImages(prev => prev.filter((_, i) => i !== indexToRemove));
        if(imageToRemove.isTemp) {
            const tempImageIndex = images.slice(0, indexToRemove).filter(img => img.isTemp).length;
            setImageFiles(prev => prev.filter((_, i) => i !== tempImageIndex));
        }
    };

    const uploadImages = async () => {
        if (imageFiles.length === 0) return [];

        setUploadingImages(true);
        try {
            const response = await uploadAPI.uploadMultiple(imageFiles, 'products');
            if (response.success) {
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
        if (images.length === 0) newErrors.images = 'At least one image is required';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the form errors before saving.');
            return;
        }

        setLoading(true);
        try {
            let uploadedImages = [];
            if (imageFiles.length > 0) {
                uploadedImages = await uploadImages();
            }

            const existingImages = images.filter(img => !img.isTemp);
            const allImages = [...existingImages, ...uploadedImages];

            const productData = {
                ...formData,
                images: allImages,
                price: parseFloat(formData.price),
                originalPrice: formData.originalPrice ? parseFloat(formData.originalPrice) : undefined,
                stock: parseInt(formData.stock),
                lowStockThreshold: parseInt(formData.lowStockThreshold),
                discount: parseFloat(formData.discount) || 0
            };

            let response;
            if (isEdit) {
                response = await productsAPI.updateProduct(productId, productData);
            } else {
                response = await productsAPI.createProduct(productData);
            }

            if (response.success) {
                toast.success(`Product ${isEdit ? 'updated' : 'created'} successfully!`);
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

    const addSpecification = () => setFormData(p => ({ ...p, specifications: [...p.specifications, { name: '', value: '' }] }));
    const removeSpecification = (index) => setFormData(p => ({ ...p, specifications: p.specifications.filter((_, i) => i !== index) }));
    const updateSpecification = (index, field, value) => setFormData(p => ({ ...p, specifications: p.specifications.map((s, i) => i === index ? { ...s, [field]: value } : s) }));
    const addFeature = () => setFormData(p => ({ ...p, features: [...p.features, ''] }));
    const removeFeature = (index) => setFormData(p => ({ ...p, features: p.features.filter((_, i) => i !== index) }));
    const updateFeature = (index, value) => setFormData(p => ({ ...p, features: p.features.map((f, i) => i === index ? value : f) }));
    // --- End of logic ---

    return (
        // Modal Overlay: Covers the entire screen
        <div 
            className="fixed inset-0 z-50 bg-black bg-opacity-60 flex items-center justify-center p-4 transition-opacity duration-300"
            onClick={onClose} // Close modal on overlay click
        >
            {/* Modal Panel: The main content box */}
            <div 
                className="bg-gray-50 rounded-xl shadow-2xl w-full max-w-6xl flex flex-col max-h-[95vh]"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside the modal
            >
                {/* Modal Header */}
                <div className="flex-shrink-0 px-6 py-4 flex items-center justify-between border-b border-gray-200">
                    <h2 className="text-xl font-semibold text-gray-800">
                        {isEdit ? 'Edit Product' : 'Add New Product'}
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="p-2 rounded-full text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                    >
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Modal Body: This part is scrollable */}
                <div className="flex-grow p-6 overflow-y-auto">
                    {loading && isEdit ? (
                         <div className="flex justify-center items-center h-full">
                            <FaSpinner className="animate-spin text-indigo-600" size={40} />
                         </div>
                    ) : (
                        <form id="product-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left Column */}
                            <div className="lg:col-span-2 space-y-8">
                                {/* Basic Info Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    {/* ... (All the card content is the same as before) ... */}
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Basic Information</h3>
                                    <div className="space-y-6">
                                        <FormInput label="Product Name *" name="name" value={formData.name} onChange={handleInputChange} error={errors.name} placeholder="e.g., Quantum Laptop Pro" />
                                        <div>
                                            <label htmlFor="description" className="block text-sm font-medium text-gray-600 mb-1">Description *</label>
                                            <textarea id="description" name="description" value={formData.description} onChange={handleInputChange} rows={5} className={`w-full p-4 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.description ? 'border-red-500 ring-red-500/50 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50 bg-gray-50'}`} placeholder="Provide a detailed description of the product..."/>
                                            {errors.description && <p className="mt-1.5 flex items-center text-sm text-red-600"><FaExclamationCircle className="mr-1.5" /> {errors.description}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Media Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Media</h3>
                                    <p className="text-sm text-gray-500 mb-6">Add up to 5 images. The first image is the primary one.</p>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                                        {images.map((image, index) => (
                                            <div key={index} className="relative group aspect-square">
                                                <img src={image.url} alt={`Product thumbnail ${index + 1}`} className="w-full h-full object-cover rounded-lg border-2 border-gray-200" />
                                                {index === 0 && (<div className="absolute top-1.5 left-1.5 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center"><FaStar className="mr-1" /> Primary</div>)}
                                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                                    <button type="button" onClick={() => removeImage(index)} className="text-white p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"><FaTimes size={16} /></button>
                                                </div>
                                            </div>
                                        ))}
                                        {images.length < 5 && (
                                            <label className="aspect-square flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-indigo-500 hover:bg-indigo-50 transition-colors">
                                                {uploadingImages ? (<FaSpinner className="animate-spin h-8 w-8 text-gray-500" />) : (<FaUpload className="h-8 w-8 text-gray-400" />)}
                                                <span className="mt-2 text-sm text-center text-gray-500">{uploadingImages ? 'Uploading...' : 'Add Image'}</span>
                                                <input type="file" multiple accept="image/*" onChange={handleImageChange} disabled={uploadingImages} className="sr-only"/>
                                            </label>
                                        )}
                                    </div>
                                    {errors.images && <p className="mt-2 flex items-center text-sm text-red-600"><FaExclamationCircle className="mr-1.5" /> {errors.images}</p>}
                                </div>

                                {/* Details Card */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    {/* Features and Specs sections remain the same */}
                                     <h3 className="text-lg font-semibold text-gray-900 mb-6">Product Details</h3>
                                    <div className="space-y-8">
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-700 mb-3">Key Features</h4>
                                            <div className="space-y-3">
                                                {formData.features.map((feature, index) => (<div key={index} className="flex items-center gap-2"><input type="text" value={feature} onChange={(e) => updateFeature(index, e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="e.g., Ultra-fast processor"/><button type="button" onClick={() => removeFeature(index)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"><FaTimes /></button></div>))}
                                                <button type="button" onClick={addFeature} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1.5 pt-2"><FaPlus size={12} /> Add Feature</button>
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="text-md font-semibold text-gray-700 mb-3">Specifications</h4>
                                            <div className="space-y-3">
                                                {formData.specifications.map((spec, index) => (<div key={index} className="grid grid-cols-1 md:grid-cols-2 gap-2 items-center"><input type="text" value={spec.name} onChange={(e) => updateSpecification(index, 'name', e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="Name (e.g., Color)"/><div className="flex items-center gap-2"><input type="text" value={spec.value} onChange={(e) => updateSpecification(index, 'value', e.target.value)} className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50" placeholder="Value (e.g., Midnight Black)"/><button type="button" onClick={() => removeSpecification(index)} className="p-2 text-gray-400 hover:text-red-500 rounded-full hover:bg-red-100 transition-colors"><FaTimes /></button></div></div>))}
                                                <button type="button" onClick={addSpecification} className="text-indigo-600 hover:text-indigo-800 text-sm font-semibold flex items-center gap-1.5 pt-2"><FaPlus size={12} /> Add Specification</button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Right Column */}
                            <div className="lg:col-span-1 space-y-8">
                                {/* Organization, Pricing & Inventory Cards are the same */}
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Organization</h3>
                                    <div className="space-y-6">
                                        <div>
                                            <label htmlFor="category" className="block text-sm font-medium text-gray-600 mb-1">Category *</label>
                                            <select id="category" name="category" value={formData.category} onChange={handleInputChange} className={`w-full py-2.5 px-3 border rounded-lg focus:outline-none focus:ring-2 transition-colors ${errors.category ? 'border-red-500 ring-red-500/50 bg-red-50' : 'border-gray-300 focus:border-indigo-500 focus:ring-indigo-500/50 bg-gray-50'}`}>
                                                <option value="">Select a category</option>
                                                {categories.map(cat => (<option key={cat._id} value={cat._id}>{cat.name}</option>))}
                                            </select>
                                            {errors.category && <p className="mt-1.5 flex items-center text-sm text-red-600"><FaExclamationCircle className="mr-1.5" /> {errors.category}</p>}
                                        </div>
                                        <FormInput label="Brand" name="brand" value={formData.brand} onChange={handleInputChange} placeholder="e.g., Quantum" />
                                        <FormInput label="SKU" name="sku" value={formData.sku} onChange={handleInputChange} placeholder="Auto-generated if empty" />
                                        <FormInput label="Warranty" name="warranty" value={formData.warranty} onChange={handleInputChange} placeholder="e.g., 2 Years Limited" />
                                        <div className="flex items-center pt-2"><input type="checkbox" id="isFeatured" name="isFeatured" checked={formData.isFeatured} onChange={handleInputChange} className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded" /><label htmlFor="isFeatured" className="ml-3 block text-sm font-medium text-gray-700">Mark as a featured product</label></div>
                                    </div>
                                </div>
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-6">Pricing & Inventory</h3>
                                    <div className="space-y-6">
                                        <FormInput label="Price *" name="price" type="number" value={formData.price} onChange={handleInputChange} error={errors.price} step="0.01" min="0" placeholder="0.00" icon={<FaDollarSign className="text-gray-400" />} />
                                        <FormInput label="Original Price" name="originalPrice" type="number" value={formData.originalPrice} onChange={handleInputChange} step="0.01" min="0" placeholder="0.00" icon={<FaDollarSign className="text-gray-400" />} />
                                        <FormInput label="Discount (%)" name="discount" type="number" value={formData.discount} onChange={handleInputChange} min="0" max="100" placeholder="0" />
                                        <hr className="my-6"/>
                                        <FormInput label="Stock Quantity *" name="stock" type="number" value={formData.stock} onChange={handleInputChange} error={errors.stock} min="0" placeholder="0" icon={<FaBoxOpen className="text-gray-400" />} />
                                        <FormInput label="Low Stock Threshold" name="lowStockThreshold" type="number" value={formData.lowStockThreshold} onChange={handleInputChange} min="0" placeholder="10" />
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex-shrink-0 px-6 py-4 flex items-center justify-end space-x-3 border-t border-gray-200 bg-gray-50/70 rounded-b-xl">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-5 py-2.5 border border-gray-300 rounded-lg text-sm font-semibold text-gray-700 bg-white hover:bg-gray-100 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        form="product-form" // This links the button to the form
                        disabled={loading || uploadingImages}
                        className="inline-flex items-center justify-center px-5 py-2.5 border border-transparent rounded-lg text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading || uploadingImages ? (
                            <FaSpinner className="animate-spin -ml-1 mr-2 h-4 w-4" />
                        ) : (
                            <FaSave className="-ml-1 mr-2 h-4 w-4" />
                        )}
                        <span>{loading ? 'Saving...' : 'Save Product'}</span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductForm;