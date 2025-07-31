import React, { useState } from 'react';
import { FaStar, FaThumbsUp, FaThumbsDown, FaReply, FaEdit, FaTrash, FaCheckCircle, FaFlag } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import CommentForm from './CommentForm';

const CommentItem = ({ comment, currentUser, onCommentUpdated, onCommentDeleted, onVote }) => {
  const [showReplyForm, setShowReplyForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
          'Authorization': `Bearer ${localStorage.getItem('token')}`
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
    <div className="p-6">
      {/* Comment Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-sm font-medium text-gray-700">
              {comment.user.name?.charAt(0)?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-medium text-gray-900">{comment.user.name}</span>
              {comment.isVerifiedPurchase && (
                <FaCheckCircle className="w-4 h-4 text-green-500" title="Verified Purchase" />
              )}
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <FaStar
                    key={star}
                    className={`w-3 h-3 ${
                      star <= comment.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span>•</span>
              <span>{formatDate(comment.createdAt)}</span>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {canEdit && (
            <button
              onClick={() => setShowEditForm(!showEditForm)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              title="Edit review"
            >
              <FaEdit className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={handleDelete}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Delete review"
            >
              <FaTrash className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Edit Form */}
      {showEditForm && (
        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <CommentForm
            productId={comment.product}
            onCommentCreated={onCommentUpdated}
            onCancel={() => setShowEditForm(false)}
            editComment={comment}
          />
        </div>
      )}

      {/* Comment Content */}
      {!showEditForm && (
        <>
          <h4 className="font-semibold text-gray-900 mb-2">{comment.title}</h4>
          <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.comment}</p>

          {/* Comment Images */}
          {comment.images && comment.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-4">
              {comment.images.map((image, index) => (
                <img
                  key={index}
                  src={image.url}
                  alt={`Review image ${index + 1}`}
                  className="w-full h-20 object-cover rounded-md cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => window.open(image.url, '_blank')}
                />
              ))}
            </div>
          )}

          {/* Voting */}
          <div className="flex items-center space-x-4 mb-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVote(comment._id, 'helpful')}
                className="flex items-center space-x-1 text-gray-500 hover:text-green-600 transition-colors"
                disabled={!currentUser}
              >
                <FaThumbsUp className="w-4 h-4" />
                <span className="text-sm">Helpful ({comment.isHelpful})</span>
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onVote(comment._id, 'not_helpful')}
                className="flex items-center space-x-1 text-gray-500 hover:text-red-600 transition-colors"
                disabled={!currentUser}
              >
                <FaThumbsDown className="w-4 h-4" />
                <span className="text-sm">Not Helpful</span>
              </button>
            </div>
            {canReply && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 text-gray-500 hover:text-blue-600 transition-colors"
              >
                <FaReply className="w-4 h-4" />
                <span className="text-sm">Reply</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg">
              <form onSubmit={handleReply}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  maxLength={500}
                  required
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    {replyText.length}/500 characters
                  </span>
                  <div className="flex space-x-2">
                    <button
                      type="button"
                      onClick={() => setShowReplyForm(false)}
                      className="px-3 py-1 text-sm text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      {isSubmitting ? 'Posting...' : 'Post Reply'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="ml-8 space-y-3">
              {comment.replies.map((reply, index) => (
                <div key={index} className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="font-medium text-gray-900">{reply.user.name}</span>
                    {reply.isAdminReply && (
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                        Admin
                      </span>
                    )}
                    <span className="text-sm text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{formatDate(reply.createdAt)}</span>
                  </div>
                  <p className="text-gray-700 whitespace-pre-wrap">{reply.comment}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default CommentItem; 