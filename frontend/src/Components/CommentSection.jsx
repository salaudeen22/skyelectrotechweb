import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaStar, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaCheckCircle, FaPen, FaUsers, FaChartBar, FaFilter, FaSort } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import CommentModal from './CommentModal';
import CommentItem from './CommentItem';
import RatingFilter from './RatingFilter';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentModal, setShowCommentModal] = useState(false);
  const [editingComment, setEditingComment] = useState(null);
  const [filters, setFilters] = useState({
    rating: '',
    sort: '-createdAt',
    page: 1
  });
  const [pagination, setPagination] = useState({});
  const [ratingStats, setRatingStats] = useState({
    ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    totalReviews: 0
  });
  
  const { user } = useAuth();

  useEffect(() => {
    fetchComments();
  }, [productId, filters]);

  const fetchComments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: filters.page,
        limit: 10,
        sort: filters.sort,
        ...(filters.rating && { rating: filters.rating })
      });

      const response = await fetch(`/api/comments/product/${productId}?${params}`);
      
      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        if (response.status === 403) {
          toast.error('Access denied. Please login to view comments.');
        } else if (response.status === 404) {
          toast.error('Product not found.');
        } else {
          toast.error('Failed to load comments. Please try again.');
        }
        return;
      }

      // Check if response has content before parsing JSON
      const text = await response.text();
      if (!text) {
        console.warn('Empty response from server');
        setComments([]);
        setPagination({ page: 1, totalPages: 1, totalItems: 0 });
        setRatingStats({ ratingDistribution: {}, totalReviews: 0 });
        return;
      }

      const data = JSON.parse(text);

      if (data.success) {
        setComments(data.data.comments);
        setPagination(data.data.pagination);
        setRatingStats({
          ratingDistribution: data.data.ratingDistribution,
          totalReviews: data.data.totalReviews
        });
      } else {
        toast.error(data.message || 'Failed to load comments');
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      toast.error('Failed to load comments');
    } finally {
      setLoading(false);
    }
  };

  const handleCommentCreated = (newComment) => {
    setComments(prev => [newComment, ...prev]);
    setShowCommentModal(false);
    setEditingComment(null);
    fetchComments(); // Refresh to get updated stats
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
    setEditingComment(null);
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
    fetchComments(); // Refresh to get updated stats
  };

  const handleEditComment = (comment) => {
    setEditingComment(comment);
    setShowCommentModal(true);
  };

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters, page: 1 }));
  };

  const handlePageChange = (page) => {
    setFilters(prev => ({ ...prev, page }));
  };

  const handleVote = async (commentId, vote) => {
    if (!user) {
      toast.error('Please login to vote');
      return;
    }

    try {
      const response = await fetch(`/api/comments/${commentId}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ vote })
      });

      const data = await response.json();

      if (response.ok) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId ? data.data.comment : comment
          )
        );
        toast.success('Vote recorded successfully');
      } else {
        toast.error(data.message || 'Failed to record vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
      toast.error('Failed to record vote');
    }
  };

  const averageRating = Object.entries(ratingStats.ratingDistribution).reduce((acc, [rating, count]) => {
    return acc + (parseInt(rating) * count);
  }, 0) / Math.max(ratingStats.totalReviews, 1);

  // Check if user has already reviewed this product
  const userComment = comments.find(comment => comment.user._id === user?._id);

  return (
    <>
      <div className="bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Enhanced Header */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-200">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <FaUsers className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">
                  Customer Reviews
                </h3>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <FaStar
                        key={star}
                        className={`w-5 h-5 ${
                          star <= Math.round(averageRating)
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                    <span className="text-lg font-semibold text-gray-900">
                      {averageRating.toFixed(1)}
                    </span>
                    <span className="text-sm text-gray-600">
                      out of 5
                    </span>
                    <span className="text-sm text-gray-500">
                      ({ratingStats.totalReviews} reviews)
                    </span>
                  </div>
                </div>
              </div>
            </div>
            
            {user && (
              <div className="flex flex-col gap-3">
                {userComment && (
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      You have already reviewed this product. You can edit your review below.
                    </p>
                  </div>
                )}
                <button
                  onClick={() => {
                    if (userComment) {
                      // If user has already reviewed, open edit mode
                      setEditingComment(userComment);
                      setShowCommentModal(true);
                    } else {
                      // If user hasn't reviewed, open new review mode
                      setEditingComment(null);
                      setShowCommentModal(true);
                    }
                  }}
                  className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
                >
                  <FaPen className="w-4 h-4" />
                  <span className="font-medium">
                    {userComment ? 'Edit Your Review' : 'Write a Review'}
                  </span>
                </button>
              </div>
            )}
          </div>

          {/* Enhanced Rating Distribution */}
          <div className="mt-6 grid grid-cols-5 gap-3">
            {[5, 4, 3, 2, 1].map((rating) => {
              const count = ratingStats.ratingDistribution[rating] || 0;
              const percentage = ratingStats.totalReviews > 0 
                ? (count / ratingStats.totalReviews) * 100 
                : 0;
              
              return (
                <div key={rating} className="text-center group cursor-pointer hover:bg-white hover:rounded-lg hover:shadow-sm p-2 transition-all duration-200">
                  <div className="flex items-center justify-center mb-2">
                    <span className="text-sm font-semibold text-gray-900">{rating}</span>
                    <FaStar className="w-3 h-3 text-yellow-400 fill-current ml-1" />
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-yellow-400 to-yellow-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                  <span className="text-xs text-gray-600 mt-1 block font-medium">{count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Filters */}
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <RatingFilter
            filters={filters}
            onFilterChange={handleFilterChange}
            ratingDistribution={ratingStats.ratingDistribution}
          />
        </div>

        {/* Comments List */}
        <div className="divide-y divide-gray-100">
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-flex items-center gap-3">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                <p className="text-gray-600 font-medium">Loading reviews...</p>
              </div>
            </div>
          ) : comments.length === 0 ? (
            <div className="p-8 text-center">
              <div className="p-4 bg-gray-50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <FaChartBar className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-600 font-medium">No reviews yet</p>
              <p className="text-gray-500 text-sm mt-1">Be the first to review this product!</p>
            </div>
          ) : (
            comments.map((comment) => (
              <CommentItem
                key={comment._id}
                comment={comment}
                currentUser={user}
                onCommentUpdated={handleCommentUpdated}
                onCommentDeleted={handleCommentDeleted}
                onVote={handleVote}
                onEditComment={handleEditComment}
              />
            ))
          )}
        </div>

        {/* Enhanced Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-6 border-t border-gray-100 bg-gray-50">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="text-sm text-gray-600 text-center sm:text-left">
                Showing <span className="font-semibold">{((pagination.currentPage - 1) * pagination.limit) + 1}</span> to{' '}
                <span className="font-semibold">{Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)}</span> of{' '}
                <span className="font-semibold">{pagination.totalItems}</span> reviews
              </div>
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
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
                        onClick={() => handlePageChange(page)}
                        className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
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
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 hover:border-gray-400 transition-all duration-200"
                >
                  <span className="hidden sm:inline">Next</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Comment Modal */}
      <CommentModal
        isOpen={showCommentModal}
        onClose={() => {
          setShowCommentModal(false);
          setEditingComment(null);
        }}
        productId={productId}
        onCommentCreated={handleCommentCreated}
        editComment={editingComment}
      />
    </>
  );
};

export default CommentSection; 