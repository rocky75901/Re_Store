/* Paste this Code in Contact Seller of Frontend
 
const handleContactSeller = async (sellerId) => {
  const userId = getCurrentUserId(); // Function to get logged-in user ID

  const response = await fetch('/api/chats/find-or-create', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ userId1: userId, userId2: sellerId })
  });

  const data = await response.json();
  if (data.chatId) {
    navigate(`/messages?chatId=${data.chatId}`); // Open chat page
  }
};
  
  */
import express from "express";
import Chat from "../models/Chat.js";
import Message from "../models/Message.js";
import User from '../models/User.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

// Create a new chat or get existing one
router.post("/create", verifyToken, async (req, res) => {
  try {
    const { participantEmail, userId } = req.body;

    // Validate inputs
    if (!participantEmail || !userId) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    // Find the participant by email
    const participant = await User.findOne({ email: participantEmail });
    if (!participant) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Don't allow chat with self
    if (participant._id.toString() === userId) {
      return res.status(400).json({ message: 'Cannot create chat with yourself' });
    }

    // Check if chat already exists between these users
    const existingChat = await Chat.findOne({
      participants: {
        $all: [userId, participant._id]
      }
    }).populate('participants', 'name email');

    if (existingChat) {
      return res.json({ chatId: existingChat._id, chat: existingChat });
    }

    // Create new chat
    const newChat = new Chat({
      participants: [userId, participant._id]
    });

    await newChat.save();

    // Populate participant details
    const populatedChat = await Chat.findById(newChat._id)
      .populate('participants', 'name email');

    res.status(201).json({ chatId: newChat._id, chat: populatedChat });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: 'Failed to create chat' });
  }
});

// Get user's chats
router.get("/user/:userId", verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const chats = await Chat.find({ participants: userId })
      .populate('participants', 'name email')
      .populate('lastMessage')
      .sort({ updatedAt: -1 });

    res.json(chats);
  } catch (error) {
    console.error('Error fetching user chats:', error);
    res.status(500).json({ message: 'Failed to fetch chats' });
  }
});

// Get messages for a chat
router.get("/:chatId/messages", verifyToken, async (req, res) => {
  try {
    const { chatId } = req.params;
    
    if (!chatId) {
      return res.status(400).json({ message: 'Chat ID is required' });
    }

    const messages = await Message.find({ chatId })
      .populate('senderId', 'name email')
      .populate('receiverId', 'name email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ message: 'Failed to fetch messages' });
  }
});

export default router;
