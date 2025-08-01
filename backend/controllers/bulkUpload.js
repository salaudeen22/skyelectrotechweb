const csv = require('csv-parser');
const multer = require('multer');
const { Readable } = require('stream');
const Product = require('../models/Product');
const Category = require('../models/Category');
const { sendResponse, sendError, asyncHandler } = require('../utils/helpers');
const { uploadMultipleImages } = require('../utils/cloudinary');
const { exportProducts, getDatabaseStats } = require('./databaseExport');

// Helper function to generate SKU
const generateSKU = (categoryName, brand, productName) => {
  const categoryCode = categoryName.substring(0, 3).toUpperCase();
  const brandCode = brand.substring(0, 2).toUpperCase();
  const productCode = productName.substring(0, 3).toUpperCase();
  const randomCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${categoryCode}${brandCode}${productCode}${randomCode}`;
};

// Helper function to parse CSV data
const parseCSVData = (csvData) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(csvData);
    
    stream
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
};

// Helper function to validate product data
const validateProductData = (product, categories) => {
  const errors = [];
  
  if (!product.name || product.name.trim() === '') {
    errors.push('Product name is required');
  }
  
  if (!product.description || product.description.trim() === '') {
    errors.push('Description is required');
  }
  
  if (!product.price || isNaN(parseFloat(product.price)) || parseFloat(product.price) <= 0) {
    errors.push('Valid price is required');
  }
  
  if (!product.category || product.category.trim() === '') {
    errors.push('Category is required');
  } else {
    const categoryExists = categories.find(cat => 
      cat.name.toLowerCase() === product.category.toLowerCase()
    );
    if (!categoryExists) {
      errors.push(`Category "${product.category}" not found`);
    }
  }
  
  return errors;
};

// @desc    Download CSV template
// @route   GET /api/bulk-upload/template
// @access  Private (Admin)
const downloadTemplate = asyncHandler(async (req, res) => {
  const csvTemplate = `name,description,price,originalPrice,discount,category,brand,specifications,features,tags,warranty,isFeatured,isActive,imageUrls,dimensions_length,dimensions_width,dimensions_height,dimensions_weight,sku
1.3 Inch OLED I2C Display Module – 128x64 – Blue,"This 1.3-inch OLED display module is a compact screen with a resolution of 128x64 pixels, ideal for DIY electronics, Arduino projects, and embedded systems. It uses I2C communication protocol, making it easy to interface with microcontrollers like Arduino, Raspberry Pi, or ESP32. Featuring crisp blue visuals and low power consumption, it's perfect for battery-powered applications.",168.99,249,32,Displays & Interfaces,Generic,"Display Type:OLED|Interface:I2C|Resolution:128x64|Operating Voltage:3.3V - 5V|Color:Blue|Dimensions:35mm x 35mm x 5mm","1.3-inch crisp OLED screen|128x64 pixel resolution|I2C interface (easy wiring)|Low power usage|High contrast & wide viewing angles","oled,display,i2c,arduino,electronics","1 Month Replacement Warranty",false,true,"https://example.com/image1.jpg,https://example.com/image2.jpg,https://example.com/image3.jpg",35,35,5,15,
Nitecore Intellicharger i2 Dual Slot Smart Battery Charger,"The Nitecore i2 is a universal, automatic smart-charger compatible with almost all cylindrical rechargeable batteries, including Li-ion, Ni-MH, and Ni-Cd. The i2 can independently charge 2 batteries at the same time, with intelligent circuitry that identifies battery type and applies the appropriate charging mode.",3392,9999,66,Batteries & Chargers,Nitecore,"Input Voltage:AC 100-240V / DC 12V|Output Voltage:4.2V / 3.7V / 1.48V|Battery Compatibility:Li-ion, NiMH, NiCd|Number of Slots:2","Compatible with multiple battery chemistries|Independent dual-slot charging|LED indicators for charging status|Overcharge protection|Fire-retardant and durable ABS shell","charger,battery,nitecore,li-ion,nimh","6 Months Manufacturer Warranty",true,true,"https://example.com/charger1.jpg,https://example.com/charger2.jpg",145,75,30,120,
ESP32 Development Board,"The ESP32 Dev Board is a powerful microcontroller board based on the ESP-WROOM-32 chip. It comes with integrated Wi-Fi and Bluetooth capabilities, making it ideal for IoT, smart home, wearable, and automation projects. With dual-core processing, rich peripherals, and deep sleep support.",300,1200,75,IoT & Wireless,Espressif,"Microcontroller:ESP32 (ESP-WROOM-32)|Clock Speed:Up to 240 MHz|Flash Memory:4MB|USB Interface:Micro USB|Wireless:Wi-Fi + Bluetooth","Dual-core 32-bit processor|Built-in Wi-Fi (802.11 b/g/n)|Bluetooth 4.2 (Classic + BLE)|520 KB SRAM, 4MB Flash|Low power consumption with deep sleep|Multiple GPIOs with UART, SPI, I2C, PWM support","esp32,wifi,bluetooth,iot,microcontroller,arduino","3 Months Replacement Warranty",true,true,"https://example.com/esp32_1.jpg,https://example.com/esp32_2.jpg,https://example.com/esp32_3.jpg",55,28,12,25,`;

  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=bulk-product-upload-template.csv');
  res.send(csvTemplate);
});

// @desc    Process bulk upload
// @route   POST /api/bulk-upload/products
// @access  Private (Admin)
const bulkUploadProducts = asyncHandler(async (req, res) => {
  if (!req.file) {
    return sendError(res, 400, 'No CSV file provided');
  }

  try {
    // Parse CSV data
    const csvString = req.file.buffer.toString('utf8');
    const products = await parseCSVData(csvString);
    
    if (products.length === 0) {
      return sendError(res, 400, 'CSV file is empty or invalid');
    }

    // Get all categories for validation
    const categories = await Category.find({ isActive: true });
    
    const results = {
      total: products.length,
      successful: 0,
      failed: 0,
      errors: [],
      createdProducts: []
    };

    // Process each product
    for (let i = 0; i < products.length; i++) {
      const productData = products[i];
      const rowNumber = i + 2; // +2 because CSV starts from row 2 (header is row 1)
      
      try {
        // Validate product data
        const validationErrors = validateProductData(productData, categories);
        if (validationErrors.length > 0) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            product: productData.name || 'Unknown',
            errors: validationErrors
          });
          continue;
        }

        // Find category
        const category = categories.find(cat => 
          cat.name.toLowerCase() === productData.category.toLowerCase()
        );

        // Parse specifications
        let specifications = [];
        if (productData.specifications) {
          try {
            const specs = productData.specifications.split('|');
            specifications = specs.map(spec => {
              const [name, value] = spec.split(':');
              return { name: name?.trim(), value: value?.trim() };
            }).filter(spec => spec.name && spec.value);
          } catch (error) {
            console.warn(`Invalid specifications format for product ${productData.name}`);
          }
        }

        // Parse features
        let features = [];
        if (productData.features) {
          features = productData.features.split('|').map(f => f.trim()).filter(f => f);
        }

        // Parse tags
        let tags = [];
        if (productData.tags) {
          tags = productData.tags.split(',').map(t => t.trim()).filter(t => t);
        }

        // Parse dimensions
        let dimensions = {};
        if (productData.dimensions_length) dimensions.length = parseFloat(productData.dimensions_length);
        if (productData.dimensions_width) dimensions.width = parseFloat(productData.dimensions_width);
        if (productData.dimensions_height) dimensions.height = parseFloat(productData.dimensions_height);
        if (productData.dimensions_weight) dimensions.weight = parseFloat(productData.dimensions_weight);

        // Parse images
        let images = [];
        if (productData.imageUrls) {
          const imageUrls = productData.imageUrls.split(',').map(url => url.trim()).filter(url => url);
          images = imageUrls.map((url, index) => ({
            url: url,
            public_id: `external_${Date.now()}_${Math.random()}_${index}`
          }));
        }

        // Generate or use provided SKU
        let sku = productData.sku?.trim();
        if (!sku) {
          sku = generateSKU(
            category.name,
            productData.brand || 'GENERIC',
            productData.name
          );
        }

        // Check if SKU already exists
        const existingSKU = await Product.findOne({ sku });
        if (existingSKU) {
          results.failed++;
          results.errors.push({
            row: rowNumber,
            product: productData.name,
            errors: [`Product with SKU "${sku}" already exists`]
          });
          continue;
        }

        // Create product
        const product = await Product.create({
          name: productData.name.trim(),
          description: productData.description.trim(),
          price: parseFloat(productData.price),
          originalPrice: productData.originalPrice ? parseFloat(productData.originalPrice) : undefined,
          discount: productData.discount ? parseFloat(productData.discount) : 0,
          category: category._id,
          brand: productData.brand?.trim() || '',
          sku,
          specifications,
          features,
          tags,
          dimensions: Object.keys(dimensions).length > 0 ? dimensions : undefined,
          warranty: productData.warranty?.trim() || '',
          isFeatured: productData.isFeatured === 'true' || productData.isFeatured === '1',
          isActive: productData.isActive !== 'false' && productData.isActive !== '0', // Default to true unless explicitly false
          images,
          createdBy: req.user._id
        });

        await product.populate('category', 'name');

        results.successful++;
        results.createdProducts.push({
          row: rowNumber,
          id: product._id,
          name: product.name,
          sku: product.sku
        });

      } catch (error) {
        console.error(`Error creating product at row ${rowNumber}:`, error);
        results.failed++;
        results.errors.push({
          row: rowNumber,
          product: productData.name || 'Unknown',
          errors: [error.message || 'Failed to create product']
        });
      }
    }

    sendResponse(res, 200, results, 'Bulk upload completed');

  } catch (error) {
    console.error('Bulk upload error:', error);
    sendError(res, 500, 'Error processing bulk upload: ' + error.message);
  }
});

// @desc    Bulk update products
// @route   PUT /api/bulk-upload/products
// @access  Private (Admin)
const bulkUpdateProducts = asyncHandler(async (req, res) => {
  const { updates } = req.body;
  
  if (!updates || !Array.isArray(updates) || updates.length === 0) {
    return sendError(res, 400, 'Updates array is required');
  }

  const results = {
    total: updates.length,
    successful: 0,
    failed: 0,
    errors: []
  };

  for (let i = 0; i < updates.length; i++) {
    const update = updates[i];
    
    try {
      if (!update.id) {
        results.failed++;
        results.errors.push({
          index: i,
          error: 'Product ID is required'
        });
        continue;
      }

      const product = await Product.findById(update.id);
      if (!product) {
        results.failed++;
        results.errors.push({
          index: i,
          id: update.id,
          error: 'Product not found'
        });
        continue;
      }

      // Update only provided fields
      const updateData = { ...update };
      delete updateData.id; // Remove ID from update data
      updateData.updatedBy = req.user._id;

      await Product.findByIdAndUpdate(update.id, updateData, {
        new: true,
        runValidators: true
      });

      results.successful++;

    } catch (error) {
      console.error(`Error updating product ${update.id}:`, error);
      results.failed++;
      results.errors.push({
        index: i,
        id: update.id,
        error: error.message || 'Failed to update product'
      });
    }
  }

  sendResponse(res, 200, results, 'Bulk update completed');
});

// @desc    Bulk delete products
// @route   DELETE /api/bulk-upload/products
// @access  Private (Admin)
const bulkDeleteProducts = asyncHandler(async (req, res) => {
  const { productIds } = req.body;
  
  if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
    return sendError(res, 400, 'Product IDs array is required');
  }

  try {
    // Soft delete - set isActive to false
    const result = await Product.updateMany(
      { _id: { $in: productIds } },
      { 
        isActive: false,
        updatedBy: req.user._id
      }
    );

    sendResponse(res, 200, {
      deletedCount: result.modifiedCount
    }, `Successfully deleted ${result.modifiedCount} products`);

  } catch (error) {
    console.error('Bulk delete error:', error);
    sendError(res, 500, 'Error deleting products: ' + error.message);
  }
});

module.exports = {
  downloadTemplate,
  bulkUploadProducts,
  bulkUpdateProducts,
  bulkDeleteProducts,
  exportProducts,
  getDatabaseStats
};