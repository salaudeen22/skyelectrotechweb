import React, { useState, useEffect, useMemo } from 'react';
import { FaPlus, FaSearch, FaPencilAlt, FaTrashAlt, FaTimes, FaImage, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { categoriesAPI, uploadAPI } from '../services/apiServices';
import { useCategories } from '../hooks/useCategories';
import toast from 'react-hot-toast';

const CategoriesManagement = () => {
  const { refreshCategories: refreshGlobalCategories } = useCategories();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [parentCategory, setParentCategory] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await categoriesAPI.getCategories();
      if (response.success) {
        setCategories(response.data.categories);
        // Also refresh the global categories context
        refreshGlobalCategories();
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
  const filteredCategories = useMemo(() => 
    categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (category.subcategories && category.subcategories.some(sub => 
        sub.name.toLowerCase().includes(searchTerm.toLowerCase())
      ))
    ),
    [categories, searchTerm]
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
  const paginatedCategories = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredCategories.slice(startIndex, endIndex);
  }, [filteredCategories, currentPage, itemsPerPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

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

  const handleSave = async () => {
    await fetchCategories();
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
    <div className="p-2 sm:p-4 lg:p-6 max-w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="min-w-0 flex-1">
          <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Categories Management</h1>
          <p className="text-gray-600 text-xs sm:text-sm lg:text-base">Manage product categories with images for homepage display</p>
        </div>
        <button
          onClick={handleCreate}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors whitespace-nowrap text-sm sm:text-base"
        >
          <FaPlus className="w-3 h-3 sm:w-4 sm:h-4" />
          <span className="hidden xs:inline">Add Category</span>
          <span className="xs:hidden">Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-4 sm:mb-6">
        <div className="relative">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-3 h-3 sm:w-4 sm:h-4" />
          <input
            type="text"
            placeholder="Search categories..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full pl-8 sm:pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
          />
        </div>
      </div>

      {/* Categories Grid */}
      <div className="space-y-4 sm:space-y-6">
        {paginatedCategories.map((category) => (
          <div key={category._id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
            {/* Main Category */}
            <div className="p-3 sm:p-4 lg:p-6 border-b border-gray-100">
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-start space-x-3 sm:space-x-4 flex-1 min-w-0">
                  {/* Category Image */}
                  <div className="w-16 h-16 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {category.image?.url ? (
                      <img
                        src={category.image.url}
                        alt={category.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.src = 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png';
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gray-200">
                        <FaImage className="w-6 h-6 sm:w-6 sm:h-6 lg:w-8 lg:h-8 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Category Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col gap-2 mb-3">
                      <h3 className="text-lg sm:text-lg font-semibold text-gray-900">{category.name}</h3>
                      <div className="flex flex-wrap gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {category.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                          {category.productCount || 0} products
                        </span>
                      </div>
                    </div>
                    {category.description && (
                      <p className="text-gray-600 text-sm mb-2 line-clamp-2">{category.description}</p>
                    )}
                    <p className="text-xs text-gray-500">Created by {category.createdBy?.name}</p>
                  </div>
                </div>

                {/* Action buttons - Full width on mobile */}
                <div className="flex items-center gap-2 sm:gap-3 pt-2 border-t border-gray-100 sm:border-t-0 sm:pt-0">
                  <button
                    onClick={() => handleCreateSubcategory(category)}
                    className="flex-1 sm:flex-none px-3 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                    title="Add Subcategory"
                  >
                    <FaPlus className="w-3 h-3" />
                    <span>Add Subcategory</span>
                  </button>
                  <button
                    onClick={() => handleEdit(category)}
                    className="px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200"
                    title="Edit Category"
                  >
                    <FaPencilAlt className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(category._id)}
                    className="px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200"
                    title="Delete Category"
                  >
                    <FaTrashAlt className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Subcategories */}
            {category.subcategories && category.subcategories.length > 0 && (
              <div className="bg-gray-50 px-3 sm:px-6 py-3 sm:py-4">
                <h4 className="text-sm font-medium text-gray-700 mb-3">
                  Subcategories ({category.subcategories.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory._id} className="bg-white p-3 rounded-lg border border-gray-200">
                      <div className="space-y-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col gap-2 mb-2">
                            <h5 className="font-medium text-gray-900 text-sm">{subcategory.name}</h5>
                            <div className="flex flex-wrap gap-1">
                              <span className={`px-2 py-1 rounded-full text-xs ${
                                subcategory.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {subcategory.isActive ? 'Active' : 'Inactive'}
                              </span>
                              <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs">
                                {subcategory.productCount || 0} products
                              </span>
                            </div>
                          </div>
                          {subcategory.description && (
                            <p className="text-gray-600 text-xs mb-2 line-clamp-2">{subcategory.description}</p>
                          )}
                        </div>
                        
                        {/* Mobile-friendly action buttons */}
                        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                          <button
                            onClick={() => handleEdit(subcategory)}
                            className="flex-1 px-3 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-blue-200 flex items-center justify-center gap-1 text-xs"
                            title="Edit Subcategory"
                          >
                            <FaPencilAlt className="w-3 h-3" />
                            <span>Edit</span>
                          </button>
                          <button
                            onClick={() => handleDelete(subcategory._id)}
                            className="flex-1 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-200 flex items-center justify-center gap-1 text-xs"
                            title="Delete Subcategory"
                          >
                            <FaTrashAlt className="w-3 h-3" />
                            <span>Delete</span>
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

      {/* Pagination Controls */}
      {filteredCategories.length > 0 && (
        <div className="bg-white border-t border-slate-200 px-4 py-4 sm:px-6 rounded-lg shadow-md">
          {/* Mobile Pagination */}
          <div className="md:hidden">
            <div className="text-sm text-slate-500 text-center mb-3">
              Page {currentPage} of {totalPages} ({filteredCategories.length} categories)
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
              Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredCategories.length)} of {filteredCategories.length} categories
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

      {filteredCategories.length === 0 && !loading && (
        <div className="text-center py-8 sm:py-12">
          <FaImage className="w-12 h-12 sm:w-16 sm:h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">No categories found</h3>
          <p className="text-gray-500 mb-4 text-sm sm:text-base">
            {searchTerm ? 'Try adjusting your search terms.' : 'Get started by creating your first category.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleCreate}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg inline-flex items-center gap-2 text-sm sm:text-base"
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
          imageData = uploadResponse.data;
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
        onClose();
      } else {
        toast.error(response.message || `Failed to ${isEditing ? 'update' : 'create'} ${isSubcategory ? 'subcategory' : 'category'}`);
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
    <div className="fixed inset-0 backdrop-blur-sm bg-black/30 flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between p-4 sm:p-6 border-b sticky top-0 bg-white">
          <div className="flex-1 pr-4">
            <h2 className="text-lg sm:text-xl font-semibold">
              {isEditing 
                ? `Edit ${isSubcategory ? 'Subcategory' : 'Category'}` 
                : `Create ${isSubcategory ? 'Subcategory' : 'Category'}`
              }
            </h2>
            {parentCategory && !isEditing && (
              <p className="text-sm font-normal text-gray-600 mt-1">
                under "{parentCategory.name}"
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 -mr-2 -mt-2 rounded-lg"
          >
            <FaTimes className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-3 sm:space-y-4">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
                    className="w-full h-24 sm:h-32 object-cover rounded-lg border"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
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
          <div className="flex gap-3 pt-6 sticky bottom-0 bg-white border-t border-gray-100 -mx-4 sm:-mx-6 px-4 sm:px-6 py-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || uploadingImage}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 text-base font-medium"
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
