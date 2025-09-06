import React, { useState, useEffect } from 'react';
import { FiUsers, FiX, FiCalendar, FiShoppingBag } from 'react-icons/fi';
import { couponsAPI } from '../services/apiServices';
import toast from 'react-hot-toast';

const CouponUserUsage = ({ coupon, isOpen, onClose }) => {
  const [usageData, setUsageData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && coupon) {
      fetchUsageData();
    }
  }, [isOpen, coupon]);

  const fetchUsageData = async () => {
    try {
      setLoading(true);
      const response = await couponsAPI.getCouponStats(coupon._id);
      if (response.success) {
        setUsageData(response.data.stats);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
      toast.error('Failed to load usage statistics');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getUserUsageCount = (userId) => {
    if (!coupon.usageHistory) return 0;
    return coupon.usageHistory.filter(usage => usage.user === userId).length;
  };

  const getRemainingUsesForUser = (userId) => {
    const usedCount = getUserUsageCount(userId);
    return Math.max(0, coupon.userUsageLimit - usedCount);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-bold text-gray-900">User Usage Statistics</h2>
            <p className="text-sm text-gray-600 mt-1">
              Coupon: <span className="font-mono font-semibold text-blue-600">{coupon?.code}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiUsers className="w-5 h-5 text-blue-600 mr-2" />
                  <div>
                    <p className="text-sm text-blue-600">Total Uses</p>
                    <p className="text-xl font-bold text-blue-800">{coupon.usedCount}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiUsers className="w-5 h-5 text-green-600 mr-2" />
                  <div>
                    <p className="text-sm text-green-600">Unique Users</p>
                    <p className="text-xl font-bold text-green-800">
                      {usageData ? usageData.uniqueUsers : 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-purple-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiShoppingBag className="w-5 h-5 text-purple-600 mr-2" />
                  <div>
                    <p className="text-sm text-purple-600">Avg Uses/User</p>
                    <p className="text-xl font-bold text-purple-800">
                      {usageData ? (usageData.uniqueUsers > 0 ? (coupon.usedCount / usageData.uniqueUsers).toFixed(1) : 0) : 0}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="bg-orange-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <FiUsers className="w-5 h-5 text-orange-600 mr-2" />
                  <div>
                    <p className="text-sm text-orange-600">User Limit</p>
                    <p className="text-xl font-bold text-orange-800">{coupon.userUsageLimit}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* User Usage Breakdown */}
            <div className="bg-white border rounded-lg">
              <div className="px-6 py-4 border-b">
                <h3 className="text-lg font-semibold text-gray-900">Individual User Usage</h3>
                <p className="text-sm text-gray-600">
                  Each user can use this coupon up to {coupon.userUsageLimit} time(s)
                </p>
              </div>
              
              {coupon.usageHistory && coupon.usageHistory.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          User
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Uses Count
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Remaining Uses
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Last Used
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total Savings
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Group usage by user */}
                      {Object.entries(
                        coupon.usageHistory.reduce((acc, usage) => {
                          const userId = usage.user._id || usage.user;
                          if (!acc[userId]) {
                            acc[userId] = {
                              user: usage.user,
                              uses: [],
                              totalSavings: 0,
                              usageCount: 0
                            };
                          }
                          acc[userId].uses.push(usage);
                          acc[userId].totalSavings += usage.discountAmount;
                          acc[userId].usageCount += 1;
                          return acc;
                        }, {})
                      ).map(([userId, userData]) => {
                        const remainingUses = getRemainingUsesForUser(userId);
                        const lastUsed = userData.uses[userData.uses.length - 1];
                        
                        return (
                          <tr key={userId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FiUsers className="w-4 h-4 text-gray-400 mr-2" />
                                <div>
                                  <div className="text-sm font-medium text-gray-900">
                                    {userData.user.name || 'Unknown User'}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {userData.user.email || 'No email'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  userData.usageCount >= coupon.userUsageLimit 
                                    ? 'bg-red-100 text-red-800' 
                                    : 'bg-green-100 text-green-800'
                                }`}>
                                  {userData.usageCount} / {coupon.userUsageLimit}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`text-sm font-medium ${
                                remainingUses > 0 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {remainingUses} remaining
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-sm text-gray-900">
                                <FiCalendar className="w-4 h-4 text-gray-400 mr-1" />
                                {formatDate(lastUsed.usedAt)}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="text-sm font-medium text-green-600">
                                ₹{userData.totalSavings.toFixed(2)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="px-6 py-8 text-center">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No usage yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    This coupon hasn't been used by any users yet.
                  </p>
                </div>
              )}
            </div>

            {/* Rate Limiting Information */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <FiUsers className="w-5 h-5 text-yellow-600 mt-0.5 mr-3" />
                <div>
                  <h4 className="text-sm font-medium text-yellow-800">Per-User Rate Limiting</h4>
                  <div className="mt-2 text-sm text-yellow-700 space-y-1">
                    <p>• Each user can use this coupon up to <strong>{coupon.userUsageLimit}</strong> time(s)</p>
                    <p>• Total coupon usage limit: <strong>{coupon.usageLimit || 'Unlimited'}</strong></p>
                    <p>• Current total usage: <strong>{coupon.usedCount}</strong> times</p>
                    {coupon.usageLimit && (
                      <p>• Remaining total uses: <strong>{coupon.usageLimit - coupon.usedCount}</strong></p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponUserUsage;