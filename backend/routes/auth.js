const express = require('express');
const { body } = require('express-validator');
const { 
  register, 
  login, 
  logout, 
  getMe, 
  updateProfile, 
  changePassword,
  forgotPassword,
  resetPassword,
  googleLogin
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
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['user', 'employee', 'admin'])
    .withMessage('Invalid role')
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
router.post('/google', [
  body('idToken').notEmpty().withMessage('Google ID token is required')
], validate, logActivity('google_login', 'system'), googleLogin);
router.post('/logout', auth, logActivity('logout', 'system'), logout);
router.get('/me', auth, getMe);
router.put('/profile', auth, updateProfileValidation, validate, updateProfile);
router.put('/password', auth, changePasswordValidation, validate, changePassword);
router.post('/forgot-password', [
  body('email').isEmail().normalizeEmail().withMessage('Please provide a valid email')
], validate, forgotPassword);
router.put('/reset-password/:token', [
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
], validate, resetPassword);

module.exports = router;
