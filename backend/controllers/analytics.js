const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const Category = require('../models/Category');
const ActivityLog = require('../models/ActivityLog');
const { sendResponse, sendError, asyncHandler, paginate, getPaginationMeta } = require('../utils/helpers');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin/Employee)
const getDashboardStats = asyncHandler(async (req, res) => {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfYear = new Date(today.getFullYear(), 0, 1);

  // Basic counts
  const [
    totalOrders,
    totalProducts,
    totalUsers,
    totalCategories
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Category.countDocuments({ isActive: true })
  ]);

  // Revenue statistics
  const revenueStats = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        avgOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  // Today's stats
  const todayStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfToday }
      }
    },
    {
      $group: {
        _id: null,
        todayOrders: { $sum: 1 },
        todayRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // This month's stats
  const monthStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfMonth }
      }
    },
    {
      $group: {
        _id: null,
        monthOrders: { $sum: 1 },
        monthRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Order status distribution
  const orderStatusStats = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // Low stock products
  const lowStockProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  }).select('name stock lowStockThreshold').limit(10);

  // Recent orders (for employees, only assigned orders)
  let recentOrdersQuery = {};
  if (req.user.role === 'employee') {
    recentOrdersQuery.assignedTo = req.user._id;
  }

  const recentOrders = await Order.find(recentOrdersQuery)
    .populate('user', 'name')
    .sort('-createdAt')
    .limit(10)
    .select('_id user totalPrice orderStatus createdAt');

  const stats = {
    overview: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalCategories,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      avgOrderValue: revenueStats[0]?.avgOrderValue || 0
    },
    today: {
      orders: todayStats[0]?.todayOrders || 0,
      revenue: todayStats[0]?.todayRevenue || 0
    },
    thisMonth: {
      orders: monthStats[0]?.monthOrders || 0,
      revenue: monthStats[0]?.monthRevenue || 0
    },
    orderStatusDistribution: orderStatusStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    lowStockProducts,
    recentOrders
  };

  sendResponse(res, 200, { stats }, 'Dashboard statistics retrieved successfully');
});

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private (Admin)
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month', year = new Date().getFullYear() } = req.query;

  let groupBy, dateFormat;
  let matchCondition = {
    orderStatus: { $in: ['delivered', 'shipped'] },
    createdAt: {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${parseInt(year) + 1}-01-01`)
    }
  };

  // Determine grouping based on period
  switch (period) {
    case 'day':
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' },
        day: { $dayOfMonth: '$createdAt' }
      };
      dateFormat = '%Y-%m-%d';
      break;
    case 'week':
      groupBy = {
        year: { $year: '$createdAt' },
        week: { $week: '$createdAt' }
      };
      dateFormat = '%Y-W%U';
      break;
    case 'month':
    default:
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
      dateFormat = '%Y-%m';
      break;
  }

  // Sales over time
  const salesOverTime = await Order.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: groupBy,
        revenue: { $sum: '$totalPrice' },
        orders: { $sum: 1 },
        avgOrderValue: { $avg: '$totalPrice' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Top selling products
  const topProducts = await Order.aggregate([
    { $match: matchCondition },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        productName: { $first: '$orderItems.name' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 10 }
  ]);

  // Revenue by category
  const revenueByCategory = await Order.aggregate([
    { $match: matchCondition },
    { $unwind: '$orderItems' },
    {
      $lookup: {
        from: 'products',
        localField: 'orderItems.product',
        foreignField: '_id',
        as: 'product'
      }
    },
    { $unwind: '$product' },
    {
      $lookup: {
        from: 'categories',
        localField: 'product.category',
        foreignField: '_id',
        as: 'category'
      }
    },
    { $unwind: '$category' },
    {
      $group: {
        _id: '$category._id',
        categoryName: { $first: '$category.name' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        orders: { $sum: 1 }
      }
    },
    { $sort: { revenue: -1 } }
  ]);

  // Monthly comparison (current vs previous year)
  const currentYearRevenue = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ['delivered', 'shipped'] },
        createdAt: {
          $gte: new Date(`${year}-01-01`),
          $lt: new Date(`${parseInt(year) + 1}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const previousYearRevenue = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ['delivered', 'shipped'] },
        createdAt: {
          $gte: new Date(`${parseInt(year) - 1}-01-01`),
          $lt: new Date(`${year}-01-01`)
        }
      }
    },
    {
      $group: {
        _id: { $month: '$createdAt' },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id': 1 } }
  ]);

  const analytics = {
    salesOverTime,
    topProducts,
    revenueByCategory,
    monthlyComparison: {
      currentYear: currentYearRevenue,
      previousYear: previousYearRevenue
    },
    period,
    year
  };

  sendResponse(res, 200, { analytics }, 'Sales analytics retrieved successfully');
});

// @desc    Get product analytics
// @route   GET /api/analytics/products
// @access  Private (Admin)
const getProductAnalytics = asyncHandler(async (req, res) => {
  // Product performance metrics
  const productStats = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $group: {
        _id: null,
        totalProducts: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' },
        avgRating: { $avg: '$ratings.average' }
      }
    }
  ]);

  // Products by category
  const productsByCategory = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $lookup: {
        from: 'categories',
        localField: 'category',
        foreignField: '_id',
        as: 'categoryInfo'
      }
    },
    { $unwind: '$categoryInfo' },
    {
      $group: {
        _id: '$categoryInfo._id',
        categoryName: { $first: '$categoryInfo.name' },
        productCount: { $sum: 1 },
        avgPrice: { $avg: '$price' },
        totalStock: { $sum: '$stock' }
      }
    },
    { $sort: { productCount: -1 } }
  ]);

  // Top rated products
  const topRatedProducts = await Product.find({
    isActive: true,
    'ratings.count': { $gte: 1 }
  })
    .select('name ratings price images')
    .sort('-ratings.average')
    .limit(10)
    .lean();

  // Low stock alert
  const lowStockProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  })
    .select('name stock lowStockThreshold price')
    .sort('stock')
    .lean();

  // Recently added products
  const recentProducts = await Product.find({ isActive: true })
    .populate('category', 'name')
    .populate('createdBy', 'name')
    .select('name price stock createdAt')
    .sort('-createdAt')
    .limit(10)
    .lean();

  // Price distribution
  const priceDistribution = await Product.aggregate([
    {
      $match: { isActive: true }
    },
    {
      $bucket: {
        groupBy: '$price',
        boundaries: [0, 100, 500, 1000, 5000, 10000, Infinity],
        default: 'Other',
        output: {
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' }
        }
      }
    }
  ]);

  const analytics = {
    overview: productStats[0] || {
      totalProducts: 0,
      avgPrice: 0,
      totalStock: 0,
      avgRating: 0
    },
    productsByCategory,
    topRatedProducts,
    lowStockProducts,
    recentProducts,
    priceDistribution
  };

  sendResponse(res, 200, { analytics }, 'Product analytics retrieved successfully');
});

// @desc    Get order analytics
// @route   GET /api/analytics/orders
// @access  Private (Admin/Employee)
const getOrderAnalytics = asyncHandler(async (req, res) => {
  // For employees, only show their assigned orders
  let matchCondition = {};
  if (req.user.role === 'employee') {
    matchCondition.assignedTo = req.user._id;
  }

  // Order status distribution
  const orderStatusStats = await Order.aggregate([
    { $match: matchCondition },
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 },
        totalValue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Orders over time (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const ordersOverTime = await Order.aggregate([
    {
      $match: {
        ...matchCondition,
        createdAt: { $gte: thirtyDaysAgo }
      }
    },
    {
      $group: {
        _id: {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' }
        },
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    },
    { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
  ]);

  // Average order processing time
  const processingTimeStats = await Order.aggregate([
    {
      $match: {
        ...matchCondition,
        orderStatus: { $in: ['delivered', 'shipped'] }
      }
    },
    {
      $addFields: {
        processingTime: {
          $subtract: [
            { $ifNull: ['$deliveredAt', '$updatedAt'] },
            '$createdAt'
          ]
        }
      }
    },
    {
      $group: {
        _id: null,
        avgProcessingTime: { $avg: '$processingTime' },
        minProcessingTime: { $min: '$processingTime' },
        maxProcessingTime: { $max: '$processingTime' }
      }
    }
  ]);

  // Top customers (for admin only)
  let topCustomers = [];
  if (req.user.role === 'admin') {
    topCustomers = await Order.aggregate([
      {
        $group: {
          _id: '$user',
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          avgOrderValue: { $avg: '$totalPrice' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userInfo'
        }
      },
      { $unwind: '$userInfo' },
      {
        $project: {
          userName: '$userInfo.name',
          userEmail: '$userInfo.email',
          totalOrders: 1,
          totalSpent: 1,
          avgOrderValue: 1
        }
      },
      { $sort: { totalSpent: -1 } },
      { $limit: 10 }
    ]);
  }

  const analytics = {
    orderStatusDistribution: orderStatusStats.reduce((acc, item) => {
      acc[item._id] = {
        count: item.count,
        totalValue: item.totalValue
      };
      return acc;
    }, {}),
    ordersOverTime,
    processingTimeStats: processingTimeStats[0] || {
      avgProcessingTime: 0,
      minProcessingTime: 0,
      maxProcessingTime: 0
    },
    topCustomers
  };

  sendResponse(res, 200, { analytics }, 'Order analytics retrieved successfully');
});

// @desc    Get activity logs
// @route   GET /api/analytics/activity-logs
// @access  Private (Admin)
const getActivityLogs = asyncHandler(async (req, res) => {
  const {
    page = 1,
    limit = 50,
    action,
    resource,
    userId,
    dateFrom,
    dateTo
  } = req.query;

  // Build query
  const query = {};

  if (action) {
    query.action = action;
  }

  if (resource) {
    query.resource = resource;
  }

  if (userId) {
    query.user = userId;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const { skip, limit: pageLimit } = paginate(page, limit);

  const logs = await ActivityLog.find(query)
    .populate('user', 'name email role')
    .sort('-createdAt')
    .skip(skip)
    .limit(pageLimit)
    .lean();

  const total = await ActivityLog.countDocuments(query);
  const pagination = getPaginationMeta(total, page, pageLimit);

  sendResponse(res, 200, {
    logs,
    pagination
  }, 'Activity logs retrieved successfully');
});

module.exports = {
  getDashboardStats,
  getSalesAnalytics,
  getProductAnalytics,
  getOrderAnalytics,
  getActivityLogs
};
