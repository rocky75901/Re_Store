import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { createOrGetChat, getUserChats, getChatMessages } from './chatService';
import { initSocket, disconnectSocket, joinChat, leaveChat, sendMessage } from '../../socket';
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

    // Handle initial chat creation from Contact Seller
    useEffect(() => {
        const initializeChat = async () => {
            if (!user) {
                navigate('/login');
                return;
            }

            try {
                setLoading(true);
                const sellerId = location.state?.sellerId;
                
                if (sellerId) {
                    console.log('Creating chat with seller:', sellerId);
                    const chat = await createOrGetChat(sellerId);
                    if (chat) {
                        setSelectedChat(chat);
                        const updatedChats = await getUserChats();
                        // Only set chats if there are valid chats with messages or participants
                        const validChats = updatedChats.filter(chat => 
                            chat.participants && 
                            chat.participants.length === 2 && 
                            chat.participants.every(p => p._id && p.username)
                        );
                        setChats(validChats);
                    }
                } else {
                    const userChats = await getUserChats();
                    // Only set chats if there are valid chats with messages or participants
                    const validChats = userChats.filter(chat => 
                        chat.participants && 
                        chat.participants.length === 2 && 
                        chat.participants.every(p => p._id && p.username)
                    );
                    setChats(validChats);
                }
            } catch (err) {
                console.error('Error initializing chat:', err);
                setError('Failed to load chats');
            } finally {
                setLoading(false);
            }
        };

        initializeChat();
    }, [user, navigate, location.state?.sellerId]);

    // Socket connection and event handling
    useEffect(() => {
        if (!user) return;

        const socket = initSocket(user._id);
        if (!socket) return;

        const handleReceiveMessage = (newMessage) => {
            // Only add message if it's from another user
            if (newMessage.senderId !== user._id) {
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
            // Only add message if it's from current user
            if (newMessage.senderId === user._id) {
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

        socket.on('receive_message', handleReceiveMessage);
        socket.on('message_sent', handleMessageSent);

        return () => {
            socket.off('receive_message', handleReceiveMessage);
            socket.off('message_sent', handleMessageSent);
            disconnectSocket();
        };
    }, [user]);

    // Join chat room when selected chat changes
    useEffect(() => {
        if (!selectedChat) return;

        const loadMessages = async () => {
            try {
                const chatMessages = await getChatMessages(selectedChat._id);
                setMessages(chatMessages);
            } catch (err) {
                console.error('Error loading messages:', err);
                setError('Failed to load messages');
            }
        };

        joinChat(selectedChat._id);
        loadMessages();

        return () => {
            leaveChat(selectedChat._id);
        };
    }, [selectedChat]);

    const handleChatSelect = (chat) => {
        setSelectedChat(chat);
    };

    const handleSendMessage = async (content) => {
        if (!selectedChat || !content.trim()) return;

        const messageData = {
            chatId: selectedChat._id,
            content: content.trim(),
            senderId: user._id,
            receiverId: selectedChat.participants.find(p => p._id !== user._id)?._id
        };

        const sent = sendMessage(messageData);
        if (!sent) {
            setError('Failed to send message: Not connected');
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