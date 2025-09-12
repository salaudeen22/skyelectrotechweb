import { useContext, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaPlus, FaMinus, FaTrash, FaShoppingCart } from 'react-icons/fa';
import { CartContext } from '../contexts/CartContext';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Cart = () => {
  const { items: cartItems, updateCartItem, removeFromCart, loading } = useContext(CartContext);
  const { settings } = useSettings();
  const [hasIncompleteCheckout, setHasIncompleteCheckout] = useState(false);
  
  // Calculate subtotal dynamically from cart items - memoized
  const subtotal = useMemo(() => {
    if (!cartItems || cartItems.length === 0) return 0;
    
    return cartItems.reduce((total, item) => {
      // Use currentPrice if available (from backend), otherwise fallback to product.price
      const itemPrice = item.currentPrice || item.product.price;
      return total + (itemPrice * item.quantity);
    }, 0);
  }, [cartItems]);
  
  const shipping = useMemo(() => {
    return settings.shipping.defaultShippingCost;
  }, [settings.shipping.defaultShippingCost]);
  
  const total = useMemo(() => {
    return subtotal + shipping;
  }, [subtotal, shipping]);

  // Check for incomplete checkout data
  useEffect(() => {
    const shippingInfo = localStorage.getItem('shippingInfo');
    const checkoutShippingInfo = localStorage.getItem('checkout_shipping_info');
    const selectedShippingMethod = localStorage.getItem('selectedShippingMethod');
    
    if (shippingInfo || checkoutShippingInfo || selectedShippingMethod) {
      setHasIncompleteCheckout(true);
    }
  }, []);

  const handleQuantityChange = async (productId, newQuantity) => {
    if (newQuantity < 1) return;
    await updateCartItem(productId, newQuantity);
  };

  const handleRemoveItem = async (productId) => {
    await removeFromCart(productId);
  };

  const clearIncompleteCheckout = () => {
    if (window.confirm('Are you sure you want to clear your incomplete checkout data?')) {
      localStorage.removeItem('checkout_shipping_info');
      localStorage.removeItem('checkout_selected_address');
      localStorage.removeItem('shippingInfo');
      localStorage.removeItem('selectedAddress');
      localStorage.removeItem('selectedShippingMethod');
      setHasIncompleteCheckout(false);
      toast.success('Checkout data cleared!');
    }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen flex flex-col">
        <div className="flex-1 flex justify-center items-center min-h-[70vh]">
          <div className="animate-spin rounded-full h-8 w-8 sm:h-12 sm:w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  if (!cartItems || cartItems.length === 0) {
      return (
          <div className="bg-slate-50 min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center min-h-[70vh] text-center px-4">
                <FaShoppingCart className="text-4xl sm:text-6xl text-slate-300 mb-3 sm:mb-4" />
                <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">Your cart is empty</h1>
                <p className="text-slate-500 mt-2 text-sm sm:text-base">Looks like you haven't added anything to your cart yet.</p>
                <Link to="/products" className="mt-4 sm:mt-6 bg-blue-600 text-white font-semibold px-4 sm:px-6 py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base">
                    Continue Shopping
                </Link>
            </div>
          </div>
      );
  }

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      <div className="flex-1 py-4 sm:py-8 lg:py-12">
        <div className="max-w-screen-xl mx-auto px-2 sm:px-4 lg:px-8">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 mb-4 sm:mb-6 lg:mb-8">Your Shopping Cart</h1>
            
            {/* Incomplete Checkout Notification */}
            {hasIncompleteCheckout && (
              <div className="mb-4 sm:mb-6 bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-blue-800 font-medium text-sm sm:text-base">Continue Your Checkout</h3>
                    <p className="text-blue-600 text-xs sm:text-sm">You have incomplete checkout data. Would you like to continue where you left off?</p>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
                    <Link 
                      to="/user/shipping" 
                      className="bg-blue-600 text-white px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm hover:bg-blue-700 transition text-center"
                    >
                      Continue Checkout
                    </Link>
                    <button
                      onClick={clearIncompleteCheckout}
                      className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm underline text-center"
                    >
                      Clear Data
                    </button>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 items-start">
                
                {/* Cart Items */}
                <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 space-y-4 sm:space-y-6">
                    {cartItems.map((item) => {
                      // Use currentPrice if available (from backend), otherwise fallback to product.price
                      const itemPrice = item.currentPrice || item.product.price;
                      const itemTotal = itemPrice * item.quantity;
                      
                      return (
                        <div key={item.product._id} className="flex flex-col sm:flex-row sm:items-center space-y-3 sm:space-y-0 sm:space-x-3 lg:space-x-4 border-b border-slate-200 pb-4 sm:pb-6 last:border-b-0">
                            {/* Product Image */}
                            <img 
                                src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'} 
                                alt={item.product.name} 
                                className="w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 rounded-lg object-cover flex-shrink-0 self-start sm:self-center"
                            />
                            
                            {/* Product Info */}
                            <div className="flex-1 min-w-0">
                                <h2 className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg truncate">{item.product.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                  <p className="text-xs sm:text-sm text-slate-500">Price: ₹{itemPrice.toFixed(2)}</p>
                                  {item.currentPrice && item.currentPrice !== item.product.price && (
                                    <span className="text-xs text-green-600 font-medium">
                                      {Math.round(((item.product.price - item.currentPrice) / item.product.price) * 100)}% OFF
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-slate-400 mt-1">{item.product.brand}</p>
                            </div>
                            
                            {/* Quantity Controls */}
                            <div className="flex items-center justify-between sm:justify-end space-x-2 sm:space-x-3">
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <button 
                                        onClick={() => handleQuantityChange(item.product._id, item.quantity - 1)}
                                        disabled={item.quantity <= 1}
                                        className="p-1 sm:p-1.5 rounded-full bg-slate-200 hover:bg-slate-300 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <FaMinus size={10} className="sm:w-3 sm:h-3"/>
                                    </button>
                                    <span className="font-bold w-6 sm:w-8 text-center text-sm sm:text-base">{item.quantity}</span>
                                    <button 
                                        onClick={() => handleQuantityChange(item.product._id, item.quantity + 1)}
                                        className="p-1 sm:p-1.5 rounded-full bg-slate-200 hover:bg-slate-300"
                                    >
                                        <FaPlus size={10} className="sm:w-3 sm:h-3"/>
                                    </button>
                                </div>
                                
                                {/* Price and Remove */}
                                <div className="flex items-center space-x-2 sm:space-x-3">
                                    <p className="font-bold text-slate-800 text-sm sm:text-base lg:text-lg">
                                        ₹{itemTotal.toFixed(2)}
                                    </p>
                                    <button 
                                        onClick={() => handleRemoveItem(item.product._id)}
                                        className="text-slate-400 hover:text-red-500 p-1"
                                    >
                                        <FaTrash size={12} className="sm:w-4 sm:h-4"/>
                                    </button>
                                </div>
                            </div>
                        </div>
                      );
                    })}
                </div>

                {/* Order Summary */}
                <div className="lg:col-span-1 bg-white rounded-xl shadow-lg p-3 sm:p-4 lg:p-6 sticky top-20 sm:top-28">
                    <h2 className="text-lg sm:text-xl font-bold border-b pb-3 sm:pb-4 mb-3 sm:mb-4">Order Summary</h2>
                    <div className="space-y-2 sm:space-y-3">
                        <div className="flex justify-between text-slate-600 text-sm sm:text-base">
                            <span>Subtotal ({cartItems.length} items)</span>
                            <span>₹{subtotal.toFixed(2)}</span>
                        </div>
                
                        <div className="flex justify-between font-bold text-slate-900 text-base sm:text-lg border-t pt-3 mt-3">
                            <span>Total</span>
                            <span>₹{total.toFixed(2)}</span>
                        </div>
                    </div>
                    <Link 
                        to="/user/shipping" 
                        className="mt-4 sm:mt-6 w-full block text-center bg-blue-600 text-white font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-700 transition text-sm sm:text-base"
                    >
                        Proceed to Checkout
                    </Link>
                    <Link 
                        to="/products" 
                        className="mt-2 sm:mt-3 w-full block text-center border border-blue-600 text-blue-600 font-semibold py-2 sm:py-3 rounded-lg hover:bg-blue-50 transition text-sm sm:text-base"
                    >
                        Continue Shopping
                    </Link>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;