const express = require('express');
const { body } = require('express-validator');
const {
  trackProductView,
  trackInteraction,
  getRecentlyViewed,
  getRecommendations,
  getCategoryRecommendations,
  getTrendingProducts,
  getSimilarProducts
} = require('../controllers/recommendations');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');

const router = express.Router();

// Validation rules
const trackViewValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

const trackInteractionValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required'),
  body('action')
    .isIn(['view', 'cart_add', 'purchase', 'wishlist_add', 'search'])
    .withMessage('Valid action is required'),
  body('metadata')
    .optional()
    .isObject()
    .withMessage('Metadata must be an object')
];

// Private routes (require authentication)
router.post('/track-view', auth, trackViewValidation, validate, trackProductView);
router.post('/track-interaction', auth, trackInteractionValidation, validate, trackInteraction);
router.get('/recently-viewed', auth, getRecentlyViewed);
router.get('/', auth, getRecommendations);
router.get('/category/:categoryId', auth, getCategoryRecommendations);

// Public routes
router.get('/trending', getTrendingProducts);
router.get('/similar/:productId', getSimilarProducts);

module.exports = router;
