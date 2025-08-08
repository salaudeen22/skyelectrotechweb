const UserBehavior = require('../models/UserBehavior');
const Product = require('../models/Product');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Track product view
// @route   POST /api/recommendations/track-view
// @access  Private
const trackProductView = asyncHandler(async (req, res) => {
  const { productId } = req.body;
  const userId = req.user._id;

  if (!productId) {
    return sendError(res, 400, 'Product ID is required');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // Find or create user behavior record
  let userBehavior = await UserBehavior.findOne({ user: userId });
  
  if (!userBehavior) {
    userBehavior = new UserBehavior({ user: userId });
  }

  // Add to recently viewed
  userBehavior.addRecentlyViewed(productId);
  
  // Add interaction
  userBehavior.addInteraction(productId, 'view');

  await userBehavior.save();

  sendResponse(res, 200, null, 'Product view tracked successfully');
});

// @desc    Track product interaction
// @route   POST /api/recommendations/track-interaction
// @access  Private
const trackInteraction = asyncHandler(async (req, res) => {
  const { productId, action, metadata } = req.body;
  const userId = req.user._id;

  if (!productId || !action) {
    return sendError(res, 400, 'Product ID and action are required');
  }

  // Validate action
  const validActions = ['view', 'cart_add', 'purchase', 'wishlist_add', 'search'];
  if (!validActions.includes(action)) {
    return sendError(res, 400, 'Invalid action');
  }

  // Check if product exists
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // Find or create user behavior record
  let userBehavior = await UserBehavior.findOne({ user: userId });
  
  if (!userBehavior) {
    userBehavior = new UserBehavior({ user: userId });
  }

  // Add interaction
  userBehavior.addInteraction(productId, action, metadata);

  await userBehavior.save();

  sendResponse(res, 200, null, 'Interaction tracked successfully');
});

// @desc    Get recently viewed products
// @route   GET /api/recommendations/recently-viewed
// @access  Private
const getRecentlyViewed = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 8 } = req.query;

  const userBehavior = await UserBehavior.findOne({ user: userId })
    .populate({
      path: 'recentlyViewed.product',
      match: { isActive: true },
      populate: { path: 'category', select: 'name' }
    })
    .lean();

  if (!userBehavior) {
    return sendResponse(res, 200, { products: [] }, 'No recently viewed products');
  }

  // Filter out inactive products and get the most recent ones
  const recentlyViewed = userBehavior.recentlyViewed
    .filter(item => item.product && item.product.isActive)
    .slice(0, parseInt(limit))
    .map(item => ({
      ...item.product,
      viewedAt: item.viewedAt,
      viewCount: item.viewCount
    }));

  sendResponse(res, 200, { products: recentlyViewed }, 'Recently viewed products retrieved successfully');
});

// @desc    Get product recommendations
// @route   GET /api/recommendations
// @access  Private
const getRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { limit = 8 } = req.query;

  const recommendations = await UserBehavior.getRecommendations(userId, parseInt(limit));

  sendResponse(res, 200, { products: recommendations }, 'Recommendations retrieved successfully');
});

// @desc    Get personalized recommendations based on category
// @route   GET /api/recommendations/category/:categoryId
// @access  Private
const getCategoryRecommendations = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { categoryId } = req.params;
  const { limit = 8 } = req.query;

  // Get user behavior to understand preferences
  const userBehavior = await UserBehavior.findOne({ user: userId })
    .populate('recentlyViewed.product')
    .populate('interactions.product')
    .lean();

  // Get products in the specified category
  const categoryProducts = await Product.find({
    category: categoryId,
    isActive: true,
    _id: { $ne: userId } // Exclude current user's products if any
  })
  .populate('category', 'name')
  .lean();

  if (!userBehavior || categoryProducts.length === 0) {
    return sendResponse(res, 200, { products: categoryProducts.slice(0, parseInt(limit)) }, 'Category products retrieved');
  }

  // Get user's viewed products in this category
  const viewedInCategory = userBehavior.recentlyViewed
    .filter(item => item.product && item.product.category && item.product.category.toString() === categoryId)
    .map(item => item.product._id);

  // Score products based on user's behavior
  const scoredProducts = categoryProducts.map(product => {
    let score = 0;
    
    // Higher score for products not recently viewed
    if (!viewedInCategory.includes(product._id)) {
      score += 5;
    }
    
    // Check brand preference
    if (userBehavior.preferences.brands) {
      const userBrands = userBehavior.preferences.brands.map(b => b.brand);
      if (product.brand && userBrands.includes(product.brand)) {
        score += 3;
      }
    }
    
    // Check tag preferences
    if (userBehavior.preferences.tags && product.tags) {
      const userTags = userBehavior.preferences.tags.map(t => t.tag);
      const matchingTags = product.tags.filter(tag => userTags.includes(tag));
      score += matchingTags.length * 2;
    }
    
    // Price range preference
    if (userBehavior.preferences.priceRange) {
      const { min, max } = userBehavior.preferences.priceRange;
      if (product.price >= min && product.price <= max) {
        score += 2;
      }
    }

    return { product, score };
  });

  // Sort by score and return top results
  const recommendations = scoredProducts
    .sort((a, b) => b.score - a.score)
    .slice(0, parseInt(limit))
    .map(item => item.product);

  sendResponse(res, 200, { products: recommendations }, 'Category recommendations retrieved successfully');
});

// @desc    Get trending products (based on sales, searches, wishlist, and recent activity)
// @route   GET /api/recommendations/trending
// @access  Public
const getTrendingProducts = asyncHandler(async (req, res) => {
  const { limit = 8 } = req.query;

  // Get products with most activity in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trendingProducts = await UserBehavior.aggregate([
    {
      $unwind: '$interactions'
    },
    {
      $match: {
        'interactions.timestamp': { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: '$interactions.product',
        totalInteractions: { $sum: 1 },
        viewCount: {
          $sum: {
            $cond: [{ $eq: ['$interactions.action', 'view'] }, 1, 0]
          }
        },
        searchCount: {
          $sum: {
            $cond: [{ $eq: ['$interactions.action', 'search'] }, 1, 0]
          }
        },
        wishlistCount: {
          $sum: {
            $cond: [{ $eq: ['$interactions.action', 'wishlist_add'] }, 1, 0]
          }
        },
        cartAddCount: {
          $sum: {
            $cond: [{ $eq: ['$interactions.action', 'cart_add'] }, 1, 0]
          }
        },
        purchaseCount: {
          $sum: {
            $cond: [{ $eq: ['$interactions.action', 'purchase'] }, 1, 0]
          }
        }
      }
    },
    {
      $addFields: {
        // Calculate trending score based on different activities
        trendingScore: {
          $add: [
            { $multiply: ['$purchaseCount', 10] },      // Purchases get highest weight
            { $multiply: ['$cartAddCount', 5] },        // Cart additions get medium weight
            { $multiply: ['$wishlistCount', 3] },       // Wishlist gets medium weight
            { $multiply: ['$searchCount', 2] },         // Searches get lower weight
            { $multiply: ['$viewCount', 1] }            // Views get lowest weight
          ]
        }
      }
    },
    {
      $sort: {
        trendingScore: -1,
        purchaseCount: -1,
        cartAddCount: -1,
        wishlistCount: -1
      }
    },
    {
      $limit: parseInt(limit)
    }
  ]);

  // Get product details
  const productIds = trendingProducts.map(item => item._id);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true
  })
  .populate('category', 'name')
  .lean();

  // Map products with their trending data
  const productsWithTrendingData = products.map(product => {
    const trendingData = trendingProducts.find(item => item._id.toString() === product._id.toString());
    return {
      ...product,
      trendingScore: trendingData ? trendingData.trendingScore : 0,
      viewCount: trendingData ? trendingData.viewCount : 0,
      searchCount: trendingData ? trendingData.searchCount : 0,
      wishlistCount: trendingData ? trendingData.wishlistCount : 0,
      cartAddCount: trendingData ? trendingData.cartAddCount : 0,
      purchaseCount: trendingData ? trendingData.purchaseCount : 0
    };
  });

  // Sort by trending score
  productsWithTrendingData.sort((a, b) => b.trendingScore - a.trendingScore);

  // If no trending products, return popular products based on ratings and sales
  if (productsWithTrendingData.length === 0) {
    const popularProducts = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('-ratings.average -createdAt')
      .limit(parseInt(limit))
      .lean();

    return sendResponse(res, 200, { products: popularProducts }, 'Popular products retrieved successfully');
  }

  sendResponse(res, 200, { products: productsWithTrendingData }, 'Trending products retrieved successfully');
});

// @desc    Get similar products
// @route   GET /api/recommendations/similar/:productId
// @access  Public
const getSimilarProducts = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { limit = 8 } = req.query;

  // Get the target product
  const targetProduct = await Product.findById(productId)
    .populate('category', 'name')
    .lean();

  if (!targetProduct || !targetProduct.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // Find similar products based on category, brand, tags, and price range
  const similarProducts = await Product.find({
    _id: { $ne: productId },
    isActive: true,
    $or: [
      { category: targetProduct.category._id },
      { brand: targetProduct.brand },
      { tags: { $in: targetProduct.tags || [] } },
      {
        price: {
          $gte: targetProduct.price * 0.7,
          $lte: targetProduct.price * 1.3
        }
      }
    ]
  })
  .populate('category', 'name')
  .lean();

  // Score products based on similarity
  const scoredProducts = similarProducts.map(product => {
    let score = 0;
    
    // Category match (highest weight)
    if (product.category._id.toString() === targetProduct.category._id.toString()) {
      score += 5;
    }
    
    // Brand match
    if (product.brand === targetProduct.brand) {
      score += 3;
    }
    
    // Tag matches
    if (product.tags && targetProduct.tags) {
      const matchingTags = product.tags.filter(tag => targetProduct.tags.includes(tag));
      score += matchingTags.length * 2;
    }
    
    // Price similarity
    const priceDiff = Math.abs(product.price - targetProduct.price) / targetProduct.price;
    if (priceDiff <= 0.1) {
      score += 2;
    } else if (priceDiff <= 0.3) {
      score += 1;
    }

    return { product, score };
  });

  // Sort by score and return top results
  const recommendations = scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, parseInt(limit))
    .map(item => item.product);

  // If no similar products, return products from same category
  if (recommendations.length === 0) {
    const categoryProducts = await Product.find({
      _id: { $ne: productId },
      category: targetProduct.category._id,
      isActive: true
    })
    .populate('category', 'name')
    .sort('-ratings.average -createdAt')
    .limit(parseInt(limit))
    .lean();

    return sendResponse(res, 200, { products: categoryProducts }, 'Category products retrieved successfully');
  }

  sendResponse(res, 200, { products: recommendations }, 'Similar products retrieved successfully');
});

module.exports = {
  trackProductView,
  trackInteraction,
  getRecentlyViewed,
  getRecommendations,
  getCategoryRecommendations,
  getTrendingProducts,
  getSimilarProducts
};
