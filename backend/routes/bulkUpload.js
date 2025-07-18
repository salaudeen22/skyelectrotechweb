const express = require('express');
const multer = require('multer');
const { 
  downloadTemplate,
  bulkUploadProducts,
  bulkUpdateProducts,
  bulkDeleteProducts,
  exportProducts,
  getDatabaseStats
} = require('../controllers/bulkUpload');
const { auth, adminOnly } = require('../middleware/auth');
const logActivity = require('../middleware/activityLogger');

const router = express.Router();

// Configure multer for CSV file upload
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit for CSV files
  },
  fileFilter: (req, file, cb) => {
    // Check file type - allow CSV and Excel files
    if (file.mimetype === 'text/csv' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
      cb(null, true);
    } else {
      cb(new Error('Only CSV and Excel files are allowed'), false);
    }
  }
});

// Error handling middleware for multer
const handleMulterError = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 10MB.'
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

// All routes require admin authentication
router.use(auth);
router.use(adminOnly);

// Download CSV template
router.get('/template', downloadTemplate);

// Export existing products to CSV
router.get('/export', exportProducts);

// Get database statistics
router.get('/stats', getDatabaseStats);

// Bulk upload products from CSV
router.post('/products', 
  upload.single('csvFile'), 
  handleMulterError,
  logActivity('bulk_upload_products', 'product'),
  bulkUploadProducts
);

// Bulk update products
router.put('/products',
  logActivity('bulk_update_products', 'product'),
  bulkUpdateProducts
);

// Bulk delete products
router.delete('/products',
  logActivity('bulk_delete_products', 'product'),
  bulkDeleteProducts
);

module.exports = router;
