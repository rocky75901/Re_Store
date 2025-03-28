const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const http = require('http');
const { Server } = require('socket.io');
const messageModel = require('./models/messageModel');
const chatModel = require('./models/chatModel');
const app = require('./app');

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
const allowedOrigins = [process.env.FRONTEND_BASEURL];

app.use((req, res, next) => {
  const host = `${req.protocol}://${req.get('host')}`;
  if (!allowedOrigins.includes(host)) {
    allowedOrigins.push(host);
  }
  next();
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
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

  // Handle joining a chat room
  socket.on('join_chat', async (chatId) => {
    try {
      if (!chatId) {
        throw new Error('Missing chatId');
      }

      // Get the current user ID
      const userId = socket.handshake.query.userId;
      if (!userId) {
        throw new Error('Missing userId');
      }

      // Join the chat room
      socket.join(chatId);
      console.log(`User ${userId} joined chat room: ${chatId}`);

      // Automatically update unread count to 0 when joining a chat
      const updatedChat = await chatModel.findOneAndUpdate(
        { _id: chatId, participants: userId },
        { unreadCount: 0 },
        { new: true }
      );

      if (updatedChat) {
        console.log(
          `Reset unread count for chat ${chatId} to 0 when user ${userId} joined`
        );

        // Broadcast message_read event to all users in the chat
        socket.to(chatId).emit('message_read', { chatId });

        // Also emit to the current user to ensure their UI updates
        socket.emit('message_read', { chatId });
      }
    } catch (error) {
      console.error('Error joining chat:', error);
    }
  });

  // Leave a chat room
  socket.on('leave_chat', (chatId) => {
    if (!chatId) return;
    socket.leave(chatId);
    console.log(`User ${userId || socket.id} left chat: ${chatId}`);
  });

  // Handle message read status
  socket.on('message_read', async ({ chatId }) => {
    try {
      if (!chatId) {
        throw new Error('Missing chatId');
      }

      // Get the current user ID
      const userId = socket.handshake.query.userId;
      if (!userId) {
        throw new Error('Missing userId');
      }

      console.log(`User ${userId} explicitly marking chat ${chatId} as read`);

      // Update chat's unread count in database only when explicitly marked as read
      const updatedChat = await chatModel.findByIdAndUpdate(
        chatId,
        {
          unreadCount: 0,
        },
        { new: true }
      );

      console.log(`Updated chat ${chatId} unread count to 0:`, {
        id: updatedChat._id.toString(),
        unreadCount: updatedChat.unreadCount,
      });

      // Broadcast message_read event to all users in the chat
      socket.to(chatId).emit('message_read', { chatId });

      // Also emit to the current user to ensure their UI updates
      socket.emit('message_read', { chatId });

      console.log(
        `Messages marked as read in chat ${chatId} by user ${userId}`
      );
    } catch (error) {
      console.error('Error marking messages as read:', error);
      socket.emit('error', { message: 'Failed to mark messages as read' });
    }
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

      // Get receiver's socket ID to check if they're in the chat room
      const receiverSocketId = userSockets.get(receiverId);
      const receiverSocket = receiverSocketId
        ? io.sockets.sockets.get(receiverSocketId)
        : null;
      const isReceiverInChatRoom =
        receiverSocket && receiverSocket.rooms.has(chatId);

      // Only increment unread count if receiver is not in the chat room
      const updatedChat = await chatModel.findByIdAndUpdate(
        chatId,
        {
          lastMessage: newMessage._id,
          // Always increment unreadCount if receiver is not in chat room
          $inc: isReceiverInChatRoom ? {} : { unreadCount: 1 },
        },
        { new: true }
      );

      console.log(
        `Message sent to chat ${chatId}, updated unreadCount: ${updatedChat.unreadCount}`
      );
      console.log(
        `Receiver in chat room: ${isReceiverInChatRoom}, Incrementing unread: ${!isReceiverInChatRoom}`
      );

      // Always emit new_message to receiver for notification
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', {
          chatId,
          senderId: populatedMessage.senderId,
          content,
          receiverId,
          createdAt: populatedMessage.createdAt,
        });
      }

      // Handle message delivery based on whether receiver is in chat room
      if (receiverSocketId && receiverSocketId !== socket.id) {
        if (isReceiverInChatRoom) {
          // Receiver is in the chat room, emit to the room, no unread count
          socket.to(chatId).emit('receive_message', populatedMessage);
        } else {
          // Receiver is not in the chat room, emit directly, increment unread
          io.to(receiverSocketId).emit('receive_message', populatedMessage);
        }
      } else {
        // If receiver is not connected, emit to the chat room
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
