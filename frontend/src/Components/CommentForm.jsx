import React, { useState } from 'react';
import { FaStar, FaUpload, FaTimes, FaCamera, FaEdit, FaCheck } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import { commentsAPI, uploadAPI } from '../services/apiServices';

const CommentForm = ({ productId, onCommentCreated, onCancel, editComment = null }) => {
  const [formData, setFormData] = useState({
    rating: editComment?.rating || 0,
    title: editComment?.title || '',
    comment: editComment?.comment || '',
    images: editComment?.images || []
  });
  const [hoveredRating, setHoveredRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);

  const handleRatingChange = (rating) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploadingImages(true);
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        try {
          const response = await uploadAPI.uploadSingle(file, 'comments');
          
          if (response.success) {
            uploadedImages.push({
              url: response.data.url,
              publicId: response.data.public_id
            });
          } else {
            toast.error(`Failed to upload ${file.name}: ${response.message || 'Unknown error'}`);
          }
        } catch (error) {
          console.error(`Error uploading ${file.name}:`, error);
          toast.error(`Failed to upload ${file.name}. Please try again.`);
        }
      }

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...uploadedImages]
      }));

      if (uploadedImages.length > 0) {
        toast.success(`${uploadedImages.length} image(s) uploaded successfully`);
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.rating === 0) {
      toast.error('Please select a rating');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (!formData.comment.trim()) {
      toast.error('Please enter a comment');
      return;
    }

    setIsSubmitting(true);
    try {
      let response;
      
      if (editComment) {
        // Update existing comment
        response = await commentsAPI.updateComment(editComment._id, formData);
      } else {
        // Create new comment
        response = await commentsAPI.createComment({
          ...formData,
          productId
        });
      }

      if (response.success) {
        toast.success(editComment ? 'Review updated successfully' : 'Review submitted successfully');
        onCommentCreated(response.data.comment);
      } else {
        // Handle specific error cases
        if (response.message && response.message.includes('already reviewed')) {
          toast.error('You have already reviewed this product. You can edit your existing review instead.');
        } else {
          toast.error(response.message || 'Failed to submit review');
        }
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Rating Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-base font-semibold text-gray-900 mb-4">
          Your Rating *
        </label>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => handleRatingChange(star)}
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                className="focus:outline-none transform hover:scale-110 transition-transform duration-200"
              >
                <FaStar
                  className={`w-8 h-8 ${
                    star <= (hoveredRating || formData.rating)
                      ? 'text-yellow-400 fill-current drop-shadow-sm'
                      : 'text-gray-300 hover:text-yellow-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {formData.rating > 0 && (
            <div className="flex items-center gap-2 px-4 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
              <FaCheck className="w-4 h-4 text-yellow-600" />
              <span className="text-sm font-medium text-yellow-800">
                {formData.rating} star{formData.rating > 1 ? 's' : ''} selected
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Title Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label htmlFor="title" className="block text-base font-semibold text-gray-900 mb-3">
          Review Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          maxLength={100}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
          placeholder="Summarize your experience with this product..."
          required
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Keep it concise and descriptive
          </span>
          <span className="text-xs font-medium text-gray-600">
            {formData.title.length}/100
          </span>
        </div>
      </div>

      {/* Comment Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label htmlFor="comment" className="block text-base font-semibold text-gray-900 mb-3">
          Detailed Review *
        </label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          maxLength={1000}
          rows={5}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200"
          placeholder="Share your detailed experience with this product. What did you like? What could be improved? Your honest feedback helps other customers make informed decisions..."
          required
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-500">
            Be specific about your experience
          </span>
          <span className="text-xs font-medium text-gray-600">
            {formData.comment.length}/1000
          </span>
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <label className="block text-base font-semibold text-gray-900 mb-4">
          Add Photos (Optional)
        </label>
        <div className="space-y-4">
          {/* Image Upload */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <label className="cursor-pointer flex items-center justify-center gap-3 bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 px-6 py-4 rounded-xl border-2 border-dashed border-blue-300 hover:border-blue-400 transition-all duration-200">
              <FaCamera className="w-5 h-5 text-blue-600" />
              <span className="font-medium text-blue-700">
                {uploadingImages ? 'Uploading...' : 'Upload Images'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
            </label>
            <div className="text-sm text-gray-600">
              <p>• Maximum 5 images</p>
              <p>• 5MB per image</p>
              <p>• JPG, PNG, WebP formats</p>
            </div>
          </div>

          {/* Display Uploaded Images */}
          {formData.images.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <FaEdit className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">Uploaded Images</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {formData.images.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image.url}
                      alt={`Review image ${index + 1}`}
                      className="w-full h-24 sm:h-28 object-cover rounded-lg shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-red-600 shadow-lg"
                    >
                      <FaTimes className="w-3 h-3" />
                    </button>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 rounded-lg transition-all duration-200"></div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-6 border-t border-gray-200">
        <button
          type="button"
          onClick={onCancel}
          className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-all duration-200 font-medium"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages}
          className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          {isSubmitting ? (
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Submitting...</span>
            </div>
          ) : (
            <span>{editComment ? 'Update Review' : 'Submit Review'}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 