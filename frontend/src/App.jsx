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
import ProductRequestcard from "./pages/auth/productRequestcard";
=======


import Profile from "./pages/auth/profile";
<<<<<<< HEAD
import ProductDetails from "./pages/auth/ProductDetails";
>>>>>>> 25fa16754435dbe0db4e2c696b55875fa527df1b
// import ProductDetails from "./pages/auth/Viewproductcard";
// import ViewDetails from "./pages/auth/ViewDetails";
=======
// import ProductDetails from "./pages/auth/ProductDetails";

>>>>>>> 240f58615f66f0e9523754578ad1b69cc1ff939f
// import ProductDetails from "./pages/auth/Viewproductcard";
// import ViewDetails from "./pages/auth/ViewDetails";


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
     {/* <Route path="/product/:slug" element={<ProductDetails />} />  */}
>>>>>>> 25fa16754435dbe0db4e2c696b55875fa527df1b
      <Route path="/sellpage" element={<SellPage />} />
      <Route path="/auctionproduct/:id" element={<AuctionProduct />} />
      <Route path="/auctionpage" element={<AuctionPage />} />
      <Route path="/togglebutton" element={<ToggleButton/>} />
<<<<<<< HEAD
      <Route path="/productrequestcard" element={<ProductRequestcard/>} />
      {/* <Route path="/productdetails" element={<ProductDetails/>} /> */}
=======
      <Route path="/productdetails" element={<ProductDetails/>} />
      <Route path="/profile" element={<Profile/>} />
>>>>>>> 25fa16754435dbe0db4e2c696b55875fa527df1b
      {/* <Route path="/viewdetails" element={<ViewDetails/>} /> */}
    </Routes>
  </Router>
);

export default App;