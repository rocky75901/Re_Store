import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
    if (!userId) {
        console.error('Cannot initialize socket without userId');
        return null;
    }

    // If socket exists and is connected, return it
    if (socket?.connected) {
        return socket;
    }

    // Disconnect existing socket if any
    if (socket) {
        socket.disconnect();
    }

    // Create new socket connection
    socket = io('http://localhost:3000', {
        query: { userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 60000
    });

    // Connection event handlers
    socket.on('connect', () => {
        console.log('Socket connected:', socket.id);
    });

    socket.on('disconnect', (reason) => {
        console.log('Socket disconnected:', reason);
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
    });

    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });

    return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
    if (socket?.connected) {
        socket.disconnect();
        socket = null;
        console.log('Socket disconnected and cleared');
    }
};

export const joinChat = (chatId) => {
    if (!socket?.connected || !chatId) return;
    socket.emit('join_chat', chatId);
};

export const leaveChat = (chatId) => {
    if (!socket?.connected || !chatId) return;
    socket.emit('leave_chat', chatId);
};

export const sendMessage = (messageData) => {
    if (!socket?.connected) {
        console.error('Cannot send message: Socket not connected');
        return false;
    }

    // Validate message data
    if (!messageData || !messageData.chatId || !messageData.content || !messageData.senderId || !messageData.receiverId) {
        console.error('Invalid message data');
        return false;
    }

    socket.emit('send_message', messageData);
    return true;
}; 