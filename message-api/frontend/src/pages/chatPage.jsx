import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import io from "socket.io-client";
import useAuth from "../hooks/useAuth";
import "./chatPage.css";

const ChatPage = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
  const { chatId } = useParams();
  const navigate = useNavigate();

  // Socket connection management
  useEffect(() => {
    if (!user?._id) {
      navigate('/login');
      return;
    }

    const token = localStorage.getItem('token');
    const newSocket = io("http://localhost:5000", {
      withCredentials: true,
      auth: {
        token: `Bearer ${token}`
      },
      extraHeaders: {
        "Access-Control-Allow-Origin": "http://localhost:5173, http://localhost:5174"
      }
    });

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
      newSocket.emit('join_user', user._id);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    setSocket(newSocket);

    return () => {
      if (newSocket) {
        newSocket.disconnect();
      }
    };
  }, [user?._id, navigate]);

  // Fetch conversations
  const fetchConversations = async () => {
    if (!user?._id) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chats/user/${user._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Failed to fetch conversations');
      const data = await response.json();
      setConversations(data);

      // If we have a chatId, set the active conversation
      if (chatId) {
        const conversation = data.find(c => c._id === chatId);
        if (conversation) {
          setActiveConversation(conversation);
        }
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  // Initial fetch of conversations
  useEffect(() => {
    fetchConversations();
  }, [user?._id, chatId]);

  // Fetch messages for active conversation
  const fetchMessages = async (conversationId) => {
    if (!conversationId) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/chats/${conversationId}/messages`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) throw new Error('Failed to fetch messages');
      const data = await response.json();
      setMessages(data);
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  // When active conversation changes, fetch its messages
  useEffect(() => {
    if (activeConversation?._id) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation?._id]);

  // Handle socket messages
  useEffect(() => {
    if (!socket || !activeConversation?._id) return;

    socket.emit('join_chat', activeConversation._id);

    const handleNewMessage = async (message) => {
      console.log('Received message:', message);
      
      if (message.chatId === activeConversation._id) {
        setMessages(prev => [...prev, message]);
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        fetchConversations();
      }
    };

    socket.on("receive_message", handleNewMessage);

    return () => {
      socket.emit("leave_chat", activeConversation._id);
      socket.off("receive_message", handleNewMessage);
    };
  }, [socket, activeConversation]);

  const handleSelectConversation = (conversation) => {
    setActiveConversation(conversation);
    navigate(`/chat/${conversation._id}`);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();

    if (!newMessage.trim() || !activeConversation || !socket || !user?._id) return;

    const receiverId = activeConversation.participants.find(p => p._id !== user._id)?._id;
    if (!receiverId) return;

    const messageData = {
      chatId: activeConversation._id,
      senderId: user._id,
      receiverId,
      content: newMessage.trim()
    };

    socket.emit("send_message", messageData);
    setNewMessage("");
  };

  // Render messages with proper alignment and status
  const renderMessages = () => {
    return messages.map((msg, index) => {
      const isSentByMe = msg.senderId._id === user._id || msg.senderId === user._id;
      return (
        <div 
          key={msg._id || index} 
          className={`message ${isSentByMe ? "sent" : "received"}`}
        >
          <div className="message-content">{msg.content}</div>
          <div className="message-info">
            <span className="message-timestamp">
              {formatTime(msg.createdAt)}
            </span>
            {isSentByMe && msg.status && (
              <span className="message-status">{msg.status}</span>
            )}
          </div>
        </div>
      );
    });
  };

  // Function to scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    // Scroll to bottom whenever messages change
    scrollToBottom();
  }, [messages]);

  // Add this function at the top of your component
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <h2>Messages</h2>
        <button 
          className="new-chat-button"
          onClick={() => navigate('/new-chat')}
        >
          New Chat
        </button>
        <div className="conversation-list">
          {conversations.length > 0 ? (
            conversations.map((chat) => (
              <div
                key={chat._id}
                className={`conversation-item ${activeConversation?._id === chat._id ? "active" : ""}`}
                onClick={() => handleSelectConversation(chat)}
              >
                <div className="conversation-info">
                  <div className="conversation-name">
                    {chat.participants.find((p) => p._id !== user?._id)?.name || "Unknown User"}
                  </div>
                  <div className="conversation-last-message">
                    {chat.lastMessage?.content || "No messages yet"}
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-conversations">No conversations</div>
          )}
        </div>
      </div>

      <div className="chat-main">
        {activeConversation ? (
          <>
            <div className="chat-header">
              <div className="chat-header-info">
                <div className="chat-header-name">
                  {activeConversation.participants.find((p) => p._id !== user?._id)?.name || "Unknown User"}
                </div>
              </div>
            </div>
            <div className="chat-messages">
              {renderMessages()}
              <div ref={messagesEndRef} />
            </div>
            <form className="chat-input" onSubmit={handleSendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
              />
              <button 
                type="submit" 
                className="send-button" 
              >
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="no-conversation-selected">
            <p>Select a conversation</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatPage;