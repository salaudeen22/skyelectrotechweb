const express = require('express');
const { body } = require('express-validator');
const {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory
} = require('../controllers/categories');
const { auth, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');
const { cacheSearchResults } = require('../utils/cache');

const router = express.Router();

// Validation rules
const categoryValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Category name must be between 2 and 50 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters')
];

// Public routes with caching (reduced cache time for better admin experience)
router.get('/', cacheSearchResults(60), getCategories); // 1 min cache (reduced from 30 min)
router.get('/:id', getCategory); // Individual categories cached in controller

// Admin only routes
router.post('/', 
  auth, 
  adminOnly, 
  categoryValidation, 
  validate,
  logActivity('category_created', 'category'),
  createCategory
);

router.put('/:id', 
  auth, 
  adminOnly, 
  categoryValidation, 
  validate,
  logActivity('category_updated', 'category'),
  updateCategory
);

router.delete('/:id', 
  auth, 
  adminOnly,
  logActivity('category_deleted', 'category'),
  deleteCategory
);

// Debug endpoint to flush cache (admin only)
router.post('/flush-cache', auth, adminOnly, (req, res) => {
  const { cacheUtils } = require('../utils/cache');
  cacheUtils.flush();
  cacheUtils.invalidateSearch();
  cacheUtils.invalidateCategoryCache();
  res.json({ message: 'Cache flushed successfully' });
});

module.exports = router;
