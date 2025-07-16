const express = require('express');
const { body } = require('express-validator');
const {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
} = require('../controllers/wishlist');
const { auth, userAccess } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

// Validation rules
const addToWishlistValidation = [
  body('productId')
    .isMongoId()
    .withMessage('Invalid product ID')
];

// All wishlist routes require authentication
router.use(auth);
router.use(userAccess);

// Wishlist routes
router.get('/', getWishlist);
router.post('/add', addToWishlistValidation, validate, addToWishlist);
router.delete('/item/:productId', removeFromWishlist);
router.delete('/clear', clearWishlist);

module.exports = router;
