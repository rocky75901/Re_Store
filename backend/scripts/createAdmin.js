const mongoose = require('mongoose');
const User = require('../models/userModel');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../config.env') });

const createAdmin = async () => {
  try {
    // Connect to database
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to database');

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@iitk.ac.in' });
    
    if (existingAdmin) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    const adminData = {
      username: 'admin',
      name: 'Admin User',
      email: 'admin@iitk.ac.in',
      password: 'Admin@123',
      passwordConfirm: 'Admin@123',
      role: 'admin',
      isVerified: true
    };

    const admin = new User(adminData);
    await admin.save();

    console.log('Admin user created successfully');

  } catch (error) {
    console.error('Error creating admin:', error);
  } finally {
    await mongoose.connection.close();
    process.exit(0);
  }
};

// Run the script
createAdmin(); 