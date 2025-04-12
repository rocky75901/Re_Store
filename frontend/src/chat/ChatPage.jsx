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
    const textareaRef = useRef(null);
    const MAX_MESSAGE_LENGTH = 1000;

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const adjustTextareaHeight = () => {
        const textarea = textareaRef.current;
        if (textarea) {
            textarea.style.height = 'auto';
            textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
        }
    };

    const handleInputChange = (e) => {
        const value = e.target.value;
        if (value.length <= MAX_MESSAGE_LENGTH) {
            setNewMessage(value);
            adjustTextareaHeight();
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (newMessage.trim()) {
            const truncatedMessage = newMessage.slice(0, MAX_MESSAGE_LENGTH);
            onSendMessage(truncatedMessage);
            setNewMessage('');
            // Reset height after sending
            if (textareaRef.current) {
                textareaRef.current.style.height = '45px';
            }
        }
    };

    // Reset height when chat changes
    useEffect(() => {
        if (textareaRef.current) {
            textareaRef.current.style.height = '45px';
        }
    }, [chat]);

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
                <div className="message-input-container">
                    <textarea
                        ref={textareaRef}
                        value={newMessage}
                        onChange={handleInputChange}
                        placeholder="Type a message..."
                        className="message-input"
                        maxLength={MAX_MESSAGE_LENGTH}
                        rows={1}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                                e.preventDefault();
                                handleSubmit(e);
                            }
                        }}
                    />
                    <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChatPage; 