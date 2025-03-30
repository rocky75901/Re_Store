const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });
const messageModel = require('../models/messageModel');
const chatModel = require('../models/chatModel');

// Connecting to the database
const DB = process.env.DATABASE;

// Run the migration
async function migrateMessages() {
  try {
    console.log('Connecting to database...');
    await mongoose.connect(DB);
    console.log('Connected to database.');

    // 1. Get all messages that don't have a readBy array
    const messages = await messageModel.find();
    console.log(`Found ${messages.length} messages to update.`);

    // 2. For each message, add a readBy array with the sender
    let updatedCount = 0;
    for (const message of messages) {
      // Add sender to readBy array
      if (!message.readBy || message.readBy.length === 0) {
        message.readBy = [message.senderId];
        await message.save();
        updatedCount++;
      }
    }
    console.log(`Updated ${updatedCount} messages with readBy arrays.`);

    // 3. Get all chats
    const chats = await chatModel.find();
    console.log(`Found ${chats.length} chats to update.`);

    // 4. For each chat with unreadCount > 0, find the last message and update its readBy array
    let updatedChats = 0;
    for (const chat of chats) {
      if (chat.lastMessage) {
        // Get participants
        const participants = chat.participants;
        
        // Find messages in this chat
        const chatMessages = await messageModel.find({ chatId: chat._id });
        
        for (const message of chatMessages) {
          const sender = message.senderId.toString();
          
          // If sender is not in readBy, add them
          if (!message.readBy.some(id => id.toString() === sender)) {
            message.readBy.push(sender);
            await message.save();
          }
        }
        
        updatedChats++;
      }
    }
    console.log(`Updated messages in ${updatedChats} chats.`);

    console.log('Migration complete!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

migrateMessages(); 