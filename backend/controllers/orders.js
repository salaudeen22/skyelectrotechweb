const Order = require('../models/Order');
const Product = require('../models/Product');
const Cart = require('../models/Cart');
const User = require('../models/User');
const ReturnRequest = require('../models/ReturnRequest');
const { sendResponse, sendError, asyncHandler, paginate, getPaginationMeta } = require('../utils/helpers');
const { sendOrderConfirmationEmail, sendOrderNotificationEmail, sendOrderStatusUpdateEmail, sendReturnRequestEmail, sendReturnApprovedEmail, sendReturnRejectedEmail } = require('../utils/email');
const { uploadImage } = require('../utils/s3');
const notificationService = require('../services/notificationService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (User)
const createOrder = asyncHandler(async (req, res) => {
  console.log('Creating order with payload:', req.body);
  
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
  }

  // Calculate total price
  const totalPrice = calculatedItemsPrice + taxPrice + shippingPrice;

  // Create order
  const orderData = {
    user: req.user._id,
    orderItems: processedItems,
    shippingInfo,
    paymentInfo: {
      method: paymentMethod || paymentInfo.method,
      status: paymentStatus === 'paid' ? 'completed' : (paymentStatus || paymentInfo.status),
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
  };
  
  console.log('Creating order with data:', orderData);
  
  try {
    const order = await Order.create(orderData);
    console.log('Order created successfully:', order._id);

    // Clear user's cart
    await Cart.findOneAndDelete({ user: req.user._id });

    await order.populate('user', 'name email');

    // Send email notifications
    try {
      // Send order confirmation email to customer
      await sendOrderConfirmationEmail(order, req.user);
      
      // Send order notification email to admin/owner
      await sendOrderNotificationEmail(order, req.user);
    } catch (emailError) {
      console.error('Failed to send order emails:', emailError);
      // Don't fail the order creation if emails fail
    }

    // Send push notification for new order
    try {
      await notificationService.sendOrderUpdateNotification(
        req.user._id,
        order,
        order.orderStatus,
        {
          orderNumber: order._id,
          totalAmount: order.totalPrice
        }
      );
      console.log(`Push notification sent for new order ${order._id}`);
    } catch (notificationError) {
      console.error('Failed to send push notification for new order:', notificationError);
      // Don't fail the order creation if notification fails
    }

    sendResponse(res, 201, { order }, 'Order created successfully');
  } catch (error) {
    console.error('Order creation error:', error);
    if (error.name === 'ValidationError') {
      const validationErrors = Object.values(error.errors).map(err => err.message);
      return sendError(res, 400, `Validation failed: ${validationErrors.join(', ')}`);
    }
    throw error;
  }
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

  // Validate status transitions - standardized workflow
  const validTransitions = {
    pending: ['confirmed', 'cancelled'],
    confirmed: ['packed', 'cancelled'],
    packed: ['shipped', 'cancelled'],
    shipped: ['delivered', 'returned'],
    delivered: ['returned'],
    cancelled: [],
    returned: []
  };

  if (!validTransitions[order.orderStatus].includes(status)) {
    return sendError(res, 400, `Cannot change status from ${order.orderStatus} to ${status}`);
  }

  // Validate tracking number for shipped status
  if (status === 'shipped' && !trackingNumber) {
    return sendError(res, 400, 'Tracking number is required when shipping an order');
  }

  // Update order
  order.orderStatus = status;
  
  if (trackingNumber) {
    order.trackingNumber = trackingNumber;
  }
  
  if (estimatedDelivery) {
    order.estimatedDelivery = new Date(estimatedDelivery);
  }

  // If marking as delivered, set deliveredAt timestamp
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

  // Send email notification only when order is shipped
  if (status === 'shipped') {
    try {
      await sendOrderStatusUpdateEmail(order, order.user, status);
    } catch (emailError) {
      console.error('Failed to send shipping notification email:', emailError);
      // Don't fail the status update if email fails
    }
  }

  // Send push notification for all status updates
  try {
    await notificationService.sendOrderUpdateNotification(
      order.user._id,
      order,
      status,
      {
        trackingNumber: order.trackingNumber,
        estimatedDelivery: order.estimatedDelivery,
        updatedBy: req.user.name
      }
    );
    console.log(`Push notification sent for order ${order._id} status: ${status}`);
  } catch (notificationError) {
    console.error('Failed to send push notification:', notificationError);
    // Don't fail the status update if notification fails
  }

  sendResponse(res, 200, { order }, 'Order status updated successfully');
});

// @desc    Confirm delivery by user (no courier webhook)
// @route   PUT /api/orders/:id/confirm-delivery
// @access  Private (User)
const confirmDelivery = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Only order owner can confirm delivery
  if (order.user._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied');
  }

  // Only shipped orders can be confirmed delivered
  if (order.orderStatus !== 'shipped') {
    return sendError(res, 400, 'Only shipped orders can be confirmed as delivered');
  }

  order.orderStatus = 'delivered';
  order.deliveredAt = new Date();
  order.statusHistory.push({
    status: 'delivered',
    updatedBy: req.user._id,
    note: 'Delivery confirmed by customer'
  });

  await order.save();

  try {
    await sendOrderStatusUpdateEmail(order, order.user, 'delivered');
  } catch (emailError) {
    console.error('Failed to send delivery confirmation email:', emailError);
  }

  // Optional: Push notification
  try {
    await notificationService.sendOrderUpdateNotification(
      order.user._id,
      order,
      'delivered',
      { deliveredAt: order.deliveredAt }
    );
  } catch (notificationError) {
    console.error('Failed to send delivery confirmation notification:', notificationError);
  }

  sendResponse(res, 200, { order }, 'Delivery confirmed successfully');
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

  // Validate cancellation reason
  const { reason } = req.body;
  if (!reason || !reason.trim()) {
    return sendError(res, 400, 'Cancellation reason is required');
  }

  // No inventory management – do not modify product stock on cancel

  order.orderStatus = 'cancelled';
  order.statusHistory.push({
    status: 'cancelled',
    updatedBy: req.user._id,
    note: `Cancelled by customer: ${reason.trim()}`
  });

  await order.save();

  // Send cancellation email notification
  try {
    await sendOrderStatusUpdateEmail(order, req.user, 'cancelled');
  } catch (emailError) {
    console.error('Failed to send cancellation email:', emailError);
    // Don't fail the cancellation if email fails
  }

  sendResponse(res, 200, { order }, 'Order cancelled successfully');
});

// @desc    Return order
// @route   PUT /api/orders/:id/return
// @access  Private (User)
const returnOrder = asyncHandler(async (req, res) => {
  try {
  const order = await Order.findById(req.params.id).populate('user', 'name email');

  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Check if user owns the order
  if (order.user._id.toString() !== req.user._id.toString()) {
    return sendError(res, 403, 'Access denied');
  }

  // Check if order can be returned (must be shipped and within 2 days)
  if (order.orderStatus !== 'shipped' && order.orderStatus !== 'delivered') {
    return sendError(res, 400, `Order must be shipped or delivered to be returned. Current status: ${order.orderStatus}`);
  }

  // Check if order was shipped/delivered within 2 days
  const shippedDate = order.statusHistory.find(h => h.status === 'shipped')?.updatedAt || 
                     order.statusHistory.find(h => h.status === 'delivered')?.updatedAt || 
                     order.updatedAt;
  const hoursSinceDelivered = (new Date() - new Date(shippedDate)) / (1000 * 60 * 60);
  
  if (hoursSinceDelivered > 48) {
    return sendError(res, 400, `Order can only be returned within 48 hours of delivery. Hours since delivered: ${Math.round(hoursSinceDelivered)}`);
  }

  const { reason, description, condition } = req.body;
  
  // Validate required fields
  if (!reason || !description || !condition) {
    return sendError(res, 400, 'Please provide reason, description, and condition');
  }

  // Handle image uploads
  let imageUrls = [];
  if (req.files && req.files.length > 0) {
    try {
      const uploadPromises = req.files.map(file => 
        uploadImage(file, 'return-requests')
      );

      const uploadResults = await Promise.all(uploadPromises);
      imageUrls = uploadResults.map(result => result.url);
    } catch (uploadError) {
      console.error('Image upload error:', uploadError);
      return sendError(res, 500, 'Failed to upload images');
    }
  }

  // Get the count of existing return requests for this order
  const existingCount = await ReturnRequest.countDocuments({ order: order._id });
  
  // Create return request
  const returnRequest = await ReturnRequest.create({
    order: order._id,
    user: req.user._id,
    requestNumber: existingCount + 1,
    reason,
    description,
    condition,
    images: imageUrls,
    status: 'pending'
  });

  // Add return request to order status history
  order.statusHistory.push({
    status: 'return_requested',
    updatedBy: req.user._id,
    note: `Return request #${returnRequest.requestNumber} submitted: ${reason}`
  });

  await order.save();

  // Populate return request with order and user details
  await returnRequest.populate('order user', 'orderId name email');

  // Send email notification to admin
  try {
    await sendReturnRequestEmail(order, req.user, returnRequest);
  } catch (emailError) {
    console.error('Failed to send return request email:', emailError);
  }

  sendResponse(res, 200, { returnRequest }, 'Return request submitted successfully');
  } catch (error) {
    console.error('Error in returnOrder:', error);
    return sendError(res, 500, 'Failed to submit return request');
  }
});

// @desc    Get all return requests (Admin)
// @route   GET /api/orders/return-requests
// @access  Private (Admin)
const getReturnRequests = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, status } = req.query;

  const query = {};
  if (status) {
    query.status = status;
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const returnRequests = await ReturnRequest.find(query)
    .populate({
      path: 'order',
      select: 'orderId totalPrice orderStatus',
      model: 'Order'
    })
    .populate({
      path: 'user',
      select: 'name email',
      model: 'User'
    })
    .populate({
      path: 'processedBy',
      select: 'name',
      model: 'User'
    })
    .sort('-requestedAt')
    .skip(skip)
    .limit(pageLimit);

  const total = await ReturnRequest.countDocuments(query);
  const meta = getPaginationMeta(page, limit, total);

  sendResponse(res, 200, { returnRequests, meta }, 'Return requests retrieved successfully');
});

// @desc    Get return requests for a specific order
// @route   GET /api/orders/:id/return-requests
// @access  Private (User/Admin)
const getOrderReturnRequests = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  
  if (!order) {
    return sendError(res, 404, 'Order not found');
  }

  // Check if user owns the order or is admin
  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 403, 'Access denied');
  }

  const returnRequests = await ReturnRequest.find({ order: req.params.id })
    .populate('processedBy', 'name')
    .sort('-requestedAt');

  sendResponse(res, 200, { returnRequests }, 'Return requests retrieved successfully');
});

// @desc    Process return request (Approve/Reject)
// @route   PUT /api/orders/return-requests/:id/process
// @access  Private (Admin)
const processReturnRequest = asyncHandler(async (req, res) => {
  const { status, adminNotes } = req.body;

  if (!status || !['approved', 'rejected'].includes(status)) {
    return sendError(res, 400, 'Status must be either approved or rejected');
  }

  const returnRequest = await ReturnRequest.findById(req.params.id)
    .populate('order', 'orderId totalPrice orderStatus user')
    .populate('user', 'name email');

  if (!returnRequest) {
    return sendError(res, 404, 'Return request not found');
  }

  if (returnRequest.status !== 'pending') {
    return sendError(res, 400, 'Return request has already been processed');
  }

  // Update return request
  returnRequest.status = status;
  returnRequest.adminNotes = adminNotes;
  returnRequest.processedBy = req.user._id;
  returnRequest.processedAt = new Date();

  await returnRequest.save();

  // Update order status if approved
  if (status === 'approved') {
    const order = await Order.findById(returnRequest.order._id);
    order.orderStatus = 'returned';
    order.statusHistory.push({
      status: 'returned',
      updatedBy: req.user._id,
      note: `Return approved: ${adminNotes || 'No additional notes'}`
    });
    await order.save();
  }

  // Send email notification to user
  try {
    if (status === 'approved') {
      await sendReturnApprovedEmail(returnRequest.order, returnRequest.user, returnRequest);
    } else {
      await sendReturnRejectedEmail(returnRequest.order, returnRequest.user, returnRequest);
    }
  } catch (emailError) {
    console.error('Failed to send return status email:', emailError);
  }

  sendResponse(res, 200, { returnRequest }, `Return request ${status} successfully`);
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrder,
  updateOrderStatus,
  getAllOrders,
  getOrdersByEmployee,
  assignOrderToEmployee,
  cancelOrder,
  returnOrder,
  getReturnRequests,
  getOrderReturnRequests,
  processReturnRequest,
  confirmDelivery
};
