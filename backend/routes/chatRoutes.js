const express = require('express');
const router = express.Router();
const Chat = require('../models/chatModel');
const Message = require('../models/messageModel');

// Get all chats for a user
router.get('/user/:userId', async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.params.userId
    })
    .populate('participants', 'name')
    .populate('lastMessage')
    .sort({ updatedAt: -1 });
    res.json(chats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get messages for a specific chat
router.get('/:chatId/messages', async (req, res) => {
  try {
    const messages = await Message.find({
      chatId: req.params.chatId
    })
    .populate('senderId', 'name')
    .sort({ createdAt: 1 });
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create a new chat or get existing one
router.post('/create', async (req, res) => {
  try {
    const { participants, productId } = req.body;
    
    // Check if chat already exists between these users for this product
    let chat = await Chat.findOne({
      participants: { $all: participants },
      productId
    });

    if (!chat) {
      chat = await Chat.create({
        participants,
        productId
      });
    }

    chat = await chat.populate('participants', 'name');
    res.status(201).json(chat);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Send a message
router.post('/:chatId/messages', async (req, res) => {
  try {
    const { content, senderId, receiverId } = req.body;
    const message = await Message.create({
      chatId: req.params.chatId,
      content,
      senderId,
      receiverId
    });
    
    const populatedMessage = await message.populate('senderId', 'name');
    res.status(201).json(populatedMessage);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router; 