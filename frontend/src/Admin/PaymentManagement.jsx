import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../services/apiServices';
import { toast } from 'react-hot-toast';
import { 
  ClockIcon, 
  ExclamationTriangleIcon, 
  CheckCircleIcon, 
  XCircleIcon,
  ArrowPathIcon,
  ChartBarIcon,
  PlayIcon,
  StopIcon
} from '@heroicons/react/24/outline';

const PaymentManagement = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    loadPaymentStats();
  }, []);

  const loadPaymentStats = async () => {
    try {
      setLoading(true);
      const response = await paymentAPI.getPaymentStats();
      setStats(response.data);
    } catch (error) {
      console.error('Error loading payment stats:', error);
      toast.error('Failed to load payment statistics');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessExpiredPayments = async () => {
    try {
      setProcessing(true);
      const response = await paymentAPI.processExpiredPayments();
      toast.success(`Processed ${response.data.processedCount} expired payments`);
      loadPaymentStats(); // Refresh stats
    } catch (error) {
      console.error('Error processing expired payments:', error);
      toast.error('Failed to process expired payments');
    } finally {
      setProcessing(false);
    }
  };

  const handleRetryFailedPayments = async () => {
    try {
      setProcessing(true);
      const response = await paymentAPI.retryFailedPayments();
      toast.success(`Retried ${response.data.retriedCount} failed payments`);
      loadPaymentStats(); // Refresh stats
    } catch (error) {
      console.error('Error retrying failed payments:', error);
      toast.error('Failed to retry failed payments');
    } finally {
      setProcessing(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />;
      case 'processing':
        return <ArrowPathIcon className="w-5 h-5 text-blue-500" />;
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircleIcon className="w-5 h-5 text-red-500" />;
      case 'timeout':
        return <ExclamationTriangleIcon className="w-5 h-5 text-orange-500" />;
      default:
        return <ChartBarIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'timeout':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Payment Management</h1>
            <p className="text-gray-600 mt-1">
              Monitor and manage payment timeouts, retries, and synchronization
            </p>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={loadPaymentStats}
              disabled={loading}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <ArrowPathIcon className="w-4 h-4 mr-2" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ChartBarIcon className="w-8 h-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Payments</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ClockIcon className="w-8 h-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Pending</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.pending}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <ExclamationTriangleIcon className="w-8 h-8 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Expired</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.expired}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircleIcon className="w-8 h-8 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completed</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stats.byStatus?.find(s => s._id === 'completed')?.count || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Breakdown */}
      {stats?.byStatus && (
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Payment Status Breakdown</h3>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.byStatus.map((status) => (
                <div key={status._id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center">
                    {getStatusIcon(status._id)}
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900 capitalize">
                        {status._id}
                      </p>
                      <p className="text-sm text-gray-500">
                        ₹{status.totalAmount?.toLocaleString() || 0}
                      </p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status._id)}`}>
                    {status.count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Payment Management Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={handleProcessExpiredPayments}
            disabled={processing}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 disabled:opacity-50"
          >
            <PlayIcon className="w-4 h-4 mr-2" />
            {processing ? 'Processing...' : 'Process Expired Payments'}
          </button>

          <button
            onClick={handleRetryFailedPayments}
            disabled={processing}
            className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            <ArrowPathIcon className="w-4 h-4 mr-2" />
            {processing ? 'Processing...' : 'Retry Failed Payments'}
          </button>
        </div>
      </div>

      {/* Information Panel */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <ChartBarIcon className="w-6 h-6 text-blue-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">Payment Management Features</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li><strong>Timeout Handling:</strong> Payments automatically expire after 30 minutes</li>
                <li><strong>Retry Mechanism:</strong> Failed payments can be retried up to 3 times with exponential backoff</li>
                <li><strong>Status Synchronization:</strong> Payment status is automatically synchronized with Razorpay every 15 minutes</li>
                <li><strong>Automatic Cleanup:</strong> Old payment records are cleaned up after 30 days</li>
                <li><strong>User Notifications:</strong> Users are notified when payments timeout</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentManagement;
