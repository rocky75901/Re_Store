import express from "express";
import http from "http";
import { Server } from "socket.io";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";
import Chat from "./models/Chat.js";
import Message from "./models/Message.js";

// Import routes
import chatRoutes from "./routes/chatRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import authRoutes from "./routes/authRoutes.js";

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173", "http://localhost:5174"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Middleware
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:5174"],
    credentials: true,
  })
);
app.use(express.json());
app.use("/api/auth", authRoutes);

// ✅ Routes
app.use("/api/chats", chatRoutes);
app.use("/api/messages", messageRoutes);

// ✅ Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Track active users and their rooms
const userSockets = new Map(); // Map userId to socketId
const socketUsers = new Map(); // Map socketId to userId

// Debug function to log current connections
const logConnections = () => {
  console.log('\nCurrent Connections:');
  console.log('Active Users:', userSockets.size);
  userSockets.forEach((socketId, userId) => {
    console.log(`User ${userId} -> Socket ${socketId}`);
  });
  console.log('------------------------\n');
};

// ✅ WebSocket Logic
io.on("connection", (socket) => {
  console.log(`\n🔌 Socket connected: ${socket.id}`);

  // Handle user joining their personal room
  socket.on("join_user", (userId) => {
    if (!userId) {
      console.log(`❌ Invalid user ID for socket ${socket.id}`);
      return;
    }
    
    // Remove any existing socket connection for this user
    const existingSocketId = userSockets.get(userId);
    if (existingSocketId && existingSocketId !== socket.id) {
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        console.log(`🔄 Disconnecting existing socket ${existingSocketId} for user ${userId}`);
        existingSocket.disconnect();
        userSockets.delete(userId);
        socketUsers.delete(existingSocketId);
      }
    }
    
    // Store the new socket connection
    socket.join(userId);
    userSockets.set(userId, socket.id);
    socketUsers.set(socket.id, userId);
    console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    logConnections();
  });

  // Handle joining a chat room
  socket.on("join_chat", (chatId) => {
    if (!chatId) return;
    const userId = socketUsers.get(socket.id);
    socket.join(chatId);
    console.log(`💬 User ${userId} (Socket ${socket.id}) joined chat ${chatId}`);
  });

  // Handle sending messages
  socket.on("send_message", async (messageData) => {
    try {
      const { chatId, senderId, receiverId, content } = messageData;
      
      // Save message to database with new schema
      const newMessage = new Message({
        chatId,
        senderId,
        receiverId,
        content,
        status: 'sent',
        createdAt: new Date()
      });
      const savedMessage = await newMessage.save();

      // Update chat's last message and timestamp
      await Chat.findByIdAndUpdate(chatId, {
        lastMessage: savedMessage._id,
        updatedAt: new Date()
      });

      // Populate the message with sender and receiver details
      const populatedMessage = await Message.findById(savedMessage._id)
        .populate('senderId', 'name email')
        .populate('receiverId', 'name email');

      // Only emit to the chat room - this will reach all participants
      io.to(chatId).emit("receive_message", populatedMessage);

      // If receiver is online, update message status to delivered
      const receiverSocketId = userSockets.get(receiverId);
      if (receiverSocketId) {
        await Message.findByIdAndUpdate(savedMessage._id, { status: 'delivered' });
      }

      console.log(`✅ Message sent in chat ${chatId} from ${senderId} to ${receiverId}`);
    } catch (error) {
      console.error("❌ Error handling message:", error);
      socket.emit("message_error", { error: "Failed to send message" });
    }
  });

  // Handle leaving a chat
  socket.on("leave_chat", (chatId) => {
    if (!chatId) return;
    const userId = socketUsers.get(socket.id);
    socket.leave(chatId);
    console.log(`👋 User ${userId} (Socket ${socket.id}) left chat ${chatId}`);
  });

  // Handle client disconnection
  socket.on("disconnect", (reason) => {
    const userId = socketUsers.get(socket.id);
    if (userId) {
      console.log(`\n🔌 User ${userId} disconnected (Socket: ${socket.id})`);
      console.log(`Reason: ${reason}`);
      
      // Clean up user mappings
      userSockets.delete(userId);
      socketUsers.delete(socket.id);
      
      logConnections();
    }
  });
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
