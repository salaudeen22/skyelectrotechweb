import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, 
  FiCreditCard, 
  FiSmartphone, 
  FiHome, 
  FiPocket, 
  FiTruck, 
  FiCheck, 
  FiLock,
  FiArrowLeft,
  FiMapPin
} from 'react-icons/fi';
import { useCart } from '../hooks/useCart';
import CouponInput from '../Components/CouponInput';

import { paymentAPI, ordersAPI } from '../services/apiServices';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const Payment = () => {
  const navigate = useNavigate();
  const { items: cart, totalPrice: cartTotal, clearCart } = useCart();

  const { trackOrderPurchase, trackClick } = useAnalytics();
  const { settings } = useSettings();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [processingStep, setProcessingStep] = useState('');
  const [processingProgress, setProcessingProgress] = useState(0);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('online');
  const [shippingInfo, setShippingInfo] = useState(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState(null);
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  const paymentSectionRef = useRef(null);

  // --- Calculations ---
  const totals = {
    subtotal: cartTotal,
    shipping: selectedShippingMethod?.cost || 0,
    tax: Math.round((cartTotal || 0) * (settings.payment.taxRate / 100)),
    discount: appliedCoupon?.discountAmount || 0,
    get total() { return Math.max(0, this.subtotal + this.shipping + this.tax - this.discount) }
  };

  // --- Payment Logic ---
  const loadPaymentMethods = useCallback(async () => {
    try {
      const response = await paymentAPI.getPaymentMethods();
      const methods = response.data.paymentMethods || [];
      setPaymentMethods(methods);
      
      // Set default payment method if available
      if (methods.length > 0) {
        setSelectedMethod(methods[0].id);
      }
    } catch (error) {
      console.error('Error loading payment methods:', error);
      toast.error('Failed to load payment methods');
    }
  }, []);

  // --- Effects ---
  useEffect(() => {
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

    // Check if shipping method is selected
    const storedShippingMethod = localStorage.getItem('selectedShippingMethod');
    if (!storedShippingMethod) {
      toast.error("Please select a shipping method first.");
      navigate('/user/shipping-method');
      return;
    }

    setShippingInfo(JSON.parse(storedShippingInfo));
    setSelectedShippingMethod(JSON.parse(storedShippingMethod));
    loadPaymentMethods();
  }, [cart, navigate, loadPaymentMethods]);

  // Clear checkout data when component unmounts (after successful payment)
  useEffect(() => {
    return () => {
      // Only clear if payment was successful (you can add a flag for this)
      // For now, we'll keep the data until explicitly cleared
    };
  }, []);

  const getMethodIcon = (methodId) => {
    const iconProps = { className: "w-6 h-6" };
    switch (methodId) {
      case 'online': return <FiCreditCard {...iconProps} />;
      case 'cod': return <FiTruck {...iconProps} />;
      default: return <FiCreditCard {...iconProps} />;
    }
  };

  const formatAmount = (num) => new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(num);

  const handleSubmit = async () => {
    if (!paymentMethods || paymentMethods.length === 0) {
      toast.error('No payment methods are available. Please contact support.');
      return;
    }
    trackClick(`pay_button_clicked_${selectedMethod}`, 'payment');
    
    setIsSubmitting(true);
    setProcessingStep('Preparing payment...');

    const orderPayload = {
      orderItems: cart.map(item => ({
        product: item.product._id,
        quantity: item.quantity,
      })),
      shippingInfo: shippingInfo,
      shippingMethod: selectedShippingMethod ? {
        methodId: selectedShippingMethod._id,
        name: selectedShippingMethod.name,
        estimatedDays: selectedShippingMethod.estimatedDays,
        cost: selectedShippingMethod.cost
      } : undefined,
      itemsPrice: totals.subtotal,
      shippingPrice: totals.shipping,
      totalPrice: totals.total,
      couponCode: appliedCoupon?.code || undefined,
    };
    
    try {
      if (selectedMethod === 'cod') {
        await handleCOD(orderPayload);
      } else {
        // Handle all online payments through Razorpay (online method)
        await handleOnlinePayment(orderPayload);
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
    } finally {
      setIsSubmitting(false);
      setProcessingStep('');
      setProcessingProgress(0);
    }
  };

  const handleOnlinePayment = async (orderPayload) => {
    try {
      // Initialize payment first (without creating order)
      const paymentResponse = await paymentAPI.createPaymentOrder({
        amount: orderPayload.totalPrice,
        currency: 'INR',
        method: 'online', // Always use 'online' for Razorpay payments
        orderId: `temp_${Date.now()}`, // Temporary order ID for payment tracking
        customerName: shippingInfo.name,
        customerEmail: shippingInfo.email,
        customerPhone: shippingInfo.phone,
        orderData: orderPayload, // Pass order data to be created after payment success
      });

      const paymentData = paymentResponse.data;
      
      // Check for payment timeout
      if (paymentData.timeoutAt) {
        const timeoutDate = new Date(paymentData.timeoutAt);
        const now = new Date();
        const timeUntilTimeout = timeoutDate.getTime() - now.getTime();
        
        if (timeUntilTimeout <= 0) {
          toast.error('Payment session has expired. Please try again.');
          setIsSubmitting(false);
          return;
        }
        
        // Set a timeout to warn user before payment expires
        setTimeout(() => {
          toast.error('Payment session will expire soon. Please complete your payment.');
        }, timeUntilTimeout - 60000); // Warn 1 minute before expiry
      }
      
      // Track payment initiation
      trackClick('payment_initiated', 'payment');

      // Handle Razorpay integration
      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: settings.storeInfo.name,
        description: `Order Payment`,
        order_id: paymentData.orderId,
        handler: (response) => handlePaymentSuccess(response, orderPayload),
        prefill: {
          name: shippingInfo.name,
          email: shippingInfo.email,
          contact: shippingInfo.phone,
        },
        notes: {
          address: shippingInfo.address,
        },
        theme: {
          color: '#3B82F6',
        },
        modal: {
          ondismiss: () => {
            setIsSubmitting(false);
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      // Add payment failure handler
      razorpay.on('payment.failed', (response) => {
        console.error('Payment failed:', response.error);
        toast.error(`Payment failed: ${response.error.description}`);
        
        // Show retry option for certain failure types
        if (response.error.code === 'PAYMENT_DECLINED' || response.error.code === 'NETWORK_ERROR') {
          const retryPayment = window.confirm(
            'Payment failed due to a temporary issue. Would you like to retry?'
          );
          if (retryPayment) {
            handleOnlinePayment(orderPayload);
            return;
          }
        }
        
        setIsSubmitting(false);
      });
      
      razorpay.open();
      
    } catch (error) {
      console.error('Online payment error:', error);
      toast.error('Failed to initialize payment. Please try again.');
      throw error;
    }
  };

  const handlePaymentSuccess = async (response, orderPayload) => {
    try {
      console.log('Payment success response:', response);
      
      setProcessingStep('Verifying payment...');
      setProcessingProgress(25);
      toast.loading('Verifying your payment...', { id: 'payment-process' });
      
      // Verify payment
      const verificationData = {
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_order_id: response.razorpay_order_id,
        razorpay_signature: response.razorpay_signature,
      };
      
      console.log('Sending verification data:', verificationData);
      
      const verificationResponse = await paymentAPI.verifyPayment(verificationData);
      console.log('Verification response:', verificationResponse);
      console.log('Verification response success:', verificationResponse.success);
      console.log('Verification response data:', verificationResponse.data);
      console.log('Verification response type:', typeof verificationResponse.success);
      console.log('Verification response keys:', Object.keys(verificationResponse));

      if (verificationResponse.success) {
        console.log('Payment verification successful, creating order...');
        
        setProcessingStep('Creating your order...');
        setProcessingProgress(50);
        toast.loading('Payment verified! Creating your order...', { id: 'payment-process' });
        
        // Create order only after payment is verified
        const finalOrderPayload = {
          ...orderPayload,
          paymentInfo: {
            method: selectedMethod,
            status: 'completed',
            transactionId: response.razorpay_payment_id,
            paidAt: new Date()
          },
          razorpayPaymentId: response.razorpay_payment_id,
          razorpayOrderId: response.razorpay_order_id,
        };
        
        console.log('Creating order with payload:', finalOrderPayload);
        
        // Add progress updates during order creation
        setTimeout(() => {
          if (processingStep === 'Creating your order...') {
            setProcessingStep('Saving order details...');
            setProcessingProgress(65);
            toast.loading('Saving your order details...', { id: 'payment-process' });
          }
        }, 3000);
        
        setTimeout(() => {
          if (processingStep.includes('Saving order')) {
            setProcessingStep('Updating inventory...');
            setProcessingProgress(80);
            toast.loading('Updating inventory and sending notifications...', { id: 'payment-process' });
          }
        }, 6000);
        
        // Set a timeout for order creation (30 seconds)
        const orderCreationTimeout = setTimeout(() => {
          if (isSubmitting) {
            setProcessingStep('This is taking longer than expected...');
            toast.loading('This is taking longer than expected. Please wait while we finalize your order...', { id: 'payment-process' });
          }
        }, 10000);
        
        try {
          const orderResponse = await ordersAPI.createOrder(finalOrderPayload);
          clearTimeout(orderCreationTimeout);
          console.log('Order creation response:', orderResponse);
          
          const order = orderResponse.data.order;
          
          setProcessingStep('Finalizing order...');
          setProcessingProgress(90);
          toast.loading('Almost done! Finalizing your order...', { id: 'payment-process' });
          
          // Track successful payment
          trackOrderPurchase(order);

          // Clear cart and redirect
          clearCart();
          clearAllCheckoutData();
          
          console.log('Payment and order creation completed successfully!');
          setIsSubmitting(false);
          setProcessingStep('');
          setProcessingProgress(100);
          toast.success('Payment successful! Your order has been placed.', { id: 'payment-process' });
          navigate(`/user/orders/${order._id}`);
        } catch (orderError) {
          clearTimeout(orderCreationTimeout);
          console.error('Order creation failed:', orderError);
          
          // If order creation fails after payment, initiate automatic refund
          setProcessingStep('Processing automatic refund...');
          toast.loading('Payment successful but order creation failed. Processing automatic refund...', { 
            id: 'payment-process' 
          });
          
          try {
            const refundResponse = await paymentAPI.processRefund({
              paymentId: response.razorpay_payment_id,
              reason: 'Automatic refund - Order creation failed after successful payment',
              orderId: null // No order was created
            });
            
            if (refundResponse.success) {
              setIsSubmitting(false);
              setProcessingStep('');
              setProcessingProgress(0);
              toast.success('Payment refunded successfully! Your money will be credited back in 3-7 business days.', { 
                id: 'payment-process',
                duration: 8000
              });
            } else {
              throw new Error('Refund failed');
            }
          } catch (refundError) {
            console.error('Automatic refund failed:', refundError);
            setIsSubmitting(false);
            setProcessingStep('');
            setProcessingProgress(0);
            toast.error('Payment successful but order creation and refund both failed. Please contact support immediately with payment ID: ' + response.razorpay_payment_id, { 
              id: 'payment-process',
              duration: 15000
            });
          }
          
          throw orderError;
        }
      } else {
        console.log('Payment verification failed:', verificationResponse);
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        response: error.response?.data
      });
      setIsSubmitting(false);
      setProcessingStep('');
      setProcessingProgress(0);
      toast.error('Payment verification failed. Please contact support.', { id: 'payment-process' });
    }
  };

  const handleCOD = async (orderPayload) => {
    try {
      setProcessingStep('Placing your order...');
      toast.loading('Placing your order...', { id: 'cod-process' });
      
      const response = await ordersAPI.createOrder({
        ...orderPayload,
        paymentInfo: {
          method: 'cod',
          status: 'pending'
        }
      });
      
      const order = response.data.order;
      
      // Track COD order
      trackOrderPurchase({
        orderId: order._id,
        amount: totals.total,
        method: 'cod',
      });

      // Clear cart and redirect
      clearCart();
      clearAllCheckoutData();
      
      toast.success('Order placed successfully! You will pay on delivery.', { id: 'cod-process' });
      navigate(`/user/orders/${order._id}`);
      
    } catch (error) {
      console.error('COD order error:', error);
      toast.error('Failed to place order. Please try again.', { id: 'cod-process' });
      throw error;
    }
  };

  const handleBackToShipping = () => {
    navigate('/user/shipping-method');
  };

  const handleCouponApplied = (couponData) => {
    setAppliedCoupon(couponData);
  };

  const handleCouponRemoved = () => {
    setAppliedCoupon(null);
  };

  // Clear all checkout data
  const clearAllCheckoutData = () => {
    localStorage.removeItem('checkout_shipping_info');
    localStorage.removeItem('checkout_selected_address');
    localStorage.removeItem('shippingInfo');
    localStorage.removeItem('selectedAddress');
    localStorage.removeItem('selectedShippingMethod');
  };

  if (!cart || cart.length === 0 || !shippingInfo) return null;

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Progress Indicator */}
        <div className="mb-8">
          {/* Mobile Progress Indicator */}
          <div className="block sm:hidden">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                <FiCheck className="w-4 h-4" />
              </div>
              <div className="w-4 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                <FiCheck className="w-4 h-4" />
              </div>
              <div className="w-4 h-1 bg-green-600"></div>
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-blue-600">Step 3: Payment</p>
            </div>
          </div>
          
          {/* Desktop Progress Indicator */}
          <div className="hidden sm:flex items-center justify-center space-x-4">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                <FiCheck className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Shipping Information</span>
            </div>
            <div className="w-8 h-1 bg-green-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                <FiCheck className="w-4 h-4" />
              </div>
              <span className="ml-2 text-sm font-medium text-green-600">Shipping Method</span>
            </div>
            <div className="w-8 h-1 bg-green-600"></div>
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold">3</div>
              <span className="ml-2 text-sm font-medium text-blue-600">Payment</span>
            </div>
          </div>
        </div>

        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight lg:text-5xl">Payment</h1>
          <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg text-slate-600">
            Choose your preferred payment method to complete your order.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 xl:gap-12 items-start">
          
          {/* Left Side: Payment Methods */}
          <div className="lg:col-span-2 space-y-8">
            {/* Shipping Info Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <FiMapPin className="w-6 h-6 mr-3 text-green-600" />
                Shipping Information
              </h2>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-green-800 font-medium">Name</p>
                    <p className="text-slate-900">{shippingInfo.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Email</p>
                    <p className="text-slate-900">{shippingInfo.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Phone</p>
                    <p className="text-slate-900">{shippingInfo.phone}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-800 font-medium">Address</p>
                    <p className="text-slate-900">{shippingInfo.address}</p>
                    <p className="text-slate-900">{shippingInfo.city}, {shippingInfo.state} {shippingInfo.zipCode}</p>
                  </div>
                </div>
                
                {/* Shipping Method Info */}
                {selectedShippingMethod && (
                  <div className="mt-4 pt-4 border-t border-green-300">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-800 font-medium">Delivery Method</p>
                        <p className="text-slate-900 font-semibold">{selectedShippingMethod.name}</p>
                        <p className="text-sm text-slate-600 flex items-center mt-1">
                          <FiTruck className="w-4 h-4 mr-1" />
                          {selectedShippingMethod.estimatedDays}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-green-800 font-medium">Shipping Cost</p>
                        <p className="text-slate-900 font-semibold">
                          {totals.shipping === 0 ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `₹${selectedShippingMethod.cost}`
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
                <button
                  onClick={handleBackToShipping}
                  className="mt-4 text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center"
                >
                  <FiArrowLeft className="w-4 h-4 mr-1" />
                  Back to Shipping Method
                </button>
              </div>
            </div>

            {/* Payment Method Card */}
            <div ref={paymentSectionRef} className="bg-white rounded-xl shadow-lg p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center">
                <FiCreditCard className="w-6 h-6 mr-3 text-blue-600" />
                Payment Method
              </h2>
              {paymentMethods.length > 0 ? (
                <div className="space-y-4">
                  {paymentMethods.map((method) => (
                    <label key={method.id} className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                      selectedMethod === method.id ? 'border-transparent ring-2 ring-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-300 hover:shadow-sm'
                    }`} onClick={() => setSelectedMethod(method.id)}>
                      <input type="radio" name="paymentMethod" value={method.id} checked={selectedMethod === method.id} onChange={(e) => setSelectedMethod(e.target.value)} className="sr-only"/>
                      <div className={`flex items-center justify-center w-12 h-12 rounded-full mr-4 transition-colors ${
                        selectedMethod === method.id ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getMethodIcon(method.id)}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900 text-lg">{method.name}</h3>
                        <p className="text-sm text-gray-500">{method.description}</p>
                      </div>
                      {selectedMethod === method.id && <div className="w-6 h-6 flex items-center justify-center bg-blue-600 rounded-full text-white"><FiCheck className="w-4 h-4" /></div>}
                    </label>
                  ))}
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800">
                  No payment methods are currently available. Please contact support or try again later.
                </div>
              )}
            </div>

            {/* Coupon Section */}
            <CouponInput
              onCouponApplied={handleCouponApplied}
              onCouponRemoved={handleCouponRemoved}
              orderAmount={totals.subtotal + totals.tax + totals.shipping}
              cartItems={cart}
              appliedCoupon={appliedCoupon}
              disabled={isSubmitting}
            />
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
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatAmount(totals.subtotal)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Shipping</span><span>{formatAmount(totals.shipping)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Tax ({settings.payment.taxRate}%)</span><span>{formatAmount(totals.tax)}</span></div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span>Discount ({appliedCoupon.code})</span>
                    <span>-{formatAmount(totals.discount)}</span>
                  </div>
                )}
                <div className="border-t-2 border-dashed pt-4">
                  <div className="flex justify-between font-bold text-xl text-slate-900">
                    <span>Total</span>
                    <span>{formatAmount(totals.total)}</span>
                  </div>
                </div>
              </div>
              <div className="p-6">
                <button 
                  onClick={handleSubmit} 
                  disabled={isSubmitting || paymentMethods.length === 0} 
                  className={`w-full py-4 px-6 rounded-lg font-bold text-lg text-white transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                    (isSubmitting || paymentMethods.length === 0) ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <div className="flex items-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                        {processingStep || 'Processing...'}
                      </div>
                      {processingProgress > 0 && (
                        <div className="w-full bg-white/20 rounded-full h-2">
                          <div 
                            className="bg-white h-2 rounded-full transition-all duration-500 ease-out" 
                            style={{ width: `${processingProgress}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ) : paymentMethods.length === 0 ? (
                    'No payment methods available'
                  ) : (
                    `Pay Securely ${formatAmount(totals.total)}`
                  )}
                </button>
                {isSubmitting && processingProgress > 0 && (
                  <div className="mt-2 text-center text-sm text-gray-600">
                    {processingProgress}% Complete
                  </div>
                )}
                <div className="mt-4 text-center flex items-center justify-center text-xs text-gray-500">
                  <FiLock className="w-4 h-4 mr-2"/>
                  All transactions are secure and encrypted.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment; 