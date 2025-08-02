const express = require('express');
const multer = require('multer');
const { uploadSingle, uploadMultiple, deleteImage } = require('../controllers/upload');
const { auth, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 5MB.'
      });
    }
  } else if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  next();
};

// Image upload for comments - requires user authentication
router.post('/image', auth, upload.single('image'), handleMulterError, uploadSingle);

// Admin-only routes
router.use(auth);
router.use(adminOnly);

// Upload multiple images (admin only)
router.post('/multiple', upload.array('images', 10), handleMulterError, uploadMultiple);

// Delete image (admin only)
router.delete('/image/:publicId', deleteImage);

module.exports = router;
