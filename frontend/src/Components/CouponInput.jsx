import React, { useState } from 'react';
import { FiPercent, FiTag, FiX, FiCheck, FiLoader } from 'react-icons/fi';
import { couponsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const CouponInput = ({ 
  onCouponApplied, 
  onCouponRemoved, 
  orderAmount, 
  cartItems = [],
  appliedCoupon,
  disabled = false 
}) => {
  const [couponCode, setCouponCode] = useState('');
  const [isValidating, setIsValidating] = useState(false);

  const validateCoupon = async () => {
    if (!couponCode.trim()) {
      toast.error('Please enter a coupon code');
      return;
    }

    setIsValidating(true);
    
    try {
      const response = await couponsAPI.validateCoupon(couponCode.trim().toUpperCase(), {
        orderAmount,
        cartItems
      });

      if (response.success) {
        const couponData = {
          code: response.data.coupon.code,
          name: response.data.coupon.name,
          discountType: response.data.coupon.discountType,
          discountValue: response.data.coupon.discountValue,
          discountAmount: response.data.discountAmount,
          finalAmount: response.data.finalAmount
        };
        
        onCouponApplied(couponData);
        setCouponCode('');
        
        // Show success message with remaining uses info
        const remainingUses = response.data.coupon.userRemainingUses;
        let successMessage = `Coupon applied! You saved ₹${response.data.discountAmount}`;
        
        if (remainingUses !== null && remainingUses > 0) {
          successMessage += `. You can use this coupon ${remainingUses} more time(s).`;
        } else if (remainingUses === 0) {
          successMessage += `. This is your last use of this coupon.`;
        }
        
        toast.success(successMessage);
      }
    } catch (error) {
      console.error('Coupon validation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to validate coupon';
      toast.error(errorMessage);
    } finally {
      setIsValidating(false);
    }
  };

  const removeCoupon = () => {
    onCouponRemoved();
    setCouponCode('');
    toast.success('Coupon removed');
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      validateCoupon();
    }
  };

  const formatDiscountText = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    } else {
      return `₹${coupon.discountValue} OFF`;
    }
  };

  const calculateSavingsMessage = (coupon) => {
    const savings = coupon.discountAmount;
    const originalAmount = orderAmount;
    const percentage = ((savings / originalAmount) * 100).toFixed(1);
    
    if (coupon.discountType === 'percentage') {
      return `You saved ₹${savings} (${coupon.discountValue}% off)`;
    } else {
      return `You saved ₹${savings} (${percentage}% off your order)`;
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center mb-3">
        <FiTag className="w-5 h-5 text-blue-600 mr-2" />
        <h3 className="font-semibold text-gray-800">Apply Coupon</h3>
      </div>

      {appliedCoupon ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full mr-3">
                <FiPercent className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <div className="flex items-center">
                  <span className="font-bold text-green-800 mr-2">{appliedCoupon.code}</span>
                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                    {formatDiscountText(appliedCoupon)}
                  </span>
                </div>
                <p className="text-sm text-green-600 mt-1">{appliedCoupon.name}</p>
                <p className="text-sm font-semibold text-green-800 mt-1">
                  {calculateSavingsMessage(appliedCoupon)}
                </p>
                {appliedCoupon.userRemainingUses !== null && (
                  <p className="text-xs text-green-600 mt-1">
                    {appliedCoupon.userRemainingUses > 0 
                      ? `You can use this coupon ${appliedCoupon.userRemainingUses} more time(s)`
                      : 'This was your last use of this coupon'
                    }
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={removeCoupon}
              disabled={disabled}
              className="p-2 text-green-600 hover:text-green-700 hover:bg-green-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              title="Remove coupon"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="flex space-x-2">
            <div className="flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                placeholder="Enter coupon code"
                disabled={disabled || isValidating}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:cursor-not-allowed uppercase text-sm font-mono"
              />
            </div>
            <button
              onClick={validateCoupon}
              disabled={disabled || isValidating || !couponCode.trim()}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all duration-200 flex items-center justify-center min-w-[80px] ${
                disabled || isValidating || !couponCode.trim()
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md hover:shadow-lg'
              }`}
            >
              {isValidating ? (
                <FiLoader className="w-4 h-4 animate-spin" />
              ) : (
                <span>Apply</span>
              )}
            </button>
          </div>

          <div className="text-xs text-gray-500 flex items-center">
            <FiCheck className="w-3 h-3 mr-1" />
            Enter a valid coupon code to get discount on your order
          </div>
        </div>
      )}
    </div>
  );
};

export default CouponInput;