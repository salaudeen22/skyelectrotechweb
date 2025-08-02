import React, { useState } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaCheckCircle, FaFlag, FaUser, FaCalendarAlt, FaImage } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import Cookies from 'js-cookie';

const CommentItem = ({ comment, currentUser, onCommentUpdated, onCommentDeleted, onVote, onEditComment }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canEdit = currentUser && (
    comment.user._id === currentUser._id || 
    currentUser.role === 'admin'
  );

  const canDelete = currentUser && (
    comment.user._id === currentUser._id || 
    currentUser.role === 'admin'
  );

  const canReply = currentUser && currentUser.role === 'admin';

  const handleReply = async (e) => {
    e.preventDefault();
    if (!replyText.trim()) {
      toast.error('Please enter a reply');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/comments/${comment._id}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${Cookies.get('token')}`
        },
        body: JSON.stringify({ comment: replyText })
      });

      const data = await response.json();

      if (response.ok) {
        onCommentUpdated(data.data.comment);
        setReplyText('');
        setShowReplyForm(false);
        toast.success('Reply added successfully');
      } else {
        toast.error(data.message || 'Failed to add reply');
      }
    } catch (error) {
      console.error('Error adding reply:', error);
      toast.error('Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this review?')) {
      return;
    }

    try {
      const response = await fetch(`/api/comments/${comment._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${Cookies.get('token')}`
        }
      });

      if (response.ok) {
        onCommentDeleted(comment._id);
        toast.success('Review deleted successfully');
      } else {
        const data = await response.json();
        toast.error(data.message || 'Failed to delete review');
      }
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Failed to delete review');
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="p-6 hover:bg-gray-50 transition-colors duration-200">
      {/* Enhanced Comment Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-md">
              <span className="text-white font-semibold text-lg">
                {comment.user.name?.charAt(0)?.toUpperCase() || 'U'}
              </span>
            </div>
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-gray-900 text-lg">{comment.user.name}</span>
                {comment.isVerifiedPurchase && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                    <FaCheckCircle className="w-3 h-3" />
                    <span>Verified</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm text-gray-600">
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
              
              <div className="flex items-center gap-1 text-gray-500">
                <FaCalendarAlt className="w-3 h-3" />
                <span>{formatDate(comment.createdAt)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => onEditComment(comment)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all duration-200"
              title="Edit review"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200"
              title="Delete review"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Comment Content */}
      <div className="mb-4">
        <h4 className="font-bold text-gray-900 text-lg mb-3">{comment.title}</h4>
        <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{comment.comment}</p>
      </div>

      {/* Enhanced Comment Images */}
      {comment.images && comment.images.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-3">
            <FaImage className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Review Images</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {comment.images.map((image, index) => (
              <div key={index} className="group relative">
                <img
                  src={image.url}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-24 sm:h-28 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-all duration-200 shadow-sm hover:shadow-md"
                  onClick={() => window.open(image.url, '_blank')}
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200 flex items-center justify-center">
                  <span className="text-white opacity-0 group-hover:opacity-100 text-xs font-medium">Click to enlarge</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Enhanced Voting */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => onVote(comment._id, 'helpful')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-green-100 hover:text-green-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentUser}
          >
            <FaThumbsUp className="w-4 h-4" />
            <span className="font-medium">Helpful</span>
            <span className="bg-white px-2 py-1 rounded-full text-xs font-bold text-gray-700">
              {comment.isHelpful || 0}
            </span>
          </button>
          
          <button
            onClick={() => onVote(comment._id, 'not_helpful')}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-red-100 hover:text-red-700 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!currentUser}
          >
            <FaThumbsDown className="w-4 h-4" />
            <span className="font-medium">Not Helpful</span>
          </button>
        </div>
        
        {canReply && (
          <button
            onClick={() => setShowReplyForm(!showReplyForm)}
            className="flex items-center gap-2 px-4 py-2 text-gray-600 bg-gray-100 hover:bg-blue-100 hover:text-blue-700 rounded-lg transition-all duration-200"
          >
            <FaReply className="w-4 h-4" />
            <span className="font-medium">Reply</span>
          </button>
        )}
      </div>

      {/* Enhanced Reply Form */}
      {showReplyForm && (
        <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-3">
            <FaReply className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Admin Reply</span>
          </div>
          <form onSubmit={handleReply}>
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write your reply..."
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              rows={3}
              maxLength={500}
              required
            />
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-3">
              <span className="text-xs text-gray-500">
                {replyText.length}/500 characters
              </span>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowReplyForm(false)}
                  className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                >
                  {isSubmitting ? 'Posting...' : 'Post Reply'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Enhanced Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="ml-4 sm:ml-8 space-y-4 border-l-2 border-blue-200 pl-4">
          {comment.replies.map((reply, index) => (
            <div key={index} className="bg-gradient-to-r from-gray-50 to-blue-50 p-4 rounded-xl border border-gray-200">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-semibold text-sm">
                    {reply.user.name?.charAt(0)?.toUpperCase() || 'A'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">{reply.user.name}</span>
                    {reply.isAdminReply && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                        Admin
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <FaCalendarAlt className="w-3 h-3" />
                    <span>{formatDate(reply.createdAt)}</span>
                  </div>
                </div>
              </div>
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{reply.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentItem; 