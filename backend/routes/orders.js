const express = require('express');
const { body } = require('express-validator');
const {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  getOrdersByEmployee,
  assignOrderToEmployee,
  cancelOrder
} = require('../controllers/orders');
const { auth, adminOnly, adminOrEmployee, userAccess } = require('../middleware/auth');
const validate = require('../middleware/validate');
const logActivity = require('../middleware/activityLogger');

const router = express.Router();

// Validation rules
const createOrderValidation = [
  body('orderItems')
    .isArray({ min: 1 })
    .withMessage('Order must have at least one item'),
  body('orderItems.*.product')
    .isMongoId()
    .withMessage('Invalid product ID'),
  body('orderItems.*.quantity')
    .isInt({ min: 1, max: 10 })
    .withMessage('Quantity must be between 1 and 10'),
  body('shippingInfo.name')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Name must be between 2 and 50 characters'),
  body('shippingInfo.phone')
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('shippingInfo.address')
    .trim()
    .isLength({ min: 10, max: 200 })
    .withMessage('Address must be between 10 and 200 characters'),
  body('shippingInfo.city')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('City must be between 2 and 50 characters'),
  body('shippingInfo.zipCode')
    .trim()
    .isLength({ min: 5, max: 10 })
    .withMessage('ZIP code must be between 5 and 10 characters')
];

const updateOrderStatusValidation = [
  body('status')
    .isIn(['pending', 'confirmed', 'processing', 'packed', 'shipped', 'delivered', 'cancelled', 'returned'])
    .withMessage('Invalid order status'),
  body('note')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Note cannot exceed 500 characters'),
  body('trackingNumber')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Tracking number cannot exceed 50 characters')
];

// User routes
router.post('/', auth, userAccess, createOrderValidation, validate, createOrder);
router.get('/my-orders', auth, userAccess, getMyOrders);
router.get('/:id', auth, userAccess, getOrder);
router.put('/:id/cancel', auth, userAccess, cancelOrder);

// Employee routes (can view assigned orders and update status)
router.get('/employee/assigned', auth, adminOrEmployee, getOrdersByEmployee);

// Admin/Employee routes (can update order status)
router.put('/:id/status', 
  auth, 
  adminOrEmployee, 
  updateOrderStatusValidation, 
  validate,
  logActivity('order_status_updated', 'order'),
  updateOrderStatus
);

// Admin only routes
router.get('/', auth, adminOnly, getAllOrders);
router.put('/:id/assign', auth, adminOnly, assignOrderToEmployee);

module.exports = router;
