const socketIo = require('socket.io');

const initializeSocket = (server) => {
    const io = socketIo(server, {
        cors: {
            origin: "http://localhost:5173",
            methods: ["GET", "POST"],
            credentials: true
        },
        transports: ['websocket'],
        pingTimeout: 60000,
        pingInterval: 25000
    });

    // Store active user connections
    const userSockets = new Map();

    io.on('connection', (socket) => {
        const userId = socket.handshake.query.userId;
        
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
            console.log(`User connected: ${userId} with socket: ${socket.id}`);
        }

        socket.on('join_chat', (chatId) => {
            if (!chatId) return;
            socket.join(chatId);
            console.log(`User ${userId} joined chat: ${chatId}`);
        });

        socket.on('leave_chat', (chatId) => {
            if (!chatId) return;
            socket.leave(chatId);
            console.log(`User ${userId} left chat: ${chatId}`);
        });

        socket.on('send_message', (messageData) => {
            if (!messageData?.chatId || !messageData?.receiverId) return;
            
            // Emit to the chat room
            socket.to(messageData.chatId).emit('receive_message', messageData);
            
            // Also emit directly to the receiver if they're not in the chat room
            const receiverSocketId = userSockets.get(messageData.receiverId);
            if (receiverSocketId && receiverSocketId !== socket.id) {
                io.to(receiverSocketId).emit('receive_message', messageData);
            }
        });

        socket.on('disconnect', () => {
            if (userId) {
                // Only remove if this socket is still the one stored for the user
                if (userSockets.get(userId) === socket.id) {
                    userSockets.delete(userId);
                    console.log(`User disconnected: ${userId} socket: ${socket.id}`);
                }
            }
        });

        // Handle errors
        socket.on('error', (error) => {
            console.error(`Socket error for user ${userId}:`, error);
        });
    });

    return io;
};

module.exports = initializeSocket; 