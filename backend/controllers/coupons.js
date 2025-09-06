const Coupon = require('../models/Coupon');
const Product = require('../models/Product');

// Create a new coupon (Admin only)
exports.createCoupon = async (req, res) => {
  try {
    const {
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      expirationDate,
      usageLimit,
      userUsageLimit,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      isFirstTimeUserOnly,
      allowedUsers,
      excludedUsers
    } = req.body;

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findByCode(code);
    if (existingCoupon) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code already exists'
      });
    }

    const coupon = new Coupon({
      code,
      name,
      description,
      discountType,
      discountValue,
      minimumOrderAmount,
      maximumDiscountAmount,
      expirationDate,
      usageLimit,
      userUsageLimit,
      applicableProducts,
      applicableCategories,
      excludedProducts,
      excludedCategories,
      isFirstTimeUserOnly,
      allowedUsers,
      excludedUsers,
      createdBy: req.user.id
    });

    await coupon.save();

    res.status(201).json({
      success: true,
      message: 'Coupon created successfully',
      data: { coupon }
    });
  } catch (error) {
    console.error('Create coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create coupon',
      error: error.message
    });
  }
};

// Get all coupons (Admin only) with pagination and filtering
exports.getCoupons = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      discountType,
      search,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const skip = (page - 1) * limit;
    const filter = {};

    // Status filter
    if (status === 'active') {
      filter.isActive = true;
      filter.expirationDate = { $gt: new Date() };
    } else if (status === 'expired') {
      filter.expirationDate = { $lte: new Date() };
    } else if (status === 'inactive') {
      filter.isActive = false;
    }

    // Discount type filter
    if (discountType) {
      filter.discountType = discountType;
    }

    // Search filter
    if (search) {
      filter.$or = [
        { code: { $regex: search, $options: 'i' } },
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const coupons = await Coupon.find(filter)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit));

    const totalCoupons = await Coupon.countDocuments(filter);

    res.json({
      success: true,
      data: {
        coupons,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalCoupons / limit),
          totalItems: totalCoupons,
          itemsPerPage: parseInt(limit)
        }
      }
    });
  } catch (error) {
    console.error('Get coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupons',
      error: error.message
    });
  }
};

// Get coupon by ID (Admin only)
exports.getCouponById = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email')
      .populate('applicableProducts', 'name price images')
      .populate('applicableCategories', 'name')
      .populate('excludedProducts', 'name price images')
      .populate('excludedCategories', 'name')
      .populate('allowedUsers', 'name email')
      .populate('excludedUsers', 'name email')
      .populate('usageHistory.user', 'name email')
      .populate('usageHistory.order', 'orderId totalPrice');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    res.json({
      success: true,
      data: { coupon }
    });
  } catch (error) {
    console.error('Get coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon',
      error: error.message
    });
  }
};

// Update coupon (Admin only)
exports.updateCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = { ...req.body };
    delete updateData.usageHistory; // Prevent manual update of usage history
    delete updateData.usedCount; // Prevent manual update of used count
    updateData.updatedBy = req.user.id;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if code is being changed and if new code already exists
    if (updateData.code && updateData.code !== coupon.code) {
      const existingCoupon = await Coupon.findByCode(updateData.code);
      if (existingCoupon) {
        return res.status(400).json({
          success: false,
          message: 'Coupon code already exists'
        });
      }
    }

    Object.assign(coupon, updateData);
    await coupon.save();

    await coupon.populate('createdBy', 'name email');
    await coupon.populate('updatedBy', 'name email');

    res.json({
      success: true,
      message: 'Coupon updated successfully',
      data: { coupon }
    });
  } catch (error) {
    console.error('Update coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update coupon',
      error: error.message
    });
  }
};

// Delete coupon (Admin only)
exports.deleteCoupon = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    // Check if coupon has been used
    if (coupon.usedCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete coupon that has been used. Deactivate it instead.'
      });
    }

    await Coupon.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Coupon deleted successfully'
    });
  } catch (error) {
    console.error('Delete coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete coupon',
      error: error.message
    });
  }
};

// Validate coupon code (Public/User)
exports.validateCoupon = async (req, res) => {
  try {
    const { code } = req.params;
    const { orderAmount, cartItems = [] } = req.body;
    const userId = req.user?.id;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Coupon code is required'
      });
    }

    if (!orderAmount || orderAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid order amount is required'
      });
    }

    const coupon = await Coupon.findByCode(code)
      .populate('applicableProducts', 'name price')
      .populate('applicableCategories', 'name')
      .populate('excludedProducts', 'name price')
      .populate('excludedCategories', 'name');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Invalid coupon code'
      });
    }

    // Basic validity check
    if (!coupon.isValid()) {
      let message = 'This coupon is no longer valid';
      if (coupon.isExpired) message = 'This coupon has expired';
      if (coupon.isUsageLimitExceeded) message = 'This coupon has reached its usage limit';
      if (!coupon.isActive) message = 'This coupon is inactive';
      
      return res.status(400).json({
        success: false,
        message
      });
    }

    // User-specific validation
    let userRemainingUses = null;
    if (userId) {
      const userValidation = coupon.canUserUseCoupon(userId);
      if (!userValidation.canUse) {
        return res.status(400).json({
          success: false,
          message: userValidation.reason
        });
      }
      
      // Calculate remaining uses for this user
      const userUsageCount = coupon.usageHistory.filter(usage => 
        usage.user.toString() === userId.toString()
      ).length;
      userRemainingUses = Math.max(0, coupon.userUsageLimit - userUsageCount);
    }

    // Check minimum order amount
    if (orderAmount < coupon.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount of ₹${coupon.minimumOrderAmount} is required for this coupon`
      });
    }

    // Calculate applicable amount based on product/category restrictions
    let applicableAmount = orderAmount;
    if (cartItems.length > 0) {
      applicableAmount = await calculateApplicableAmount(coupon, cartItems);
      
      if (applicableAmount === 0) {
        return res.status(400).json({
          success: false,
          message: 'This coupon is not applicable to any items in your cart'
        });
      }
    }

    // Calculate discount
    const discountAmount = coupon.calculateDiscount(orderAmount, applicableAmount);

    res.json({
      success: true,
      data: {
        coupon: {
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          minimumOrderAmount: coupon.minimumOrderAmount,
          maximumDiscountAmount: coupon.maximumDiscountAmount,
          userUsageLimit: coupon.userUsageLimit,
          userRemainingUses: userRemainingUses
        },
        discountAmount,
        applicableAmount,
        finalAmount: orderAmount - discountAmount
      }
    });
  } catch (error) {
    console.error('Validate coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to validate coupon',
      error: error.message
    });
  }
};

// Apply coupon to order (Internal use)
exports.applyCouponToOrder = async (couponCode, userId, orderId, orderAmount, cartItems = []) => {
  try {
    const coupon = await Coupon.findByCode(couponCode)
      .populate('applicableProducts')
      .populate('applicableCategories')
      .populate('excludedProducts')
      .populate('excludedCategories');

    if (!coupon || !coupon.isValid()) {
      throw new Error('Invalid or expired coupon');
    }

    const userValidation = coupon.canUserUseCoupon(userId);
    if (!userValidation.canUse) {
      throw new Error(userValidation.reason);
    }

    if (orderAmount < coupon.minimumOrderAmount) {
      throw new Error(`Minimum order amount of ₹${coupon.minimumOrderAmount} is required`);
    }

    const applicableAmount = await calculateApplicableAmount(coupon, cartItems) || orderAmount;
    const discountAmount = coupon.calculateDiscount(orderAmount, applicableAmount);

    if (discountAmount > 0) {
      await coupon.applyCoupon(userId, orderId, discountAmount);
    }

    return {
      discountAmount,
      applicableAmount,
      couponDetails: {
        code: coupon.code,
        name: coupon.name,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue
      }
    };
  } catch (error) {
    throw error;
  }
};

// Get coupon usage statistics (Admin only)
exports.getCouponStats = async (req, res) => {
  try {
    const { id } = req.params;

    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    const stats = {
      totalUses: coupon.usedCount,
      remainingUses: coupon.remainingUses,
      totalDiscountGiven: coupon.usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0),
      uniqueUsers: new Set(coupon.usageHistory.map(usage => usage.user.toString())).size,
      averageDiscountPerUse: coupon.usedCount > 0 ? 
        coupon.usageHistory.reduce((sum, usage) => sum + usage.discountAmount, 0) / coupon.usedCount : 0,
      usageByDay: {}
    };

    // Calculate usage by day for the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    coupon.usageHistory
      .filter(usage => usage.usedAt >= thirtyDaysAgo)
      .forEach(usage => {
        const date = usage.usedAt.toISOString().split('T')[0];
        stats.usageByDay[date] = (stats.usageByDay[date] || 0) + 1;
      });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get coupon stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch coupon statistics',
      error: error.message
    });
  }
};

// Helper function to calculate applicable amount based on product/category restrictions
async function calculateApplicableAmount(coupon, cartItems) {
  if (!cartItems || cartItems.length === 0) return 0;

  let applicableAmount = 0;

  for (const item of cartItems) {
    const product = await Product.findById(item.product._id || item.product).populate('category');
    if (!product) continue;

    const itemTotal = product.price * item.quantity;
    let isApplicable = true;

    // Check if product is excluded
    if (coupon.excludedProducts.some(p => p._id.toString() === product._id.toString())) {
      isApplicable = false;
    }

    // Check if category is excluded
    if (product.category && coupon.excludedCategories.some(c => c._id.toString() === product.category._id.toString())) {
      isApplicable = false;
    }

    // If applicable products are specified, check inclusion
    if (coupon.applicableProducts.length > 0) {
      isApplicable = coupon.applicableProducts.some(p => p._id.toString() === product._id.toString());
    }

    // If applicable categories are specified, check inclusion
    if (coupon.applicableCategories.length > 0 && product.category) {
      isApplicable = coupon.applicableCategories.some(c => c._id.toString() === product.category._id.toString());
    }

    if (isApplicable) {
      applicableAmount += itemTotal;
    }
  }

  return applicableAmount;
}

// Get user's available coupons (User only)
exports.getAvailableCoupons = async (req, res) => {
  try {
    const userId = req.user.id;
    const { orderAmount } = req.query;

    const filter = {
      isActive: true,
      expirationDate: { $gt: new Date() },
      $expr: {
        $or: [
          { $eq: ['$usageLimit', null] },
          { $lt: ['$usedCount', '$usageLimit'] }
        ]
      }
    };

    // If order amount is provided, filter by minimum order amount
    if (orderAmount) {
      filter.minimumOrderAmount = { $lte: parseFloat(orderAmount) };
    }

    const coupons = await Coupon.find(filter)
      .select('code name description discountType discountValue minimumOrderAmount maximumDiscountAmount expirationDate');

    // Filter coupons user can actually use
    const availableCoupons = [];
    for (const coupon of coupons) {
      const userValidation = coupon.canUserUseCoupon(userId);
      if (userValidation.canUse) {
        availableCoupons.push(coupon);
      }
    }

    res.json({
      success: true,
      data: { coupons: availableCoupons }
    });
  } catch (error) {
    console.error('Get available coupons error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch available coupons',
      error: error.message
    });
  }
};

// Issue coupon to specific users (Admin)
exports.issueCoupon = async (req, res) => {
  try {
    const { id } = req.params;
    const { userIds, channel = 'admin' } = req.body;

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'User IDs array is required'
      });
    }

    const Coupon = require('../models/Coupon');
    const coupon = await Coupon.findById(id);
    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    if (!coupon.canBeIssued()) {
      return res.status(400).json({
        success: false,
        message: 'Coupon cannot be issued (inactive, expired, or issuance limit reached)'
      });
    }

    const results = [];
    const errors = [];

    for (const userId of userIds) {
      try {
        await coupon.issueCoupon(userId, req.user.id, channel);
        results.push({ userId, status: 'issued' });
      } catch (error) {
        errors.push({ userId, error: error.message });
      }
    }

    res.json({
      success: true,
      message: `Coupon issued to ${results.length} user(s)`,
      data: {
        successful: results,
        failed: errors,
        totalIssued: results.length,
        totalFailed: errors.length
      }
    });
  } catch (error) {
    console.error('Issue coupon error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to issue coupon',
      error: error.message
    });
  }
};

// Get coupon issuance statistics (Admin)
exports.getCouponIssuanceStats = async (req, res) => {
  try {
    const { id } = req.params;

    const Coupon = require('../models/Coupon');
    const coupon = await Coupon.findById(id)
      .populate('issuedTo.user', 'name email')
      .populate('issuedTo.issuedBy', 'name email');

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: 'Coupon not found'
      });
    }

    const stats = {
      totalIssued: coupon.issuedCount,
      remainingIssuances: coupon.remainingIssuances,
      issuanceLimit: coupon.issuanceLimit,
      issuedTo: coupon.issuedTo,
      channelBreakdown: {},
      recentIssuances: coupon.issuedTo
        .sort((a, b) => new Date(b.issuedAt) - new Date(a.issuedAt))
        .slice(0, 10)
    };

    // Calculate channel breakdown
    coupon.issuedTo.forEach(issue => {
      stats.channelBreakdown[issue.channel] = (stats.channelBreakdown[issue.channel] || 0) + 1;
    });

    res.json({
      success: true,
      data: { stats }
    });
  } catch (error) {
    console.error('Get coupon issuance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch issuance statistics',
      error: error.message
    });
  }
};