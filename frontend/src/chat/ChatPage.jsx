import React, { useState, useRef, useEffect } from 'react';
import './messages.css';

const formatMessageTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const ChatPage = ({ chat, messages, onSendMessage, currentUserId, error }) => {
    const [newMessage, setNewMessage] = useState('');
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            onSendMessage(newMessage);
            setNewMessage('');
        }
    };

    const otherUser = chat.participants.find(p => p._id !== currentUserId);

    const renderMessage = (message) => {
        const messageSenderId = message.senderId._id || message.senderId;
        const isSentByMe = messageSenderId === currentUserId;
        
        return (
            <div key={message._id} className={`message ${isSentByMe ? 'sent' : 'received'}`}>
                <div className="message-content">
                    <p>{message.content}</p>
                    <span className="message-time">
                        {formatMessageTime(message.createdAt)}
                    </span>
                </div>
            </div>
        );
    };

    return (
        <div className="chat-page">
            <div className="chat-header">
                <div className="chat-header-avatar">
                    {otherUser?.username?.charAt(0).toUpperCase()}
                </div>
                <div className="chat-header-name">{otherUser?.username}</div>
            </div>

            <div className="messages-list">
                {messages.map(renderMessage)}
                <div ref={messagesEndRef} />
            </div>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="message-input-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                />
                <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                    Send
                </button>
            </form>
        </div>
    );
};

export default ChatPage; 