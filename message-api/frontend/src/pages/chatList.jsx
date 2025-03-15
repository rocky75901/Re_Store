import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./ChatList.css";

const ChatList = ({ userId, activeChatId }) => {
  const [conversations, setConversations] = useState([]);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatEmail, setNewChatEmail] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchConversations();
  }, [userId]);

  const fetchConversations = async () => {
    try {
      const response = await fetch(`http://localhost:5000/api/chats/user/${userId}`);
      if (!response.ok) throw new Error("Failed to fetch chats");
      const data = await response.json();
      setConversations(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSelectChat = (chatId) => {
    navigate(`/chat/${chatId}`);
  };

  const handleStartNewChat = async (e) => {
    e.preventDefault();
    try {
      // First, find the user by email
      const userResponse = await fetch(`http://localhost:5000/api/auth/find-user?email=${newChatEmail}`);
      const userData = await userResponse.json();
      
      if (!userData.user) {
        alert('User not found!');
        return;
      }

      // Create a new chat
      const chatResponse = await fetch('http://localhost:5000/api/chats/find-or-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId1: userId,
          userId2: userData.user._id
        })
      });

      const chatData = await chatResponse.json();
      
      if (chatData.chatId) {
        setShowNewChat(false);
        setNewChatEmail('');
        fetchConversations();
        navigate(`/chat/${chatData.chatId}`);
      }
    } catch (error) {
      console.error('Error starting new chat:', error);
      alert('Failed to start new chat');
    }
  };

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <h2>Messages</h2>
        <button onClick={() => setShowNewChat(true)} className="new-chat-button">
          New Chat
        </button>
      </div>

      {showNewChat && (
        <div className="new-chat-form">
          <form onSubmit={handleStartNewChat}>
            <input
              type="email"
              placeholder="Enter user email"
              value={newChatEmail}
              onChange={(e) => setNewChatEmail(e.target.value)}
              required
            />
            <button type="submit">Start Chat</button>
            <button type="button" onClick={() => setShowNewChat(false)}>Cancel</button>
          </form>
        </div>
      )}

      <div className="conversation-list">
        {conversations.length > 0 ? (
          conversations.map((chat) => (
            <div
              key={chat._id}
              className={`conversation-item ${activeChatId === chat._id ? "active" : ""}`}
              onClick={() => handleSelectChat(chat._id)}
            >
              <div className="conversation-avatar">
                <img
                  src={chat.participants.find((p) => p._id !== userId)?.avatar || "/default-avatar.png"}
                  alt="avatar"
                />
              </div>
              <div className="conversation-info">
                <div className="conversation-name">
                  {chat.participants.find((p) => p._id !== userId)?.name || "Unknown User"}
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
  );
};

export default ChatList;
