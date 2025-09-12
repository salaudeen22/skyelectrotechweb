import React, { useEffect } from 'react';
import { FaTimes, FaArrowLeft } from 'react-icons/fa';
import CommentForm from './CommentForm';

const CommentModal = ({ isOpen, onClose, productId, onCommentCreated, editComment = null }) => {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden'; // Prevent background scroll
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Close modal when clicking outside
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 backdrop-blur-sm bg-black/30 transition-opacity duration-300"
        onClick={handleBackdropClick}
      ></div>

      {/* Modal Container */}
      <div className="flex min-h-full items-center justify-center p-2 sm:p-4">
        <div className="relative w-full max-w-2xl max-h-[95vh] sm:max-h-[90vh] overflow-hidden">
          {/* Modal Content */}
          <div className="relative bg-white rounded-xl shadow-2xl overflow-hidden transform transition-all duration-300">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
              <div className="flex items-center gap-2 sm:gap-3">
                <button
                  onClick={onClose}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <FaArrowLeft className="w-4 h-4" />
                </button>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                    {editComment ? 'Edit Review' : 'Write a Review'}
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">
                    {editComment ? 'Update your review below' : 'Share your experience with this product'}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                aria-label="Close modal"
              >
                <FaTimes className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 sm:p-6 max-h-[calc(95vh-120px)] sm:max-h-[calc(90vh-120px)] overflow-y-auto">
              <CommentForm
                productId={productId}
                onCommentCreated={(comment) => {
                  onCommentCreated(comment);
                  onClose();
                }}
                onCancel={onClose}
                editComment={editComment}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentModal; 