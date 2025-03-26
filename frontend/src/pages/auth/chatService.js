import axios from 'axios';
import { BACKEND_URL } from '../../constants';
import { toast } from 'react-hot-toast';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        toast.error('Authentication required');
        return null;
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };
};

// Create or get existing chat
export const createOrGetChat = async (otherUserId) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user._id) {
        toast.error('Authentication required');
        return null;
    }

    const headers = getAuthHeaders();
    if (!headers) return null;

    try {
        console.log('Creating chat with:', { userId: user._id, participantId: otherUserId });
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/chat/create`,
            { 
                userId: user._id,
                participantId: otherUserId 
            },
            headers
        );
        console.log('Chat creation response:', response.data);
        return response.data;
    } catch (error) {
        console.error('Error creating/getting chat:', error);
        const message = error.response?.data?.message || 'Failed to create chat';
        toast.error(message);
        return null;
    }
};

// Get user's chats
export const getUserChats = async () => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user._id) {
        toast.error('Authentication required');
        return [];
    }

    const headers = getAuthHeaders();
    if (!headers) return [];

    try {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/chat/user/${user._id}`,
            headers
        );
        
        // Sort chats by latest message
        const chats = response.data || [];
        return chats.sort((a, b) => {
            const timeA = a.lastMessage?.createdAt || a.createdAt;
            const timeB = b.lastMessage?.createdAt || b.createdAt;
            return new Date(timeB) - new Date(timeA);
        });
    } catch (error) {
        console.error('Error fetching chats:', error);
        const message = error.response?.data?.message || 'Failed to fetch chats';
        toast.error(message);
        return [];
    }
};

// Get chat messages
export const getChatMessages = async (chatId) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user._id) {
        toast.error('Authentication required');
        return [];
    }

    const headers = getAuthHeaders();
    if (!headers) return [];

    try {
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/chat/${chatId}/messages`,
            headers
        );
        return response.data || [];
    } catch (error) {
        console.error('Error fetching messages:', error);
        const message = error.response?.data?.message || 'Failed to fetch messages';
        toast.error(message);
        return [];
    }
};

// Send a message
export const sendMessage = async (chatId, receiverId, content) => {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!user || !user._id) {
        toast.error('Authentication required');
        return null;
    }

    const headers = getAuthHeaders();
    if (!headers) return null;

    try {
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/chat/message`,
            { 
                chatId,
                senderId: user._id,
                receiverId, 
                content 
            },
            headers
        );
        return response.data;
    } catch (error) {
        console.error('Error sending message:', error);
        const message = error.response?.data?.message || 'Failed to send message';
        toast.error(message);
        return null;
    }
};

export const markChatAsRead = async (chatId) => {
  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const token = sessionStorage.getItem('token');
    
    if (!token) {
      console.error('No token found');
      return null;
    }
    
    const response = await fetch(`${BACKEND_URL}/api/v1/chats/${chatId}/read`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error('Failed to mark chat as read');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error marking chat as read:', error);
    return null;
  }
}; 