import express from 'express';
import { requireSignIn } from '../middlewares/authMiddleware.js';
import { 
  createChat, 
  getUserChats, 
  getChatMessages, 
  saveMessage 
} from '../controllers/chatController.js';

const router = express.Router();

// Chat routes
router.post('/create', requireSignIn, createChat);
router.get('/user/:userId', requireSignIn, getUserChats);
router.get('/:chatId/messages', requireSignIn, getChatMessages);
router.post('/message', requireSignIn, saveMessage);

export default router; 