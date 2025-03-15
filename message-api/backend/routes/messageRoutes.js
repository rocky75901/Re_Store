import express from "express";
import Message from "../models/Message.js";
import Chat from "../models/Chat.js";

const router = express.Router();

// ✅ Get all messages for a specific chat
router.get("/:chatId", async (req, res) => {
  try {
    const messages = await Message.find({ chatId: req.params.chatId })
      .sort({ createdAt: 1 }) // Sorting by timestamp
      .populate("senderId", "name")
      .populate("receiverId", "name");

    if (!messages.length) {
      return res.status(404).json({ message: "No messages found for this chat." });
    }

    res.json(messages);
  } catch (error) {
    console.error("❌ Error fetching messages:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

// ✅ Send a new message
router.post("/", async (req, res) => {
  try {
    const { chatId, senderId, receiverId, content } = req.body;

    // Validate request body
    if (!chatId || !senderId || !receiverId || !content) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newMessage = new Message({
      chatId,
      senderId,
      receiverId,
      content,
    });

    const savedMessage = await newMessage.save();

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: savedMessage._id,
      updatedAt: Date.now(),
    });

    // Populate sender and receiver details
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate("senderId", "name")
      .populate("receiverId", "name");

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: "Failed to send message." });
  }
});

// ✅ Delete a message
router.delete("/:messageId", async (req, res) => {
  try {
    const message = await Message.findById(req.params.messageId);
    if (!message) {
      return res.status(404).json({ message: "Message not found." });
    }

    await Message.findByIdAndDelete(req.params.messageId);
    res.json({ message: "✅ Message deleted successfully." });
  } catch (error) {
    console.error("❌ Error deleting message:", error);
    res.status(500).json({ message: "Failed to delete message." });
  }
});

export default router;
