const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  getSettings,
  updateSettings,
  getPublicSettings,
  addShippingMethod,
  updateShippingMethod,
  deleteShippingMethod,
  addShippingZone,
  updateShippingZone,
  deleteShippingZone,
  calculateShippingCost
} = require('../controllers/settings');
const { auth, authorize } = require('../middleware/auth');

// Validation middleware
const validate = (req, res, next) => {
  const { validationResult } = require('express-validator');
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => ({
      field: error.path,
      message: error.msg
    }));
    
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errorMessages
    });
  }
  
  next();
};

// Validation schemas
const shippingMethodValidation = [
  body('name').trim().notEmpty().withMessage('Shipping method name is required'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('estimatedDays').optional().trim().notEmpty().withMessage('Estimated days cannot be empty')
];

const shippingZoneValidation = [
  body('name').trim().notEmpty().withMessage('Zone name is required'),
  body('cost').isNumeric().withMessage('Cost must be a number'),
  body('countries').optional().isArray().withMessage('Countries must be an array'),
  body('states').optional().isArray().withMessage('States must be an array')
];

const settingsValidation = [
  body('storeInfo.name').optional().trim().notEmpty().withMessage('Store name cannot be empty'),
  body('storeInfo.email').optional().isEmail().withMessage('Invalid email format'),
  body('storeInfo.phone').optional().trim().notEmpty().withMessage('Phone cannot be empty'),
  body('storeInfo.address').optional().trim().notEmpty().withMessage('Address cannot be empty'),
  body('storeInfo.gstin').optional().trim().notEmpty().withMessage('GSTIN cannot be empty'),
  body('storeInfo.city').optional().trim().notEmpty().withMessage('City cannot be empty'),
  body('storeInfo.state').optional().trim().notEmpty().withMessage('State cannot be empty'),
  body('storeInfo.pincode').optional().trim().notEmpty().withMessage('Pincode cannot be empty'),
  body('shipping.freeShippingThreshold').optional().isNumeric().withMessage('Free shipping threshold must be a number'),
  body('shipping.defaultShippingCost').optional().isNumeric().withMessage('Default shipping cost must be a number'),
  body('payment.taxRate').optional().isNumeric().withMessage('Tax rate must be a number'),
  body('order.maxOrderQuantity').optional().isInt({ min: 1 }).withMessage('Max order quantity must be a positive integer')
];

// Public routes
router.get('/public', getPublicSettings);
router.post('/calculate-shipping', calculateShippingCost);

// Protected routes (Admin only)
router.use(auth, authorize('admin'));

// Main settings routes
router.get('/', getSettings);
router.put('/', settingsValidation, validate, updateSettings);

// Shipping methods routes
router.post('/shipping-methods', shippingMethodValidation, validate, addShippingMethod);
router.put('/shipping-methods/:id', shippingMethodValidation, validate, updateShippingMethod);
router.delete('/shipping-methods/:id', deleteShippingMethod);

// Shipping zones routes
router.post('/shipping-zones', shippingZoneValidation, validate, addShippingZone);
router.put('/shipping-zones/:id', shippingZoneValidation, validate, updateShippingZone);
router.delete('/shipping-zones/:id', deleteShippingZone);

module.exports = router; 