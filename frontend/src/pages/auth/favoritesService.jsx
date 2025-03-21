import axios from 'axios';
import { getUserProfile } from './authService';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Helper function to get auth header
const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Helper function to get current username
const getUsername = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in to manage favorites');
    }

    try {
        // Try to get user data from localStorage
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const userInfo = JSON.parse(userStr);
            // First try to get username, if not available use email
            if (userInfo?.username) {
                return userInfo.username;
            } else if (userInfo?.email) {
                return userInfo.email.split('@')[0];
            }
        }

        // If no user data in localStorage, fetch it from the API
        const userProfile = await getUserProfile();
        if (userProfile) {
            // Store the user data for future use
            localStorage.setItem('user', JSON.stringify(userProfile));
            // First try to get username, if not available use email
            if (userProfile.username) {
                return userProfile.username;
            } else if (userProfile.email) {
                return userProfile.email.split('@')[0];
            }
        }

        throw new Error('User information not found');
    } catch (error) {
        console.error('Error getting username:', error);
        throw new Error('Please log in to manage favorites');
    }
};

export const addToFavorites = async (productId) => {
    try {
        const username = await getUsername();
        const response = await axios.post(
            `${BACKEND_URL}/api/v1/wishlist`,
            { username, productId },
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error adding to favorites:', error);
        throw new Error(error.response?.data?.message || 'Failed to add to favorites');
    }
};

export const removeFromFavorites = async (productId) => {
    try {
        const username = await getUsername();
        const response = await axios.delete(
            `${BACKEND_URL}/api/v1/wishlist/remove`,
            { 
                headers: getAuthHeader(),
                data: { username, productId }
            }
        );
        return response.data;
    } catch (error) {
        console.error('Error removing from favorites:', error);
        throw new Error(error.response?.data?.message || 'Failed to remove from favorites');
    }
};

export const getFavorites = async () => {
    try {
        const username = await getUsername();
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/wishlist?username=${encodeURIComponent(username)}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching favorites:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch favorites');
    }
}; 