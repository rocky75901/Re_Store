import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { createOrGetChat, getUserChats, getChatMessages } from './chatService';
import { initSocket, joinChat, leaveChat, sendMessage, markChatAsRead } from '../../socket';
import ChatList from './ChatList';
import ChatPage from './ChatPage';
import './messages.css';

const Messages = () => {
    const { user } = useAuth();
    const { markChatAsRead } = useNotification();
    const navigate = useNavigate();
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);
    const [tempUnreadCounts, setTempUnreadCounts] = useState({});

    // Initialize socket connection
    useEffect(() => {
        if (!user?._id) return;

        const newSocket = initSocket(user._id);
        if (newSocket) {
            setSocket(newSocket);

            // Handle socket connection events
            newSocket.on('connect', () => {
                console.log('Socket connected successfully');
                setError(null);
            });

            newSocket.on('connect_error', (err) => {
                console.error('Socket connection error:', err);
                setError('Connection error. Messages may not be real-time.');
            });
        }

        return () => {
            if (newSocket) {
                newSocket.disconnect();
            }
        };
    }, [user?._id]);

    // Handle receiving messages
    useEffect(() => {
        if (!socket || !user?._id) return;

        const handleReceiveMessage = (newMessage) => {
            console.log('Received new message:', newMessage);
            // Only add received messages, not sent ones
            if (newMessage.senderId._id !== user._id) {
                setMessages(prev => [...prev, newMessage]);
                
                // Check if we're currently in this chat
                const isInCurrentChat = selectedChat?._id === newMessage.chatId;
                
                // Update chat list to show latest message
                setChats(prev => {
                    const chatIndex = prev.findIndex(chat => chat._id === newMessage.chatId);
                    if (chatIndex === -1) return prev;

                    const updatedChats = [...prev];
                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        lastMessage: newMessage,
                        // Make sure to use Number() to handle undefined values
                        // Only increment unread count if we're not in the chat
                        unreadCount: isInCurrentChat 
                            ? 0 
                            : (Number(updatedChats[chatIndex].unreadCount) || 0) + 1
                    };

                    console.log(`Chat ${newMessage.chatId} updated unreadCount: ${updatedChats[chatIndex].unreadCount}`);

                    // Move this chat to the top
                    const [chat] = updatedChats.splice(chatIndex, 1);
                    updatedChats.unshift(chat);

                    return updatedChats;
                });

                // If we're in the chat, show temporary notification
                if (isInCurrentChat) {
                    setTempUnreadCounts(prev => ({
                        ...prev,
                        [newMessage.chatId]: 1
                    }));

                    // Remove temporary notification after 1 second
                    setTimeout(() => {
                        setTempUnreadCounts(prev => ({
                            ...prev,
                            [newMessage.chatId]: 0
                        }));
                    }, 1000);
                } else {
                    // Emit new_message event for notification only if we're not in the chat
                    socket.emit('new_message', {
                        chatId: newMessage.chatId,
                        senderId: newMessage.senderId,
                        content: newMessage.content,
                        receiverId: user._id
                    });
                }
            }
        };

        const handleMessageSent = (newMessage) => {
            console.log('Message sent confirmation:', newMessage);
            // Only handle messages sent by current user
            if (newMessage.senderId._id === user._id) {
                // Replace the optimistic message with the confirmed one
                setMessages(prev => {
                    const messageIndex = prev.findIndex(msg => 
                        msg._id === newMessage._id || 
                        (msg.tempId && msg.content === newMessage.content)
                    );
                    if (messageIndex === -1) {
                        return [...prev, newMessage];
                    }
                    const updatedMessages = [...prev];
                    updatedMessages[messageIndex] = newMessage;
                    return updatedMessages;
                });

                // Update chat list to show latest message
                setChats(prev => {
                    const chatIndex = prev.findIndex(chat => chat._id === newMessage.chatId);
                    if (chatIndex === -1) return prev;

                    const updatedChats = [...prev];
                    updatedChats[chatIndex] = {
                        ...updatedChats[chatIndex],
                        lastMessage: newMessage
                    };

                    // Move this chat to the top
                    const [chat] = updatedChats.splice(chatIndex, 1);
                    updatedChats.unshift(chat);

                    return updatedChats;
                });
            }
        };

        // Listen for new messages
        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleMessageSent);
        socket.on('new_message', (message) => {
            console.log('New message notification received:', message);
        });

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
            socket.off('new_message');
        };
    }, [socket, user?._id, selectedChat]);

    // Join chat room when selected chat changes
    useEffect(() => {
        if (!socket || !selectedChat) return;

        const loadMessages = async () => {
            try {
                const chatMessages = await getChatMessages(selectedChat._id);
                setMessages(chatMessages);
                
                // Don't automatically mark chat as read when loading messages
                // Only mark as read when user explicitly selects the chat
                // Removing the automatic marking as read here
            } catch (err) {
                console.error('Error loading messages:', err);
                setError('Failed to load messages');
            }
        };

        // Leave previous chat room if any
        if (selectedChat._id) {
            leaveChat(selectedChat._id);
        }

        // Join new chat room
        joinChat(selectedChat._id);
        console.log('Joined chat room:', selectedChat._id);
        loadMessages();

        return () => {
            if (selectedChat._id) {
                leaveChat(selectedChat._id);
            }
        };
    }, [selectedChat, socket]);

    // Load initial chats
    useEffect(() => {
        const loadChats = async () => {
            if (!user?._id) return;

            try {
                setLoading(true);
                const userChats = await getUserChats();
                
                // Store chats without clearing unread counts
                if (userChats.length > 0) {
                    // Process chats and keep unread counts
                    const processedChats = userChats.map(chat => {
                        // Make sure unreadCount is preserved from API response
                        return {
                            ...chat,
                            // If chat has an unreadCount, keep it
                            unreadCount: chat.unreadCount || 0
                        };
                    });
                    
                    setChats(processedChats);
                    
                    // Debug: log all chats with their unread counts
                    console.log('Loaded chats with unread counts:', 
                        processedChats.map(c => ({ 
                            id: c._id, 
                            otherUser: c.participants.find(p => p._id !== user._id)?.username,
                            unreadCount: c.unreadCount 
                        }))
                    );
                } else {
                    setChats([]);
                }

                // Only process seller-linked chat if needed
                const sellerId = location.state?.sellerId;
                if (sellerId && sellerId !== user._id) {
                    const chat = await createOrGetChat(sellerId);
                    if (chat) {
                        // Don't auto-select the chat, just add it to the list if not already present
                        // This prevents automatic marking as read
                        if (!userChats.some(c => c._id === chat._id)) {
                            const updatedChats = [chat, ...userChats];
                            setChats(updatedChats);
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading chats:', err);
                setError('Failed to load chats');
            } finally {
                setLoading(false);
            }
        };

        loadChats();
    }, [user?._id, location.state?.sellerId]);

    const handleChatSelect = async (chat) => {
        // Update selected chat
        setSelectedChat(chat);
        
        // Convert unreadCount to a number in case it's undefined or null
        const unreadCountNum = Number(chat.unreadCount) || 0;
        
        // Now, explicitly mark the chat as read when user clicks on it
        // But only if there are unread messages
        if (unreadCountNum > 0) {
            console.log(`User clicked on chat ${chat._id} with ${unreadCountNum} unread messages`);
            
            // Mark as read in the notification context
            markChatAsRead(chat._id);
            
            // Update local chat list to show read status
            setChats(prev => prev.map(c => 
                c._id === chat._id ? { ...c, unreadCount: 0 } : c
            ));
            
            // Reset any temporary notification for this chat
            setTempUnreadCounts(prev => ({
                ...prev,
                [chat._id]: 0
            }));
        } else {
            console.log(`User clicked on chat ${chat._id} with no unread messages`);
        }
    };

    const handleSendMessage = async (content) => {
        if (!selectedChat || !content.trim() || !socket) return;

        const tempId = Date.now().toString();
        const messageData = {
            chatId: selectedChat._id,
            content: content.trim(),
            senderId: user._id,
            receiverId: selectedChat.participants.find(p => p._id !== user._id)?._id
        };

        console.log('Sending message:', messageData);
        console.log('Socket connected:', socket.connected);

        // Optimistically add message to UI with a temporary ID
        const optimisticMessage = {
            ...messageData,
            _id: tempId,
            tempId: tempId,
            createdAt: new Date().toISOString(),
            senderId: { _id: user._id, username: user.username }
        };
        setMessages(prev => [...prev, optimisticMessage]);

        // Emit new_message event for the receiver
        console.log('Emitting new_message event');
        socket.emit('new_message', {
            chatId: messageData.chatId,
            senderId: messageData.senderId,
            content: messageData.content,
            receiverId: messageData.receiverId
        });

        const sent = sendMessage(messageData);
        if (!sent) {
            setError('Failed to send message: Not connected');
            // Remove optimistic message if send failed
            setMessages(prev => prev.filter(msg => msg.tempId !== tempId));
        }
    };

    if (!user) {
        return <div className="messages-container">Please log in to view messages.</div>;
    }

    return (
        <div className="messages-container">
            <div className="chat-list-container">
                <ChatList
                    chats={chats}
                    selectedChat={selectedChat}
                    onSelectChat={handleChatSelect}
                    loading={loading}
                    currentUserId={user._id}
                    tempUnreadCounts={tempUnreadCounts}
                />
            </div>
            <div className="chat-page-container">
                {selectedChat ? (
                    <ChatPage
                        chat={selectedChat}
                        messages={messages}
                        onSendMessage={handleSendMessage}
                        currentUserId={user._id}
                        error={error}
                    />
                ) : (
                    <div className="no-chat-selected">
                        Select a chat to start messaging
                    </div>
                )}
            </div>
        </div>
    );
};

export default Messages; 