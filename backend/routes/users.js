const express = require('express');
const { body } = require('express-validator');
const {
  getAllUsers,
  getUser,
  createEmployee,
  updateUser,
  deleteUser,
  getUserStats,
  getAdminUsers
} = require('../controllers/users');
const { auth, adminOnly } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');

const router = express.Router();

// Validation rules
const createEmployeeValidation = [
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
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number')
];

const updateUserValidation = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('email')
    .optional()
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('role')
    .optional()
    .isIn(['user', 'employee', 'admin'])
    .withMessage('Invalid role'),
  body('isActive')
    .optional()
    .isBoolean()
    .withMessage('isActive must be a boolean')
];

// All routes require admin access
router.use(auth);
router.use(adminOnly);

// User management routes
router.get('/', getAllUsers);
router.get('/stats', getUserStats);
router.get('/admins', getAdminUsers);
router.get('/:id', getUser);
router.post('/employee', 
  createEmployeeValidation, 
  validate,
  logActivity('user_created', 'user'),
  createEmployee
);
router.put('/:id', 
  updateUserValidation, 
  validate,
  logActivity('user_updated', 'user'),
  updateUser
);
router.delete('/:id',
  logActivity('user_deleted', 'user'),
  deleteUser
);

module.exports = router;
