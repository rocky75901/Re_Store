import React from 'react';
import './messages.css';
import NotificationBadge from '../../components/NotificationBadge';

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const oneDay = 24 * 60 * 60 * 1000;

    // If message is from today, show time
    if (diff < oneDay && date.getDate() === now.getDate()) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    // If message is from this week, show day name
    else if (diff < 7 * oneDay) {
        return date.toLocaleDateString([], { weekday: 'short' });
    }
    // Otherwise show date
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
};

const ChatList = ({ chats, selectedChat, onSelectChat, loading, currentUserId, tempUnreadCounts }) => {
    console.log('ChatList rendering with chats:', chats.map(c => ({
        id: c._id,
        otherUser: c.participants.find(p => p._id !== currentUserId)?.username,
        unreadCount: c.unreadCount
    })));
    
    if (loading) {
        return <div className="chat-list-loading">Loading chats...</div>;
    }

    if (!chats || chats.length === 0) {
        return (
            <div className="chat-list">
                <div className="no-chats">
                    <i className="fas fa-comments"></i>
                    <p>No conversations yet</p>
                    <p className="no-chats-subtitle">Your chats will appear here</p>
                </div>
            </div>
        );
    }

    return (
        <div className="chat-list">
            {chats.map((chat) => {
                const otherUser = chat.participants.find(p => p._id !== currentUserId);
                const lastMessage = chat.lastMessage?.content || 'Start a conversation';
                const lastMessageTime = chat.lastMessage?.createdAt;
                const isSelected = selectedChat?._id === chat._id;
                
                // Make sure to handle cases where unreadCount might be undefined
                // Use Number() to ensure we actually have a number, not undefined or null
                const unreadCount = Number(chat.unreadCount) || tempUnreadCounts[chat._id] || 0;
                
                console.log(`ChatItem: ${otherUser?.username}, unread=${unreadCount}, raw unreadCount=${chat.unreadCount}`);

                return (
                    <div
                        key={chat._id}
                        className={`chat-item ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelectChat(chat)}
                    >
                        <div className="chat-item-avatar">
                            {otherUser?.username?.charAt(0).toUpperCase()}
                        </div>
                        <div className="chat-item-details">
                            <div className="chat-item-header">
                                <div className="chat-item-name">{otherUser?.username}</div>
                                <div className="chat-item-time">{formatTime(lastMessageTime)}</div>
                            </div>
                            <div className="chat-item-last-message">{lastMessage}</div>
                        </div>
                        {unreadCount > 0 && <NotificationBadge count={unreadCount} className="small" />}
                    </div>
                );
            })}
        </div>
    );
};

export default ChatList; 