// Utility functions for SEO-friendly URLs

/**
 * Create SEO-friendly slug from a string
 * @param {string} text - Text to convert to slug
 * @returns {string} - SEO-friendly slug
 */
export const createSlug = (text) => {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with hyphens
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
};

/**
 * Generate SEO-friendly product URL
 * @param {Object} product - Product object with name and _id
 * @returns {string} - SEO-friendly product URL
 */
export const generateProductUrl = (product) => {
  if (!product || !product._id) return '/products';
  
  const slug = createSlug(product.name);
  return `/product/${slug}-${product._id}`;
};

/**
 * Generate SEO-friendly category URL
 * @param {Object} category - Category object with name and _id
 * @returns {string} - SEO-friendly category URL
 */
export const generateCategoryUrl = (category) => {
  if (!category || !category._id) return '/products';
  
  const slug = createSlug(category.name);
  return `/category/${slug}-${category._id}`;
};

/**
 * Extract ID from slug-with-id format
 * @param {string} slugWithId - String in format "slug-name-id"
 * @returns {string|null} - Extracted ID or null if not found
 */
export const extractIdFromSlug = (slugWithId) => {
  if (!slugWithId || typeof slugWithId !== 'string') return null;
  
  const parts = slugWithId.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if it's a valid MongoDB ObjectId (24 characters, alphanumeric)
  if (lastPart && lastPart.length === 24 && /^[a-fA-F0-9]{24}$/.test(lastPart)) {
    return lastPart;
  }
  
  return null;
};

/**
 * Extract slug from slug-with-id format
 * @param {string} slugWithId - String in format "slug-name-id"
 * @returns {string} - Extracted slug without ID
 */
export const extractSlugFromSlugWithId = (slugWithId) => {
  if (!slugWithId) return '';
  
  const parts = slugWithId.split('-');
  const lastPart = parts[parts.length - 1];
  
  // If last part is a valid MongoDB ObjectId, remove it
  if (lastPart && lastPart.length === 24) {
    return parts.slice(0, -1).join('-');
  }
  
  return slugWithId;
};
