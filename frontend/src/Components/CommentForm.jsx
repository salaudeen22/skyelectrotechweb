import React, { useState } from 'react';
import { FaStar, FaUpload, FaTimes } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

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

    // Validate file types and sizes
    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    const maxSize = 5 * 1024 * 1024; // 5MB

    for (const file of files) {
      if (!validTypes.includes(file.type)) {
        toast.error(`${file.name} is not a valid image type`);
        return;
      }
      if (file.size > maxSize) {
        toast.error(`${file.name} is too large. Maximum size is 5MB`);
        return;
      }
    }

    if (formData.images.length + files.length > 5) {
      toast.error('Maximum 5 images allowed');
      return;
    }

    setUploadingImages(true);
    try {
      const uploadedImages = [];
      
      for (const file of files) {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload/image', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        const data = await response.json();

        if (response.ok) {
          uploadedImages.push({
            url: data.data.url,
            publicId: data.data.publicId
          });
        } else {
          toast.error(`Failed to upload ${file.name}`);
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
      const url = editComment 
        ? `/api/comments/${editComment._id}`
        : '/api/comments';
      
      const method = editComment ? 'PUT' : 'POST';
      const body = editComment 
        ? { ...formData }
        : { ...formData, productId };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(body)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editComment ? 'Review updated successfully' : 'Review submitted successfully');
        onCommentCreated(data.data.comment);
      } else {
        toast.error(data.message || 'Failed to submit review');
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex items-center space-x-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRatingChange(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="focus:outline-none"
            >
              <FaStar
                className={`w-6 h-6 ${
                  star <= (hoveredRating || formData.rating)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            </button>
          ))}
          <span className="ml-2 text-sm text-gray-600">
            {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
          </span>
        </div>
      </div>

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
          Title *
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={formData.title}
          onChange={handleInputChange}
          maxLength={100}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Summarize your experience"
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.title.length}/100 characters
        </div>
      </div>

      <div>
        <label htmlFor="comment" className="block text-sm font-medium text-gray-700 mb-2">
          Review *
        </label>
        <textarea
          id="comment"
          name="comment"
          value={formData.comment}
          onChange={handleInputChange}
          maxLength={1000}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Share your detailed experience with this product..."
          required
        />
        <div className="text-xs text-gray-500 mt-1">
          {formData.comment.length}/1000 characters
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Images (Optional)
        </label>
        <div className="space-y-3">
          {/* Image Upload */}
          <div className="flex items-center space-x-2">
            <label className="cursor-pointer bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-md border border-gray-300 transition-colors">
              <FaUpload className="inline w-4 h-4 mr-2" />
              {uploadingImages ? 'Uploading...' : 'Upload Images'}
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploadingImages}
              />
            </label>
            <span className="text-sm text-gray-500">
              Max 5 images, 5MB each
            </span>
          </div>

          {/* Display Uploaded Images */}
          {formData.images.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {formData.images.map((image, index) => (
                <div key={index} className="relative group">
                  <img
                    src={image.url}
                    alt={`Review image ${index + 1}`}
                    className="w-full h-24 object-cover rounded-md"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting || uploadingImages}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : (editComment ? 'Update Review' : 'Submit Review')}
        </button>
      </div>
    </form>
  );
};

export default CommentForm; 