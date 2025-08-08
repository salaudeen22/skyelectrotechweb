import React, { useState } from 'react';
import { paymentAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import { ArrowPathIcon } from '@heroicons/react/24/outline';

const PaymentRetryButton = ({ paymentId, onRetrySuccess, delayMinutes = 5, className = '' }) => {
  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.retryPayment(paymentId, delayMinutes);
      
      toast.success('Payment retry scheduled successfully');
      
      if (onRetrySuccess) {
        onRetrySuccess(response.data);
      }
    } catch (error) {
      console.error('Payment retry error:', error);
      toast.error('Failed to retry payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleRetry}
      disabled={loading}
      className={`inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 ${className}`}
    >
      <ArrowPathIcon className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
      {loading ? 'Retrying...' : 'Retry Payment'}
    </button>
  );
};

export default PaymentRetryButton;
