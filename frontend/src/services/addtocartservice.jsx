import axios from 'axios';
import { getUserProfile } from './authService';
import { toast } from 'react-toastify';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

// Helper function to get auth header
const getAuthHeader = () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in to manage Cart');
    }
    return {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    };
};

// Helper function to get current username
const getUsername = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
        throw new Error('Please log in to manage Cart');
    }

    try {
        // Try to get user data from sessionStorage
        const userStr = sessionStorage.getItem('user');
        if (userStr) {
            const userInfo = JSON.parse(userStr);
            if (userInfo?.username) {
                return userInfo.username;
            } else if (userInfo?.email) {
                return userInfo.email.split('@')[0];
            }
        }

        // If no user data in sessionStorage, fetch it from the API
        const userProfile = await getUserProfile();
        if (userProfile) {
            // Store the user data for future use
            sessionStorage.setItem('user', JSON.stringify(userProfile));
            if (userProfile.username) {
                return userProfile.username;
            } else if (userProfile.email) {
                return userProfile.email.split('@')[0];
            }
        }

        throw new Error('User information not found');
    } catch (error) {
        console.error('Error getting username:', error);
        throw new Error('Please log in to manage Cart');
    }
};

export const addToCart = async (productId, quantity = 1) => {
    try {
        const username = await getUsername();
        if (!username) {
            toast.error('Please login to add items to cart');
            return;
        }

        const response = await axios.post(
            `${BACKEND_URL}/api/v1/cart`,
            {
                username,
                productId,
                quantity
            },
            {
                headers: getAuthHeader()
            }
        );

        if (response.data.status === 'success') {
            toast.success('Item added to cart successfully!');
            return response;
        } else {
            toast.error(response.data.message || 'Failed to add item to cart');
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        if (error.response?.status === 401) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            toast.error('Please login to add items to cart');
        } else {
            toast.error(error.response?.data?.message || 'Failed to add item to cart');
        }
        throw error;
    }
};

export const removeFromCart = async (productId) => {
    try {
        const username = await getUsername();
        // If productId is an object, extract the _id
        const actualProductId = typeof productId === 'object' ? productId._id : productId;
        
        console.log('Removing item with:', { username, productId: actualProductId }); // Debug log
        
        const response = await axios.delete(
            `${BACKEND_URL}/api/v1/cart/remove`,
            {
                headers: {
                    ...getAuthHeader(),
                    'Content-Type': 'application/json'
                },
                data: {
                    username,
                    productId: actualProductId
                }
            }
        );
        
        console.log('Remove response:', response.data); // Debug log
        return response.data;
    } catch (error) {
        console.error('Error removing from Cart:', error);
        if (error.response?.status === 401 || error.message.includes('Please log in')) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            throw new Error('Please log in to remove from cart');
        }
        throw new Error(error.response?.data?.message || error.message || 'Failed to remove from cart');
    }
};

export const getCart = async () => {
    try {
        const username = await getUsername();
        const response = await axios.get(
            `${BACKEND_URL}/api/v1/cart?username=${encodeURIComponent(username)}`,
            { headers: getAuthHeader() }
        );
        return response.data;
    } catch (error) {
        console.error('Error fetching Cart:', error);
        if (error.response?.status === 401 || error.message.includes('Please log in')) {
            sessionStorage.removeItem('token');
            sessionStorage.removeItem('user');
            throw new Error('Please log in to view Cart');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch Cart');
    }
}; 