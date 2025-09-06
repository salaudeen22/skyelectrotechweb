import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiCreditCard, FiSmartphone, FiHome, FiPocket, FiTruck, FiCheck, FiX } from 'react-icons/fi';
import { paymentAPI, ordersAPI } from '../services/apiServices';
import { useAnalytics } from '../hooks/useAnalytics';
import { useSettings } from '../contexts/SettingsContext';
import toast from 'react-hot-toast';

const RazorpayPayment = ({ 
  amount, 
  orderData, 
  onSuccess, 
  onFailure, 
  onCancel,
  currency = 'INR' 
}) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [selectedMethod, setSelectedMethod] = useState('online');
  const [orderId, setOrderId] = useState(null);
  const navigate = useNavigate();
  const { trackCheckout, trackOrderPurchase, trackClick } = useAnalytics();
  const { settings } = useSettings();

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    try {
      const response = await paymentAPI.getPaymentMethods();
      setPaymentMethods(response.data.paymentMethods);
    } catch (error) {
      console.error('Error loading payment methods:', error);
    }
  };

  const createOrder = async () => {
    try {
      setLoading(true);
      
      // Create order in our system first
      const orderResponse = await ordersAPI.createOrder(orderData);
      const order = orderResponse.data.order;
      setOrderId(order._id);

      // Track checkout
      trackCheckout(orderData.orderItems, amount);

      // Create Razorpay order
      const paymentResponse = await paymentAPI.createPaymentOrder({
        amount,
        currency,
        orderId: order._id
      });

      return paymentResponse.data;
    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async () => {
    if (selectedMethod === 'cod') {
      await handleCOD();
      return;
    }

    try {
      setLoading(true);
      const paymentData = await createOrder();

      const options = {
        key: paymentData.key,
        amount: paymentData.amount,
        currency: paymentData.currency,
        name: settings.storeInfo.name,
        description: settings.storeInfo.description,
        order_id: paymentData.orderId,
        handler: async (response) => {
          await handlePaymentSuccess(response);
        },
        prefill: {
          name: orderData.shippingInfo?.name || '',
          email: orderData.shippingInfo?.email || '',
          contact: orderData.shippingInfo?.phone || ''
        },
        notes: {
          address: orderData.shippingInfo?.address || '',
          order_id: orderId
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: () => {
            trackClick('payment_modal_dismissed', 'checkout');
            onCancel?.();
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

      trackClick('razorpay_modal_opened', 'checkout');

    } catch (error) {
      console.error('Payment error:', error);
      toast.error('Payment failed. Please try again.');
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (response) => {
    try {
      setLoading(true);

      // Verify payment
      const verificationData = {
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        orderId: orderId
      };

      const verificationResponse = await paymentAPI.verifyPayment(verificationData);

      if (verificationResponse.success) {
        toast.success('Payment successful! Your order has been confirmed.');
        
        // Track successful purchase
        trackOrderPurchase(verificationResponse.data.order);
        trackClick('payment_successful', 'checkout');

        onSuccess?.(verificationResponse.data);
        
        // Navigate to order confirmation
        navigate(`/orders/${orderId}`);
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      console.error('Payment verification error:', error);
      toast.error('Payment verification failed. Please contact support.');
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCOD = async () => {
    try {
      setLoading(true);
      
      // Create order with COD payment method
      const orderResponse = await ordersAPI.createOrder({
        ...orderData,
        paymentInfo: {
          method: 'cod',
          status: 'pending'
        }
      });

      const order = orderResponse.data.order;
      
      toast.success('Order placed successfully! Pay on delivery.');
      
      // Track COD order
      trackOrderPurchase(order);
      trackClick('cod_order_placed', 'checkout');

      onSuccess?.({ order });
      navigate(`/orders/${order._id}`);
    } catch (error) {
      console.error('COD order error:', error);
      toast.error('Failed to place order. Please try again.');
      onFailure?.(error);
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (methodId) => {
    switch (methodId) {
      case 'online':
        return <FiCreditCard className="w-5 h-5" />;
      case 'cod':
        return <FiTruck className="w-5 h-5" />;
      default:
        return <FiCreditCard className="w-5 h-5" />;
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Method</h2>
        <p className="text-gray-600">Choose your preferred payment method</p>
      </div>

      {/* Payment Methods */}
      <div className="space-y-3 mb-6">
        {paymentMethods.map((method) => (
          <label
            key={method.id}
            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-colors ${
              selectedMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <input
              type="radio"
              name="paymentMethod"
              value={method.id}
              checked={selectedMethod === method.id}
              onChange={(e) => setSelectedMethod(e.target.value)}
              className="sr-only"
            />
            <div className="flex items-center space-x-3">
              <div className={`p-2 rounded-full ${
                selectedMethod === method.id ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-600'
              }`}>
                {getMethodIcon(method.id)}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{method.name}</h3>
                <p className="text-sm text-gray-600">{method.description}</p>
              </div>
              {selectedMethod === method.id && (
                <FiCheck className="w-5 h-5 text-blue-500" />
              )}
            </div>
          </label>
        ))}
      </div>

      {/* Order Summary */}
      <div className="border-t pt-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>{formatAmount(amount)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Shipping</span>
            <span>{formatAmount(orderData.shippingPrice || 0)}</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax</span>
            <span>{formatAmount(orderData.taxPrice || 0)}</span>
          </div>
          <div className="border-t pt-2">
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total</span>
              <span>{formatAmount(amount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Button */}
      <button
        onClick={handlePayment}
        disabled={loading}
        className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-colors ${
          loading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-600 hover:bg-blue-700'
        }`}
      >
        {loading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Processing...
          </div>
        ) : (
          `Pay ${formatAmount(amount)}`
        )}
      </button>

      {/* Security Notice */}
      <div className="mt-4 text-center">
        <p className="text-xs text-gray-500">
                          Your payment information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default RazorpayPayment; 