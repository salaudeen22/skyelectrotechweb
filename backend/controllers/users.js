const User = require('../models/User');
const Order = require('../models/Order');
const { sendResponse, sendError, asyncHandler, paginate, getPaginationMeta } = require('../utils/helpers');

// @desc    Get all users
// @route   GET /api/users
// @access  Private (Admin)
const getAllUsers = asyncHandler(async (req, res) => {
  const { 
    page = 1, 
    limit = 20, 
    role, 
    isActive, 
    search,
    sortBy = 'createdAt',
    sortOrder = 'desc'
  } = req.query;

  // Build query
  const query = {};

  if (role) {
    query.role = role;
  }

  if (isActive !== undefined) {
    query.isActive = isActive === 'true';
  }

  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const { skip, limit: pageLimit } = paginate(page, limit);

  // Sorting
  const sort = {};
  sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

  // Execute query
  const users = await User.find(query)
    .select('-password')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .lean();

  // Get total count
  const total = await User.countDocuments(query);

  // Generate pagination metadata
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    users,
    pagination
  }, 'Users retrieved successfully');
});

// @desc    Get single user
// @route   GET /api/users/:id
// @access  Private (Admin)
const getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id)
    .select('-password')
    .lean();

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Get user statistics
  const orderStats = await Order.aggregate([
    { $match: { user: user._id } },
    {
      $group: {
        _id: null,
        totalOrders: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' },
        avgOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  const stats = orderStats.length > 0 ? orderStats[0] : {
    totalOrders: 0,
    totalSpent: 0,
    avgOrderValue: 0
  };

  sendResponse(res, 200, {
    user: {
      ...user,
      stats
    }
  }, 'User retrieved successfully');
});

// @desc    Create employee
// @route   POST /api/users/employee
// @access  Private (Admin)
const createEmployee = asyncHandler(async (req, res) => {
  const { name, email, password, phone, address, role } = req.body;

  // Validate role
  if (role && !['admin', 'employee'].includes(role)) {
    return sendError(res, 400, 'Role must be either admin or employee');
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return sendError(res, 400, 'User already exists with this email');
  }

  // Create user with specified role (default to employee if not provided)
  const user = await User.create({
    name,
    email,
    password,
    phone,
    address,
    role: role || 'employee',
    emailVerified: true // Admin created accounts are pre-verified
  });

  // Remove password from response
  user.password = undefined;

  sendResponse(res, 201, { user }, `${user.role.charAt(0).toUpperCase() + user.role.slice(1)} created successfully`);
});

// @desc    Update user
// @route   PUT /api/users/:id
// @access  Private (Admin)
const updateUser = asyncHandler(async (req, res) => {
  const allowedFields = ['name', 'email', 'phone', 'address', 'role', 'isActive', 'emailVerified'];
  const updates = {};

  // Only include allowed fields
  allowedFields.forEach(field => {
    if (req.body[field] !== undefined) {
      updates[field] = req.body[field];
    }
  });

  // Check if email is being updated and is unique
  if (updates.email) {
    const existingUser = await User.findOne({
      email: updates.email,
      _id: { $ne: req.params.id }
    });

    if (existingUser) {
      return sendError(res, 400, 'Email already exists');
    }
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    updates,
    { new: true, runValidators: true }
  ).select('-password');

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  sendResponse(res, 200, { user }, 'User updated successfully');
});

// @desc    Delete user (soft delete)
// @route   DELETE /api/users/:id
// @access  Private (Admin)
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return sendError(res, 404, 'User not found');
  }

  // Prevent admin from deleting themselves
  if (user._id.toString() === req.user._id.toString()) {
    return sendError(res, 400, 'You cannot delete your own account');
  }

  // Check if user has any orders
  const orderCount = await Order.countDocuments({ user: user._id });

  if (orderCount > 0) {
    // Soft delete - deactivate account
    await User.findByIdAndUpdate(req.params.id, { isActive: false });
    sendResponse(res, 200, null, 'User account deactivated successfully');
  } else {
    // Hard delete if no orders
    await User.findByIdAndDelete(req.params.id);
    sendResponse(res, 200, null, 'User deleted successfully');
  }
});

// @desc    Get user statistics
// @route   GET /api/users/stats
// @access  Private (Admin)
const getUserStats = asyncHandler(async (req, res) => {
  // Total users by role
  const usersByRole = await User.aggregate([
    {
      $group: {
        _id: '$role',
        count: { $sum: 1 }
      }
    }
  ]);

  // Active vs inactive users
  const usersByStatus = await User.aggregate([
    {
      $group: {
        _id: '$isActive',
        count: { $sum: 1 }
      }
    }
  ]);

  // New users this month
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);

  const newUsersThisMonth = await User.countDocuments({
    createdAt: { $gte: startOfMonth }
  });

  // Users with orders
  const usersWithOrders = await User.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: '_id',
        foreignField: 'user',
        as: 'orders'
      }
    },
    {
      $match: {
        'orders.0': { $exists: true }
      }
    },
    {
      $count: 'usersWithOrders'
    }
  ]);

  const stats = {
    usersByRole: usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    usersByStatus: usersByStatus.reduce((acc, item) => {
      acc[item._id ? 'active' : 'inactive'] = item.count;
      return acc;
    }, {}),
    newUsersThisMonth,
    usersWithOrders: usersWithOrders[0]?.usersWithOrders || 0,
    totalUsers: await User.countDocuments()
  };

  sendResponse(res, 200, { stats }, 'User statistics retrieved successfully');
});

// @desc    Get admin users for notifications
// @route   GET /api/users/admins
// @access  Private (Admin)
const getAdminUsers = asyncHandler(async (req, res) => {
  const adminUsers = await User.find({ 
    role: { $in: ['admin', 'employee'] },
    isActive: true 
  }).select('name email role');

  sendResponse(res, 200, { adminUsers }, 'Admin users retrieved successfully');
});

module.exports = {
  getAllUsers,
  getUser,
  createEmployee,
  updateUser,
  deleteUser,
  getUserStats,
  getAdminUsers
};
