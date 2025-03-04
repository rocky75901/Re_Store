import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/verify";
<<<<<<< HEAD
import ResetPassword from "./pages/auth/resetpassword";
=======
import Layout from "./pages/auth/layout";
>>>>>>> 6977b395df1998ba720fc3c4b93d09102f128c02

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />     
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<Verify />} />
<<<<<<< HEAD
      <Route path="/resetpassword" element={<ResetPassword />} />
=======
      <Route path="/layout" element={<Layout />} />
        {/* <Route path="/home" element={<Home />} />  */}
      
>>>>>>> 6977b395df1998ba720fc3c4b93d09102f128c02
    </Routes>
  </Router>
);


export default App;