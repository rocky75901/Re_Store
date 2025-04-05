const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const User = require('../models/userModel');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { userId, participantId } = req.body;
    
    console.log('Creating chat with params:', { userId, participantId });

    // Input validation
    if (!userId || !participantId) {
      return res.status(400).send({ 
        message: 'Both userId and participantId are required'
      });
    }

    // Prevent self-chat
    if (userId === participantId) {
      return res.status(400).send({ 
        message: 'Cannot create chat with yourself'
      });
    }

    // Ensure valid MongoDB ObjectIDs
    const mongoose = require('mongoose');
    const ObjectId = mongoose.Types.ObjectId;

    if (!ObjectId.isValid(userId) || !ObjectId.isValid(participantId)) {
      return res.status(400).send({ 
        message: 'Invalid user ID format'
      });
    }

    // Convert to ObjectId instances
    const userObjectId = new ObjectId(userId);
    const participantObjectId = new ObjectId(participantId);

    // Check if users exist
    try {
      const userExists = await User.findById(userObjectId);
      const participantExists = await User.findById(participantObjectId);

      if (!userExists || !participantExists) {
        return res.status(404).send({ 
          message: 'One or both users not found'
        });
      }
    } catch (err) {
      console.error('Error verifying users:', err);
      return res.status(500).send({ 
        message: 'Error verifying users'
      });
    }

    // Query format ensuring we find regardless of participant order
    const participantQuery = {
      $and: [
        { participants: userObjectId },
        { participants: participantObjectId }
      ]
    };

    // Check if chat already exists
    try {
      const existingChat = await chatModel.findOne(participantQuery);

      if (existingChat) {
        // Verify both users are in the chat
        const hasUser1 = existingChat.participants.some(p => 
          p.toString() === userId
        );
        const hasUser2 = existingChat.participants.some(p => 
          p.toString() === participantId
        );

        if (hasUser1 && hasUser2) {
          // Populate the existing chat
          const populatedChat = await chatModel.findById(existingChat._id)
            .populate('participants', 'username')
            .populate('lastMessage');

          return res.status(200).send(populatedChat);
        }
      }
    } catch (err) {
      console.error('Error finding existing chat:', err);
    }

    // Create new chat with sorted participants for consistency
    try {
      // Sort the participants to ensure consistent order
      const sortedParticipants = [userObjectId, participantObjectId].sort((a, b) => 
        a.toString().localeCompare(b.toString())
      );
      
      const newChat = new chatModel({
        participants: sortedParticipants
      });

      await newChat.save();
      
      const populatedChat = await chatModel.findById(newChat._id)
        .populate('participants', 'username')
        .populate('lastMessage');

      return res.status(201).send(populatedChat);
    } catch (error) {
      // If duplicate key error, try to fetch the existing chat
      if (error.code === 11000) {
        console.log('Duplicate key detected, fetching existing chat');
        const existingChat = await chatModel.findOne(participantQuery)
          .populate('participants', 'username')
          .populate('lastMessage');
          
        if (existingChat) {
          return res.status(200).send(existingChat);
        }
      }
      
      console.error('Error saving new chat:', error);
      return res.status(500).send({ 
        message: error.message || 'Error creating new chat'
      });
    }
  } catch (error) {
    console.error('Error creating chat:', error);
    return res.status(500).send({ 
      message: error.message || 'Error creating chat'
    });
  }
};

// Get user's chats
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.params.userId;
    
    const chats = await chatModel.find({
      participants: userId
    })
    .populate('participants', 'username')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });

    console.log(`Found ${chats.length} chats for user ${userId}`);

    // Create a map to track unique chat combinations
    const uniqueChatsMap = new Map();
    
    // Filter out any potential duplicate chats
    chats.forEach(chat => {
      // Create a unique key based on sorted participant IDs
      const participantIds = chat.participants
        .map(p => (typeof p === 'string' ? p : p._id.toString()))
        .sort()
        .join('-');
      
      // Only keep the first instance of each unique participant combination
      if (!uniqueChatsMap.has(participantIds)) {
        uniqueChatsMap.set(participantIds, chat);
      } else {
        console.log(`Found duplicate chat with participants: ${participantIds}`);
      }
    });
    
    // Convert map back to array
    const uniqueChats = Array.from(uniqueChatsMap.values());
    
    console.log(`Filtered to ${uniqueChats.length} unique chats`);

    // Calculate unread counts for each chat
    const chatsWithUnreadCounts = await Promise.all(uniqueChats.map(async (chat) => {
      // Count messages where the user is the receiver and hasn't read yet
      const unreadCount = await messageModel.countDocuments({
        chatId: chat._id,
        receiverId: userId,
        readBy: { $ne: userId }
      });
      
      return {
        ...chat.toObject(),
        unreadCount
      };
    }));

    console.log('Sending chats with unread counts');
    
    res.status(200).send(chatsWithUnreadCounts);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send({ message: 'Error fetching chats' });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    
    // Just fetch messages without modifying unread status
    const messages = await messageModel.find({ chatId })
      .populate('senderId', '_id username')
      .populate('receiverId', '_id username')
      .sort({ createdAt: 1 });

    // Important: We're NOT updating the unread count here
    // This ensures unread status persists until explicitly marked as read
    
    console.log(`Fetched ${messages.length} messages for chat ${chatId} without resetting unread count`);
    
    res.status(200).send(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).send({ message: 'Error fetching messages' });
  }
};

// Save a new message
exports.saveMessage = async (req, res) => {
  try {
    const { chatId, senderId, receiverId, content } = req.body;
    
    const newMessage = await messageModel.create({
      chatId,
      senderId,
      receiverId,
      content
    });

    await chatModel.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id
    });

    res.status(201).send(newMessage);
  } catch (error) {
    res.status(500).send({ message: 'Error saving message' });
  }
};

// Create or find a chat with a specific user
exports.createOrFindChatWithUser = async (req, res) => {
  try {
    console.log('createOrFindChatWithUser called');
    const currentUserId = req.user._id.toString();
    const targetUserId = req.params.userId;

    // Basic validation
    if (!currentUserId || !targetUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Both users must be specified'
      });
    }

    // Prevent self-chat
    if (currentUserId === targetUserId) {
      return res.status(400).json({
        status: 'error',
        message: 'Cannot create chat with yourself'
      });
    }

    // Verify users exist
    const mongoose = require('mongoose');
    const currentUserObjId = new mongoose.Types.ObjectId(currentUserId);
    const targetUserObjId = new mongoose.Types.ObjectId(targetUserId);

    try {
      // SIMPLER QUERY: First try a plain $and query that works reliably
      console.log('Looking for existing chat between users with simple query');
      const existingChat = await chatModel.findOne({
        $and: [
          { participants: currentUserObjId },
          { participants: targetUserObjId }
        ]
      }).populate('participants', 'username')
        .populate('lastMessage');
      
      if (existingChat) {
        console.log('Found existing chat with simple query:', existingChat._id);
        return res.status(200).json({
          status: 'success',
          data: existingChat
        });
      }
      
      console.log('No existing chat found, creating new chat with safety checks');
      
      // Safety check: query ALL chats for this user and check manually to be absolutely sure
      const userChats = await chatModel.find({ participants: currentUserObjId });
      
      // Double-check for any chat containing both users
      for (const chat of userChats) {
        const hasTargetUser = chat.participants.some(p => 
          p.toString() === targetUserObjId.toString()
        );
        
        if (hasTargetUser) {
          console.log('Found existing chat in safety check:', chat._id);
          const populatedChat = await chatModel.findById(chat._id)
            .populate('participants', 'username')
            .populate('lastMessage');
            
          return res.status(200).json({
            status: 'success',
            data: populatedChat
          });
        }
      }
      
      // If we reach here, we're sure no chat exists
      console.log('After thorough checks, no chat exists - creating new one');
      
      // Sort participants to ensure consistent order
      const sortedParticipants = [currentUserObjId, targetUserObjId].sort((a, b) => 
        a.toString().localeCompare(b.toString())
      );
      
      // Ensure we're not creating a chat that already exists (final safety check)
      const duplicateCheck = await chatModel.findOne({
        participants: { $all: sortedParticipants }
      });
      
      if (duplicateCheck) {
        console.log('Found duplicate in final check:', duplicateCheck._id);
        const populatedDuplicate = await chatModel.findById(duplicateCheck._id)
          .populate('participants', 'username')
          .populate('lastMessage');
          
        return res.status(200).json({
          status: 'success',
          data: populatedDuplicate
        });
      }
      
      // Finally create a new chat
      const newChat = new chatModel({
        participants: sortedParticipants
      });
      
      await newChat.save();
      console.log('New chat created successfully');
      
      const populatedChat = await chatModel.findById(newChat._id)
        .populate('participants', 'username')
        .populate('lastMessage');
      
      return res.status(201).json({
        status: 'success',
        data: populatedChat
      });
    } catch (error) {
      console.error('Error in chat creation:', error);
      
      // Last resort: try to find the chat again despite the error
      try {
        console.log('Attempting recovery after error');
        const recoveryChat = await chatModel.findOne({
          $and: [
            { participants: currentUserObjId },
            { participants: targetUserObjId }
          ]
        }).populate('participants', 'username')
          .populate('lastMessage');
        
        if (recoveryChat) {
          console.log('Recovery successful, found chat:', recoveryChat._id);
          return res.status(200).json({
            status: 'success',
            data: recoveryChat
          });
        }
      } catch (recoveryError) {
        console.error('Recovery attempt failed:', recoveryError);
      }
      
      return res.status(500).json({
        status: 'error',
        message: 'Failed to find or create chat. Please try again.'
      });
    }
  } catch (error) {
    console.error('Outer error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Server error creating chat'
    });
  }
};

// Mark chat as read
exports.markChatAsRead = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const userId = req.user._id;
    
    console.log(`Marking chat ${chatId} as read for user ${userId}`);
    
    // Find the chat and make sure user is a participant
    const chat = await chatModel.findOne({
      _id: chatId,
      participants: userId
    });
    
    if (!chat) {
      return res.status(404).json({
        status: 'error',
        message: 'Chat not found or user not a participant'
      });
    }
    
    // Mark all messages as read for this user
    const updateResult = await messageModel.updateMany(
      { 
        chatId,
        readBy: { $ne: userId },
        receiverId: userId // Only mark as read if this user is the recipient
      },
      { 
        $addToSet: { readBy: userId } 
      }
    );
    
    console.log(`Marked ${updateResult.nModified} messages as read in chat ${chatId} for user ${userId}`);
    
    res.status(200).json({
      status: 'success',
      message: 'Chat marked as read',
      messagesUpdated: updateResult.nModified
    });
    
  } catch (error) {
    console.error('Error marking chat as read:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error marking chat as read'
    });
  }
}; 