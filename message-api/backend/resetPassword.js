import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import User from './models/User.js';

dotenv.config();

const createOrUpdateUser = async (userData) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Connected to MongoDB');

    const { email, password, name } = userData;
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Check if user exists
    let user = await User.findOne({ email });
    
    if (user) {
      // Update existing user
      const result = await User.updateOne(
        { email },
        { $set: { password: hashedPassword } }
      );
      console.log('✅ Updated existing user:', email);
    } else {
      // Create new user
      user = new User({
        email,
        password: hashedPassword,
        name
      });
      await user.save();
      console.log('✅ Created new user:', email);
    }
    
    console.log('User details:', {
      email,
      name,
      passwordHash: hashedPassword
    });

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

const getAllUsers = async (options = {}) => {
  try {
    await mongoose.connect(process.env.MONGO_URI, { 
      useNewUrlParser: true, 
      useUnifiedTopology: true 
    });
    console.log('✅ Connected to MongoDB');

    const {
      page = 1,
      limit = 10,
      emailFilter = '',
      active = true
    } = options;

    // Build query
    const query = {};
    if (emailFilter) {
      query.email = { $regex: emailFilter, $options: 'i' };
    }
    if (active !== null) {
      query.active = active;
    }

    // Fetch users with pagination
    const users = await User.find(query)
      .select('email name active')
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 });

    // Get total count for pagination
    const total = await User.countDocuments(query);

    console.log(`✅ Retrieved users from database: ${users.length} (Total: ${total})`);

    return {
      users,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        currentPage: page,
        perPage: limit
      }
    };
  } catch (error) {
    console.error('❌ Error fetching users:', error);
    return { users: [], pagination: { total: 0, pages: 0, currentPage: 1, perPage: 10 } };
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  }
};

// Function to test chat between two users
const setupChatTestUsers = async () => {
  try {
    const { users } = await getAllUsers({ limit: 2 });
    
    if (users.length < 2) {
      console.log('Not enough users in database, creating test users...');
      
      // Create two test users if needed
      const testUsers = [
        { email: 'test1@example.com', name: 'Test User 1' },
        { email: 'test2@example.com', name: 'Test User 2' }
      ];
      
      for (const user of testUsers) {
        await createOrUpdateUser({
          email: user.email,
          name: user.name,
          password: 'password123'
        });
      }
      
      console.log('✅ Created test users for chat testing');
    } else {
      console.log('Using existing users for chat testing:', {
        user1: { email: users[0].email, name: users[0].name },
        user2: { email: users[1].email, name: users[1].name }
      });
    }
  } catch (error) {
    console.error('❌ Error setting up chat test users:', error);
  }
};

// Run chat test setup
setupChatTestUsers();

// Example usage with options
getAllUsers({
  page: 1,
  limit: 50,
  emailFilter: '', // Optional email filter
  active: true // Only active users
}).then(({ users, pagination }) => {
  console.log(`Processing page ${pagination.currentPage} of ${pagination.pages}`);
  users.forEach(user => {
    createOrUpdateUser({
      email: user.email,
      name: user.name,
      password: 'password123' // You might want to handle password resets differently
    });
  });
}); 