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

// Public routes
router.get('/', getCategories);
router.get('/:id', getCategory);

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

module.exports = router;
