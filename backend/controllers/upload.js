const { uploadImage, uploadMultipleImages, deleteImage } = require('../utils/s3');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'No image file provided');
  }

  try {
    // Upload to S3
    const result = await uploadImage(req.file, req.body.folder || 'skyelectrotech');

    sendResponse(res, 200, {
      url: result.url,
      public_id: result.public_id,
      key: result.key
    }, 'Image uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    sendError(res, 500, 'Error uploading image');
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private (Admin)
const uploadMultiple = asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return sendError(res, 400, 'No image files provided');
  }

  try {
    // Upload all to S3
    const results = await uploadMultipleImages(req.files, req.body.folder || 'skyelectrotech');

    sendResponse(res, 200, {
      images: results
    }, 'Images uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    sendError(res, 500, 'Error uploading images');
  }
});

// @desc    Delete image from S3
// @route   DELETE /api/upload/image/:key
// @access  Private (Admin)
const deleteImageFromS3 = asyncHandler(async (req, res) => {
  const { key } = req.params;

  if (!key) {
    return sendError(res, 400, 'Image key is required');
  }

  try {
    // Decode the key (it might be URL encoded)
    const decodedKey = decodeURIComponent(key);
    
    const success = await deleteImage(decodedKey);

    if (success) {
      sendResponse(res, 200, null, 'Image deleted successfully');
    } else {
      sendError(res, 500, 'Error deleting image');
    }
  } catch (error) {
    console.error('Delete error:', error);
    sendError(res, 500, 'Error deleting image');
  }
});

module.exports = {
  uploadSingle,
  uploadMultiple,
  deleteImage: deleteImageFromS3
};
