const Category = require('../models/Category');
const Product = require('../models/Product');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get all categories with hierarchy
// @route   GET /api/categories
// @access  Public
const getCategories = asyncHandler(async (req, res) => {
  const { active = 'true', includeSubcategories = 'true' } = req.query;

  const query = active === 'true' ? { isActive: true } : {};

  let categories;
  
  if (includeSubcategories === 'true') {
    // Get all categories with their subcategories
    const allCategories = await Category.find(query)
      .populate('createdBy', 'name')
      .populate('parentCategory', 'name')
      .sort({ order: 1, name: 1 })
      .lean();

    // Organize into hierarchy
    const mainCategories = allCategories.filter(cat => !cat.parentCategory);
    
    const categoriesWithSubcategories = await Promise.all(
      mainCategories.map(async (category) => {
        const subcategories = allCategories.filter(cat => 
          cat.parentCategory && cat.parentCategory._id.toString() === category._id.toString()
        );
        
        const productCount = await Product.countDocuments({ 
          category: category._id, 
          isActive: true 
        });
        
        const subcategoriesWithCount = await Promise.all(
          subcategories.map(async (subcat) => {
            const subProductCount = await Product.countDocuments({ 
              category: subcat._id, 
              isActive: true 
            });
            return {
              ...subcat,
              productCount: subProductCount
            };
          })
        );

        return {
          ...category,
          productCount,
          subcategories: subcategoriesWithCount
        };
      })
    );

    categories = categoriesWithSubcategories;
  } else {
    // Get only main categories
    categories = await Category.find({ ...query, parentCategory: null })
      .populate('createdBy', 'name')
      .sort({ order: 1, name: 1 })
      .lean();

    // Add product count for each category
    categories = await Promise.all(
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
  }

  sendResponse(res, 200, { 
    categories 
  }, 'Categories retrieved successfully');
});

// @desc    Get single category with subcategories
// @route   GET /api/categories/:id
// @access  Public
const getCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id)
    .populate('createdBy', 'name')
    .populate('parentCategory', 'name')
    .lean();

  if (!category || !category.isActive) {
    return sendError(res, 404, 'Category not found');
  }

  // Get subcategories if this is a main category
  let subcategories = [];
  if (!category.parentCategory) {
    subcategories = await Category.find({ 
      parentCategory: category._id, 
      isActive: true 
    }).populate('createdBy', 'name').lean();
    
    // Add product count for subcategories
    subcategories = await Promise.all(
      subcategories.map(async (subcat) => {
        const subProductCount = await Product.countDocuments({ 
          category: subcat._id, 
          isActive: true 
        });
        return {
          ...subcat,
          productCount: subProductCount
        };
      })
    );
  }

  // Get product count for this category
  const productCount = await Product.countDocuments({ 
    category: category._id, 
    isActive: true 
  });

  sendResponse(res, 200, { 
    category: {
      ...category,
      productCount,
      subcategories
    }
  }, 'Category retrieved successfully');
});

// @desc    Create new category or subcategory
// @route   POST /api/categories
// @access  Private (Admin only)
const createCategory = asyncHandler(async (req, res) => {
  const { name, description, image, parentCategory, order } = req.body;

  // Check if category with same name exists in the same parent level
  const existingQuery = { 
    name: { $regex: new RegExp(`^${name}$`, 'i') },
    parentCategory: parentCategory || null
  };
  
  const existingCategory = await Category.findOne(existingQuery);

  if (existingCategory) {
    const level = parentCategory ? 'subcategory' : 'category';
    return sendError(res, 400, `A ${level} with this name already exists`);
  }

  // If this is a subcategory, validate parent exists
  if (parentCategory) {
    const parent = await Category.findById(parentCategory);
    if (!parent || !parent.isActive) {
      return sendError(res, 400, 'Parent category not found or inactive');
    }
  }

  const categoryData = {
    name,
    description,
    createdBy: req.user._id,
    parentCategory: parentCategory || null,
    isMainCategory: !parentCategory,
    order: order || 0
  };

  // Add image if provided
  if (image) {
    categoryData.image = image;
  }

  const category = await Category.create(categoryData);

  await category.populate('createdBy', 'name');
  if (parentCategory) {
    await category.populate('parentCategory', 'name');
  }

  sendResponse(res, 201, { category }, 'Category created successfully');
});

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
const updateCategory = asyncHandler(async (req, res) => {
  const { name, description, isActive, image, parentCategory, order } = req.body;

  let category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if another category with same name exists in the same parent level
  if (name && name !== category.name) {
    const existingCategory = await Category.findOne({
      name: { $regex: new RegExp(`^${name}$`, 'i') },
      _id: { $ne: category._id },
      parentCategory: parentCategory !== undefined ? parentCategory : category.parentCategory
    });

    if (existingCategory) {
      const level = parentCategory ? 'subcategory' : 'category';
      return sendError(res, 400, `Another ${level} with this name already exists`);
    }
  }

  // If changing parent category, validate it exists
  if (parentCategory !== undefined && parentCategory !== null) {
    const parent = await Category.findById(parentCategory);
    if (!parent || !parent.isActive) {
      return sendError(res, 400, 'Parent category not found or inactive');
    }
  }

  // Prepare update data
  const updateData = {
    name: name || category.name,
    description: description !== undefined ? description : category.description,
    isActive: isActive !== undefined ? isActive : category.isActive,
    parentCategory: parentCategory !== undefined ? parentCategory : category.parentCategory,
    isMainCategory: parentCategory !== undefined ? !parentCategory : category.isMainCategory,
    order: order !== undefined ? order : category.order
  };

  // Update image if provided
  if (image) {
    updateData.image = image;
  }

  // Update category
  category = await Category.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true, runValidators: true }
  ).populate('createdBy', 'name').populate('parentCategory', 'name');

  sendResponse(res, 200, { category }, 'Category updated successfully');
});

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
const deleteCategory = asyncHandler(async (req, res) => {
  const { force = false } = req.query;
  const category = await Category.findById(req.params.id);

  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  // Check if category has products
  const productCount = await Product.countDocuments({ 
    category: category._id, 
    isActive: true 
  });

  if (productCount > 0 && !force) {
    return sendError(res, 400, 
      `Cannot delete category. It has ${productCount} active products. Please move or delete products first, or use force delete.`
    );
  }

  // Check if category has subcategories
  const subcategoryCount = await Category.countDocuments({
    parentCategory: category._id,
    isActive: true
  });

  if (subcategoryCount > 0 && !force) {
    return sendError(res, 400,
      `Cannot delete category. It has ${subcategoryCount} active subcategories. Please delete subcategories first, or use force delete.`
    );
  }

  // If force delete, also deactivate associated products and subcategories
  if (force) {
    // Deactivate all products in this category
    await Product.updateMany(
      { category: category._id },
      { isActive: false }
    );
    
    // Deactivate all subcategories
    await Category.updateMany(
      { parentCategory: category._id },
      { isActive: false }
    );
  }

  // Hard delete - permanently remove from database
  await Category.findByIdAndDelete(req.params.id);

  const message = force 
    ? `Category and all associated products/subcategories deleted successfully`
    : 'Category deleted successfully';

  sendResponse(res, 200, null, message);
});

module.exports = {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
};
