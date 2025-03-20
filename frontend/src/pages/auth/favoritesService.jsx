import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/users';

export const addToFavorites = async (productId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please log in to add favorites');
        }

        const response = await axios.post(
            `${API_URL}/favorites/${productId}`,
            {},
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to add to favorites';
    }
};

export const removeFromFavorites = async (productId) => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please log in to remove favorites');
        }

        const response = await axios.delete(
            `${API_URL}/favorites/${productId}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to remove from favorites';
    }
};

export const getFavorites = async () => {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Please log in to view favorites');
        }

        const response = await axios.get(
            `${API_URL}/favorites`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );
        return response.data;
    } catch (error) {
        throw error.response?.data?.message || 'Failed to fetch favorites';
    }
}; 