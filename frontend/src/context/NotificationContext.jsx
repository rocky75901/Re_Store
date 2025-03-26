import React, { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../socket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadCounts, setChatUnreadCounts] = useState({});
    const [tempNotifications, setTempNotifications] = useState({});

    // Update total unread count whenever chatUnreadCounts changes
    useEffect(() => {
        const totalUnread = Object.values(chatUnreadCounts).reduce(
            (total, count) => total + count, 0
        );
        setUnreadCount(totalUnread);
    }, [chatUnreadCounts]);

    // Listen for socket events
    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;
        
        // Listen for message_read events
        const handleMessageRead = ({ chatId }) => {
            if (!chatId) return;
            
            // Update unread counts
            setChatUnreadCounts(prev => {
                if (!prev[chatId]) return prev; // No change needed
                
                const newCounts = { ...prev };
                newCounts[chatId] = 0;
                return newCounts;
            });
            
            // Clear any temporary notifications
            setTempNotifications(prev => ({
                ...prev,
                [chatId]: false
            }));
        };
        
        socket.on('message_read', handleMessageRead);
        
        return () => {
            socket.off('message_read', handleMessageRead);
        };
    }, []);

    // Load initial unread counts
    useEffect(() => {
        const loadUnreadCounts = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) return;

                // You could fetch unread counts from your backend here
                // For now, we'll rely on the counts coming from the chat retrieval
            } catch (error) {
                console.error('Error loading notification counts:', error);
            }
        };

        loadUnreadCounts();
    }, []);

    // Function to handle new message notifications
    const handleNewMessage = (chatId, isCurrentChat = false) => {
        if (isCurrentChat) {
            // If user is currently viewing this chat, don't increment unread count
            return;
        }
        
        setChatUnreadCounts(prev => {
            const currentCount = prev[chatId] || 0;
            return {
                ...prev,
                [chatId]: currentCount + 1
            };
        });
    };

    // Function to set absolute unread count for a chat
    const setUnreadCountForChat = (chatId, count) => {
        if (!chatId) return;
        
        setChatUnreadCounts(prev => {
            if (prev[chatId] === count) return prev; // No change needed
            
            return {
                ...prev,
                [chatId]: count
            };
        });
    };

    // Function to mark a chat as read
    const markChatAsRead = (chatId) => {
        if (!chatId) return;
        
        setChatUnreadCounts(prev => {
            if (!prev[chatId]) return prev; // No change needed
            
            const newCounts = { ...prev };
            newCounts[chatId] = 0;
            
            // Calculate new total
            const totalUnread = Object.values(newCounts).reduce(
                (total, count) => total + count, 0
            );
            setUnreadCount(totalUnread);
            
            return newCounts;
        });
    };

    // Function to get unread count for a specific chat
    const getChatUnreadCount = (chatId) => {
        const count = chatUnreadCounts[chatId] || 0;
        const isTemp = tempNotifications[chatId];
        console.log('Getting unread count for chat:', chatId, count, 'temp:', isTemp);
        return isTemp ? 1 : count;
    };

    // Public API
    const value = {
        unreadCount,
        getChatUnreadCount,
        handleNewMessage,
        markChatAsRead,
        setUnreadCountForChat
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
}; 