const express = require('express');
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { auth, adminOnly, userAccess } = require('../middleware/auth');
const logActivity = require('../middleware/activityLogger');

const {
  createCoupon,
  getCoupons,
  getCouponById,
  updateCoupon,
  deleteCoupon,
  validateCoupon,
  getCouponStats,
  getAvailableCoupons,
  issueCoupon,
  getCouponIssuanceStats
} = require('../controllers/coupons');

const router = express.Router();

// Validation schemas
const createCouponValidation = [
  body('code')
    .isString()
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code must be 3-20 characters long and contain only letters and numbers'),
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters long'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('discountType')
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  body('discountValue')
    .isFloat({ min: 0.01 })
    .withMessage('Discount value must be greater than 0')
    .custom((value, { req }) => {
      if (req.body.discountType === 'percentage' && (value <= 0 || value > 100)) {
        throw new Error('Percentage discount must be between 0 and 100');
      }
      return true;
    }),
  body('minimumOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be 0 or greater'),
  body('maximumDiscountAmount')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Allow empty values
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        throw new Error('Maximum discount amount must be greater than 0 when specified');
      }
      return true;
    }),
  body('expirationDate')
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expirationDate = new Date(value);
      expirationDate.setHours(0, 0, 0, 0);
      if (expirationDate < today) {
        throw new Error('Expiration date must be today or in the future');
      }
      return true;
    }),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('issuanceLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Issuance limit must be a positive integer'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User usage limit must be a positive integer'),
  body('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),
  body('applicableProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  body('applicableCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('excludedProducts')
    .optional()
    .isArray()
    .withMessage('Excluded products must be an array'),
  body('excludedProducts.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('excludedCategories')
    .optional()
    .isArray()
    .withMessage('Excluded categories must be an array'),
  body('excludedCategories.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid category ID'),
  body('isFirstTimeUserOnly')
    .optional()
    .isBoolean()
    .withMessage('First time user only must be a boolean'),
  body('allowedUsers')
    .optional()
    .isArray()
    .withMessage('Allowed users must be an array'),
  body('allowedUsers.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID'),
  body('excludedUsers')
    .optional()
    .isArray()
    .withMessage('Excluded users must be an array'),
  body('excludedUsers.*')
    .optional()
    .isMongoId()
    .withMessage('Invalid user ID')
];

const updateCouponValidation = [
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  body('code')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 3, max: 20 })
    .matches(/^[A-Z0-9]+$/)
    .withMessage('Coupon code must be 3-20 characters long and contain only letters and numbers'),
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 characters long'),
  body('description')
    .optional()
    .isString()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
  body('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be either percentage or fixed'),
  body('discountValue')
    .optional()
    .isFloat({ min: 0.01 })
    .withMessage('Discount value must be greater than 0')
    .custom((value, { req }) => {
      if (req.body.discountType === 'percentage' && (value <= 0 || value > 100)) {
        throw new Error('Percentage discount must be between 0 and 100');
      }
      return true;
    }),
  body('minimumOrderAmount')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum order amount must be 0 or greater'),
  body('maximumDiscountAmount')
    .optional()
    .custom((value) => {
      if (value === '' || value === null || value === undefined) {
        return true; // Allow empty values
      }
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue <= 0) {
        throw new Error('Maximum discount amount must be greater than 0 when specified');
      }
      return true;
    }),
  body('expirationDate')
    .optional()
    .isISO8601()
    .toDate()
    .custom((value) => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const expirationDate = new Date(value);
      expirationDate.setHours(0, 0, 0, 0);
      if (expirationDate < today) {
        throw new Error('Expiration date must be today or in the future');
      }
      return true;
    }),
  body('usageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Usage limit must be a positive integer'),
  body('issuanceLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Issuance limit must be a positive integer'),
  body('userUsageLimit')
    .optional()
    .isInt({ min: 1 })
    .withMessage('User usage limit must be a positive integer'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('Active status must be a boolean'),
  body('applicableProducts')
    .optional()
    .isArray()
    .withMessage('Applicable products must be an array'),
  body('applicableCategories')
    .optional()
    .isArray()
    .withMessage('Applicable categories must be an array'),
  body('excludedProducts')
    .optional()
    .isArray()
    .withMessage('Excluded products must be an array'),
  body('excludedCategories')
    .optional()
    .isArray()
    .withMessage('Excluded categories must be an array'),
  body('isFirstTimeUserOnly')
    .optional()
    .isBoolean()
    .withMessage('First time user only must be a boolean'),
  body('allowedUsers')
    .optional()
    .isArray()
    .withMessage('Allowed users must be an array'),
  body('excludedUsers')
    .optional()
    .isArray()
    .withMessage('Excluded users must be an array')
];

const validateCouponValidation = [
  param('code')
    .isString()
    .trim()
    .isLength({ min: 1 })
    .withMessage('Coupon code is required'),
  body('orderAmount')
    .isFloat({ min: 0.01 })
    .withMessage('Order amount must be greater than 0'),
  body('cartItems')
    .optional()
    .isArray()
    .withMessage('Cart items must be an array')
];

const getCouponsValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('status')
    .optional()
    .isIn(['active', 'expired', 'inactive'])
    .withMessage('Status must be active, expired, or inactive'),
  query('discountType')
    .optional()
    .isIn(['percentage', 'fixed'])
    .withMessage('Discount type must be percentage or fixed'),
  query('sortBy')
    .optional()
    .isIn(['createdAt', 'updatedAt', 'expirationDate', 'usedCount', 'code', 'name'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc')
];

// Admin routes
router.post('/', [
  auth,
  adminOnly,
  ...createCouponValidation,
  validate,
  logActivity('create_coupon', 'coupon')
], createCoupon);

router.get('/', [
  auth,
  adminOnly,
  ...getCouponsValidation,
  validate
], getCoupons);

router.get('/:id', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  validate
], getCouponById);

router.put('/:id', [
  auth,
  adminOnly,
  ...updateCouponValidation,
  validate,
  logActivity('update_coupon', 'coupon')
], updateCoupon);

router.delete('/:id', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  validate,
  logActivity('delete_coupon', 'coupon')
], deleteCoupon);

router.get('/:id/stats', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  validate
], getCouponStats);

router.post('/:id/issue', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  body('userIds').isArray().withMessage('User IDs must be an array'),
  body('userIds.*').isMongoId().withMessage('Invalid user ID'),
  body('channel').optional().isIn(['admin', 'auto', 'api', 'promotion', 'referral', 'loyalty']).withMessage('Invalid channel'),
  validate,
  logActivity('issue_coupon', 'coupon')
], issueCoupon);

router.get('/:id/issuance-stats', [
  auth,
  adminOnly,
  param('id').isMongoId().withMessage('Invalid coupon ID'),
  validate
], getCouponIssuanceStats);

// Public/User routes
router.post('/validate/:code', [
  auth,
  userAccess,
  ...validateCouponValidation,
  validate,
  logActivity('validate_coupon', 'coupon')
], validateCoupon);

router.get('/user/available', [
  auth,
  userAccess,
  query('orderAmount').optional().isFloat({ min: 0.01 }).withMessage('Order amount must be greater than 0'),
  validate
], getAvailableCoupons);

module.exports = router;