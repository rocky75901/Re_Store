export const signup = async (userData) => {
  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    const response = await fetch(`${BACKEND_URL}/api/v1/users/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(userData)
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Server error: Invalid response format. Please try again.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Signup failed. Please check your input.');
    }

    if (!data.token || !data.user) {
      throw new Error('Invalid response from server: Missing token or user data');
    }
    
    // Store in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Generate and store a unique session ID
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', sessionId);

    return data;
  } catch (error) {
    console.error('Signup error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running.');
    }
    
    throw error;
  }
};

export const login = async (email, password) => {
  try {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    const response = await fetch(`${BACKEND_URL}/api/v1/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON:', error);
      throw new Error('Server error: Invalid response format. Please try again.');
    }

    if (!response.ok) {
      throw new Error(data.message || 'Login failed. Please check your credentials.');
    }

    if (!data.token || !data.user) {
      throw new Error('Invalid response from server: Missing token or user data');
    }
    
    // Store in localStorage
    localStorage.setItem('token', data.token);
    localStorage.setItem('user', JSON.stringify(data.user));
    
    // Generate and store a unique session ID
    const sessionId = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('sessionId', sessionId);

    return data;
  } catch (error) {
    console.error('Login error:', error);
    
    if (error.message.includes('Failed to fetch')) {
      throw new Error('Cannot connect to server. Please make sure the backend server is running.');
    }
    
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('sessionId');
  window.location.href = '/login';
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  const sessionId = localStorage.getItem('sessionId');
  return !!(token && user && sessionId);
};

export const getCurrentUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const verifySession = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found');
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${BACKEND_URL}/api/v1/users/verify`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Session invalid');
    }

    return true;
  } catch (error) {
    console.error('Session verification failed:', error);
    logout();
    return false;
  }
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

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${BACKEND_URL}/api/v1/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to get profile');
    }

    const data = await response.json();
    return data.data.user;
  } catch (error) {
    console.error('Error getting profile:', error);
    if (error.message.includes('unauthorized')) {
      logout();
    }
    throw error;
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

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const response = await fetch(`${BACKEND_URL}/api/v1/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(userData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update profile');
    }

    const data = await response.json();
    // Update the stored user data
    localStorage.setItem('user', JSON.stringify(data.data.user));
    return data.data.user;
  } catch (error) {
    console.error('Error updating profile:', error);
    if (error.message.includes('unauthorized')) {
      logout();
    }
    throw error;
  }
};