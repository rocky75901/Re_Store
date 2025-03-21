import axios from 'axios';

const API_URL = 'http://localhost:3000/api/v1/users';

export const login = async (email, password) => {
  try {
    console.log('Attempting login with:', { email, password }); // Debug log
    const response = await axios.post(`${API_URL}/login`, {
      email,
      password
    });
    console.log('Login response:', response.data); // Debug log

    // Store token and user data
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    if (response.data.user) {
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response.data;
  } catch (error) {
    console.error('Login error:', error.response?.data || error.message); // Debug log
    throw error.response?.data?.message || 'Login failed';
  }
};

export const logout = () => {
  // Remove token from localStorage
  localStorage.removeItem('token');
  // Clear any other user-related data if needed
  localStorage.removeItem('userRole');
  // Redirect to login page
  window.location.href = '/login';
};

export const getUserProfile = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the current user's ID from the token
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenData.id;

    const response = await axios.get(`${API_URL}/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data.user;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to get profile');
    }
    throw new Error('Network error occurred');
  }
};

export const updateProfile = async (userData) => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No authentication token found');
    }

    // Get the current user's ID from the token
    const tokenData = JSON.parse(atob(token.split('.')[1]));
    const userId = tokenData.id;

    const response = await axios.patch(`${API_URL}/${userId}`, userData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });
    return response.data.data.user;
  } catch (error) {
    if (error.response) {
      throw new Error(error.response.data.message || 'Failed to update profile');
    }
    throw new Error('Network error occurred');
  }
};