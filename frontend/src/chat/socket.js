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

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    // Create new socket connection with better error handling and reconnection
    socket = io(BACKEND_URL, {
        query: { userId },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 10000,
        autoConnect: true
    });

    // Enhanced connection event handlers
    socket.on('connect', () => {
        
    });

    socket.on('disconnect', (reason) => {
        
        // Attempt to reconnect on certain disconnect reasons
        if (reason === 'io server disconnect' || reason === 'transport close') {
            socket.connect();
        }
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

export const joinChat = (chatId) => {
    if (!socket?.connected || !chatId) {
        console.error('Cannot join chat: Socket not connected or invalid chatId');
        return;
    }
    
    socket.emit('join_chat', chatId);
};

export const leaveChat = (chatId) => {
    if (!socket?.connected || !chatId) {
        console.error('Cannot leave chat: Socket not connected or invalid chatId');
        return;
    }
    
    socket.emit('leave_chat', chatId);
};

export const sendMessage = (messageData) => {
    if (!socket?.connected) {
        console.error('Cannot send message: Socket not connected');
        return false;
    }

    // Validate message data
    if (!messageData?.chatId || !messageData?.content || !messageData?.senderId || !messageData?.receiverId) {
        console.error('Invalid message data:', messageData);
        return false;
    }

    
    socket.emit('send_message', messageData);
    return true;
};

export const markChatAsRead = (chatId) => {
    const socket = getSocket();
    if (socket && socket.connected) {
        socket.emit('message_read', { chatId });
        return true;
    }
    console.warn('Socket not connected when trying to mark chat as read');
    return false;
};

// Clean up socket connection
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}; 