const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');

// @desc    Export products to CSV
// @route   GET /api/bulk-upload/export
// @access  Private (Admin)
const exportProducts = asyncHandler(async (req, res) => {
  try {
    // Get all active products with populated category
    const products = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    if (products.length === 0) {
      return sendError(res, 404, 'No products found to export');
    }

    // Create CSV header
    const csvHeader = 'name,description,price,originalPrice,discount,category,brand,stock,lowStockThreshold,specifications,features,tags,warranty,isFeatured,isActive,imageUrls,dimensions_length,dimensions_width,dimensions_height,dimensions_weight,sku,createdAt\n';

    // Convert products to CSV rows
    const csvRows = products.map(product => {
      // Format specifications
      const specifications = product.specifications && product.specifications.length > 0
        ? product.specifications.map(spec => `${spec.name}:${spec.value}`).join('|')
        : '';

      // Format features
      const features = product.features && product.features.length > 0
        ? product.features.join('|')
        : '';

      // Format tags
      const tags = product.tags && product.tags.length > 0
        ? product.tags.join(',')
        : '';

      // Format images
      const imageUrls = product.images && product.images.length > 0
        ? product.images.map(img => img.url).join(',')
        : '';

      // Format dimensions
      const dimensions = product.dimensions || {};
      const length = dimensions.length || '';
      const width = dimensions.width || '';
      const height = dimensions.height || '';
      const weight = dimensions.weight || '';

      // Escape CSV values
      const escapeCSV = (value) => {
        if (value === null || value === undefined) return '';
        const str = String(value);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      return [
        escapeCSV(product.name),
        escapeCSV(product.description),
        product.price,
        product.originalPrice || '',
        product.discount || 0,
        escapeCSV(product.category?.name || ''),
        escapeCSV(product.brand || ''),
        product.stock,
        product.lowStockThreshold || 10,
        escapeCSV(specifications),
        escapeCSV(features),
        escapeCSV(tags),
        escapeCSV(product.warranty || ''),
        product.isFeatured,
        product.isActive,
        escapeCSV(imageUrls),
        length,
        width,
        height,
        weight,
        escapeCSV(product.sku),
        product.createdAt.toISOString()
      ].join(',');
    }).join('\n');

    const csvContent = csvHeader + csvRows;

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename=products-export.csv');
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    sendError(res, 500, 'Error exporting products: ' + error.message);
  }
});

// @desc    Get database statistics
// @route   GET /api/bulk-upload/stats
// @access  Private (Admin)
const getDatabaseStats = asyncHandler(async (req, res) => {
  try {
    // Get product statistics
    const totalProducts = await Product.countDocuments();
    const activeProducts = await Product.countDocuments({ isActive: true });
    const featuredProducts = await Product.countDocuments({ isFeatured: true, isActive: true });
    const lowStockProducts = await Product.countDocuments({
      $expr: { $lte: ['$stock', '$lowStockThreshold'] },
      isActive: true
    });

    // Get category statistics
    const totalCategories = await Category.countDocuments();
    const activeCategories = await Category.countDocuments({ isActive: true });

    // Get products by category
    const productsByCategory = await Product.aggregate([
      { $match: { isActive: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $lookup: { from: 'categories', localField: '_id', foreignField: '_id', as: 'category' } },
      { $unwind: '$category' },
      { $project: { categoryName: '$category.name', count: 1 } },
      { $sort: { count: -1 } }
    ]);

    // Get price range statistics
    const priceStats = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $group: {
          _id: null,
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' },
          avgPrice: { $avg: '$price' },
          totalValue: { $sum: { $multiply: ['$price', '$stock'] } }
        }
      }
    ]);

    // Get recent products
    const recentProducts = await Product.find({ isActive: true })
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .limit(10)
      .select('name price stock category createdAt');

    // Get missing required fields
    const productsWithMissingData = await Product.aggregate([
      { $match: { isActive: true } },
      {
        $project: {
          name: 1,
          missingFields: {
            $filter: {
              input: [
                { field: 'description', missing: { $or: [{ $eq: ['$description', ''] }, { $eq: ['$description', null] }] } },
                { field: 'brand', missing: { $or: [{ $eq: ['$brand', ''] }, { $eq: ['$brand', null] }] } },
                { field: 'images', missing: { $eq: [{ $size: '$images' }, 0] } },
                { field: 'warranty', missing: { $or: [{ $eq: ['$warranty', ''] }, { $eq: ['$warranty', null] }] } }
              ],
              cond: '$$this.missing'
            }
          }
        }
      },
      { $match: { 'missingFields.0': { $exists: true } } }
    ]);

    sendResponse(res, 200, {
      statistics: {
        products: {
          total: totalProducts,
          active: activeProducts,
          featured: featuredProducts,
          lowStock: lowStockProducts
        },
        categories: {
          total: totalCategories,
          active: activeCategories
        },
        pricing: priceStats[0] || {
          minPrice: 0,
          maxPrice: 0,
          avgPrice: 0,
          totalValue: 0
        }
      },
      productsByCategory,
      recentProducts,
      dataQuality: {
        productsWithMissingData: productsWithMissingData.length,
        details: productsWithMissingData.slice(0, 10) // Show first 10
      }
    }, 'Database statistics retrieved successfully');

  } catch (error) {
    console.error('Stats error:', error);
    sendError(res, 500, 'Error retrieving database statistics: ' + error.message);
  }
});

module.exports = {
  exportProducts,
  getDatabaseStats
};
