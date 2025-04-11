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

// Modified ProtectedRoute Component
const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return (
      <Layout>
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          height: '70vh',
          textAlign: 'center',
          padding: '20px'
        }}>
          <i className="fa-solid fa-lock" style={{ fontSize: '48px', color: '#2F3BA3', marginBottom: '20px' }}></i>
          <h2 style={{ color: '#2F3BA3', marginBottom: '10px' }}>Please Login to View</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>This content is only available to logged-in users.</p>
          <button 
            onClick={() => window.location.href = '/login'}
            style={{
              backgroundColor: '#2F3BA3',
              color: 'white',
              padding: '10px 20px',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            Login Now
          </button>
        </div>
      </Layout>
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
            {/* Public Routes */}
            <Route path="/" element={<Navigate to="/home" />} />
            <Route path="/login" element={<Login />} />
            <Route path="/sign-up" element={<SignUp />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/home" element={<Home />} />
            <Route path="/faq" element={<Faq />} />
            <Route path="/auctionpage" element={<AuctionPage />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />
            <Route path="/verify-email" element={<EmailVerification />} />
            <Route path="/product/:id" element={<ViewDetails />} />

            {/* Protected Routes */}
            <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
            <Route path="/favcard" element={<ProtectedRoute><FavCard /></ProtectedRoute>} />
            <Route path="/orders" element={<ProtectedRoute><OrdersPage /></ProtectedRoute>} />
            <Route path="/sellpage" element={<ProtectedRoute><SellPage /></ProtectedRoute>} />
            <Route path="/sellhistory" element={<ProtectedRoute><SellHistory /></ProtectedRoute>} />
            <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
            <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
            <Route path="/productrequestcard" element={<ProtectedRoute><ProductRequestcard /></ProtectedRoute>} />
            <Route path="/productrequest" element={<ProtectedRoute><ProductRequest /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
            <Route path="/viewproductcard" element={<ProtectedRoute><ViewProductCard /></ProtectedRoute>} />
            <Route path="/order-summary" element={<ProtectedRoute><OrderSummary /></ProtectedRoute>} />
            <Route path="/shipping" element={<ProtectedRoute><ShippingPage /></ProtectedRoute>} />
            <Route path="/payment" element={<ProtectedRoute><PaymentDetails /></ProtectedRoute>} />
            <Route path="/auction/:id" element={<ProtectedRoute><AuctionViewDetails /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/adminlogin" element={<Adminlogin />} />
            <Route path="/adminpage" element={<ProtectedAdminRoute><AdminPage /></ProtectedAdminRoute>} />
            <Route path="/admin/users" element={<ProtectedAdminRoute><ManageUsers /></ProtectedAdminRoute>} />
            <Route path="/admin/products" element={<ProtectedAdminRoute><ManageProducts /></ProtectedAdminRoute>} />
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
