const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Get user's cart
// @route   GET /api/cart
// @access  Private
const getCart = asyncHandler(async (req, res) => {
  let cart = await Cart.findOne({ user: req.user._id })
    .populate('items.product', 'name price discount images isActive')
    .lean();

  let processedCart = null;

  if (!cart) {
    processedCart = {
      user: req.user._id,
      items: [],
      totalItems: 0,
      totalPrice: 0
    };
  } else {
    // Calculate total price with current product prices
    let totalPrice = 0;
    const validItems = [];
    const originalItemsLength = cart.items.length;

    for (const item of cart.items) {
      if (item.product && item.product.isActive) {
        const discountPrice = item.product.discount > 0 
          ? Math.round(item.product.price * (1 - item.product.discount / 100))
          : item.product.price;
        
        const itemTotal = discountPrice * item.quantity;
        totalPrice += itemTotal;
        
        validItems.push({
          ...item,
          currentPrice: discountPrice,
          itemTotal
        });
      }
    }

    processedCart = {
      ...cart,
      items: validItems,
      totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
      totalPrice
    };

    // Update cart in database if items were removed
    if (validItems.length !== originalItemsLength) {
      await Cart.findByIdAndUpdate(cart._id, {
        items: validItems.map(item => ({
          product: item.product._id,
          quantity: item.quantity,
          addedAt: item.addedAt
        }))
      });
    }
  }

  sendResponse(res, 200, { cart: processedCart }, 'Cart retrieved successfully');
});

// @desc    Add item to cart
// @route   POST /api/cart/add
// @access  Private
const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  // Check if product exists and is active
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }

  // No inventory management in this application – skip stock checks

  // Find or create cart
  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = new Cart({
      user: req.user._id,
      items: []
    });
  }

  // Check if product already in cart
  const existingItemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (existingItemIndex > -1) {
    // Update quantity if product already in cart
    const newQuantity = cart.items[existingItemIndex].quantity + quantity;
    
    if (newQuantity > 10) {
      return sendError(res, 400, 'Maximum quantity per item is 10');
    }

    // No stock ceiling beyond per-item limit

    cart.items[existingItemIndex].quantity = newQuantity;
  } else {
    // Add new item to cart
    cart.items.push({
      product: productId,
      quantity
    });
  }

  await cart.save();

  // Populate and return updated cart with calculated totals
  cart = await Cart.findById(cart._id)
    .populate('items.product', 'name price discount images isActive')
    .lean();

  // Calculate total price with current product prices
  let totalPrice = 0;
  const validItems = [];

  for (const item of cart.items) {
    if (item.product && item.product.isActive) {
      const discountPrice = item.product.discount > 0 
        ? Math.round(item.product.price * (1 - item.product.discount / 100))
        : item.product.price;
      
      const itemTotal = discountPrice * item.quantity;
      totalPrice += itemTotal;
      
      validItems.push({
        ...item,
        currentPrice: discountPrice,
        itemTotal
      });
    }
  }

  const processedCart = {
    ...cart,
    items: validItems,
    totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice
  };

  sendResponse(res, 200, { cart: processedCart }, 'Item added to cart successfully');
});

// @desc    Update cart item quantity
// @route   PUT /api/cart/item/:productId
// @access  Private
const updateCartItem = asyncHandler(async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return sendError(res, 404, 'Cart not found');
  }

  // Find item in cart
  const itemIndex = cart.items.findIndex(
    item => item.product.toString() === productId
  );

  if (itemIndex === -1) {
    return sendError(res, 404, 'Item not found in cart');
  }

  // No inventory management in this application – skip stock checks
  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    return sendError(res, 404, 'Product not found');
  }


  // Update quantity
  cart.items[itemIndex].quantity = quantity;
  await cart.save();

  // Return updated cart with calculated totals
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price discount images isActive')
    .lean();

  // Calculate total price with current product prices
  let totalPrice = 0;
  const validItems = [];

  for (const item of updatedCart.items) {
    if (item.product && item.product.isActive) {
      const discountPrice = item.product.discount > 0 
        ? Math.round(item.product.price * (1 - item.product.discount / 100))
        : item.product.price;
      
      const itemTotal = discountPrice * item.quantity;
      totalPrice += itemTotal;
      
      validItems.push({
        ...item,
        currentPrice: discountPrice,
        itemTotal
      });
    }
  }

  const processedCart = {
    ...updatedCart,
    items: validItems,
    totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice
  };

  sendResponse(res, 200, { cart: processedCart }, 'Cart item updated successfully');
});

// @desc    Remove item from cart
// @route   DELETE /api/cart/item/:productId
// @access  Private
const removeFromCart = asyncHandler(async (req, res) => {
  const { productId } = req.params;

  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    return sendError(res, 404, 'Cart not found');
  }

  // Remove item from cart
  cart.items = cart.items.filter(
    item => item.product.toString() !== productId
  );

  await cart.save();

  // Return updated cart with calculated totals
  const updatedCart = await Cart.findById(cart._id)
    .populate('items.product', 'name price discount images isActive')
    .lean();

  // Calculate total price with current product prices
  let totalPrice = 0;
  const validItems = [];

  for (const item of updatedCart.items) {
    if (item.product && item.product.isActive) {
      const discountPrice = item.product.discount > 0 
        ? Math.round(item.product.price * (1 - item.product.discount / 100))
        : item.product.price;
      
      const itemTotal = discountPrice * item.quantity;
      totalPrice += itemTotal;
      
      validItems.push({
        ...item,
        currentPrice: discountPrice,
        itemTotal
      });
    }
  }

  const processedCart = {
    ...updatedCart,
    items: validItems,
    totalItems: validItems.reduce((sum, item) => sum + item.quantity, 0),
    totalPrice
  };

  sendResponse(res, 200, { cart: processedCart }, 'Item removed from cart successfully');
});

// @desc    Clear cart
// @route   DELETE /api/cart/clear
// @access  Private
const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndDelete({ user: req.user._id });

  sendResponse(res, 200, null, 'Cart cleared successfully');
});

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart
};
