import { useContext } from "react";
import { AuthContext } from "../context/authContext.jsx"; // ✅ Named import

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default useAuth;
