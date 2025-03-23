const chatModel = require('../models/chatModel');
const messageModel = require('../models/messageModel');
const User = require('../models/userModel');

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { userId, participantId } = req.body;
    
    // Check if chat already exists with proper sorting of participants
    const participants = [userId, participantId].sort();
    const existingChat = await chatModel.findOne({
      participants: participants
    })
    .populate('participants', 'username')
    .populate('lastMessage');

    if (existingChat) {
      return res.status(200).send(existingChat);
    }

    // Create new chat
    const newChat = new chatModel({
      participants: participants
    });

    await newChat.save();
    
    const populatedChat = await chatModel.findById(newChat._id)
      .populate('participants', 'username')
      .populate('lastMessage');

    res.status(201).send(populatedChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).send({ message: 'Error creating chat' });
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

    // Filter out any potential duplicate chats
    const uniqueChats = chats.reduce((acc, chat) => {
      const participantIds = chat.participants.map(p => p._id.toString()).sort().join('-');
      if (!acc.some(c => c.participants.map(p => p._id.toString()).sort().join('-') === participantIds)) {
        acc.push(chat);
      }
      return acc;
    }, []);

    res.status(200).send(uniqueChats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    res.status(500).send({ message: 'Error fetching chats' });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const chatId = req.params.chatId;
    const messages = await messageModel.find({ chatId })
      .populate('senderId', '_id username')
      .populate('receiverId', '_id username')
      .sort({ createdAt: 1 });

    res.status(200).send(messages);
  } catch (error) {
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