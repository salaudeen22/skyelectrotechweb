const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: false // Optional - for verified purchase reviews
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
    validate: {
      validator: Number.isInteger,
      message: 'Rating must be a whole number between 1 and 5'
    }
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    publicId: {
      type: String,
      required: true
    }
  }],
  isVerifiedPurchase: {
    type: Boolean,
    default: false
  },
  isHelpful: {
    type: Number,
    default: 0
  },
  helpfulVotes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    vote: {
      type: String,
      enum: ['helpful', 'not_helpful'],
      required: true
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  replies: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500
    },
    isAdminReply: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better performance
commentSchema.index({ product: 1, createdAt: -1 });
commentSchema.index({ user: 1, product: 1 });
commentSchema.index({ status: 1, isActive: 1 });

// Virtual for average rating
commentSchema.virtual('averageRating').get(function() {
  return this.rating;
});

// Method to check if user can review (has purchased the product)
commentSchema.methods.canUserReview = async function(userId) {
  const Order = mongoose.model('Order');
  const order = await Order.findOne({
    user: userId,
    'orderItems.product': this.product,
    orderStatus: { $in: ['delivered', 'completed'] }
  });
  return !!order;
};

// Static method to get average rating for a product
commentSchema.statics.getAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        product: new mongoose.Types.ObjectId(productId),
        status: 'approved',
        isActive: true
      }
    },
    {
      $group: {
        _id: null,
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 },
        ratingDistribution: {
          $push: '$rating'
        }
      }
    }
  ]);

  if (result.length === 0) {
    return {
      averageRating: 0,
      totalReviews: 0,
      ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
    };
  }

  const ratingDistribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result[0].ratingDistribution.forEach(rating => {
    ratingDistribution[rating]++;
  });

  return {
    averageRating: Math.round(result[0].averageRating * 10) / 10,
    totalReviews: result[0].totalReviews,
    ratingDistribution
  };
};

// Pre-save middleware to update product rating
commentSchema.pre('save', async function(next) {
  if (this.isModified('rating') || this.isModified('status')) {
    const Product = mongoose.model('Product');
    const ratingData = await this.constructor.getAverageRating(this.product);
    
    await Product.findByIdAndUpdate(this.product, {
      'ratings.average': ratingData.averageRating,
      'ratings.count': ratingData.totalReviews
    });
  }
  next();
});

module.exports = mongoose.model('Comment', commentSchema); 