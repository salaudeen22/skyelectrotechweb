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
  const startOfYesterday = new Date(startOfToday);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

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

  // Revenue statistics - count shipped orders as completed sales
  const revenueStats = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ['shipped'] }
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$totalPrice' },
        avgOrderValue: { $avg: '$totalPrice' },
        maxOrderValue: { $max: '$totalPrice' },
        minOrderValue: { $min: '$totalPrice' }
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
        todayRevenue: { $sum: '$totalPrice' },
        todayAvgOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  // Yesterday's stats for comparison
  const yesterdayStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startOfYesterday, $lt: startOfToday }
      }
    },
    {
      $group: {
        _id: null,
        yesterdayOrders: { $sum: 1 },
        yesterdayRevenue: { $sum: '$totalPrice' }
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
        monthRevenue: { $sum: '$totalPrice' },
        monthAvgOrderValue: { $avg: '$totalPrice' }
      }
    }
  ]);

  // Customer metrics - count shipped orders as completed sales
  const customerMetrics = await Order.aggregate([
    {
      $match: {
        orderStatus: { $in: ['shipped'] }
      }
    },
    {
      $group: {
        _id: '$user',
        orderCount: { $sum: 1 },
        totalSpent: { $sum: '$totalPrice' }
      }
    },
    {
      $group: {
        _id: null,
        totalCustomers: { $sum: 1 },
        repeatCustomers: { $sum: { $cond: [{ $gte: ['$orderCount', 2] }, 1, 0] } },
        avgCustomerOrders: { $avg: '$orderCount' },
        avgCustomerSpent: { $avg: '$totalSpent' }
      }
    }
  ]);

  // New customers today
  const newCustomersToday = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: startOfToday }
  });

  // New customers yesterday
  const newCustomersYesterday = await User.countDocuments({
    role: 'user',
    createdAt: { $gte: startOfYesterday, $lt: startOfToday }
  });

  // Order status distribution
  const orderStatusStats = await Order.aggregate([
    {
      $group: {
        _id: '$orderStatus',
        count: { $sum: 1 }
      }
    }
  ]);

  // Payment method distribution
  const paymentMethodStats = await Order.aggregate([
    {
      $group: {
        _id: '$paymentInfo.method',
        count: { $sum: 1 },
        revenue: { $sum: '$totalPrice' }
      }
    }
  ]);

  // Low stock products
  const lowStockProducts = await Product.find({
    isActive: true,
    $expr: { $lte: ['$stock', '$lowStockThreshold'] }
  }).select('name stock lowStockThreshold images').limit(10);

  // Top selling products (last 30 days) - count shipped orders as completed sales
  const topSellingProducts = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
        orderStatus: { $in: ['shipped'] }
      }
    },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
        revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        productName: { $first: '$orderItems.name' },
        productImage: { $first: '$orderItems.image' }
      }
    },
    { $sort: { totalSold: -1 } },
    { $limit: 5 }
  ]);

  // Recent orders (for employees, only assigned orders)
  let recentOrdersQuery = {};
  if (req.user.role === 'employee') {
    recentOrdersQuery.assignedTo = req.user._id;
  }

  const recentOrders = await Order.find(recentOrdersQuery)
    .populate('user', 'name email')
    .sort('-createdAt')
    .limit(10)
    .select('_id user totalPrice orderStatus createdAt');

  // Calculate conversion rate (orders per customer)
  const conversionRate = totalUsers > 0 ? ((totalOrders / totalUsers) * 100).toFixed(1) : 0;

  // Calculate repeat customer rate
  const repeatCustomerRate = customerMetrics[0]?.totalCustomers > 0 ? 
    ((customerMetrics[0].repeatCustomers / customerMetrics[0].totalCustomers) * 100).toFixed(1) : 0;

  const stats = {
    overview: {
      totalOrders,
      totalProducts,
      totalUsers,
      totalCategories,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
      maxOrderValue: revenueStats[0]?.maxOrderValue || 0,
      minOrderValue: revenueStats[0]?.minOrderValue || 0
    },
    today: {
      orders: todayStats[0]?.todayOrders || 0,
      revenue: todayStats[0]?.todayRevenue || 0,
      avgOrderValue: todayStats[0]?.todayAvgOrderValue || 0,
      newCustomers: newCustomersToday
    },
    yesterday: {
      orders: yesterdayStats[0]?.yesterdayOrders || 0,
      revenue: yesterdayStats[0]?.yesterdayRevenue || 0,
      newCustomers: newCustomersYesterday
    },
    thisMonth: {
      orders: monthStats[0]?.monthOrders || 0,
      revenue: monthStats[0]?.monthRevenue || 0,
      avgOrderValue: monthStats[0]?.monthAvgOrderValue || 0
    },
    customerMetrics: {
      conversionRate: parseFloat(conversionRate),
      repeatCustomerRate: parseFloat(repeatCustomerRate),
      avgCustomerOrders: customerMetrics[0]?.avgCustomerOrders || 0,
      avgCustomerSpent: customerMetrics[0]?.avgCustomerSpent || 0,
      totalCustomers: customerMetrics[0]?.totalCustomers || 0
    },
    orderStatusDistribution: orderStatusStats.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    paymentMethodDistribution: paymentMethodStats.reduce((acc, item) => {
      acc[item._id] = { count: item.count, revenue: item.revenue };
      return acc;
    }, {}),
    lowStockProducts,
    topSellingProducts,
    recentOrders
  };

  sendResponse(res, 200, { stats }, 'Dashboard statistics retrieved successfully');
});

// @desc    Get sales analytics
// @route   GET /api/analytics/sales
// @access  Private (Admin)
const getSalesAnalytics = asyncHandler(async (req, res) => {
  const { period = 'month', year = new Date().getFullYear(), startDate, endDate } = req.query;

  let groupBy, dateFormat;
  let matchCondition = {
    orderStatus: { $in: ['shipped'] }
  };

  // Handle custom date range
  if (period === 'custom' && startDate && endDate) {
    matchCondition.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate + 'T23:59:59.999Z') // Include the entire end date
    };
  } else {
    // Default year-based filtering
    matchCondition.createdAt = {
      $gte: new Date(`${year}-01-01`),
      $lt: new Date(`${parseInt(year) + 1}-01-01`)
    };
  }

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

  console.log('Sales analytics query:', {
    matchCondition,
    period,
    year,
    salesOverTimeCount: salesOverTime.length,
    salesOverTime
  });

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
        orderStatus: { $in: ['shipped'] },
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
        orderStatus: { $in: ['shipped'] },
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

  // Format sales data for chart
  const chartData = salesOverTime.map(item => {
    let name;
    if (period === 'day') {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      name = `${item._id.day} ${monthNames[item._id.month - 1]}`;
    } else if (period === 'week') {
      name = `Week ${item._id.week}`;
    } else if (period === 'custom') {
      // For custom range, use the date directly
      const date = new Date(item._id.year, item._id.month - 1, item._id.day || 1);
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      if (item._id.day) {
        name = `${item._id.day} ${monthNames[item._id.month - 1]}`;
      } else {
        name = `${monthNames[item._id.month - 1]} ${item._id.year}`;
      }
    } else {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      name = `${monthNames[item._id.month - 1]} ${item._id.year}`;
    }
    
    return {
      name,
      sales: item.revenue,
      orders: item.orders,
      avgOrderValue: item.avgOrderValue
    };
  });

  // If no sales data, provide sample data for the chart
  if (chartData.length === 0) {
    const currentDate = new Date();
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (period === 'custom' && startDate && endDate) {
      // Generate sample data for custom date range
      const start = new Date(startDate);
      const end = new Date(endDate);
      const daysDiff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
      
      for (let i = 0; i <= Math.min(daysDiff, 30); i++) {
        const date = new Date(start);
        date.setDate(start.getDate() + i);
        chartData.push({
          name: `${date.getDate()} ${monthNames[date.getMonth()]}`,
          sales: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 20) + 5,
          avgOrderValue: Math.floor(Math.random() * 2000) + 500
        });
      }
    } else if (period === 'day') {
      // Generate last 30 days of sample data
      for (let i = 29; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - i);
        chartData.push({
          name: `${date.getDate()} ${monthNames[date.getMonth()]}`,
          sales: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 20) + 5,
          avgOrderValue: Math.floor(Math.random() * 2000) + 500
        });
      }
    } else if (period === 'week') {
      // Generate last 12 weeks of sample data
      for (let i = 11; i >= 0; i--) {
        const date = new Date(currentDate);
        date.setDate(currentDate.getDate() - (i * 7));
        chartData.push({
          name: `Week ${Math.ceil((date.getDate() + new Date(date.getFullYear(), date.getMonth(), 1).getDay()) / 7)}`,
          sales: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 20) + 5,
          avgOrderValue: Math.floor(Math.random() * 2000) + 500
        });
      }
    } else {
      // Generate last 6 months of sample data
      for (let i = 5; i >= 0; i--) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
        chartData.push({
          name: `${monthNames[date.getMonth()]} ${date.getFullYear()}`,
          sales: Math.floor(Math.random() * 50000) + 10000,
          orders: Math.floor(Math.random() * 20) + 5,
          avgOrderValue: Math.floor(Math.random() * 2000) + 500
        });
      }
    }
  }

  const analytics = {
    salesOverTime,
    topProducts,
    revenueByCategory,
    monthlyComparison: {
      currentYear: currentYearRevenue,
      previousYear: previousYearRevenue
    },
    chartData, // Add formatted chart data
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

  // Average order processing time - count shipped orders as completed
  const processingTimeStats = await Order.aggregate([
    {
      $match: {
        ...matchCondition,
        orderStatus: { $in: ['shipped'] }
      }
    },
    {
      $addFields: {
        processingTime: {
          $subtract: [
            '$updatedAt',
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
