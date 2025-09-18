const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Product price is required'],
    min: [0, 'Price cannot be negative']
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative'],
    max: [100, 'Discount cannot exceed 100%']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Product category is required']
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  brand: {
    type: String,
    maxlength: [50, 'Brand name cannot exceed 50 characters']
  },
  sku: {
    type: String,
    required: [true, 'SKU is required']
    // unique: true - removed to avoid duplicate index warning, handled in schema.index()
  },
  images: [{
    public_id: {
      type: String,
      required: true
    },
    url: {
      type: String,
      required: true
    }
  }],
  specifications: [{
    name: String,
    value: String
  }],
  features: [String],
  tags: [String],
  seoKeywords: {
    type: String,
    maxlength: [200, 'SEO keywords cannot exceed 200 characters'],
    trim: true
  },
  ratings: {
    average: {
      type: Number,
      default: 0,
      min: [0, 'Rating cannot be negative'],
      max: [5, 'Rating cannot exceed 5']
    },
    count: {
      type: Number,
      default: 0
    }
  },
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: {
      type: String,
      maxlength: [500, 'Review comment cannot exceed 500 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number,
    weight: Number
  },
  warranty: {
    type: String,
    maxlength: [100, 'Warranty information cannot exceed 100 characters']
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Update the updatedAt field before saving
productSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Calculate discount price
productSchema.virtual('discountPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

// Ensure virtual fields are serialized
productSchema.set('toJSON', { virtuals: true });
productSchema.set('toObject', { virtuals: true });

// Optimized compound indexes for better query performance
productSchema.index({ name: 'text', description: 'text', brand: 'text' });

// High-performance compound indexes
productSchema.index({ isActive: 1, category: 1, price: 1 }); // Main product queries
productSchema.index({ isActive: 1, isFeatured: 1, 'ratings.average': -1 }); // Featured products
productSchema.index({ isActive: 1, category: 1, 'ratings.average': -1, createdAt: -1 }); // Category sorting
productSchema.index({ isActive: 1, price: 1, 'ratings.average': -1 }); // Price range + rating
productSchema.index({ isActive: 1, brand: 1, createdAt: -1 }); // Brand filtering
productSchema.index({ sku: 1 }, { unique: true }); // Unique SKU lookup
productSchema.index({ createdAt: -1, isActive: 1 }); // Recent products
productSchema.index({ 'ratings.average': -1, 'ratings.count': -1 }); // Top-rated products

module.exports = mongoose.model('Product', productSchema);
