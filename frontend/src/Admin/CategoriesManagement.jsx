import React, { useState, useEffect } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes, FaImage } from 'react-icons/fa';
import { categoriesAPI, uploadAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const CategoriesManagement = () => {
  const [categories, setCategories] = useState([]);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
        setFilteredCategories(response.data.categories);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Filter categories based on search
  useEffect(() => {
    const filtered = categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.subcategories && category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleCreate = () => {
    setSelectedCategory(null);
    setParentCategory(null);
    setShowModal(true);
  };

  const handleCreateSubcategory = (category) => {
    setSelectedCategory(null);
    setParentCategory(category);
    setShowModal(true);
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setParentCategory(null);
    setShowModal(true);
  };

  const handleDelete = async (categoryId, forceDelete = false) => {
    const confirmMessage = forceDelete 
      ? 'Are you sure you want to force delete this category? This will also deactivate all associated products and subcategories.'
      : 'Are you sure you want to delete this category?';
      
    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await categoriesAPI.deleteCategory(categoryId, forceDelete);
      if (response.success) {
        toast.success(response.message || 'Category deleted successfully');
        fetchCategories();
      } else {
        toast.error(response.message || 'Failed to delete category');
      }
    } catch (error) {
      console.error('Error deleting category:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to delete category';
      
      // If deletion failed due to products/subcategories, offer force delete option
      if (errorMessage.includes('active products') || errorMessage.includes('active subcategories')) {
        const forceConfirm = window.confirm(
          `${errorMessage}\n\nWould you like to force delete this category and deactivate all associated products/subcategories?`
        );
        if (forceConfirm) {
          handleDelete(categoryId, true);
          return;
        }
      }
      
      toast.error(errorMessage);
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCategory(null);
    setParentCategory(null);
  };

  const handleSave = () => {
    fetchCategories();
    handleModalClose();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="text-gray-600 text-sm sm:text-base">Manage product categories with images for homepage display</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
        >
          <FaPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-6">
        {filteredCategories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Main Category */}
            <div className="p-4 sm:p-6 border-b border-gray-100">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  {/* Category Image */}
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {category.image?.url ? (
                      <img
                        src={category.image.url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = '/api/placeholder/400/300';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaImage className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {category.isActive ? 'Active' : 'Inactive'}
                      </span>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                        {category.productCount || 0} products
                      </span>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-2">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500">Created by {category.createdBy?.name}</p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                  <button
                    onClick={() => handleCreateSubcategory(category)}
                    className="px-2 sm:px-3 py-1.5 bg-green-600 text-white text-xs sm:text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center gap-1"
                    title="Add Subcategory"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span className="hidden sm:inline">Sub</span>
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Edit Category"
                  >
                    <FaPencilAlt className="w-3 h-3 sm:w-4 sm:h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete Category"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="bg-gray-50 px-6 py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Subcategories ({category.subcategories.length})
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory._id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h5 className="font-medium text-gray-900 text-sm">{subcategory.name}</h5>
                            <span className={`px-1.5 py-0.5 rounded-full text-xs ${
                              subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {subcategory.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </div>
                          {subcategory.description && (
                            <p className="text-gray-600 text-xs mb-1 line-clamp-2">{subcategory.description}</p>
                          )}
                          <div className="flex items-center justify-between text-xs text-gray-500">
                            <span>{subcategory.productCount || 0} products</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-1 ml-2">
                          <button
                            onClick={() => handleEdit(subcategory)}
                            className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                            title="Edit Subcategory"
                          >
                            <FaPencilAlt className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => handleDelete(subcategory._id)}
                            className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete Subcategory"
                          >
                            <FaTrashAlt className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-12">
          <FaImage className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first category.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2"
            >
              <FaPlus className="w-4 h-4" />
              Add Category
            </button>
          )}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <CategoryModal
          category={selectedCategory}
          parentCategory={parentCategory}
          allCategories={categories}
          onClose={handleModalClose}
          onSave={handleSave}
        />
      )}
    </div>
  );
};

// Category Modal Component
const CategoryModal = ({ category, parentCategory, allCategories, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    name: category?.name || '',
    description: category?.description || '',
    isActive: category?.isActive ?? true,
    parentCategory: category?.parentCategory?._id || parentCategory?._id || '',
    order: category?.order || 0
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(category?.image?.url || '');
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  const isEditing = !!category;
  const isSubcategory = !!formData.parentCategory;

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Category name is required');
      return;
    }

    try {
      setLoading(true);
      let imageData = category?.image;

      // Upload image if a new one is selected
      if (imageFile) {
        setUploadingImage(true);
        const uploadResponse = await uploadAPI.uploadSingle(imageFile, 'categories');
        if (uploadResponse.success) {
          imageData = uploadResponse.data.image;
        }
        setUploadingImage(false);
      }

      const categoryData = {
        ...formData,
        parentCategory: formData.parentCategory || null,
        ...(imageData && { image: imageData })
      };

      let response;
      if (isEditing) {
        response = await categoriesAPI.updateCategory(category._id, categoryData);
      } else {
        response = await categoriesAPI.createCategory(categoryData);
      }

      if (response.success) {
        toast.success(`${isSubcategory ? 'Subcategory' : 'Category'} ${isEditing ? 'updated' : 'created'} successfully`);
        onSave();
      }
    } catch (error) {
      console.error('Error saving category:', error);
      toast.error(`Failed to ${isEditing ? 'update' : 'create'} ${isSubcategory ? 'subcategory' : 'category'}`);
    } finally {
      setLoading(false);
      setUploadingImage(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold">
            {isEditing 
              ? `Edit ${isSubcategory ? 'Subcategory' : 'Category'}` 
              : `Create ${isSubcategory ? 'Subcategory' : 'Category'}`
            }
            {parentCategory && !isEditing && (
              <span className="text-sm font-normal text-gray-600 ml-2">
                under "{parentCategory.name}"
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Parent Category Selection */}
          {!parentCategory && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Parent Category
              </label>
              <select
                name="parentCategory"
                value={formData.parentCategory}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Main Category (No Parent)</option>
                {allCategories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Leave empty to create a main category, or select a parent to create a subcategory
              </p>
            </div>
          )}

          {/* Order */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Display Order
            </label>
            <input
              type="number"
              name="order"
              value={formData.order}
              onChange={handleInputChange}
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="0"
            />
            <p className="text-xs text-gray-500 mt-1">
              Lower numbers appear first
            </p>
          </div>
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Category Image
            </label>
            <div className="space-y-3">
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="w-full h-32 object-cover rounded-lg border"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImagePreview('');
                      setImageFile(null);
                    }}
                    className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category name"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter category description"
            />
          </div>

          {/* Active Status */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isActive"
              checked={formData.isActive}
              onChange={handleInputChange}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Active Category
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? (uploadingImage ? 'Uploading...' : 'Saving...') : isEditing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CategoriesManagement;
