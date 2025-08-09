const mongoose = require('mongoose');

const userBehaviorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  // Recently viewed products (limited to last 20)
  recentlyViewed: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    viewedAt: {
      type: Date,
      default: Date.now
    },
    viewCount: {
      type: Number,
      default: 1
    }
  }],
  // Product interactions (clicks, cart adds, purchases)
  interactions: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    action: {
      type: String,
      enum: ['view', 'cart_add', 'purchase', 'wishlist_add', 'search'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed
    }
  }],
  // User preferences based on behavior
  preferences: {
    categories: [{
      category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
      },
      weight: {
        type: Number,
        default: 1
      }
    }],
    priceRange: {
      min: Number,
      max: Number
    },
    brands: [{
      brand: String,
      weight: {
        type: Number,
        default: 1
      }
    }],
    tags: [{
      tag: String,
      weight: {
        type: Number,
        default: 1
      }
    }]
  },
  // Session data for anonymous users
  sessionId: {
    type: String,
    index: true,
    sparse: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update timestamp on save
userBehaviorSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for efficient queries
userBehaviorSchema.index({ user: 1 });
userBehaviorSchema.index({ 'recentlyViewed.viewedAt': -1 });
userBehaviorSchema.index({ 'interactions.timestamp': -1 });

// Method to add a recently viewed product
userBehaviorSchema.methods.addRecentlyViewed = function(productId) {
  const existingIndex = this.recentlyViewed.findIndex(
    item => item.product.toString() === productId.toString()
  );

  if (existingIndex !== -1) {
    // Update existing entry
    this.recentlyViewed[existingIndex].viewedAt = new Date();
    this.recentlyViewed[existingIndex].viewCount += 1;
    
    // Move to front
    const item = this.recentlyViewed.splice(existingIndex, 1)[0];
    this.recentlyViewed.unshift(item);
  } else {
    // Add new entry at the beginning
    this.recentlyViewed.unshift({
      product: productId,
      viewedAt: new Date(),
      viewCount: 1
    });
  }

  // Keep only the last 20 items
  if (this.recentlyViewed.length > 20) {
    this.recentlyViewed = this.recentlyViewed.slice(0, 20);
  }
};

// Method to add an interaction
userBehaviorSchema.methods.addInteraction = function(productId, action, metadata = {}) {
  this.interactions.push({
    product: productId,
    action,
    timestamp: new Date(),
    metadata
  });

  // Keep only the last 100 interactions
  if (this.interactions.length > 100) {
    this.interactions = this.interactions.slice(-100);
  }
};

// Method to update user preferences based on interactions
userBehaviorSchema.methods.updatePreferences = function() {
  // This method will be implemented to analyze interactions
  // and update preferences accordingly
};

// Static method to get recommendations for a user
userBehaviorSchema.statics.getRecommendations = async function(userId, limit = 8) {
  const behavior = await this.findOne({ user: userId })
    .populate('recentlyViewed.product')
    .populate('interactions.product')
    .populate('preferences.categories.category');

  if (!behavior) {
    // If no behavior data, return popular products
    const Product = mongoose.model('Product');
    return await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('-ratings.average -createdAt')
      .limit(limit)
      .lean();
  }

  // Get product IDs from recently viewed and interactions
  const viewedProductIds = behavior.recentlyViewed.map(item => item.product._id);
  const interactionProductIds = behavior.interactions.map(item => item.product._id);
  
  // Get unique product IDs
  const allProductIds = [...new Set([...viewedProductIds, ...interactionProductIds])];

  // Get categories, brands, and tags from these products
  const Product = mongoose.model('Product');
  const products = await Product.find({ _id: { $in: allProductIds } })
    .populate('category', 'name')
    .lean();

  // Extract preferences
  const categories = [...new Set(products.map(p => p.category?._id).filter(Boolean))];
  const brands = [...new Set(products.map(p => p.brand).filter(Boolean))];
  const tags = [...new Set(products.flatMap(p => p.tags || []))];

  // Find similar products
  const recommendations = await Product.find({
    _id: { $nin: allProductIds },
    isActive: true
  })
  .populate('category', 'name')
  .lean();

  // If no user history, return popular products
  if (products.length === 0) {
    return await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('-ratings.average -createdAt')
      .limit(limit)
      .lean();
  }

  // Score products based on similarity
  const scoredProducts = recommendations.map(product => {
    let score = 0;
    
    // Category match
    if (product.category && categories.includes(product.category._id)) {
      score += 3;
    }
    
    // Brand match
    if (product.brand && brands.includes(product.brand)) {
      score += 2;
    }
    
    // Tag matches
    if (product.tags) {
      const matchingTags = product.tags.filter(tag => tags.includes(tag));
      score += matchingTags.length;
    }
    
    // Price range preference (if available)
    if (behavior.preferences.priceRange) {
      const { min, max } = behavior.preferences.priceRange;
      if (product.price >= min && product.price <= max) {
        score += 1;
      }
    }

    return { product, score };
  });

  // Sort by score and return top results
  const filteredProducts = scoredProducts
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.product);

  // If no scored products, return popular products
  if (filteredProducts.length === 0) {
    return await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort('-ratings.average -createdAt')
      .limit(limit)
      .lean();
  }

  return filteredProducts;
};

module.exports = mongoose.model('UserBehavior', userBehaviorSchema);
