import { createContext, useState, useEffect } from "react";
import { getUser, login, register } from "./authUtils.js"; 

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    getUser()
      .then(({ data }) => setUser(data))
      .catch(() => {});
  }, []);

  const loginUser = async (email, password) => {
    const { data } = await login(email, password);
    setUser(data.user);
  };

  const registerUser = async (userData) => {
    const { data } = await register(userData);
    setUser(data.user);
  };

  return (
    <AuthContext.Provider value={{ user, setUser, loginUser, registerUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
