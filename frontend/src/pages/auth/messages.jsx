import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createOrGetChat, getUserChats, getChatMessages } from './chatService';
import { initSocket, joinChat, leaveChat, sendMessage } from '../../socket';
import ChatList from './ChatList';
import ChatPage from './ChatPage';
import './messages.css';

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [chats, setChats] = useState([]);
    const [selectedChat, setSelectedChat] = useState(null);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [socket, setSocket] = useState(null);

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

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleMessageSent);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
        };
    }, [socket, user?._id]);

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

    // Load initial chats
    useEffect(() => {
        const loadChats = async () => {
            if (!user?._id) return;

            try {
                setLoading(true);
                const userChats = await getUserChats();
                setChats(userChats);

                // If there's a sellerId in location state, create/get that chat
                const sellerId = location.state?.sellerId;
                if (sellerId && sellerId !== user._id) {
                    const chat = await createOrGetChat(sellerId);
                    if (chat) {
                        setSelectedChat(chat);
                        const updatedChats = [chat, ...userChats.filter(c => c._id !== chat._id)];
                        setChats(updatedChats);
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

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
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

        // Optimistically add message to UI with a temporary ID
        const optimisticMessage = {
            ...messageData,
            _id: tempId,
            tempId: tempId, // Add this to help identify the message later
            createdAt: new Date().toISOString(),
            senderId: { _id: user._id, username: user.username }
        };
        setMessages(prev => [...prev, optimisticMessage]);

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