const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const { sendResponse, sendError, asyncHandler, paginate, getPaginationMeta } = require('../utils/helpers');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User)
const createOrder = asyncHandler(async (req, res) => {
  const {
    orderItems,
    shippingInfo,
    paymentInfo = { method: 'cod', status: 'pending' },
    itemsPrice,
    taxPrice = 0,
    shippingPrice = 0,
    paymentMethod,
    paymentStatus,
    razorpayPaymentId,
    razorpayOrderId
  } = req.body;

  // Validate and process order items
  const processedItems = [];
  let calculatedItemsPrice = 0;

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    
    if (!product || !product.isActive) {
      return sendError(res, 400, `Product ${item.product} not found or inactive`);
    }

    if (product.stock < item.quantity) {
      return sendError(res, 400, `Insufficient stock for ${product.name}. Available: ${product.stock}`);
    }

    const itemPrice = product.discountPrice || product.price;
    const itemTotal = itemPrice * item.quantity;
    calculatedItemsPrice += itemTotal;

    processedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      price: itemPrice,
      quantity: item.quantity
    });

    // Update product stock
    product.stock -= item.quantity;
    await product.save();
  }

  // Calculate total price
  const totalPrice = calculatedItemsPrice + taxPrice + shippingPrice;

  // Create order
  const order = await Order.create({
    user: req.user._id,
    orderItems: processedItems,
    shippingInfo,
    paymentInfo: {
      method: paymentMethod || paymentInfo.method,
      status: paymentStatus || paymentInfo.status,
      transactionId: razorpayPaymentId,
      paidAt: paymentStatus === 'paid' ? new Date() : undefined
    },
    razorpayPaymentId,
    razorpayOrderId,
    itemsPrice: calculatedItemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    orderStatus: paymentStatus === 'paid' ? 'confirmed' : 'pending'
  });

  // Clear user's cart
  await Cart.findOneAndDelete({ user: req.user._id });

  await order.populate('user', 'name email');

  sendResponse(res, 201, { order }, 'Order created successfully');
});

// @desc    Get user's orders
// @route   GET /api/orders/my-orders
// @access  Private (User)
const getMyOrders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = { user: req.user._id };
  
  if (status) {
    query.orderStatus = status;
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const orders = await Order.find(query)
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .populate('orderItems.product', 'name images')
    .lean();

  const total = await Order.countDocuments(query);
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    orders,
    pagination
  }, 'Orders retrieved successfully');
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images brand')
    .populate('assignedTo', 'name email')
    .populate('statusHistory.updatedBy', 'name');

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Check access permissions
  const isOwner = order.user._id.toString() === req.user._id.toString();
  const isAssignee = order.assignedTo && order.assignedTo._id.toString() === req.user._id.toString();
  const isAdmin = req.user.role === 'admin';
  const isEmployee = req.user.role === 'employee';

  if (!isOwner && !isAssignee && !isAdmin && !isEmployee) {
    return sendError(res, 403, 'Access denied');
  }

  sendResponse(res, 200, { order }, 'Order retrieved successfully');
});

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Admin/Employee)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Check if employee is assigned to this order (if not admin)
  if (req.user.role === 'employee') {
    if (!order.assignedTo || order.assignedTo.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'You are not assigned to this order');
    }
  }

  // Validate status transitions
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['processing', 'cancelled'],
    processing: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: []
  };

  if (!validTransitions[order.orderStatus].includes(status)) {
    return sendError(res, 400, `Cannot change status from ${order.orderStatus} to ${status}`);
  }

  // Update order
  order.orderStatus = status;
  
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  
  if (estimatedDelivery) {
    order.estimatedDelivery = new Date(estimatedDelivery);
  }

  if (status === 'delivered') {
    order.deliveredAt = new Date();
  }

  // Add to status history
  order.statusHistory.push({
    status,
    updatedBy: req.user._id,
    note
  });

  await order.save();

  await order.populate('user', 'name email');
  await order.populate('assignedTo', 'name email');

  sendResponse(res, 200, { order }, 'Order status updated successfully');
});

// @desc    Get all orders (Admin)
// @route   GET /api/orders
// @access  Private (Admin)
const getAllOrders = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    status, 
    assignedTo,
    dateFrom,
    dateTo,
    search
  } = req.query;

  const query = {};

  // Status filter
  if (status) {
    query.orderStatus = status;
  }

  // Assigned to filter
  if (assignedTo) {
    query.assignedTo = assignedTo;
  }

  // Date range filter
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  // Search filter (by order ID or user name)
  if (search) {
    const users = await User.find({
      name: { $regex: search, $options: 'i' }
    }).select('_id');
    
    query.$or = [
      { user: { $in: users.map(u => u._id) } },
      { _id: { $regex: search, $options: 'i' } }
    ];
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const orders = await Order.find(query)
    .populate('user', 'name email')
    .populate('assignedTo', 'name email')
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Order.countDocuments(query);
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    orders,
    pagination
  }, 'Orders retrieved successfully');
});

// @desc    Get orders assigned to employee
// @route   GET /api/orders/employee/assigned
// @access  Private (Employee)
const getOrdersByEmployee = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status } = req.query;

  const query = { assignedTo: req.user._id };
  
  if (status) {
    query.orderStatus = status;
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const orders = await Order.find(query)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images')
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await Order.countDocuments(query);
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    orders,
    pagination
  }, 'Assigned orders retrieved successfully');
});

// @desc    Assign order to employee
// @route   PUT /api/orders/:id/assign
// @access  Private (Admin)
const assignOrderToEmployee = asyncHandler(async (req, res) => {
  const { employeeId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Verify employee exists and has correct role
  const employee = await User.findById(employeeId);
  if (!employee || !['employee', 'admin'].includes(employee.role)) {
    return sendError(res, 400, 'Invalid employee ID');
  }

  order.assignedTo = employeeId;
  await order.save();

  await order.populate('assignedTo', 'name email');

  sendResponse(res, 200, { order }, 'Order assigned successfully');
});

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private (User)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Check if user owns the order
  if (order.user.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied');
  }

  // Check if order can be cancelled
  if (!['pending', 'confirmed'].includes(order.orderStatus)) {
    return sendError(res, 400, 'Order cannot be cancelled at this stage');
  }

  // Restore product stock
  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(
      item.product,
      { $inc: { stock: item.quantity } }
    );
  }

  order.orderStatus = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    updatedBy: req.user._id,
    note: 'Cancelled by customer'
  });

  await order.save();

  sendResponse(res, 200, { order }, 'Order cancelled successfully');
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  getOrdersByEmployee,
  assignOrderToEmployee,
  cancelOrder
};
