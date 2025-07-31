import React, { useState, useEffect, useContext } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaStar, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaCheckCircle } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import CommentForm from './CommentForm';
import CommentItem from './CommentItem';
import RatingFilter from './RatingFilter';

const CommentSection = ({ productId }) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCommentForm, setShowCommentForm] = useState(false);
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
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: filters.page,
        limit: 10,
        sort: filters.sort,
        ...(filters.rating && { rating: filters.rating })
      });

      const response = await fetch(`/api/comments/product/${productId}?${params}`);
      const data = await response.json();

      if (response.ok) {
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
    setShowCommentForm(false);
    fetchComments(); // Refresh to get updated stats
  };

  const handleCommentUpdated = (updatedComment) => {
    setComments(prev => 
      prev.map(comment => 
        comment._id === updatedComment._id ? updatedComment : comment
      )
    );
  };

  const handleCommentDeleted = (commentId) => {
    setComments(prev => prev.filter(comment => comment._id !== commentId));
    fetchComments(); // Refresh to get updated stats
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

  return (
    <div className="bg-white rounded-lg shadow-sm border">
      {/* Header */}
      <div className="p-6 border-b">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Customer Reviews
            </h3>
            <div className="flex items-center mt-1">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(averageRating)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="ml-2 text-sm text-gray-600">
                {averageRating.toFixed(1)} out of 5
              </span>
              <span className="ml-2 text-sm text-gray-500">
                ({ratingStats.totalReviews} reviews)
              </span>
            </div>
          </div>
          
          {user && (
            <button
              onClick={() => setShowCommentForm(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Rating Distribution */}
        <div className="mt-4 grid grid-cols-5 gap-2">
          {[5, 4, 3, 2, 1].map((rating) => {
            const count = ratingStats.ratingDistribution[rating] || 0;
            const percentage = ratingStats.totalReviews > 0 
              ? (count / ratingStats.totalReviews) * 100 
              : 0;
            
            return (
              <div key={rating} className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-sm font-medium text-gray-900">{rating}</span>
                  <FaStar className="w-3 h-3 text-yellow-400 fill-current ml-1" />
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full"
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>
                <span className="text-xs text-gray-500 mt-1 block">{count}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filters */}
      <div className="p-4 border-b bg-gray-50">
        <RatingFilter
          filters={filters}
          onFilterChange={handleFilterChange}
          ratingDistribution={ratingStats.ratingDistribution}
        />
      </div>

      {/* Comment Form */}
      {showCommentForm && (
        <div className="p-4 border-b">
          <CommentForm
            productId={productId}
            onCommentCreated={handleCommentCreated}
            onCancel={() => setShowCommentForm(false)}
          />
        </div>
      )}

      {/* Comments List */}
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-500">Loading comments...</p>
          </div>
        ) : comments.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500">No reviews yet. Be the first to review this product!</p>
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
            />
          ))
        )}
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="p-4 border-t bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">
              Showing {((pagination.currentPage - 1) * pagination.limit) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} of{' '}
              {pagination.totalItems} reviews
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 text-sm border rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommentSection; 