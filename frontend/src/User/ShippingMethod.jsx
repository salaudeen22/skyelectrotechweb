import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiTruck, 
  FiClock, 
  FiShoppingCart, 
  FiArrowRight,
  FiArrowLeft
} from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSettings } from '../contexts/SettingsContext';
import { settingsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const ShippingMethod = () => {
  const navigate = useNavigate();
  const { items: cart, totalPrice: cartTotal, loading: cartLoading } = useCart();
  const { trackClick } = useAnalytics();
  const { settings } = useSettings();
  
  const [shippingMethods, setShippingMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load shipping info and methods on component mount
  useEffect(() => {
    const initializeShippingMethods = async () => {
      // Don't check cart if still loading
      if (cartLoading) {
        return;
      }

      // Don't proceed if settings not loaded yet
      if (!settings || !settings.shipping) {
        return;
      }

      if (!cart || cart.length === 0) {
        toast.error("Your cart is empty. Redirecting...");
        navigate('/user/cart');
        return;
      }

      // Check if shipping info exists
      const storedShippingInfo = localStorage.getItem('shippingInfo');
      if (!storedShippingInfo) {
        toast.error("Please complete shipping information first.");
        navigate('/user/shipping');
        return;
      }

      const parsedShippingInfo = JSON.parse(storedShippingInfo);
      
      // Load shipping methods
      try {
        setLoading(true);
        
        // Get available shipping methods
        const response = await settingsAPI.calculateShippingCost({
          subtotal: cartTotal || 0,
          country: parsedShippingInfo?.country || 'India',
          state: parsedShippingInfo?.state,
        });

        if (response.success) {
          const availableMethods = response.data.availableMethods || [];
          
          // Add default method if no custom methods exist
          if (availableMethods.length === 0) {
            const defaultMethod = {
              _id: 'default',
              name: 'Standard Delivery',
              cost: settings.shipping.defaultShippingCost,
              estimatedDays: '3-5 business days',
              isActive: true
            };
            setShippingMethods([defaultMethod]);
            setSelectedMethod(defaultMethod);
          } else {
            setShippingMethods(availableMethods);
            // Auto-select first active method
            const firstActive = availableMethods.find(method => method.isActive);
            if (firstActive) {
              setSelectedMethod(firstActive);
            }
          }
        }
      } catch (error) {
        console.error('Error loading shipping methods:', error);
        toast.error('Failed to load shipping methods');
        // Fallback to default method
        const defaultMethod = {
          _id: 'default',
          name: 'Standard Delivery',
          cost: settings.shipping.defaultShippingCost,
          estimatedDays: '3-5 business days',
          isActive: true
        };
        setShippingMethods([defaultMethod]);
        setSelectedMethod(defaultMethod);
      } finally {
        setLoading(false);
      }
    };

    initializeShippingMethods();
  }, [cart, navigate, cartLoading, settings, cartTotal]);

  const formatAmount = (num) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);

  const handleMethodSelect = (method) => {
    setSelectedMethod(method);
    trackClick(`shipping_method_selected_${method.name.toLowerCase().replace(/\s+/g, '_')}`, 'shipping');
  };

  const handleProceedToPayment = () => {
    if (!selectedMethod) {
      toast.error('Please select a shipping method');
      return;
    }

    setIsSubmitting(true);

    // Store selected shipping method for payment page
    localStorage.setItem('selectedShippingMethod', JSON.stringify(selectedMethod));
    
    // Track shipping method selection
    trackClick('shipping_method_completed', 'shipping');

    // Navigate to payment page
    navigate('/user/payment');
  };

  const handleBackToShipping = () => {
    navigate('/user/shipping');
  };

  // Calculate totals with selected shipping method
  const totals = {
    subtotal: cartTotal || 0,
    shipping: selectedMethod?.cost || 0,
    tax: Math.round((cartTotal || 0) * (settings.payment.taxRate / 100)),
    get total() { return this.subtotal + this.shipping + this.tax }
  };

  if (loading) {
    return (
      <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="bg-white rounded-lg p-6">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </div>
                ))}
              </div>
              <div className="bg-white rounded-lg p-6">
                <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                <div className="space-y-2">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-4 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Progress Indicator */}
        <div className="mb-8">
          {/* Mobile Progress Indicator */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <div className="w-4 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <div className="w-4 h-1 bg-gray-300"></div>
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-600">Step 2: Shipping Method</p>
            </div>
          </div>
          
          {/* Desktop Progress Indicator */}
          <div className="hidden sm:flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">✓</div>
              <span className="ml-2 text-sm font-medium text-green-600">Shipping Information</span>
            </div>
            <div className="w-8 h-1 bg-green-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="ml-2 text-sm font-medium text-blue-600">Shipping Method</span>
            </div>
            <div className="w-8 h-1 bg-gray-300"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-gray-300 text-gray-600 rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-gray-500">Payment</span>
            </div>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight">Shipping Method</h1>
          <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600">
            Choose your preferred delivery method for your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          
          {/* Left Side: Shipping Methods */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Back Button */}
            <button
              onClick={handleBackToShipping}
              className="flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <FiArrowLeft className="w-4 h-4 mr-2" />
              Back to Shipping Info
            </button>

            {/* Shipping Methods */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-4 flex items-center">
                <FiTruck className="w-6 h-6 mr-3 text-blue-600" />
                Delivery Options
              </h2>
              
              {/* Instant Delivery Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <FiClock className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-semibold text-blue-900 mb-1">Instant Delivery Available</h3>
                    <p className="text-sm text-blue-700">
                      Same-day delivery is available within Bangalore city limits. Orders placed before 5 PM are delivered the same day.
                    </p>
                  </div>
                </div>
              </div>

              {/* Shipping Methods List */}
              {shippingMethods.length > 0 ? (
                <div className="space-y-4">
                  {shippingMethods.map((method) => (
                    <div
                      key={method._id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedMethod?._id === method._id
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleMethodSelect(method)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                            selectedMethod?._id === method._id 
                              ? 'border-blue-500 bg-blue-500' 
                              : 'border-gray-300'
                          }`}>
                            {selectedMethod?._id === method._id && (
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{method.name}</h3>
                            <div className="flex items-center text-sm text-gray-600 mt-1">
                              <FiClock className="w-4 h-4 mr-1" />
                              {method.estimatedDays}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-gray-900">
                            {formatAmount(method.cost)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FiTruck className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No shipping methods available for your location.</p>
                </div>
              )}
            </div>

            {/* Continue Button */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <button 
                onClick={handleProceedToPayment} 
                disabled={isSubmitting || !selectedMethod} 
                className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center ${
                  isSubmitting || !selectedMethod 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Processing...
                  </>
                ) : (
                  <>
                    Continue to Payment
                    <FiArrowRight className="ml-2 w-5 h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Side: Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg lg:sticky lg:top-8">
              <div className="p-6 border-b">
                <h3 className="text-xl font-bold text-gray-800 flex items-center">
                  <FiShoppingCart className="mr-3 text-gray-500"/>
                  Order Summary
                </h3>
              </div>
              <div className="p-6 space-y-4 max-h-80 overflow-y-auto">
                {cart.map(item => (
                  <div key={item.product._id} className="flex items-center space-x-4">
                    <img 
                      src={item.product.images?.[0]?.url || item.product.images?.[0] || 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png'} 
                      alt={item.product.name} 
                      className="w-16 h-16 rounded-md object-cover"
                    />
                    <div className="flex-1">
                      <p className="font-semibold text-slate-800">{item.product.name}</p>
                      <p className="text-sm text-slate-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-medium text-slate-900">{formatAmount((item.product.price || 0) * item.quantity)}</p>
                  </div>
                ))}
              </div>
              <div className="p-6 border-t space-y-3">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal</span>
                  <span>{formatAmount(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Shipping</span>
                  <span>{formatAmount(totals.shipping)}</span>
                </div>
                <div className="flex justify-between text-slate-600 mb-4">
                  <span>Tax ({settings.payment.taxRate}%)</span>
                  <span>{formatAmount(totals.tax)}</span>
                </div>
                <div className="border-t-2 border-dashed pt-4">
                  <div className="flex justify-between font-bold text-xl text-slate-900">
                    <span>Total</span>
                    <span>{formatAmount(totals.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShippingMethod;
