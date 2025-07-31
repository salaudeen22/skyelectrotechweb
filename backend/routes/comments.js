const express = require('express');
const router = express.Router();
const { body, param, query } = require('express-validator');
const validate = require('../middleware/validate');
const { auth, authorize } = require('../middleware/auth');

const {
  getProductComments,
  createComment,
  updateComment,
  deleteComment,
  addReply,
  voteComment,
  getAllComments,
  updateCommentStatus,
  getCommentStats
} = require('../controllers/comments');

// Validation schemas
const createCommentValidation = [
  body('productId').isMongoId().withMessage('Invalid product ID'),
  body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('comment').trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array'),
  body('images.*.url').optional().isURL().withMessage('Invalid image URL'),
  body('images.*.publicId').optional().isString().withMessage('Invalid public ID')
];

const updateCommentValidation = [
  param('id').isMongoId().withMessage('Invalid comment ID'),
  body('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('title').optional().trim().isLength({ min: 1, max: 100 }).withMessage('Title must be between 1 and 100 characters'),
  body('comment').optional().trim().isLength({ min: 1, max: 1000 }).withMessage('Comment must be between 1 and 1000 characters'),
  body('images').optional().isArray().withMessage('Images must be an array')
];

const addReplyValidation = [
  param('id').isMongoId().withMessage('Invalid comment ID'),
  body('comment').trim().isLength({ min: 1, max: 500 }).withMessage('Reply must be between 1 and 500 characters')
];

const voteValidation = [
  param('id').isMongoId().withMessage('Invalid comment ID'),
  body('vote').isIn(['helpful', 'not_helpful']).withMessage('Vote must be either helpful or not_helpful')
];

const statusValidation = [
  param('id').isMongoId().withMessage('Invalid comment ID'),
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status')
];

// Public routes
router.get('/product/:productId', [
  param('productId').isMongoId().withMessage('Invalid product ID'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be between 1 and 50'),
  query('rating').optional().isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('sort').optional().isIn(['-createdAt', 'createdAt', '-rating', 'rating', '-isHelpful']).withMessage('Invalid sort parameter'),
  validate
], getProductComments);

// Protected routes (require authentication)
router.post('/', [
  auth,
  ...createCommentValidation,
  validate
], createComment);

router.put('/:id', [
  auth,
  ...updateCommentValidation,
  validate
], updateComment);

router.delete('/:id', [
  auth,
  param('id').isMongoId().withMessage('Invalid comment ID'),
  validate
], deleteComment);

router.post('/:id/replies', [
  auth,
  ...addReplyValidation,
  validate
], addReply);

router.post('/:id/vote', [
  auth,
  ...voteValidation,
  validate
], voteComment);

// Admin routes
router.get('/', [
  auth,
  authorize('admin'),
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('status').optional().isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  query('product').optional().isMongoId().withMessage('Invalid product ID'),
  query('user').optional().isMongoId().withMessage('Invalid user ID'),
  query('sort').optional().isIn(['-createdAt', 'createdAt', '-rating', 'rating', 'status']).withMessage('Invalid sort parameter'),
  validate
], getAllComments);

router.put('/:id/status', [
  auth,
  authorize('admin'),
  ...statusValidation,
  validate
], updateCommentStatus);

router.get('/stats', [
  auth,
  authorize('admin')
], getCommentStats);

module.exports = router; 