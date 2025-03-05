import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/auth/Login";
import Home from "./pages/auth/home";
import SignUp from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/verify";
import List from "./pages/auth/help";
import ProductCard from "./pages/auth/fav";
const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />      
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/help" element={<List />} />
      <Route path="/fav" element={<ProductCard />}/>
    </Routes>
  </Router>
);


export default App;