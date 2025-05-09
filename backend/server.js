const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });
const http = require('http');
const { Server } = require('socket.io');
const messageModel = require('./models/messageModel');
const chatModel = require('./models/chatModel');
const app = require('./app');

// Add this function at the top of the file
const fixChatIndexes = async () => {
  try {
    const mongoose = require('mongoose');
    const db = mongoose.connection;
    
    // Wait for connection to be established
    if (db.readyState !== 1) {
      console.log('Waiting for database connection...');
      await new Promise(resolve => setTimeout(resolve, 1000));
      return fixChatIndexes();
    }
    
    console.log('Checking and fixing chat collection indexes...');
    
    // Get the Chat collection
    const Chat = mongoose.model('Chat');
    const collection = Chat.collection;
    
    // Check existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));
    
    // Drop all indexes except _id
    await Promise.all(
      indexes
        .filter(i => i.name !== '_id_')
        .map(i => collection.dropIndex(i.name))
    );
    
    console.log('Removed problematic indexes');
    
    // Build a new, proper compound index
    await collection.createIndex(
      { "participants.0": 1, "participants.1": 1 },
      { unique: true, background: true }
    );
    
    console.log('Created new compound index for chat participants');
  } catch (error) {
    console.error('Error fixing chat indexes:', error);
  }
};

// Connecting to the database
const DB = process.env.DATABASE;
mongoose
  .connect(DB)
  .then(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('DB connection successful');
    }
    
    // Fix chat indexes right after connection
    fixChatIndexes().then(() => {
      console.log('Chat indexes fixed successfully');
    }).catch(err => {
      console.error('Error fixing chat indexes:', err);
    });
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

      // Mark unread messages as read when joining a chat
      const chat = await chatModel.findById(chatId);
      
      if (chat && chat.lastMessage) {
        // Find all unread messages by this user in this chat
        await messageModel.updateMany(
          { 
            chatId,
            readBy: { $ne: userId },
            receiverId: userId // Only mark as read for the recipient
          },
          { 
            $addToSet: { readBy: userId } 
          }
        );
        
        console.log(`Marked all messages as read in chat ${chatId} for user ${userId}`);
            
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

      // Find all unread messages by this user in this chat
      const updateResult = await messageModel.updateMany(
        { 
          chatId,
          readBy: { $ne: userId },
          receiverId: userId // Only mark as read if this user is the recipient
        },
        { 
          $addToSet: { readBy: userId } 
        }
      );
      
      console.log(`Marked ${updateResult.nModified} messages as read in chat ${chatId} for user ${userId}`);
      
      // Broadcast message_read event to all users in the chat
      socket.to(chatId).emit('message_read', { chatId });
      
      // Also emit to the current user to ensure their UI updates
      socket.emit('message_read', { chatId });
      
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

      // Validate message length
      if (content.length > 1000) {
        throw new Error('Message too long');
      }

      // Create new message in database with sender already marked as read
      const newMessage = await messageModel.create({
        chatId,
        content,
        senderId,
        receiverId,
        readBy: [senderId] // Sender has already read the message
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
        
      // Update the chat's last message
      const updatedChat = await chatModel.findByIdAndUpdate(
        chatId,
        {
          lastMessage: newMessage._id
        },
        { new: true }
      );

      // If receiver is in the chat room, mark message as read automatically
      if (isReceiverInChatRoom) {
        await messageModel.findByIdAndUpdate(
          newMessage._id,
          { $addToSet: { readBy: receiverId } }
        );
      }

      // Send confirmation back to sender first
      socket.emit('message_sent', populatedMessage);

      // Then handle message delivery based on whether receiver is in chat room
      if (receiverSocketId && receiverSocketId !== socket.id) {
        if (isReceiverInChatRoom) {
          // Receiver is in the chat room, emit to the room
          socket.to(chatId).emit('receive_message', populatedMessage);
        } else {
          // Receiver is not in the chat room, emit directly
          io.to(receiverSocketId).emit('receive_message', populatedMessage);
        }
      } else {
        // If receiver is not connected, emit to the chat room
        socket.to(chatId).emit('receive_message', populatedMessage);
      }

    } catch (error) {
      console.error('Error sending message:', error);
      socket.emit('error', { 
        message: error.message || 'Failed to send message',
        type: 'message_error'
      });
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
