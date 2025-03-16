const mongoose = require('mongoose');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
dotenv.config({ path: './config.env' });

const app = require('./app');

//Connecting to the database
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
const io = socketIo(server, {
  cors: {
    origin: "*",  // Allow any origin
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  // Join a chat room
  socket.on('join_chat', (chatId) => {
    socket.join(chatId);
    console.log(`User ${socket.id} joined chat: ${chatId}`);
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    socket.leave(chatId);
    console.log(`User ${socket.id} left chat: ${chatId}`);
  });

  // Handle new messages
  socket.on('send_message', async (messageData) => {
    try {
      const { chatId, content, senderId, receiverId } = messageData;
      
      // Create new message in database
      const Message = mongoose.model('Message');
      const newMessage = await Message.create({
        chatId,
        content,
        senderId,
        receiverId
      });

      // Broadcast message to chat room
      io.to(chatId).emit('receive_message', newMessage);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

//starting the server
const port = process.env.PORT;
server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
