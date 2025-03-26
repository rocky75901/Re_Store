const express = require('express');
const router = express.Router();
const { protect } = require('../controllers/authController');
const { 
  createChat, 
  getUserChats, 
  getChatMessages, 
  saveMessage,
  createOrFindChatWithUser,
  markChatAsRead
} = require('../controllers/chatController');

// Chat routes
router.post('/create', protect, createChat);
router.get('/user/:userId', protect, getUserChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/message', protect, saveMessage);
router.post('/with-user/:userId', protect, createOrFindChatWithUser);
router.post('/:chatId/read', protect, markChatAsRead);

module.exports = router; 