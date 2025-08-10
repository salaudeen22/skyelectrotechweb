const NodeCache = require('node-cache');

// In-memory cache for search results and frequently accessed data
// For production, consider using Redis for distributed caching
const cache = new NodeCache({
  stdTTL: 300, // 5 minutes default TTL
  checkperiod: 60, // Check for expired keys every minute
  useClones: false, // Better performance
  maxKeys: 1000 // Limit memory usage
});

// Cache keys
const CACHE_KEYS = {
  SEARCH_RESULTS: 'search_results',
  FEATURED_PRODUCTS: 'featured_products',
  CATEGORIES: 'categories',
  PRODUCT_DETAILS: 'product_details'
};

// Generate cache key for search results
const generateSearchKey = (params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${CACHE_KEYS.SEARCH_RESULTS}:${sortedParams}`;
};

// Cache middleware for search results
const cacheSearchResults = (duration = 300) => {
  return async (req, res, next) => {
    const cacheKey = generateSearchKey(req.query);
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      return res.json(cachedResult);
    }
    
    // Store original send function
    const originalSend = res.json;
    
    // Override send function to cache the response
    res.json = function(data) {
      // Cache the result
      cache.set(cacheKey, data, duration);
      
      // Call original send function
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Cache utility functions
const cacheUtils = {
  // Get cached data
  get: (key) => cache.get(key),
  
  // Set cached data
  set: (key, data, ttl = 300) => cache.set(key, data, ttl),
  
  // Delete cached data
  del: (key) => cache.del(key),
  
  // Clear all cache
  flush: () => cache.flushAll(),
  
  // Get cache stats
  getStats: () => cache.getStats(),
  
  // Invalidate search cache
  invalidateSearch: () => {
    const keys = cache.keys();
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEYS.SEARCH_RESULTS)) {
        cache.del(key);
      }
    });
  },
  
  // Invalidate product-related cache
  invalidateProductCache: (productId = null) => {
    if (productId) {
      cache.del(`${CACHE_KEYS.PRODUCT_DETAILS}:${productId}`);
    } else {
      const keys = cache.keys();
      keys.forEach(key => {
        if (key.startsWith(CACHE_KEYS.PRODUCT_DETAILS) || 
            key.startsWith(CACHE_KEYS.FEATURED_PRODUCTS)) {
          cache.del(key);
        }
      });
    }
  }
};

module.exports = {
  cache,
  cacheSearchResults,
  cacheUtils,
  CACHE_KEYS
};
