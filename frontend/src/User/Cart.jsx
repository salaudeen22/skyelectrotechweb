import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items: cartItems, updateCartItem, removeFromCart, totalPrice, loading } = useContext(CartContext);
  const { settings } = useSettings();
  const [hasIncompleteCheckout, setHasIncompleteCheckout] = useState(false);
  
  console.log('Cart component rendered:', { cartItems, totalPrice, loading });
  
  // Calculate subtotal dynamically from cart items
  const calculateSubtotal = () => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      // Use currentPrice if available (from backend), otherwise fallback to product.price
      const itemPrice = item.currentPrice || item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  };
  
  const subtotal = calculateSubtotal();
  const shipping = subtotal >= settings.shipping.freeShippingThreshold ? 0 : settings.shipping.defaultShippingCost;
  const total = subtotal + shipping;

  // Check for incomplete checkout data
  useEffect(() => {
    const shippingInfo = localStorage.getItem('shippingInfo');
    const checkoutShippingInfo = localStorage.getItem('checkout_shipping_info');
    
    if (shippingInfo || checkoutShippingInfo) {
      setHasIncompleteCheckout(true);
    }
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    try {
      await updateCartItem(productId, newQuantity);
    } catch {
      toast.error('Failed to update quantity');
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      await removeFromCart(productId);
      toast.success('Item removed from cart');
    } catch {
      toast.error('Failed to remove item');
    }
  };

  const clearIncompleteCheckout = () => {
    if (window.confirm('Are you sure you want to clear your incomplete checkout data?')) {
      localStorage.removeItem('checkout_shipping_info');
      localStorage.removeItem('checkout_selected_address');
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('selectedAddress');
      setHasIncompleteCheckout(false);
      toast.success('Checkout data cleared!');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
              <FaShoppingCart className="text-6xl text-slate-300 mb-4" />
              <h1 className="text-3xl font-bold text-slate-800">Your cart is empty</h1>
              <p className="text-slate-500 mt-2">Looks like you haven't added anything to your cart yet.</p>
              <Link to="/products" className="mt-6 bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition">
                  Continue Shopping
              </Link>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 py-12">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-8">Your Shopping Cart</h1>
            
            {/* Incomplete Checkout Notification */}
            {hasIncompleteCheckout && (
              <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-blue-800 font-medium">Continue Your Checkout</h3>
                    <p className="text-blue-600 text-sm">You have incomplete checkout data. Would you like to continue where you left off?</p>
                  </div>
                  <div className="flex space-x-3">
                    <Link 
                      to="/user/shipping" 
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
                    >
                      Continue Checkout
                    </Link>
                    <button
                      onClick={clearIncompleteCheckout}
                      className="text-blue-600 hover:text-blue-700 text-sm underline"
                    >
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                
                {/* Cart Items */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 space-y-6">
                    {cartItems.map((item) => {
                      // Use currentPrice if available (from backend), otherwise fallback to product.price
                      const itemPrice = item.currentPrice || item.product.price;
                      const itemTotal = itemPrice * item.quantity;
                      
                      return (
                        <div key={item.product._id} className="flex items-center space-x-4 border-b border-slate-200 pb-6 last:border-b-0">
                            <img 
                                src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'} 
                                alt={item.product.name} 
                                className="w-24 h-24 rounded-lg object-cover"
                            />
                            <div className="flex-grow">
                                <h2 className="font-bold text-slate-800">{item.product.name}</h2>
                                <div className="flex items-center gap-2">
                                  <p className="text-sm text-slate-500">Price: ₹{itemPrice.toFixed(2)}</p>
                                  {item.currentPrice && item.currentPrice !== item.product.price && (
                                    <span className="text-xs text-green-600 font-medium">
                                      {Math.round(((item.product.price - item.currentPrice) / item.product.price) * 100)}% OFF
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400">{item.product.brand}</p>
                            </div>
                            <div className="flex items-center space-x-3">
                                <button 
                                    onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="p-1 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <FaMinus size={12}/>
                                </button>
                                <span className="font-bold w-8 text-center">{item.quantity}</span>
                                <button 
                                    onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                    className="p-1 rounded-full bg-slate-200 hover:bg-slate-300"
                                >
                                    <FaPlus size={12}/>
                                </button>
                            </div>
                            <p className="font-bold text-slate-800 w-24 text-right">
                                ₹{itemTotal.toFixed(2)}
                            </p>
                            <button 
                                onClick={() => handleRemoveItem(item.product._id)}
                                className="text-slate-400 hover:text-red-500"
                            >
                                <FaTrash />
                            </button>
                        </div>
                      );
                    })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-6 sticky top-28">
                    <h2 className="text-xl font-bold border-b pb-4 mb-4">Order Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between text-slate-600">
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between text-slate-600">
                            <span>Shipping</span>
                            <span>
                                {shipping === 0 ? (
                                    <span className="text-green-600 font-medium">FREE</span>
                                ) : (
                                    `₹${shipping.toFixed(2)}`
                                )}
                            </span>
                        </div>
                        {shipping > 0 && (
                            <div className="text-xs text-slate-500 bg-blue-50 p-2 rounded">
                                Add ₹{(settings.shipping.freeShippingThreshold - subtotal).toFixed(2)} more for free shipping!
                            </div>
                        )}
                        <div className="flex justify-between font-bold text-slate-900 text-lg border-t pt-3 mt-3">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <Link 
                        to="/user/shipping" 
                        className="mt-6 w-full block text-center bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition"
                    >
                        Proceed to Checkout
                    </Link>
                    <Link 
                        to="/products" 
                        className="mt-3 w-full block text-center border border-blue-600 text-blue-600 font-semibold py-3 rounded-lg hover:bg-blue-50 transition"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
    </div>
  );
};

export default Cart;