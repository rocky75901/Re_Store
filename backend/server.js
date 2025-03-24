const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require('socket.io');
const messageModel = require('./models/messageModel');
const chatModel = require('./models/chatModel');
const app = require('./app');

dotenv.config({ path: './config.env' });

// Connecting to the database
const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DB connection successful');
    }
  })
  .catch((err) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(err.message);
    }
  });

// Create HTTP server
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket'],
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Store active user connections
const userSockets = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  const userId = socket.handshake.query.userId;
  console.log('A user connected:', socket.id, 'userId:', userId);

  if (userId) {
    // Disconnect existing socket for this user if any
    const existingSocketId = userSockets.get(userId);
    if (existingSocketId) {
      const existingSocket = io.sockets.sockets.get(existingSocketId);
      if (existingSocket) {
        console.log(`Disconnecting existing socket for user: ${userId}`);
        existingSocket.disconnect(true);
      }
    }

    // Store new socket
    userSockets.set(userId, socket.id);
  }

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    if (!chatId) return;
    socket.join(chatId);
    console.log(`User ${userId || socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    if (!chatId) return;
    socket.leave(chatId);
    console.log(`User ${userId || socket.id} left chat: ${chatId}`);
  });

  // Handle new messages
  socket.on('send_message', async (messageData) => {
    try {
      const { chatId, content, senderId, receiverId } = messageData;
      if (!chatId || !content || !senderId || !receiverId) {
        throw new Error('Missing required message data');
      }

      // Create new message in database
      const newMessage = await messageModel.create({
        chatId,
        content,
        senderId,
        receiverId,
      });

      // Populate the message with sender and receiver details
      const populatedMessage = await messageModel
        .findById(newMessage._id)
        .populate('senderId', '_id username')
        .populate('receiverId', '_id username');

      // Update last message in chat
      await chatModel.findByIdAndUpdate(chatId, {
        lastMessage: newMessage._id,
      });

      // Get receiver's socket ID
      const receiverSocketId = userSockets.get(receiverId);

      // If receiver is in the chat room, only emit to the chat room
      // Otherwise, emit directly to the receiver
      if (receiverSocketId && receiverSocketId !== socket.id) {
        const receiverSocket = io.sockets.sockets.get(receiverSocketId);
        if (receiverSocket && receiverSocket.rooms.has(chatId)) {
          // Receiver is in the chat room, only emit to the room
          socket.to(chatId).emit('receive_message', populatedMessage);
        } else {
          // Receiver is not in the chat room, emit directly
          io.to(receiverSocketId).emit('receive_message', populatedMessage);
        }
      } else {
        // If receiver is not connected or is the sender, emit to the chat room
        socket.to(chatId).emit('receive_message', populatedMessage);
      }

      // Send confirmation back to sender
      socket.emit('message_sent', populatedMessage);

      console.log(
        `Message sent in chat ${chatId} from ${senderId} to ${receiverId}`
      );
    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    if (userId) {
      // Only remove if this socket is still the one stored for the user
      if (userSockets.get(userId) === socket.id) {
        userSockets.delete(userId);
        console.log(`User disconnected: ${userId} socket: ${socket.id}`);
      }
    } else {
      console.log('User disconnected:', socket.id);
    }
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error(`Socket error for user ${userId || socket.id}:`, error);
  });
});

const port = process.env.PORT || 3000;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = server;
