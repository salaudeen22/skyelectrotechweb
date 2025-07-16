const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Category = require('../models/Category');
const Product = require('../models/Product');

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Sample data
const sampleUsers = [
  {
    name: 'Admin User',
    email: 'admin@skyelectrotech.com',
    password: 'admin123',
    role: 'admin',
    isActive: true,
    emailVerified: true
  },
  {
    name: 'Employee One',
    email: 'employee1@skyelectrotech.com',
    password: 'employee123',
    role: 'employee',
    isActive: true,
    emailVerified: true
  },
  {
    name: 'John Doe',
    email: 'user@example.com',
    password: 'user123',
    role: 'user',
    isActive: true,
    emailVerified: true,
    phone: '+1234567890',
    address: {
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001'
    }
  }
];

const sampleCategories = [
  {
    name: 'Smartphones',
    description: 'Latest smartphones and mobile devices',
    image: {
      public_id: 'categories/smartphones',
      url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    name: 'Laptops',
    description: 'High-performance laptops and notebooks',
    image: {
      public_id: 'categories/laptops',
      url: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    name: 'Tablets',
    description: 'Tablets and e-readers',
    image: {
      public_id: 'categories/tablets',
      url: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    name: 'Audio',
    description: 'Headphones, speakers, and audio equipment',
    image: {
      public_id: 'categories/audio',
      url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  },
  {
    name: 'Accessories',
    description: 'Electronic accessories and peripherals',
    image: {
      public_id: 'categories/accessories',
      url: 'https://images.unsplash.com/photo-1572569511254-d8f925fe2cbb?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
    }
  }
];

const sampleProducts = [
  {
    name: 'iPhone 15 Pro',
    description: 'The latest iPhone with A17 Pro chip, titanium design, and advanced camera system. Features a 6.1-inch Super Retina XDR display, 48MP main camera, and USB-C connectivity.',
    price: 999,
    originalPrice: 1099,
    discount: 9,
    brand: 'Apple',
    stock: 50,
    lowStockThreshold: 10,
    specifications: [
      { name: 'Display', value: '6.1-inch Super Retina XDR' },
      { name: 'Chip', value: 'A17 Pro' },
      { name: 'Storage', value: '128GB' },
      { name: 'Camera', value: '48MP Main, 12MP Ultra Wide' }
    ],
    features: [
      'Titanium Design',
      'Action Button',
      'USB-C',
      'MagSafe Compatible',
      '5G Ready'
    ],
    tags: ['smartphone', 'apple', 'iphone', '5g'],
    isFeatured: true,
    dimensions: {
      length: 14.67,
      width: 7.08,
      height: 0.83,
      weight: 187
    },
    warranty: '1 Year Apple Warranty'
  },
  {
    name: 'MacBook Air M2',
    description: 'Supercharged by the M2 chip, the redesigned MacBook Air combines incredible performance and up to 18 hours of battery life into its strikingly thin design.',
    price: 1199,
    brand: 'Apple',
    stock: 30,
    specifications: [
      { name: 'Display', value: '13.6-inch Liquid Retina' },
      { name: 'Chip', value: 'Apple M2' },
      { name: 'Memory', value: '8GB Unified Memory' },
      { name: 'Storage', value: '256GB SSD' }
    ],
    features: [
      'M2 Chip',
      'All-day battery life',
      'Fanless design',
      'MagSafe charging',
      'Two Thunderbolt ports'
    ],
    tags: ['laptop', 'apple', 'macbook', 'm2'],
    isFeatured: true,
    warranty: '1 Year Apple Warranty'
  },
  {
    name: 'Samsung Galaxy Tab S9',
    description: 'The ultimate Android tablet with S Pen included. Features a stunning 11-inch display, powerful performance, and all-day battery life.',
    price: 799,
    brand: 'Samsung',
    stock: 25,
    specifications: [
      { name: 'Display', value: '11-inch Dynamic AMOLED 2X' },
      { name: 'Processor', value: 'Snapdragon 8 Gen 2' },
      { name: 'RAM', value: '8GB' },
      { name: 'Storage', value: '128GB' }
    ],
    features: [
      'S Pen Included',
      'DeX Mode',
      'Multi-window',
      '5G Ready',
      'Water Resistant'
    ],
    tags: ['tablet', 'samsung', 'android', 's-pen']
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise canceling wireless headphones with crystal clear hands-free calling and Alexa voice control.',
    price: 399,
    originalPrice: 449,
    discount: 11,
    brand: 'Sony',
    stock: 40,
    specifications: [
      { name: 'Driver', value: '30mm' },
      { name: 'Battery', value: '30 hours' },
      { name: 'Connectivity', value: 'Bluetooth 5.2' },
      { name: 'Weight', value: '250g' }
    ],
    features: [
      'Industry-leading noise canceling',
      '30-hour battery life',
      'Quick charge',
      'Speak-to-chat',
      'Multipoint connection'
    ],
    tags: ['headphones', 'sony', 'wireless', 'noise-canceling'],
    isFeatured: true
  },
  {
    name: 'USB-C to Lightning Cable',
    description: 'High-quality USB-C to Lightning cable for fast charging and data transfer. MFi certified for guaranteed compatibility.',
    price: 29,
    brand: 'Generic',
    stock: 100,
    specifications: [
      { name: 'Length', value: '1 meter' },
      { name: 'Connector', value: 'USB-C to Lightning' },
      { name: 'Certification', value: 'MFi Certified' }
    ],
    features: [
      'Fast charging',
      'Data sync',
      'MFi certified',
      'Durable design'
    ],
    tags: ['cable', 'usb-c', 'lightning', 'charging']
  }
];

// Seed function
const seedDatabase = async () => {
  try {
    await connectDB();

    // Clear existing data
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Create admin user first
    console.log('Creating users...');
    const createdUsers = [];
    
    for (const userData of sampleUsers) {
      // Don't hash password here - let the User model handle it
      const user = await User.create({
        ...userData
      });
      createdUsers.push(user);
      console.log(`Created user: ${user.name} (${user.role})`);
    }

    const adminUser = createdUsers.find(user => user.role === 'admin');

    // Create categories
    console.log('Creating categories...');
    const createdCategories = [];
    
    for (const categoryData of sampleCategories) {
      const category = await Category.create({
        ...categoryData,
        createdBy: adminUser._id
      });
      createdCategories.push(category);
      console.log(`Created category: ${category.name}`);
    }

    // Create products
    console.log('Creating products...');
    const categoryMap = {
      'iPhone 15 Pro': createdCategories.find(cat => cat.name === 'Smartphones')._id,
      'MacBook Air M2': createdCategories.find(cat => cat.name === 'Laptops')._id,
      'Samsung Galaxy Tab S9': createdCategories.find(cat => cat.name === 'Tablets')._id,
      'Sony WH-1000XM5': createdCategories.find(cat => cat.name === 'Audio')._id,
      'USB-C to Lightning Cable': createdCategories.find(cat => cat.name === 'Accessories')._id
    };

    for (const productData of sampleProducts) {
      // Generate SKU
      const category = createdCategories.find(cat => cat._id.equals(categoryMap[productData.name]));
      const sku = `${category.name.substring(0, 3).toUpperCase()}${productData.brand.substring(0, 2).toUpperCase()}${productData.name.substring(0, 3).toUpperCase()}${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`;
      
      const product = await Product.create({
        ...productData,
        category: categoryMap[productData.name],
        sku,
        createdBy: adminUser._id,
        isFeatured: productData.isFeatured || false, // Use the isFeatured from productData
        images: [
          {
            public_id: `sample_${productData.name.replace(/\s+/g, '_').toLowerCase()}`,
            url: `https://via.placeholder.com/600x400?text=${encodeURIComponent(productData.name)}`
          }
        ]
      });
      
      console.log(`Created product: ${product.name} (SKU: ${product.sku})${product.isFeatured ? ' [FEATURED]' : ''}`);
    }

    console.log('\n🎉 Database seeded successfully!');
    console.log('\nDefault login credentials:');
    console.log('Admin: admin@skyelectrotech.com / admin123');
    console.log('Employee: employee1@skyelectrotech.com / employee123');
    console.log('User: user@example.com / user123');

  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Database connection closed');
  }
};

// Run seeder
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;
