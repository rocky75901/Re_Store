import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from "./pages/auth/Login";
import SignUp from "./pages/auth/Signup";
import CartPage from "./pages/CartPage";
import ForgotPassword from "./pages/auth/ForgotPassword";
import FavCard from "./pages/favcard";
import ResetPassword from "./pages/auth/resetpassword";
import Faq from "./pages/faq";
import Layout from "./components/layout";
import OrdersPage from "./pages/OrdersPage";
import Home from "./pages/home";
import SellPage from "./pages/sellpage";
import ContactUs from "./pages/contactUs"
import SellHistory from "./pages/sellHistory";
// import AuctionProduct from "./pages/auth/Auctionproduct";
import AuctionPage from "./pages/auctionpage";
import ToggleButton from "./components/ToggleButton";
import Messages from "./chat/messages";
import Favorites from "./pages/favorites";
// import ViewProductAuction from "./pages/auth/ViewProductAuction";
import ProductRequestcard from "./pages/productRequestcard";
import ProductRequest from "./pages/ProductRequest";
import Profile from "./pages/profile";
import ViewProductCard from "./pages/Viewproductcard";
import ViewDetails from "./pages/ViewDetails";
import Adminlogin from "./pages/adminlogin";
import AuctionViewDetails from "./pages/Auctionviewdetails";
import PaymentDetails from "./pages/PaymentDetails";
import ShippingPage from "./pages/shippingpage";
import { SidebarProvider } from "./context/SidebarContext";
import { LoadingProvider } from "./context/LoadingContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import EmailVerification from "./pages/auth/EmailVerification";
import OrderSummary from './pages/orderSummary';
import { NotificationProvider } from './context/NotificationContext';
import AdminPage from "./pages/adminpage";
import ManageUsers from "./pages/ManageUsers";
import ManageProducts from "./pages/ManageProducts";

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    // Redirect to login with return URL
    return (
      <Navigate
        to="/login"
        state={{ from: window.location.pathname }}
        replace
      />
    );
  }

  return children;
};

// Protected Admin Route Component
const ProtectedAdminRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user || user.role !== 'admin') {
    return (
      <Navigate
        to="/adminlogin"
        state={{ from: window.location.pathname }}
        replace
      />
    );
  }

  return children;
};

function App() {
  return (
    <NotificationProvider>
      <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <SidebarProvider>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/favcard" element={<FavCard />} />
            <Route path="/orders" element={<OrdersPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/home" element={<Home />} />
            <Route path="/sellpage" element={<SellPage />} />
            <Route path="/contact-us" element={<ContactUs />} />
            <Route 
              path="/sellhistory" 
              element={
                <ProtectedRoute>
                  <SellHistory />
                </ProtectedRoute>
              } 
            />
            <Route path="/shipping" element={<ShippingPage />} />

            {/* Protected Auction Routes */}
            {/* <Route
              path="/auctionproduct"
              element={
                <ProtectedRoute>
                  <AuctionProduct />
                </ProtectedRoute>
              }
            /> */}
            <Route
              path="/auctionpage"
              element={
                <ProtectedRoute>
                  <AuctionPage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/auction/:id"
              element={
                <ProtectedRoute>
                  <AuctionViewDetails />
                </ProtectedRoute>
              }
            />
           

            <Route path="/togglebutton" element={<ToggleButton />} />
            <Route path="/messages" element={<Messages />} />
            <Route path="/favorites" element={<Favorites />} />
            {/* <Route path="/viewproductauction" element={<ViewProductAuction />} /> */}
            <Route path="/productrequestcard" element={<ProductRequestcard />} />
            <Route path="/productrequest" element={<ProductRequest />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/viewproductcard" element={<ViewProductCard />} />
            <Route path="/product/:id" element={<ViewDetails />} />
            <Route path="/adminlogin" element={<Adminlogin />} />
            <Route path="/order-summary" element={<OrderSummary />} />
            <Route path="/payment" element={<PaymentDetails />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route 
              path="/adminpage" 
              element={
                <ProtectedAdminRoute>
                  <AdminPage />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/users" 
              element={
                <ProtectedAdminRoute>
                  <ManageUsers />
                </ProtectedAdminRoute>
              } 
            />
            <Route 
              path="/admin/products" 
              element={
                <ProtectedAdminRoute>
                  <ManageProducts />
                </ProtectedAdminRoute>
              } 
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            color="white"
            newestOnTop
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            theme="light"
          />
        </SidebarProvider>
      </Router>
    </NotificationProvider>
  );
}

export default App;
