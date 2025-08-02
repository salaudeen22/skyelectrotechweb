/**
 * Image utility functions for AWS S3 integration
 */

/**
 * Get the display URL for an image
 * @param {Object|string} image - Image object or URL string
 * @param {string} fallbackUrl - Fallback URL if image is not available
 * @returns {string} Image URL
 */
export const getImageUrl = (image, fallbackUrl = 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png') => {
  if (!image) return fallbackUrl;
  
  // If image is a string (direct URL)
  if (typeof image === 'string') {
    return image;
  }
  
  // If image is an object with url property (S3 format)
  if (image.url) {
    return image.url;
  }
  
  // If image is an object with public_id (legacy format)
  if (image.public_id) {
    return image.public_id;
  }
  
  return fallbackUrl;
};

/**
 * Get the primary image from an array of images
 * @param {Array} images - Array of image objects
 * @param {string} fallbackUrl - Fallback URL if no images available
 * @returns {string} Primary image URL
 */
export const getPrimaryImage = (images, fallbackUrl = 'https://tepeseo.com/wp-content/uploads/2019/05/404notfound.png') => {
  if (!images || images.length === 0) return fallbackUrl;
  
  return getImageUrl(images[0], fallbackUrl);
};

/**
 * Validate image file
 * @param {File} file - File to validate
 * @param {number} maxSize - Maximum file size in bytes (default: 5MB)
 * @returns {Object} Validation result with isValid and error message
 */
export const validateImageFile = (file, maxSize = 5 * 1024 * 1024) => {
  // Check file type
  if (!file.type.startsWith('image/')) {
    return {
      isValid: false,
      error: `${file.name} is not an image file`
    };
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      isValid: false,
      error: `${file.name} is too large (max ${Math.round(maxSize / 1024 / 1024)}MB)`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
};

/**
 * Format file size for display
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

/**
 * Check if image URL is from AWS S3
 * @param {string} url - Image URL
 * @returns {boolean} True if URL is from S3
 */
export const isS3Url = (url) => {
  if (!url) return false;
  return url.includes('s3.amazonaws.com') || url.includes('s3.') || url.includes('amazonaws.com');
};

/**
 * Get image dimensions from URL (for S3 images)
 * @param {string} url - Image URL
 * @returns {Promise<Object>} Promise resolving to {width, height}
 */
export const getImageDimensions = (url) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({
        width: img.width,
        height: img.height
      });
    };
    img.onerror = () => {
      reject(new Error('Failed to load image'));
    };
    img.src = url;
  });
}; 