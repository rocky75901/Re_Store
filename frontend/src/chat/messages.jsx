import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { createOrGetChat, getUserChats, getChatMessages, markChatAsRead as apiMarkChatAsRead } from './chatService';
import { initSocket, joinChat, leaveChat, sendMessage, markChatAsRead } from './socket';
import ChatList from './ChatList';
import ChatPage from './ChatPage';
import Layout from '../components/layout';
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

    // Listen for message_read events
    useEffect(() => {
        if (!socket || !user) return;
        
        const handleMessageRead = ({ chatId }) => {
            console.log('Messages marked as read in chat:', chatId);
            
            // Update local chat list to show read status
            setChats(prev => prev.map(c =>
                c._id === chatId ? { ...c, unreadCount: 0 } : c
            ));
            
            // Reset any temporary notification for this chat
            setTempUnreadCounts(prev => ({
                ...prev,
                [chatId]: 0
            }));
        };
        
        socket.on('message_read', handleMessageRead);
        
        return () => {
            socket.off('message_read', handleMessageRead);
        };
    }, [socket, user]);

    // Handle received messages
    useEffect(() => {
        if (!socket || !user) return;

        const handleReceiveMessage = (newMessage) => {
            console.log('Message received:', newMessage);
            
            // Check if this message is for a chat we have
            const chatId = newMessage.chatId;
            const chatIndex = chats.findIndex(c => c._id === chatId);
            
            if (chatIndex === -1) {
                console.log(`Chat ${chatId} not found, refetching chats`);
                // If we don't have this chat, refetch all chats
                getUserChats(user._id).then(refreshedChats => {
                    if (refreshedChats) {
                        setChats(refreshedChats);
                    }
                });
                return;
            }

            // Update the chat's last message
            const isInCurrentChat = selectedChat && selectedChat._id === chatId;
            const isUnread = !newMessage.readBy.includes(user._id) && newMessage.receiverId._id === user._id;
            
            const updatedChats = [...chats];
            updatedChats[chatIndex] = {
                ...updatedChats[chatIndex],
                lastMessage: newMessage,
                // If we're in the current chat, unread count doesn't change
                // If the message is from us, unread count doesn't change
                // Otherwise, increment the unread count
                unreadCount: isInCurrentChat ? 
                    updatedChats[chatIndex].unreadCount || 0 :
                    isUnread ? 
                        ((Number(updatedChats[chatIndex].unreadCount) || 0) + 1) : 
                        updatedChats[chatIndex].unreadCount || 0
            };
            
            console.log(`Chat ${newMessage.chatId} updated unreadCount: ${updatedChats[chatIndex].unreadCount}`);
            
            // Move this chat to the top of the list
            const chatToMove = updatedChats.splice(chatIndex, 1)[0];
            updatedChats.unshift(chatToMove);
            setChats(updatedChats);
            
            // If we're currently viewing this chat, add the message to the UI
            if (isInCurrentChat) {
                setMessages(prev => [...prev, newMessage]);
                
                // Automatically mark message as read if we're viewing the chat and we're the receiver
                if (newMessage.receiverId._id === user._id) {
                    markChatAsRead(chatId);
                }
            } else if (isUnread) {
                // Add to temporary unread counts to display notifications only for messages from other users that we haven't read
                setTempUnreadCounts(prev => ({
                    ...prev,
                    [chatId]: (prev[chatId] || 0) + 1
                }));
            }
        };

        socket.on('receive_message', handleReceiveMessage);
        
        return () => {
            socket.off('receive_message', handleReceiveMessage);
        };
    }, [socket, chats, selectedChat, user]);

    // Handle receiving messages
    useEffect(() => {
        if (!socket || !user?._id) return;

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
        socket.on('message_sent', handleMessageSent);
        socket.on('new_message', (message) => {
            console.log('New message notification received:', message);
        });

        return () => {
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

    // Load initial chats and handle chat creation from product page
    useEffect(() => {
        const loadInitialData = async () => {
            try {
                setLoading(true);
                const userChats = await getUserChats();
                setChats(userChats);

                // If we have a sellerId from navigation, find or create chat with that seller
                if (location.state?.sellerId) {
                    console.log('Looking for chat with seller:', location.state.sellerId);
                    
                    // First check if we already have a chat with this seller
                    const existingChat = userChats.find(chat => 
                        chat.participants.some(p => 
                            p._id === location.state.sellerId || 
                            (typeof p === 'string' && p === location.state.sellerId)
                        )
                    );

                    let chatToOpen = existingChat;

                    if (!existingChat) {
                        // If no existing chat, create a new one
                        console.log('No existing chat found, creating new chat');
                        chatToOpen = await createOrGetChat(location.state.sellerId);
                        if (chatToOpen) {
                            // Insert the new chat at the top of the list
                            setChats(prevChats => [chatToOpen, ...prevChats]);
                        }
                    }

                    if (chatToOpen) {
                        console.log('Opening chat:', chatToOpen._id);
                        setSelectedChat(chatToOpen);
                        const chatMessages = await getChatMessages(chatToOpen._id);
                        setMessages(chatMessages);
                        if (socket) {
                            joinChat(chatToOpen._id);
                        }
                        
                        // Mark chat as read if opened directly
                        if (chatToOpen.unreadCount && chatToOpen.unreadCount > 0) {
                            markChatAsRead(chatToOpen._id);
                            apiMarkChatAsRead(chatToOpen._id);
                        }
                    }
                } else if (location.search) {
                    // Try to handle ?chatId= in the URL
                    const params = new URLSearchParams(location.search);
                    const chatId = params.get('chatId');
                    if (chatId) {
                        console.log('Chat ID found in URL:', chatId);
                        const chatToOpen = userChats.find(c => c._id === chatId);
                        if (chatToOpen) {
                            console.log('Opening chat from URL param:', chatToOpen._id);
                            setSelectedChat(chatToOpen);
                            const chatMessages = await getChatMessages(chatToOpen._id);
                            setMessages(chatMessages);
                            if (socket) {
                                joinChat(chatToOpen._id);
                            }
                            
                            // Mark chat as read if opened from URL
                            if (chatToOpen.unreadCount && chatToOpen.unreadCount > 0) {
                                markChatAsRead(chatToOpen._id);
                                apiMarkChatAsRead(chatToOpen._id);
                            }
                        }
                    }
                }
            } catch (err) {
                console.error('Error loading initial data:', err);
                setError('Failed to load chats');
            } finally {
                setLoading(false);
            }
        };

        if (user?._id) {
            loadInitialData();
        }
    }, [user?._id, location.state?.sellerId, location.search]);

    const handleChatSelect = async (chat) => {
        // Update selected chat
        setSelectedChat(chat);

        // Convert unreadCount to a number in case it's undefined or null
        const unreadCountNum = Number(chat.unreadCount) || 0;

        // Now, explicitly mark the chat as read when user clicks on it
        // But only if there are unread messages and the user is a receiver
        if (unreadCountNum > 0) {
            console.log(`User clicked on chat ${chat._id} with ${unreadCountNum} unread messages`);

            // Mark as read in the notification context
            markChatAsRead(chat._id);
            
            // Also call the API to mark as read on the server
            const result = await apiMarkChatAsRead(chat._id);
            console.log('Mark as read API result:', result);

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
        return (
            <Layout>
                <div className="messages-container">Please log in to view messages.</div>
            </Layout>
        );
    }

    return (
        <Layout>
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
        </Layout>
    );
};

export default Messages; 