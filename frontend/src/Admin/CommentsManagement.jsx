import React, { useState, useEffect } from 'react';
import { 
  FaStar, 
  FaCheck, 
  FaTimes, 
  FaEye, 
  FaTrash, 
  FaFilter, 
  FaSearch, 
  FaCalendarAlt, 
  FaUser, 
  FaBox, 
  FaChartBar,
  FaEllipsisV,
  FaEdit,
  FaReply,
  FaThumbsUp,
  FaImage,
  FaClock,
  FaCheckCircle,
  FaBan,
  FaDownload,
  FaCog,
  FaSort,
  FaSortUp,
  FaSortDown,
  FaExclamationTriangle,
  FaCheckDouble,
  FaTimesCircle,
  FaEyeSlash,
  FaFlag,
  FaShieldAlt,
  FaChartLine,
  FaUsers,
  FaComments,
  FaExclamationCircle
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { commentsAPI } from '../services/apiServices';

const CommentsManagement = () => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    page: 1,
    limit: 20,
    search: '',
    rating: '',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  const [pagination, setPagination] = useState({});
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [selectedComment, setSelectedComment] = useState(null);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [selectedComments, setSelectedComments] = useState([]);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [bulkAction, setBulkAction] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    fetchComments();
    fetchStats();
  }, [filters]);

  const fetchComments = async () => {
    try {
      setLoading(true);
      const params = {
        page: filters.page,
        limit: filters.limit,
        ...(filters.status && { status: filters.status }),
        ...(filters.search && { search: filters.search }),
        ...(filters.rating && { rating: filters.rating }),
        sort: `${filters.sortOrder === 'desc' ? '-' : ''}${filters.sortBy}`
      };

      const response = await commentsAPI.getAllComments(params);

      if (response.success) {
        setComments(response.data.comments);
        setPagination(response.data.pagination);
      } else {
        toast.error(response.message || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await commentsAPI.getCommentStats();

      if (response.success) {
        setStats(response.data.statusStats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleStatusUpdate = async (commentId, status) => {
    try {
      setIsProcessing(true);
      const response = await commentsAPI.updateCommentStatus(commentId, status);

      if (response.success) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId ? { ...comment, status } : comment
          )
        );
        fetchStats();
        toast.success(`Comment ${status} successfully`);
      } else {
        toast.error(response.message || 'Failed to update comment status');
      }
    } catch (error) {
      console.error('Error updating comment status:', error);
      toast.error('Failed to update comment status');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedComments.length === 0) {
      toast.error('Please select an action and comments');
      return;
    }

    try {
      setIsProcessing(true);
      let successCount = 0;
      let errorCount = 0;

      for (const commentId of selectedComments) {
        try {
          if (bulkAction === 'approve') {
            await commentsAPI.updateCommentStatus(commentId, 'approved');
          } else if (bulkAction === 'reject') {
            await commentsAPI.updateCommentStatus(commentId, 'rejected');
          } else if (bulkAction === 'delete') {
            await commentsAPI.deleteComment(commentId);
          }
          successCount++;
                 } catch {
           errorCount++;
         }
      }

      if (successCount > 0) {
        toast.success(`${successCount} comments processed successfully`);
        setSelectedComments([]);
        setBulkAction('');
        fetchComments();
        fetchStats();
      }
      if (errorCount > 0) {
        toast.error(`${errorCount} comments failed to process`);
      }
    } catch (error) {
      console.error('Error processing bulk action:', error);
      toast.error('Failed to process bulk action');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment? This action cannot be undone.')) {
      return;
    }

    try {
      setIsProcessing(true);
      const response = await commentsAPI.deleteComment(commentId);

      if (response.success) {
        setComments(prev => prev.filter(comment => comment._id !== commentId));
        fetchStats();
        toast.success('Comment deleted successfully');
      } else {
        toast.error(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete comment');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-800 border-green-200';
      case 'pending': return 'bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-800 border-yellow-200';
      case 'rejected': return 'bg-gradient-to-r from-red-100 to-pink-100 text-red-800 border-red-200';
      default: return 'bg-gradient-to-r from-gray-100 to-slate-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <FaCheckCircle className="w-4 h-4" />;
      case 'pending': return <FaClock className="w-4 h-4" />;
      case 'rejected': return <FaBan className="w-4 h-4" />;
      default: return <FaEye className="w-4 h-4" />;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const totalComments = stats.pending + stats.approved + stats.rejected;
  const approvalRate = totalComments > 0 ? ((stats.approved / totalComments) * 100).toFixed(1) : 0;

  const sortOptions = [
    { value: 'createdAt', label: 'Date Created' },
    { value: 'rating', label: 'Rating' },
    { value: 'title', label: 'Title' },
    { value: 'status', label: 'Status' }
  ];

  const ratingOptions = [
    { value: '', label: 'All Ratings' },
    { value: '5', label: '5 Stars' },
    { value: '4', label: '4 Stars' },
    { value: '3', label: '3 Stars' },
    { value: '2', label: '2 Stars' },
    { value: '1', label: '1 Star' }
  ];

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedComments(comments.map(comment => comment._id));
    } else {
      setSelectedComments([]);
    }
  };

  const handleSelectComment = (commentId, checked) => {
    if (checked) {
      setSelectedComments(prev => [...prev, commentId]);
    } else {
      setSelectedComments(prev => prev.filter(id => id !== commentId));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 p-6">
      {/* Enhanced Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
              <FaComments className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Comments Management</h1>
              <p className="text-sm text-gray-600 mt-1">Manage and moderate customer reviews across your platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
            >
              <FaFilter className="w-4 h-4" />
              Advanced Filters
            </button>
            <button
              onClick={() => {/* Export functionality */}}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
            >
              <FaDownload className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
                          <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Total Comments</p>
                <p className="text-2xl font-bold text-gray-900">{totalComments}</p>
                <p className="text-xs text-gray-500 mt-1">All time reviews</p>
              </div>
            <div className="p-3 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-lg">
              <FaComments className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
                          <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Pending Review</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
                <p className="text-xs text-gray-500 mt-1">Awaiting approval</p>
              </div>
            <div className="p-3 bg-gradient-to-r from-yellow-100 to-orange-100 rounded-lg">
              <FaClock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
                          <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Approval Rate</p>
                <p className="text-2xl font-bold text-green-600">{approvalRate}%</p>
                <p className="text-xs text-gray-500 mt-1">Of total comments</p>
              </div>
            <div className="p-3 bg-gradient-to-r from-green-100 to-emerald-100 rounded-lg">
              <FaCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300">
          <div className="flex items-center justify-between">
                          <div>
                <p className="text-xs font-medium text-gray-600 mb-1">Rejected</p>
                <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
                <p className="text-xs text-gray-500 mt-1">Not approved</p>
              </div>
            <div className="p-3 bg-gradient-to-r from-red-100 to-pink-100 rounded-lg">
              <FaBan className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Filters */}
      <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-8">
        <div className="space-y-4">
          {/* Basic Filters */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex items-center gap-2">
                <FaFilter className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-semibold text-gray-700">Filters</span>
              </div>
              
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">All Status</option>
                <option value="pending">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <select
                value={filters.rating}
                onChange={(e) => setFilters(prev => ({ ...prev, rating: e.target.value, page: 1 }))}
                className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                {ratingOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search comments..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }))}
                className="pl-10 pr-4 py-2 w-full sm:w-64 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              />
            </div>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="pt-4 border-t border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex items-center gap-2">
                  <FaSort className="w-4 h-4 text-gray-500" />
                  <span className="text-xs font-semibold text-gray-700">Sort By</span>
                </div>
                
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value, page: 1 }))}
                  className="px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>

                <button
                  onClick={() => setFilters(prev => ({ 
                    ...prev, 
                    sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc',
                    page: 1 
                  }))}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                >
                  {filters.sortOrder === 'asc' ? <FaSortUp className="w-4 h-4" /> : <FaSortDown className="w-4 h-4" />}
                  {filters.sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedComments.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-2">
              <FaShieldAlt className="w-5 h-5 text-blue-600" />
                              <span className="text-xs font-medium text-blue-800">
                  {selectedComments.length} comment{selectedComments.length > 1 ? 's' : ''} selected
                </span>
            </div>
            
            <div className="flex items-center gap-3">
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
              >
                <option value="">Select Action</option>
                <option value="approve">Approve Selected</option>
                <option value="reject">Reject Selected</option>
                <option value="delete">Delete Selected</option>
              </select>
              
              <button
                onClick={handleBulkAction}
                disabled={!bulkAction || isProcessing}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <FaCheckDouble className="w-4 h-4" />
                )}
                Apply Action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Comments List */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <div className="inline-flex items-center gap-3">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <p className="text-gray-600 font-medium">Loading comments...</p>
            </div>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-12 text-center">
            <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FaComments className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">No comments found</p>
            <p className="text-gray-500 text-sm mt-1">Try adjusting your filters or search terms</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {/* Table Header */}
            <div className="bg-gray-50 px-6 py-4">
              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  checked={selectedComments.length === comments.length && comments.length > 0}
                  onChange={(e) => handleSelectAll(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                />
                <span className="text-xs font-medium text-gray-700">Select All</span>
              </div>
            </div>

            {comments.map((comment) => (
              <div key={comment._id} className="p-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  {/* Comment Content */}
                  <div className="flex-1">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="flex-shrink-0">
                        <input
                          type="checkbox"
                          checked={selectedComments.includes(comment._id)}
                          onChange={(e) => handleSelectComment(comment._id, e.target.checked)}
                          className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
                        />
                      </div>
                      
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
                          <span className="text-white font-semibold text-lg">
                            {comment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <FaUser className="w-4 h-4 text-gray-500" />
                            <span className="text-sm font-semibold text-gray-900">{comment.user?.name || 'Unknown User'}</span>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <FaBox className="w-4 h-4 text-gray-500" />
                            <span className="text-xs text-gray-600">{comment.product?.name || 'Unknown Product'}</span>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-gray-500 mb-3">
                          <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <FaStar
                                key={star}
                                className={`w-4 h-4 ${
                                  star <= comment.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                            <span className="ml-1 font-medium text-gray-700">{comment.rating}/5</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <FaCalendarAlt className="w-3 h-3" />
                            <span>{formatDate(comment.createdAt)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-bold text-gray-900 text-sm mb-2">{comment.title}</h4>
                      <p className="text-xs text-gray-700 leading-relaxed">{comment.comment}</p>
                    </div>

                    {/* Comment Images */}
                    {comment.images && comment.images.length > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-2">
                          <FaImage className="w-4 h-4 text-gray-500" />
                          <span className="text-xs font-medium text-gray-700">Review Images</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                          {comment.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-16 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(image.url, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Voting Info */}
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <FaThumbsUp className="w-3 h-3" />
                        <span>{comment.isHelpful || 0} helpful</span>
                      </div>
                    </div>
                  </div>

                  {/* Status and Actions */}
                  <div className="flex flex-col items-end gap-4">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full border ${getStatusColor(comment.status)}`}>
                        {getStatusIcon(comment.status)}
                        {comment.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {comment.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleStatusUpdate(comment._id, 'approved')}
                            disabled={isProcessing}
                            className="p-2 text-green-600 bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Approve comment"
                          >
                            <FaCheck className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleStatusUpdate(comment._id, 'rejected')}
                            disabled={isProcessing}
                            className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                            title="Reject comment"
                          >
                            <FaTimes className="w-4 h-4" />
                          </button>
                        </>
                      )}
                      
                      <button
                        onClick={() => {
                          setSelectedComment(comment);
                          setShowCommentModal(true);
                        }}
                        className="p-2 text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200"
                        title="View details"
                      >
                        <FaEye className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => handleDelete(comment._id)}
                        disabled={isProcessing}
                        className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors duration-200 disabled:opacity-50"
                        title="Delete comment"
                      >
                        <FaTrash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Pagination */}
      {pagination.totalPages > 1 && (
        <div className="mt-8 bg-white p-6 rounded-xl shadow-lg border border-gray-100">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="text-xs text-gray-600 text-center sm:text-left">
              Showing <span className="font-semibold">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
              <span className="font-semibold">{Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}</span> of{' '}
              <span className="font-semibold">{pagination.totalItems || 0}</span> comments
            </div>
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: pagination.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <span>←</span>
                <span className="hidden sm:inline">Previous</span>
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                  const page = i + 1;
                  return (
                    <button
                      key={page}
                      onClick={() => setFilters(prev => ({ ...prev, page }))}
                      className={`px-2 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                        page === pagination.currentPage
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>
              
              <button
                onClick={() => setFilters(prev => ({ ...prev, page: pagination.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
              >
                <span className="hidden sm:inline">Next</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comment Detail Modal */}
      {showCommentModal && selectedComment && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300"></div>
          <div className="flex min-h-full items-center justify-center p-4">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden">
                <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                  <h2 className="text-lg font-bold text-gray-900">Comment Details</h2>
                  <button
                    onClick={() => setShowCommentModal(false)}
                    className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                  >
                    <FaTimes className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-6 max-h-[calc(90vh-120px)] overflow-y-auto">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-semibold text-lg">
                          {selectedComment.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900">{selectedComment.user?.name || 'Unknown User'}</h3>
                        <p className="text-xs text-gray-600">{selectedComment.product?.name || 'Unknown Product'}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FaStar
                            key={star}
                            className={`w-4 h-4 ${
                              star <= selectedComment.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="ml-1 font-medium text-gray-700">{selectedComment.rating}/5</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <FaCalendarAlt className="w-3 h-3" />
                        <span>{formatDate(selectedComment.createdAt)}</span>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm mb-2">{selectedComment.title}</h4>
                      <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-wrap">{selectedComment.comment}</p>
                    </div>
                    
                    {selectedComment.images && selectedComment.images.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-gray-900 mb-2">Review Images</h5>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                          {selectedComment.images.map((image, index) => (
                            <img
                              key={index}
                              src={image.url}
                              alt={`Review image ${index + 1}`}
                              className="w-full h-24 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                              onClick={() => window.open(image.url, '_blank')}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentsManagement; 