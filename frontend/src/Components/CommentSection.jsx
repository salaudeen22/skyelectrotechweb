import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaCheckCircle, FaUsers, FaChartBar, FaFilter, FaSort } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import CommentModal from './CommentModal';
import CommentItem from './CommentItem';
import RatingFilter from './RatingFilter';
import { commentsAPI } from '../services/apiServices';

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
      console.log('Fetching comments for product:', productId);
      console.log('Filters:', filters);
      
      const params = {
        page: filters.page,
        limit: 10,
        sort: filters.sort,
        ...(filters.rating && { rating: filters.rating })
      };

      console.log('API params:', params);
      const response = await commentsAPI.getProductComments(productId, params);
      
      console.log('API response:', response);
      
      if (response.success) {
        setComments(response.data.comments || []);
        setPagination(response.data.pagination || { page: 1, totalPages: 1, totalItems: 0 });
        setRatingStats({
          ratingDistribution: response.data.ratingDistribution || { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
          totalReviews: response.data.totalReviews || 0
        });
        console.log('Comments loaded successfully:', response.data.comments?.length || 0, 'comments');
      } else {
        console.error('API returned error:', response.message);
        toast.error(response.message || 'Failed to load comments');
        setComments([]);
        setPagination({ page: 1, totalPages: 1, totalItems: 0 });
        setRatingStats({ ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, totalReviews: 0 });
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
      toast.error('Failed to load comments. Please try again.');
      setComments([]);
      setPagination({ page: 1, totalPages: 1, totalItems: 0 });
      setRatingStats({ ratingDistribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }, totalReviews: 0 });
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
      const response = await commentsAPI.voteComment(commentId, vote);

      if (response.success) {
        setComments(prev => 
          prev.map(comment => 
            comment._id === commentId ? response.data.comment : comment
          )
        );
        toast.success('Vote recorded successfully');
      } else {
        toast.error(response.message || 'Failed to record vote');
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
      <div className="bg-white">
        {/* Flipkart-style Header */}
        <div className="border-b border-gray-200">
          <div className="p-4 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-4">Ratings & Reviews</h2>
            
            {/* Rating Summary and Rate Product Button */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              {/* Left side - Rating Summary */}
              <div className="flex-1">
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      {averageRating.toFixed(1)}★
                    </span>
                  </div>
                  <div className="text-gray-600">
                    <span className="font-medium">{ratingStats.totalReviews.toLocaleString()} Ratings &</span>
                    <br />
                    <span className="font-medium">{comments.length} Reviews</span>
                  </div>
                </div>

                {/* Rating Distribution */}
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => {
                    const count = ratingStats.ratingDistribution[rating] || 0;
                    const percentage = ratingStats.totalReviews > 0 
                      ? (count / ratingStats.totalReviews) * 100 
                      : 0;
                    
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <span className="text-sm font-medium text-gray-700 w-8">{rating}★</span>
                        <div className="flex-1 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                        <span className="text-sm text-gray-600 w-12 text-right">
                          {count.toLocaleString()}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right side - Rate Product Button */}
              <div className="flex-shrink-0 lg:self-start">
                <button
                  onClick={() => {
                    if (!user) {
                      toast.error('Please login to rate this product');
                      return;
                    }
                    if (userComment) {
                      setEditingComment(userComment);
                      setShowCommentModal(true);
                    } else {
                      setEditingComment(null);
                      setShowCommentModal(true);
                    }
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium text-sm transition-colors"
                >
                  {user && userComment ? 'Edit Review' : 'Rate this Product'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="p-4 border-b border-gray-100">
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

        {/* Simple Pagination */}
        {pagination.totalPages > 1 && (
          <div className="p-4 border-t border-gray-100 text-center">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                ← Previous
              </button>
              
              <span className="px-4 py-2 text-sm text-gray-600">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              
              <button
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next →
              </button>
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