const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Product = require('../models/Product');
const Order = require('../models/Order');
const { sendResponse, sendError, asyncHandler, paginate, getPaginationMeta } = require('../utils/helpers');

// @desc    Get comments for a product
// @route   GET /api/comments/product/:productId
// @access  Public
const getProductComments = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { page = 1, limit = 10, rating, sort = '-createdAt' } = req.query;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  // Build query
  const query = {
    product: productId,
    status: 'approved',
    isActive: true
  };

  // Filter by rating
  if (rating) {
    query.rating = parseInt(rating);
  }

  // Pagination
  const { skip, limit: pageLimit } = paginate(page, limit);

  // Execute query
  const comments = await Comment.find(query)
    .populate('user', 'name avatar')
    .populate('replies.user', 'name avatar')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .lean();

  // Get total count
  const total = await Comment.countDocuments(query);

  // Get rating statistics
  const ratingStats = await Comment.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        isActive: true
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    }
  ]);

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  ratingStats.forEach(stat => {
    ratingDistribution[stat._id] = stat.count;
  });

  // Generate pagination metadata
  const pagination = getPaginationMeta(page, pageLimit, total);

  sendResponse(res, 200, {
    comments,
    pagination,
    ratingDistribution,
    totalReviews: total
  }, 'Comments retrieved successfully');
});

// @desc    Create a new comment
// @route   POST /api/comments
// @access  Private
const createComment = asyncHandler(async (req, res) => {
  const { productId, rating, title, comment, images = [] } = req.body;

  // Validate product exists
  const product = await Product.findById(productId);
  if (!product) {
    return sendError(res, 404, 'Product not found');
  }

  // Check if user has already reviewed this product
  const existingComment = await Comment.findOne({
    user: req.user._id,
    product: productId
  });

  if (existingComment) {
    return sendError(res, 400, 'You have already reviewed this product');
  }

  // Check if user has purchased the product (for verified purchase badge)
  const hasPurchased = await Order.findOne({
    user: req.user._id,
    'orderItems.product': productId,
    orderStatus: { $in: ['delivered', 'completed'] }
  });

  // Create comment
  const newComment = await Comment.create({
    user: req.user._id,
    product: productId,
    rating,
    title,
    comment,
    images,
    isVerifiedPurchase: !!hasPurchased,
    status: req.user.role === 'admin' ? 'approved' : 'pending'
  });

  await newComment.populate('user', 'name avatar');

  sendResponse(res, 201, { comment: newComment }, 'Comment created successfully');
});

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { rating, title, comment, images } = req.body;

  const commentDoc = await Comment.findById(id);

  if (!commentDoc) {
    return sendError(res, 404, 'Comment not found');
  }

  // Check if user owns the comment or is admin
  if (commentDoc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to update this comment');
  }

  // Update comment
  const updatedComment = await Comment.findByIdAndUpdate(
    id,
    {
      rating,
      title,
      comment,
      images,
      status: req.user.role === 'admin' ? 'approved' : 'pending'
    },
    { new: true, runValidators: true }
  ).populate('user', 'name avatar');

  sendResponse(res, 200, { comment: updatedComment }, 'Comment updated successfully');
});

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const comment = await Comment.findById(id);

  if (!comment) {
    return sendError(res, 404, 'Comment not found');
  }

  // Check if user owns the comment or is admin
  if (comment.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    return sendError(res, 403, 'Not authorized to delete this comment');
  }

  // Soft delete
  await Comment.findByIdAndUpdate(id, { isActive: false });

  sendResponse(res, 200, null, 'Comment deleted successfully');
});

// @desc    Add a reply to a comment
// @route   POST /api/comments/:id/replies
// @access  Private
const addReply = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { comment: replyText } = req.body;

  const comment = await Comment.findById(id);

  if (!comment) {
    return sendError(res, 404, 'Comment not found');
  }

  // Add reply
  comment.replies.push({
    user: req.user._id,
    comment: replyText,
    isAdminReply: req.user.role === 'admin'
  });

  await comment.save();
  await comment.populate('replies.user', 'name avatar');

  sendResponse(res, 201, { comment }, 'Reply added successfully');
});

// @desc    Vote on comment helpfulness
// @route   POST /api/comments/:id/vote
// @access  Private
const voteComment = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { vote } = req.body; // 'helpful' or 'not_helpful'

  if (!['helpful', 'not_helpful'].includes(vote)) {
    return sendError(res, 400, 'Invalid vote type');
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return sendError(res, 404, 'Comment not found');
  }

  // Check if user has already voted
  const existingVote = comment.helpfulVotes.find(
    vote => vote.user.toString() === req.user._id.toString()
  );

  if (existingVote) {
    // Update existing vote
    existingVote.vote = vote;
  } else {
    // Add new vote
    comment.helpfulVotes.push({
      user: req.user._id,
      vote
    });
  }

  // Recalculate helpful count
  comment.isHelpful = comment.helpfulVotes.filter(v => v.vote === 'helpful').length;

  await comment.save();

  sendResponse(res, 200, { comment }, 'Vote recorded successfully');
});

// @desc    Get all comments (Admin)
// @route   GET /api/comments
// @access  Private (Admin)
const getAllComments = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, status, product, user, sort = '-createdAt' } = req.query;

  const query = {};

  // Status filter
  if (status) {
    query.status = status;
  }

  // Product filter
  if (product) {
    query.product = product;
  }

  // User filter
  if (user) {
    query.user = user;
  }

  // Pagination
  const { skip, limit: pageLimit } = paginate(page, limit);

  // Execute query
  const comments = await Comment.find(query)
    .populate('user', 'name email')
    .populate('product', 'name images')
    .sort(sort)
    .skip(skip)
    .limit(pageLimit)
    .lean();

  // Get total count
  const total = await Comment.countDocuments(query);

  // Generate pagination metadata
  const pagination = getPaginationMeta(page, pageLimit, total);

  sendResponse(res, 200, {
    comments,
    pagination
  }, 'Comments retrieved successfully');
});

// @desc    Update comment status (Admin)
// @route   PUT /api/comments/:id/status
// @access  Private (Admin)
const updateCommentStatus = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!['pending', 'approved', 'rejected'].includes(status)) {
    return sendError(res, 400, 'Invalid status');
  }

  const comment = await Comment.findById(id);

  if (!comment) {
    return sendError(res, 404, 'Comment not found');
  }

  comment.status = status;
  await comment.save();

  await comment.populate('user', 'name email');
  await comment.populate('product', 'name');

  sendResponse(res, 200, { comment }, 'Comment status updated successfully');
});

// @desc    Get comment statistics
// @route   GET /api/comments/stats
// @access  Private (Admin)
const getCommentStats = asyncHandler(async (req, res) => {
  const stats = await Comment.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  const statusStats = {
    pending: 0,
    approved: 0,
    rejected: 0
  };

  stats.forEach(stat => {
    statusStats[stat._id] = stat.count;
  });

  // Get recent comments
  const recentComments = await Comment.find()
    .populate('user', 'name')
    .populate('product', 'name')
    .sort('-createdAt')
    .limit(5)
    .lean();

  sendResponse(res, 200, {
    statusStats,
    recentComments
  }, 'Comment statistics retrieved successfully');
});

module.exports = {
  getProductComments,
  createComment,
  updateComment,
  deleteComment,
  addReply,
  voteComment,
  getAllComments,
  updateCommentStatus,
  getCommentStats
}; 