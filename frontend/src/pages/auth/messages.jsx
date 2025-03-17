import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from './layout';
import './messages.css';
import io from 'socket.io-client';

const Messages = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [chats, setChats] = useState([]);
  const [selectedChat, setSelectedChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const user = JSON.parse(localStorage.getItem('user'));
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      navigate('/login');
    }
  }, [user, navigate]);

  // Create new chat if coming from product page
  useEffect(() => {
    const findOrCreateChat = async (userId) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        // Check if chat exists in current chats
        const existingChat = chats.find(chat => 
          chat.participants.some(p => p._id === userId)
        );

        if (existingChat) {
          setSelectedChat(existingChat);
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${BACKEND_URL}/api/v1/chats/create`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            userId: user._id,
            participantId: userId
          })
        });
        
        if (!response.ok) {
          throw new Error('Failed to create chat');
        }
        
        const newChat = await response.json();
        setChats(prev => [...prev, newChat]);
        setSelectedChat(newChat);
      } catch (error) {
        console.error('Error with chat:', error);
      }
    };

    if (location.state?.userId && user) {
      findOrCreateChat(location.state.userId);
    }
  }, [location.state?.userId, user, chats]);

  // Fetch user's chats
  const fetchChats = useCallback(async () => {
    if (!user?._id) return;

    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch chats');
      }

      const data = await response.json();
      setChats(data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    }
  }, [user]);

  // Socket.io connection
  useEffect(() => {
    if (!user) return;

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    // Only create socket if it doesn't exist
    if (!socketRef.current) {
      socketRef.current = io(BACKEND_URL, {
        withCredentials: true,
        path: '/socket.io',
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });

      socketRef.current.on('connect', () => {
        console.log('Connected to socket server');
      });

      socketRef.current.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
      });

      socketRef.current.on('receive_message', (message) => {
        if (selectedChat && message.chatId === selectedChat._id) {
          setMessages(prev => [...prev, message]);
        }
        // Update chat list without full refetch
        setChats(prev => prev.map(chat => 
          chat._id === message.chatId 
            ? { ...chat, lastMessage: message }
            : chat
        ));
      });
    }

    return () => {
      // Only disconnect on component unmount
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
    };
  }, [user, selectedChat]);

  // Fetch messages for selected chat
  const fetchMessages = useCallback(async (chatId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    }
  }, []);

  // Initial chat fetch
  useEffect(() => {
    if (user) {
      fetchChats();
    }
  }, [user, fetchChats]);

  // Fetch messages when chat is selected
  useEffect(() => {
    if (selectedChat && socketRef.current) {
      fetchMessages(selectedChat._id);
      socketRef.current.emit('join_chat', selectedChat._id);
    }
  }, [selectedChat, fetchMessages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedChat || !socketRef.current || !user) return;

    const receiverId = selectedChat.participants.find(p => p._id !== user._id)?._id;
    if (!receiverId) return;

    setSendingMessage(true);
    const messageData = {
      chatId: selectedChat._id,
      content: newMessage.trim(),
      senderId: user._id,
      receiverId
    };

    try {
      socketRef.current.emit('send_message', messageData);
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
    }
  };

  if (!user) {
    return (
      <Layout showSearchBar={false}>
        <div className="messages-container">
          <div className="no-chat-selected">
            Please log in to view messages
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearchBar={false}>
      <div className="messages-container">
        <div className="chats-list">
          <h2>Your Chats</h2>
          {chats.length > 0 ? (
            chats.map(chat => (
              <div 
                key={chat._id}
                className={`chat-item ${selectedChat?._id === chat._id ? 'active' : ''}`}
                onClick={() => setSelectedChat(chat)}
              >
                <div className="chat-info">
                  <span className="chat-name">
                    {chat.participants.find(p => p._id !== user._id)?.name || 'Unknown User'}
                  </span>
                  <span className="last-message">
                    {chat.lastMessage?.content || 'No messages yet'}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="no-chats">No chats yet</div>
          )}
        </div>
        
        <div className="chat-messages">
          {selectedChat ? (
            <>
              <div className="messages-header">
                <h3>{selectedChat.participants.find(p => p._id !== user._id)?.name || 'Unknown User'}</h3>
              </div>
              <div className="messages-list">
                {messages.map(message => (
                  <div 
                    key={message._id}
                    className={`message ${message.senderId === user._id ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">{message.content}</div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <form onSubmit={handleSendMessage} className="message-input-form">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  disabled={sendingMessage}
                />
                <button type="submit" disabled={sendingMessage}>
                  Send
                </button>
              </form>
            </>
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