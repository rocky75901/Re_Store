import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
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
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider, useAuth } from "./context/AuthContext";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  
  if (!user) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: window.location.pathname }} replace />;
  }
  
  return children;
};

function App() {
  return (
    <Router>
<<<<<<< HEAD
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
          <Route path="/auction/:id" element={<AuctionViewDetails />} />
          <Route path="/adminlogin" element={<Adminlogin />} />
          <Route path="/cartpage" element={<Cartpage />} />
          <Route path="/auctionviewdetails" element={<AuctionViewDetails />} />
          <Route path="/payment" element={<PaymentDetails />} />
        </Routes>
      </SidebarProvider>
=======
      <AuthProvider>
        <LoadingProvider>
          <SidebarProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Login />} />
              <Route path="/login" element={<Login />} />
              <Route path="/sign-up" element={<SignUp />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/resetpassword" element={<ResetPassword />} />
              <Route path="/verify" element={<Verify />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/adminlogin" element={<Adminlogin />} />
              
              {/* Protected Routes */}
              <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
              <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
              <Route path="/favcard" element={<ProtectedRoute><FavCard /></ProtectedRoute>} />
              <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
              <Route path="/sellpage" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
              <Route path="/auctionproduct" element={<ProtectedRoute><AuctionProduct /></ProtectedRoute>} />
              <Route path="/auctionpage" element={<ProtectedRoute><AuctionPage /></ProtectedRoute>} />
              <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
              <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
              <Route path="/viewproductauction" element={<ProtectedRoute><ViewProductAuction /></ProtectedRoute>} />
              <Route path="/productrequestcard" element={<ProtectedRoute><ProductRequestcard /></ProtectedRoute>} />
              <Route path="/productrequest" element={<ProtectedRoute><ProductRequest /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
              <Route path="/viewproductcard" element={<ProtectedRoute><ViewProductCard /></ProtectedRoute>} />
              <Route path="/product/:id" element={<ProtectedRoute><ViewDetails /></ProtectedRoute>} />
              <Route path="/cartpage" element={<ProtectedRoute><Cartpage /></ProtectedRoute>} />
              <Route path="/auctionviewdetails" element={<ProtectedRoute><AuctionViewDetails /></ProtectedRoute>} />
              <Route path="/payment" element={<ProtectedRoute><PaymentDetails /></ProtectedRoute>} />
            </Routes>
          </SidebarProvider>
        </LoadingProvider>
      </AuthProvider>
>>>>>>> be1c2590d5ee31e05da06b1ecd920e67b4f3f7f1
    </Router>
  );
}

export default App;