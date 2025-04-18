import { io } from 'socket.io-client';

let socket = null;

export const initSocket = (userId) => {
    if (!userId) {
        
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
        
    });

    socket.on('error', (error) => {
       
    });

    return socket;
};

export const getSocket = () => socket;

export const joinChat = (chatId) => {
    if (!socket?.connected || !chatId) {
        
        return;
    }
    
    socket.emit('join_chat', chatId);
};

export const leaveChat = (chatId) => {
    if (!socket?.connected || !chatId) {
        
        return;
    }
    
    socket.emit('leave_chat', chatId);
};

export const sendMessage = (messageData) => {
    if (!socket?.connected) {
        
        return false;
    }

    // Validate message data
    if (!messageData?.chatId || !messageData?.content || !messageData?.senderId || !messageData?.receiverId) {
        
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
    return false;
};

// Clean up socket connection
export const disconnectSocket = () => {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}; 