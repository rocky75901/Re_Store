import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/authContext";
import useAuth from "./hooks/useAuth";
import Login from "./pages/login";
import Register from "./pages/register";
import ChatPage from "./pages/chatPage";
import NewChat from "./pages/newChat";

const PrivateRoute = ({ children }) => {
  const { user } = useAuth();
  const token = localStorage.getItem('token');
  
  if (!user || !token) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected Routes */}
          <Route
            path="/chat"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/chat/:chatId"
            element={
              <PrivateRoute>
                <ChatPage />
              </PrivateRoute>
            }
          />
          <Route
            path="/new-chat"
            element={
              <PrivateRoute>
                <NewChat />
              </PrivateRoute>
            }
          />

          {/* Default Route */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
