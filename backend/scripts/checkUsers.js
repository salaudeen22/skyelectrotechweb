const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

const checkUsers = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected successfully');

    const users = await User.find({}).select('+password');
    console.log('Users in database:');
    users.forEach(user => {
      console.log(`- Email: ${user.email}, Role: ${user.role}, Active: ${user.isActive}, Password Hash: ${user.password?.substring(0, 20)}...`);
    });

    // Test admin user
    const adminUser = await User.findOne({ email: 'admin@skyelectrotech.com' }).select('+password');
    if (adminUser) {
      console.log('\nAdmin user found:');
      console.log('Email:', adminUser.email);
      console.log('Role:', adminUser.role);
      console.log('Active:', adminUser.isActive);
      console.log('Password hash length:', adminUser.password?.length);
      
      // Test password comparison
      const bcrypt = require('bcryptjs');
      const isMatch = await bcrypt.compare('admin123', adminUser.password);
      console.log('Password comparison test:', isMatch);
    } else {
      console.log('\nAdmin user not found!');
    }

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

checkUsers();
