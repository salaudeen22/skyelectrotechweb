const mongoose = require('mongoose');
require('dotenv').config();

// Import models
const Product = require('../models/Product');
const Category = require('../models/Category');

const fixProductCategories = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/skyelectrotech');
    console.log('Connected to MongoDB');

    // Find all products
    const products = await Product.find({});
    console.log(`Found ${products.length} products`);

    // Find all categories
    const categories = await Category.find({});
    console.log(`Found ${categories.length} categories`);

    let fixedCount = 0;
    let invalidCount = 0;

    for (const product of products) {
      // Check if category is a string
      if (typeof product.category === 'string') {
        console.log(`Fixing product: ${product.name}, current category: ${product.category}`);
        
        // Find matching category by name (case insensitive)
        const matchingCategory = categories.find(cat => 
          cat.name.toLowerCase() === product.category.toLowerCase()
        );

        if (matchingCategory) {
          // Update the product with the correct ObjectId
          await Product.findByIdAndUpdate(product._id, {
            category: matchingCategory._id
          });
          console.log(`✅ Fixed: ${product.name} -> ${matchingCategory.name} (${matchingCategory._id})`);
          fixedCount++;
        } else {
          console.log(`❌ No matching category found for: ${product.category}`);
          invalidCount++;
        }
      }
    }

    console.log(`\n🎉 Database fix completed!`);
    console.log(`✅ Fixed products: ${fixedCount}`);
    console.log(`❌ Invalid products: ${invalidCount}`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error fixing database:', error);
    process.exit(1);
  }
};

// Run the fix
fixProductCategories();
