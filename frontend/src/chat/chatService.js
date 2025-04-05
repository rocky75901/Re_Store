import axios from 'axios';
import { toast } from 'react-hot-toast';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        toast.error('Authentication required');
        return null;
    }
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
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

    console.log(`Attempting to create/get chat with user ${otherUserId}`);

    try {
        if (!otherUserId) {
            throw new Error('Invalid user ID');
        }

        // First try to get existing chat
        try {
            console.log(`Checking if chat already exists with ${otherUserId}`);
            const existingChatsResponse = await axios.get(
                `${BACKEND_URL}/api/v1/chat/user/${user._id}`,
                headers
            );

            const existingChats = existingChatsResponse.data || [];
            console.log(`Found ${existingChats.length} chats total`);
            
            // Find chat with the other user
            const existingChat = existingChats.find(chat => 
                chat.participants.some(p => {
                    const participantId = typeof p === 'string' ? p : p._id;
                    return participantId === otherUserId;
                })
            );

            if (existingChat) {
                console.log('Found existing chat:', existingChat._id);
                return existingChat;
            }
            
            console.log('No existing chat found with this user');
        } catch (error) {
            console.error('Error checking existing chats:', error);
            // Continue to create new chat even if checking existing chats fails
        }

        // If no existing chat found or error checking, create new one
        console.log('Creating new chat with:', { otherUserId });
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/chat/with-user/${otherUserId}`,
            {},
            headers
        );

        console.log('Chat creation response:', response.data);
        
        // Handle different response structures
        if (!response.data) {
            throw new Error('Empty response from server');
        }
        
        // Extract the chat data based on response format
        let chatData;
        if (response.data.data) {
            chatData = response.data.data;
        } else if (response.data._id) {
            chatData = response.data;
        } else {
            console.error('Unexpected response format:', response.data);
            throw new Error('Invalid response format from server');
        }
        
        console.log('Successfully created/retrieved chat:', chatData._id);
        return chatData;
    } catch (error) {
        console.error('Error creating/getting chat:', error);
        if (error.response?.status === 500) {
            // Try one more time with direct chat creation
            try {
                console.log('Attempting fallback chat creation method');
                const response = await axios.post(
                    `${BACKEND_URL}/api/v1/chat/create`,
                    {
                        userId: user._id,
                        participantId: otherUserId
                    },
                    headers
                );
                
                if (response.data) {
                    console.log('Fallback chat creation succeeded:', response.data);
                    return response.data;
                }
            } catch (retryError) {
                console.error('Error in retry attempt:', retryError);
            }
        }
        const message = error.response?.data?.message || error.message || 'Failed to create chat';
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
    
    const response = await fetch(`${BACKEND_URL}/api/v1/chat/${chatId}/read`, {
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