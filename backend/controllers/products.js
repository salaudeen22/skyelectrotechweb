const mongoose = require('mongoose');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendResponse, sendError, asyncHandler, paginate, getPaginationMeta, generateSKU } = require('../utils/helpers');

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 12,
    category,
    brand,
    minPrice,
    maxPrice,
    rating,
    sort = '-createdAt',
    search,
    featured
  } = req.query;

  // Build query
  const query = { isActive: true };

  // Category filter
  if (category) {
    // Check if category is an ObjectId or a category name
    if (mongoose.Types.ObjectId.isValid(category)) {
      query.category = category;
    } else {
      // If it's a category name, find the category ObjectId
      const categoryDoc = await Category.findOne({ 
        name: { $regex: new RegExp(`^${category}$`, 'i') },
        isActive: true 
      });
      if (categoryDoc) {
        query.category = categoryDoc._id;
      } else {
        // If category not found, return empty results
        query.category = new mongoose.Types.ObjectId();
      }
    }
  }

  // Brand filter
  if (brand) {
    query.brand = { $regex: brand, $options: 'i' };
  }

  // Price range filter
  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  // Rating filter
  if (rating) {
    query['ratings.average'] = { $gte: parseFloat(rating) };
  }

  // Featured filter
  if (featured === 'true') {
    query.isFeatured = true;
  }

  // Search filter
  if (search) {
    console.log('Search query:', search);
    query.$text = { $search: search };
  }

  // Pagination
  const { skip, limit: pageLimit } = paginate(page, limit);

  // Execute query
  let sortOptions = sort;
  
  // If search is active, sort by text score first, then by the specified sort
  if (search) {
    sortOptions = { score: { $meta: 'textScore' }, [sort.replace('-', '')]: sort.startsWith('-') ? -1 : 1 };
  }
  
  console.log('Final query:', JSON.stringify(query, null, 2));
  console.log('Sort options:', sortOptions);
  
  const products = await Product.find(query)
    .populate('category', 'name')
    .sort(sortOptions)
    .skip(skip)
    .limit(pageLimit)
    .lean();

  // Get total count for pagination
  const total = await Product.countDocuments(query);

  // Generate pagination metadata
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    products,
    pagination
  }, 'Products retrieved successfully');
});

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name description')
    .populate('reviews.user', 'name avatar')
    .populate('createdBy', 'name')
    .lean();

  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  sendResponse(res, 200, { product }, 'Product retrieved successfully');
});

// @desc    Create new product
// @route   POST /api/products
// @access  Private (Admin only)
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    description,
    price,
    originalPrice,
    discount,
    category,
    brand,
    specifications,
    features,
    tags,
    dimensions,
    warranty,
    isFeatured,
    images
  } = req.body;

  // Check if category exists
  const categoryExists = await Category.findById(category);
  if (!categoryExists) {
    return sendError(res, 400, 'Invalid category');
  }

  // Generate SKU if not provided
  let sku = req.body.sku;
  if (!sku) {
    sku = generateSKU(categoryExists.name, brand || 'GENERIC', name);
  }

  // Check if SKU already exists
  const existingSKU = await Product.findOne({ sku });
  if (existingSKU) {
    return sendError(res, 400, 'Product with this SKU already exists');
  }

  const product = await Product.create({
    name,
    description,
    price,
    originalPrice,
    discount,
    category,
    brand,
    sku,
    specifications,
    features,
    tags,
    dimensions,
    warranty,
    isFeatured,
    images: images || [], // Add images array
    createdBy: req.user._id
  });

  await product.populate('category', 'name');

  sendResponse(res, 201, { product }, 'Product created successfully');
});

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private (Admin only)
const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  // If category is being updated, verify it exists
  if (req.body.category && req.body.category !== product.category.toString()) {
    const categoryExists = await Category.findById(req.body.category);
    if (!categoryExists) {
      return sendError(res, 400, 'Invalid category');
    }
  }

  // If SKU is being updated, check uniqueness
  if (req.body.sku && req.body.sku !== product.sku) {
    const existingSKU = await Product.findOne({ 
      sku: req.body.sku, 
      _id: { $ne: product._id } 
    });
    if (existingSKU) {
      return sendError(res, 400, 'Product with this SKU already exists');
    }
  }

  // Update product
  req.body.updatedBy = req.user._id;
  product = await Product.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true }
  ).populate('category', 'name');

  sendResponse(res, 200, { product }, 'Product updated successfully');
});

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private (Admin only)
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  // Soft delete - just set isActive to false
  await Product.findByIdAndUpdate(req.params.id, { isActive: false });

  sendResponse(res, 200, null, 'Product deleted successfully');
});

// @desc    Add product review
// @route   POST /api/products/:id/reviews
// @access  Private
const addProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;

  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // Check if user has already reviewed this product
  const existingReview = product.reviews.find(
    review => review.user.toString() === req.user._id.toString()
  );

  if (existingReview) {
    return sendError(res, 400, 'You have already reviewed this product');
  }

  // Add review
  const review = {
    user: req.user._id,
    rating,
    comment
  };

  product.reviews.push(review);

  // Update ratings
  const totalRatings = product.reviews.length;
  const totalScore = product.reviews.reduce((sum, review) => sum + review.rating, 0);
  
  product.ratings.average = totalScore / totalRatings;
  product.ratings.count = totalRatings;

  await product.save();

  sendResponse(res, 201, { review }, 'Review added successfully');
});

// @desc    Delete product review
// @route   DELETE /api/products/:id/reviews/:reviewId
// @access  Private
const deleteProductReview = asyncHandler(async (req, res) => {
  const { id: productId, reviewId } = req.params;

  const product = await Product.findById(productId);

  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  const review = product.reviews.id(reviewId);

  if (!review) {
    return sendError(res, 404, 'Review not found');
  }

  // Check if user owns the review or is admin
  if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to delete this review');
  }

  // Remove review
  product.reviews.pull(reviewId);

  // Update ratings
  if (product.reviews.length > 0) {
    const totalScore = product.reviews.reduce((sum, review) => sum + review.rating, 0);
    product.ratings.average = totalScore / product.reviews.length;
    product.ratings.count = product.reviews.length;
  } else {
    product.ratings.average = 0;
    product.ratings.count = 0;
  }

  await product.save();

  sendResponse(res, 200, null, 'Review deleted successfully');
});

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  const products = await Product.find({ 
    isActive: true, 
    isFeatured: true 
  })
    .populate('category', 'name')
    .sort('-createdAt')
    .limit(parseInt(limit))
    .lean();

  sendResponse(res, 200, { products }, 'Featured products retrieved successfully');
});

// @desc    Search products
// @route   GET /api/products/search
// @access  Public
const searchProducts = asyncHandler(async (req, res) => {
  const { q, page = 1, limit = 12 } = req.query;

  if (!q || q.trim().length === 0) {
    return sendError(res, 400, 'Search query is required');
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const query = {
    isActive: true,
    $text: { $search: q }
  };

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort({ score: { $meta: 'textScore' } })
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Product.countDocuments(query);
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    products,
    pagination,
    searchQuery: q
  }, 'Search results retrieved successfully');
});

// @desc    Get products by category
// @route   GET /api/products/category/:categoryId
// @access  Public
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { categoryId } = req.params;
  const { page = 1, limit = 12, sort = '-createdAt' } = req.query;

  // Check if category exists
  const category = await Category.findById(categoryId);
  if (!category) {
    return sendError(res, 404, 'Category not found');
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const query = {
    category: categoryId,
    isActive: true
  };

  const products = await Product.find(query)
    .populate('category', 'name')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Product.countDocuments(query);
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    products,
    pagination,
    category
  }, 'Category products retrieved successfully');
});

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  addProductReview,
  deleteProductReview,
  getFeaturedProducts,
  searchProducts,
  getProductsByCategory
};
