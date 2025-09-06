const NodeCache = require('node-cache');

// High-performance in-memory cache for search results and frequently accessed data
// For production, consider using Redis for distributed caching
const cache = new NodeCache({
  stdTTL: 600, // 10 minutes default TTL (increased for better performance)
  checkperiod: 120, // Check for expired keys every 2 minutes (optimized)
  useClones: false, // Better performance - no deep cloning
  maxKeys: 2000, // Increased memory allowance for better hit rate
  deleteOnExpire: true, // Automatically delete expired keys
  errorOnMissing: false // Don't throw errors on cache misses
});

// Cache keys
const CACHE_KEYS = {
  SEARCH_RESULTS: 'search_results',
  FEATURED_PRODUCTS: 'featured_products',
  CATEGORIES: 'categories',
  PRODUCT_DETAILS: 'product_details',
  CATEGORY_PRODUCTS: 'category_products',
  TOP_RATED: 'top_rated_products',
  RECENT_PRODUCTS: 'recent_products'
};

// Generate cache key for search results
const generateSearchKey = (params) => {
  const sortedParams = Object.keys(params)
    .sort()
    .map(key => `${key}:${params[key]}`)
    .join('|');
  return `${CACHE_KEYS.SEARCH_RESULTS}:${sortedParams}`;
};

// Enhanced cache middleware with HTTP cache headers
const cacheSearchResults = (duration = 600) => {
  return async (req, res, next) => {
    const cacheKey = generateSearchKey(req.query);
    
    // Check cache first
    const cachedResult = cache.get(cacheKey);
    if (cachedResult) {
      // Set cache headers for client-side caching
      res.set({
        'Cache-Control': `public, max-age=${duration}, s-maxage=${duration}`,
        'ETag': `"${cacheKey.slice(-16)}"`, // Use last 16 chars of cache key as ETag
        'Last-Modified': new Date(Date.now() - duration * 1000).toUTCString()
      });
      
      // Check if client has cached version
      if (req.headers['if-none-match'] === `"${cacheKey.slice(-16)}"`) {
        return res.status(304).end();
      }
      
      return res.json(cachedResult);
    }
    
    // Store original send function
    const originalSend = res.json;
    
    // Override send function to cache the response
    res.json = function(data) {
      // Set cache headers
      res.set({
        'Cache-Control': `public, max-age=${duration}, s-maxage=${duration}`,
        'ETag': `"${cacheKey.slice(-16)}"`,
        'Last-Modified': new Date().toUTCString()
      });
      
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
