const Category = require('../models/Category');
const Product = require('../models/Product');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { active = true } = req.query;

  const query = active === 'true' ? { isActive: true } : {};

  const categories = await Category.find(query)
    .populate('createdBy', 'name')
    .sort('name')
    .lean();

  // Add product count for each category
  const categoriesWithCount = await Promise.all(
    categories.map(async (category) => {
      const productCount = await Product.countDocuments({ 
        category: category._id, 
        isActive: true 
      });
      return {
        ...category,
        productCount
      };
    })
  );

  sendResponse(res, 200, { 
    categories: categoriesWithCount 
  }, 'Categories retrieved successfully');
});

// @desc    Get single category
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('createdBy', 'name')
    .lean();

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  // Get product count
  const productCount = await Product.countDocuments({ 
    category: category._id, 
    isActive: true 
  });

  sendResponse(res, 200, { 
    category: {
      ...category,
      productCount
    }
  }, 'Category retrieved successfully');
});

// @desc    Create new category
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  // Check if category with same name exists
  const existingCategory = await Category.findOne({ 
    name: { $regex: new RegExp(`^${name}$`, 'i') } 
  });

  if (existingCategory) {
    return sendError(res, 400, 'Category with this name already exists');
  }

  const category = await Category.create({
    name,
    description,
    createdBy: req.user._id
  });

  await category.populate('createdBy', 'name');

  sendResponse(res, 201, { category }, 'Category created successfully');
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive } = req.body;

  let category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if another category with same name exists
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: category._id }
    });

    if (existingCategory) {
      return sendError(res, 400, 'Category with this name already exists');
    }
  }

  // Update category
  category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      isActive: isActive !== undefined ? isActive : category.isActive
    },
    { new: true, runValidators: true }
  ).populate('createdBy', 'name');

  sendResponse(res, 200, { category }, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ 
    category: category._id, 
    isActive: true 
  });

  if (productCount > 0) {
    return sendError(res, 400, 
      `Cannot delete category. It has ${productCount} active products. Please move or delete products first.`
    );
  }

  // Soft delete - set isActive to false
  await Category.findByIdAndUpdate(req.params.id, { isActive: false });

  sendResponse(res, 200, null, 'Category deleted successfully');
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
