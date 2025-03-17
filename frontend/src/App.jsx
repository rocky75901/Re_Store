import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/verify";

import List from "./pages/auth/help";
import ProductCard from "./pages/auth/fav";

import ResetPassword from "./pages/auth/resetpassword";
import Faq from "./pages/auth/faq";
import Layout from "./pages/auth/layout";
import Home from "./pages/auth/home";
import SellPage from "./pages/auth/sellpage";
import AuctionProduct from "./pages/auth/Auctionproduct";
import AuctionPage from "./pages/auth/auctionpage";
import ToggleButton from "./pages/auth/ToggleButton";
import Messages from "./pages/auth/messages";
<<<<<<< HEAD
// import ProductDetails from "./pages/auth/Viewproductcard";
// import ViewDetails from "./pages/auth/ViewDetails";

=======
import Profile from "./pages/auth/profile";
import ProductDetails from "./pages/auth/ProductDetails";
// import ProductDetails from "./pages/auth/Viewproductcard";
//import ViewDetails from "./pages/auth/ViewDetails";
>>>>>>> 526615a46229a88cf2443c8288708aa42ea70cd2

const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />     
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<Verify />} />

      <Route path="/help" element={<List />} />
      <Route path="/fav" element={<ProductCard />}/>

      <Route path="/resetpassword" element={<ResetPassword />} />
      <Route path="/layout" element={<Layout />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/home" element={<Home />} />
      <Route path="/messages" element={<Messages />} />
<<<<<<< HEAD
      {/* <Route path="/product/:slug" element={<ProductDetails />} /> */}
=======
     <Route path="/product/:slug" element={<ProductDetails />} /> 
>>>>>>> 526615a46229a88cf2443c8288708aa42ea70cd2
      <Route path="/sellpage" element={<SellPage />} />
      <Route path="/auctionproduct" element={<AuctionProduct />} />
      <Route path="/auctionpage" element={<AuctionPage />} />
      <Route path="/togglebutton" element={<ToggleButton/>} />
<<<<<<< HEAD
      {/* <Route path="/productdetails" element={<ProductDetails/>} />
      <Route path="/viewdetails" element={<ViewDetails/>} /> */}

=======
      <Route path="/profile" element={<Profile/>} />
      {/* <Route path="/productdetails" element={<ProductDetails/>} /> */}
      {/* <Route path="/viewdetails" element={<ViewDetails/>} /> */}
>>>>>>> 526615a46229a88cf2443c8288708aa42ea70cd2
    </Routes>
  </Router>
);

export default App;