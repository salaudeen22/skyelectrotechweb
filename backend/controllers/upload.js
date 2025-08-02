const { uploadImage, uploadMultipleImages, deleteImage } = require('../utils/cloudinary');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Upload single image
// @route   POST /api/upload/image
// @access  Private
const uploadSingle = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'No image file provided');
  }

  try {
    // Convert buffer to base64
    const fileStr = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;
    
    // Upload to Cloudinary
    const result = await uploadImage(fileStr, req.body.folder || 'skyelectrotech');

    sendResponse(res, 200, {
      url: result.secure_url,
      publicId: result.public_id
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
    // Convert all files to base64
    const fileStrs = req.files.map(file => 
      `data:${file.mimetype};base64,${file.buffer.toString('base64')}`
    );
    
    // Upload all to Cloudinary
    const results = await uploadMultipleImages(fileStrs, req.body.folder || 'skyelectrotech');

    sendResponse(res, 200, {
      images: results
    }, 'Images uploaded successfully');
  } catch (error) {
    console.error('Upload error:', error);
    sendError(res, 500, 'Error uploading images');
  }
});

// @desc    Delete image from Cloudinary
// @route   DELETE /api/upload/image/:publicId
// @access  Private (Admin)
const deleteImageFromCloud = asyncHandler(async (req, res) => {
  const { publicId } = req.params;

  if (!publicId) {
    return sendError(res, 400, 'Public ID is required');
  }

  try {
    // Decode the public ID (it might be URL encoded)
    const decodedPublicId = decodeURIComponent(publicId);
    
    const success = await deleteImage(decodedPublicId);

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
  deleteImage: deleteImageFromCloud
};
