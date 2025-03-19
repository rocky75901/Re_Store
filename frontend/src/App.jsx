import "./App.css";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/verify";
import FavCard from "./pages/auth/favcard";
import ResetPassword from "./pages/auth/resetpassword";
import Faq from "./pages/auth/faq";
import Layout from "./pages/auth/layout";
import Home from "./pages/auth/home";
import SellPage from "./pages/auth/sellpage";
import AuctionProduct from "./pages/auth/Auctionproduct";
import AuctionPage from "./pages/auth/auctionpage";
import ToggleButton from "./pages/auth/ToggleButton";
import Messages from "./pages/auth/messages";
import Favorites from "./pages/auth/favorites";
import ViewProductAuction from "./pages/auth/ViewProductAuction"
import ProductRequestcard from "./pages/auth/productRequestcard";
import ProductRequest from "./pages/auth/productrequest";
import Profile from "./pages/auth/profile";
import ProductDetails from "./pages/auth/Viewproductcard";
import ViewDetails from "./pages/auth/ViewDetails";
import Adminlogin from "./pages/auth/adminlogin";


const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />     
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/verify" element={<Verify />} />
      <Route path="/favorites" element={<Favorites />}/>
      <Route path="/favcard" element={<FavCard />}/>
      <Route path="/resetpassword" element={<ResetPassword />} />
      <Route path="/layout" element={<Layout />} />
      <Route path="/faq" element={<Faq />} />
      <Route path="/home" element={<Home />} />
      <Route path="/messages" element={<Messages />} />
     <Route path="/productrequest" element={<ProductRequest />} />
      <Route path="/sellpage" element={<SellPage />} />
      <Route path="/auctionproduct/:id" element={<AuctionProduct />} />
      <Route path="/auctionpage" element={<AuctionPage />} />
      <Route path="/togglebutton" element={<ToggleButton/>} />
      <Route path="/viewproductauction" element={<ViewProductAuction/>} />
      <Route path="/productrequestcard" element={<ProductRequestcard/>} />
      <Route path="/productdetails" element={<ProductDetails/>} />
      <Route path="/profile" element={<Profile/>} />
      <Route path="/viewdetails" element={<ViewDetails/>} />
      <Route path="/adminlogin" element={<Adminlogin/>} />
    </Routes>
  </Router>
);

export default App;