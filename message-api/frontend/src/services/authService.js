import axios from "axios";

const API_URL = "http://localhost:5000/api/auth"; // Adjust based on backend

// Login User
export const login = async (userId) => {
  const response = await axios.post(`${API_URL}/login`, { userId });
  return response.data;
};

// Register User (if needed)
export const register = async (userData) => {
  const response = await axios.post(`${API_URL}/register`, userData);
  return response.data;
};

// Fetch Current User
export const getUser = async () => {
  const response = await axios.get(`${API_URL}/me`, { withCredentials: true });
  return response.data;
};
