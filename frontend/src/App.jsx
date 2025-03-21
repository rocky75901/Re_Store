import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import CartPage from "./pages/auth/CartPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import Verify from "./pages/auth/verify";
import FavCard from "./pages/auth/favcard";
import ResetPassword from "./pages/auth/resetpassword";
import Faq from "./pages/auth/faq";
import Layout from "./pages/auth/layout";
import OrdersPage from "./pages/auth/OrdersPage"
import Home from "./pages/auth/home";
import SellPage from "./pages/auth/sellpage";
import AuctionProduct from "./pages/auth/Auctionproduct";
import AuctionPage from "./pages/auth/auctionpage";
import ToggleButton from "./pages/auth/ToggleButton";
import Messages from "./pages/auth/messages";
import Favorites from "./pages/auth/favorites";
import ViewProductAuction from "./pages/auth/ViewProductAuction";
import ProductRequestcard from "./pages/auth/productRequestcard";
import ProductRequest from "./pages/auth/productrequest";
import Profile from "./pages/auth/profile";
import ViewProductCard from "./pages/auth/Viewproductcard";
import ViewDetails from "./pages/auth/ViewDetails";
import Adminlogin from "./pages/auth/adminlogin";
import Cartpage from "./pages/auth/CartPage";
import AuctionViewDetails from "./pages/auth/Auctionviewdetails";
import PaymentDetails from "./pages/auth/PaymentDetails";
import { SidebarProvider } from "./context/SidebarContext";

function App() {
  return (
    <Router>
      <SidebarProvider>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/resetpassword" element={<ResetPassword />} />
          <Route path="/verify" element={<Verify />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/favcard" element={<FavCard />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/home" element={<Home />} />
          <Route path="/sellpage" element={<SellPage />} />
          <Route path="/auctionproduct" element={<AuctionProduct />} />
          <Route path="/auctionpage" element={<AuctionPage />} />
          <Route path="/togglebutton" element={<ToggleButton />} />
          <Route path="/messages" element={<Messages />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/viewproductauction" element={<ViewProductAuction />} />
          <Route path="/productrequestcard" element={<ProductRequestcard />} />
          <Route path="/productrequest" element={<ProductRequest />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/viewproductcard" element={<ViewProductCard />} />
          <Route path="/product/:id" element={<ViewDetails />} />
          <Route path="/adminlogin" element={<Adminlogin />} />
          <Route path="/cartpage" element={<Cartpage />} />
          <Route path="/auctionviewdetails" element={<AuctionViewDetails />} />
          <Route path="/payment" element={<PaymentDetails />} />
        </Routes>
      </SidebarProvider>
    </Router>
  );
}

export default App;