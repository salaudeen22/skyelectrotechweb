const express = require('express');
const { body } = require('express-validator');
const {
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
} = require('../controllers/products');
const { auth, adminOnly, adminOrEmployee } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');
const { cacheSearchResults } = require('../utils/cache');

const router = express.Router();

// Validation rules
const productValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Description must be between 10 and 2000 characters'),
  body('price')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  body('category')
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('sku')
    .optional()
    .trim()
    .isLength({ min: 3, max: 20 })
    .withMessage('SKU must be between 3 and 20 characters')
];

const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment cannot exceed 500 characters')
];

// Public routes with optimized caching
router.get('/', cacheSearchResults(600), getProducts); // 10 min cache
router.get('/featured', cacheSearchResults(900), getFeaturedProducts); // 15 min cache - changes less frequently
router.get('/search', cacheSearchResults(300), searchProducts); // 5 min cache for search
router.get('/category/:categoryId', cacheSearchResults(600), getProductsByCategory); // 10 min cache
router.get('/:id', getProduct); // Individual products don't use search cache middleware

// Protected routes - Users can add reviews
router.post('/:id/reviews', auth, reviewValidation, validate, addProductReview);
router.delete('/:id/reviews/:reviewId', auth, deleteProductReview);

// Admin/Employee routes
router.post('/', 
  auth, 
  adminOnly, 
  productValidation, 
  validate, 
  logActivity('product_created', 'product'),
  createProduct
);

router.put('/:id', 
  auth, 
  adminOnly, 
  productValidation, 
  validate,
  logActivity('product_updated', 'product'),
  updateProduct
);

router.delete('/:id', 
  auth, 
  adminOnly,
  logActivity('product_deleted', 'product'),
  deleteProduct
);

module.exports = router;
