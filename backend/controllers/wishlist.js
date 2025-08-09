const Wishlist = require('../models/Wishlist');
const Product = require('../models/Product');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get user's wishlist
// @route   GET /api/wishlist
// @access  Private
const getWishlist = asyncHandler(async (req, res) => {
  let wishlist = await Wishlist.findOne({ user: req.user._id })
    .populate('products.product', 'name price discount images isActive ratings')
    .lean();

  if (!wishlist) {
    wishlist = {
      user: req.user._id,
      products: []
    };
  } else {
    // Filter out inactive products
    const activeProducts = wishlist.products.filter(
      item => item.product && item.product.isActive
    );

    if (activeProducts.length !== wishlist.products.length) {
      // Update wishlist to remove inactive products
      await Wishlist.findByIdAndUpdate(wishlist._id, {
        products: activeProducts
      });
    }

    wishlist.products = activeProducts;
  }

  sendResponse(res, 200, { wishlist }, 'Wishlist retrieved successfully');
});

// @desc    Add item to wishlist
// @route   POST /api/wishlist/add
// @access  Private
const addToWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // Find or create wishlist
  let wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    wishlist = new Wishlist({
      user: req.user._id,
      products: []
    });
  }

  // Check if product already in wishlist
  const existingProduct = wishlist.products.find(
    item => item.product.toString() === productId
  );

  if (existingProduct) {
    return sendError(res, 400, 'Product already in wishlist');
  }

  // Add product to wishlist
  wishlist.products.push({
    product: productId
  });

  await wishlist.save();

  // Populate and return updated wishlist
  wishlist = await Wishlist.findById(wishlist._id)
    .populate('products.product', 'name price discount images ratings')
    .lean();

  sendResponse(res, 200, { wishlist }, 'Item added to wishlist successfully');
});

// @desc    Remove item from wishlist
// @route   DELETE /api/wishlist/item/:productId
// @access  Private
const removeFromWishlist = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const wishlist = await Wishlist.findOne({ user: req.user._id });

  if (!wishlist) {
    return sendError(res, 404, 'Wishlist not found');
  }

  // Remove product from wishlist
  wishlist.products = wishlist.products.filter(
    item => item.product.toString() !== productId
  );

  await wishlist.save();

  // Return updated wishlist
  const updatedWishlist = await Wishlist.findById(wishlist._id)
    .populate('products.product', 'name price discount images ratings')
    .lean();

  sendResponse(res, 200, { wishlist: updatedWishlist }, 'Item removed from wishlist successfully');
});

// @desc    Clear wishlist
// @route   DELETE /api/wishlist/clear
// @access  Private
const clearWishlist = asyncHandler(async (req, res) => {
  await Wishlist.findOneAndDelete({ user: req.user._id });

  sendResponse(res, 200, null, 'Wishlist cleared successfully');
});

module.exports = {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist
};
