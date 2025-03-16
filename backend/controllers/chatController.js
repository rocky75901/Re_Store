const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { userId, participantId } = req.body;
    
    // Check if chat already exists
    const existingChat = await chatModel.findOne({
      participants: { $all: [userId, participantId] }
    }).populate('participants', 'name email');

    if (existingChat) {
      return res.status(200).send(existingChat);
    }

    // Create new chat
    const newChat = new chatModel({
      participants: [userId, participantId]
    });

    await newChat.save();
    
    // Populate participant details
    const populatedChat = await chatModel.findById(newChat._id)
      .populate('participants', 'name email');

    res.status(201).send(populatedChat);
  } catch (error) {
    console.error('Create chat error:', error);
    res.status(500).send({
      success: false,
      message: 'Error creating chat',
      error
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
    .populate('participants', 'name email')
    .populate('lastMessage');

    res.status(200).send(chats);
  } catch (error) {
    console.error('Get chats error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching chats',
      error
    });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await messageModel.find({ chatId })
      .sort({ createdAt: 1 });

    res.status(200).send(messages);
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).send({
      success: false,
      message: 'Error fetching messages',
      error
    });
  }
};

// Save a new message
exports.saveMessage = async (req, res) => {
  try {
    const { chatId, senderId, receiverId, content } = req.body;
    
    const newMessage = new messageModel({
      chatId,
      senderId,
      receiverId,
      content
    });

    await newMessage.save();

    // Update last message in chat
    await chatModel.findByIdAndUpdate(chatId, {
      lastMessage: newMessage._id
    });

    res.status(201).send(newMessage);
  } catch (error) {
    console.error('Save message error:', error);
    res.status(500).send({
      success: false,
      message: 'Error saving message',
      error
    });
  }
}; 