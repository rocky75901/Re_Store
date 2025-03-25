import { createContext, useContext, useState, useEffect } from 'react';
import { getSocket } from '../socket';

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [chatUnreadCounts, setChatUnreadCounts] = useState({});
    const [tempNotifications, setTempNotifications] = useState({});

    // Initialize unread counts
    useEffect(() => {
        // This will be called when the context is first mounted
        // We'll leave the unread counts as they are until they're explicitly marked as read
        console.log('NotificationProvider mounted');
        
        // Don't clear existing unread counts on component remount
        // This ensures notifications persist through page navigation
    }, []);

    useEffect(() => {
        const socket = getSocket();
        if (!socket) return;

        console.log('Setting up notification listeners');

        // Listen for new messages
        const handleNewMessage = (message) => {
            console.log('Notification received:', message);
            
            // Update chat-specific unread count
            setChatUnreadCounts(prev => {
                const newCounts = {
                    ...prev,
                    [message.chatId]: (prev[message.chatId] || 0) + 1
                };
                console.log('New chat unread counts:', newCounts);
                return newCounts;
            });

            // Add temporary notification
            setTempNotifications(prev => ({
                ...prev,
                [message.chatId]: true
            }));

            // Remove temporary notification after 1 second
            setTimeout(() => {
                setTempNotifications(prev => ({
                    ...prev,
                    [message.chatId]: false
                }));
            }, 1000);

            // Update total unread count
            setUnreadCount(prev => {
                const newCount = prev + 1;
                console.log('New unread count:', newCount);
                return newCount;
            });
        };

        // Listen for message read status
        const handleMessageRead = ({ chatId }) => {
            console.log('Message read event received for chat:', chatId);
            
            // Update chat-specific unread count
            setChatUnreadCounts(prev => {
                // If this chatId already has a zero count, don't update
                if (prev[chatId] === 0) {
                    console.log(`Chat ${chatId} already has zero unread count in NotificationContext`);
                    return prev;
                }
                
                console.log(`Resetting unread count for chat ${chatId} in NotificationContext`);
                const newCounts = { ...prev, [chatId]: 0 };
                
                // Update total unread count
                const totalUnread = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
                console.log('Updated total unread count:', totalUnread);
                setUnreadCount(totalUnread);
                return newCounts;
            });

            // Clear temporary notification
            setTempNotifications(prev => {
                if (prev[chatId]) {
                    console.log(`Clearing temporary notification for chat ${chatId}`);
                    return { ...prev, [chatId]: false };
                }
                return prev;
            });

            // Do NOT re-emit message_read event to server here
            // Only emit when explicitly called through markChatAsRead
        };

        socket.on('new_message', handleNewMessage);
        socket.on('message_read', handleMessageRead);

        // Cleanup
        return () => {
            console.log('Cleaning up notification listeners');
            socket.off('new_message', handleNewMessage);
            socket.off('message_read', handleMessageRead);
        };
    }, []);

    const markChatAsRead = (chatId) => {
        const socket = getSocket();
        if (socket) {
            console.log('Marking chat as read:', chatId);
            
            // Emit message_read event
            socket.emit('message_read', { chatId });
            
            // Update local state
            setChatUnreadCounts(prev => {
                const newCounts = { ...prev, [chatId]: 0 };
                const totalUnread = Object.values(newCounts).reduce((sum, count) => sum + count, 0);
                console.log('Optimistic update - new total unread count:', totalUnread);
                setUnreadCount(totalUnread);
                return newCounts;
            });

            // Clear temporary notification
            setTempNotifications(prev => ({
                ...prev,
                [chatId]: false
            }));
        }
    };

    const getChatUnreadCount = (chatId) => {
        const count = chatUnreadCounts[chatId] || 0;
        const isTemp = tempNotifications[chatId];
        console.log('Getting unread count for chat:', chatId, count, 'temp:', isTemp);
        return isTemp ? 1 : count;
    };

    return (
        <NotificationContext.Provider value={{
            unreadCount,
            getChatUnreadCount,
            markChatAsRead
        }}>
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