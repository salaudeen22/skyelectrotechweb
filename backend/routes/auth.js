const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  requestProfileUpdateOTP,
  updateProfile, 
  addAddress,
  updateAddress,
  deleteAddress,
  getAddresses,
  setDefaultAddress,
  changePassword,
  forgotPassword,
  resetPassword,
  googleAuth,
  googleCallback,
  linkGoogleAccount
} = require('../controllers/auth');
const { auth } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .optional()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('googleId')
    .optional()
    .isString()
    .withMessage('Google ID must be a string'),
  body('role')
    .optional()
    .isIn(['user', 'employee', 'admin'])
    .withMessage('Invalid role'),
  // Custom validation to ensure either password or googleId is provided
  body().custom((value, { req }) => {
    if (!req.body.password && !req.body.googleId) {
      throw new Error('Either password or Google ID is required');
    }
    return true;
  })
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const updateProfileValidation = [
  body('otp')
    .notEmpty()
    .isLength({ min: 6, max: 6 })
    .withMessage('OTP must be 6 digits'),
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('address.street')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Street address cannot exceed 100 characters'),
  body('address.city')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('City cannot exceed 50 characters')
];

const addAddressValidation = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Address name must be between 2 and 50 characters'),
  body('street')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Street address must be between 5 and 100 characters'),
  body('city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('state')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('State must be between 2 and 50 characters'),
  body('country')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Country must be between 2 and 50 characters'),
  body('zipCode')
    .trim()
    .isLength({ min: 3, max: 10 })
    .withMessage('ZIP code must be between 3 and 10 characters'),
  body('isDefault')
    .optional()
    .isBoolean()
    .withMessage('isDefault must be a boolean')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long'),
  body('confirmPassword')
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error('Passwords do not match');
      }
      return true;
    })
];

// Routes
router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, logActivity('login', 'system'), login);
router.post('/logout', auth, logActivity('logout', 'system'), logout);
router.get('/me', auth, getMe);

// Profile and address management
router.post('/profile/request-otp', auth, requestProfileUpdateOTP);
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);

// Address routes
router.get('/addresses', auth, getAddresses);
router.post('/addresses', auth, addAddressValidation, validate, addAddress);
router.put('/addresses/:addressId', auth, addAddressValidation, validate, updateAddress);
router.delete('/addresses/:addressId', auth, deleteAddress);
router.put('/addresses/:addressId/default', auth, setDefaultAddress);

// Password management
router.put('/password', auth, changePasswordValidation, validate, changePassword);
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], validate, forgotPassword);
router.put('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], validate, resetPassword);

// Google OAuth routes
router.get('/google', googleAuth);
router.get('/google/callback', googleCallback);
router.post('/link-google', auth, [
  body('googleToken').notEmpty().withMessage('Google token is required')
], validate, linkGoogleAccount);

// Test endpoint to verify OAuth setup
router.get('/oauth-status', (req, res) => {
  res.json({
    googleConfigured: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
    callbackUrl: process.env.GOOGLE_CALLBACK_URL || 'Not set',
    clientUrl: process.env.CLIENT_URL || 'Not set'
  });
});

module.exports = router;
