import { createContext, useState, useEffect } from "react";
import { getUser } from "../services/authService.js";

export const AuthContext = createContext(); // ✅ Named export

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('userId', user._id); // Store userId separately for easy access
    } else {
      localStorage.removeItem('user');
      localStorage.removeItem('userId');
    }
  }, [user]);

  const loginUser = async (email, password) => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Login failed');
      }

      const data = await response.json();
      setUser(data.user); // Store only the user object
      localStorage.setItem('token', data.token);
      return data;
    } catch (error) {
      throw error;
    }
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    localStorage.removeItem('token');
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, logoutUser }}>
      {children}
    </AuthContext.Provider>
  );
};
