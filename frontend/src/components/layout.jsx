import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./layout.css";
import Text_Logo_final_re from "../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../assets/Re_store_image_small.png";
import { useSidebar } from "../context/SidebarContext";
import { useNotification } from "../context/NotificationContext";
import NotificationBadge from "./NotificationBadge";
import { useAuth } from "../context/AuthContext";

const Layout = ({
  children,
  showSearchBar = true,
  showNavBar = true,
  showHeader = true,
  customHeaderContent = null,  
}) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const { unreadCount } = useNotification();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout: authLogout } = useAuth();
  
  // Extract search query from URL if it exists
  const searchParams = new URLSearchParams(location.search);
  const urlSearchQuery = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(urlSearchQuery);
  
  // Update searchQuery state when URL parameter changes
  useEffect(() => {
    setSearchQuery(urlSearchQuery);
  }, [urlSearchQuery]);

  const handleSearch = (e) => {
    const newSearchQuery = e.target.value;
    setSearchQuery(newSearchQuery);
    
    // Update URL with search query
    const currentParams = new URLSearchParams(location.search);
    if (newSearchQuery) {
      currentParams.set('q', newSearchQuery);
    } else {
      currentParams.delete('q');
    }
    
    // Navigate to same route with updated search params
    const newSearch = currentParams.toString();
    const newPathWithSearch = `${location.pathname}${newSearch ? `?${newSearch}` : ''}`;
    navigate(newPathWithSearch, { replace: true });
  };

  // Clone children with searchQuery prop
  const childrenWithProps = React.Children.map(children, child => {
    if (React.isValidElement(child)) {
      return React.cloneElement(child, { searchQuery });
    }
    return child;
  });

  // Inside the Layout component, add this function to check active route
  const isActiveRoute = (pathname) => {
    return location.pathname === pathname;
  };

  // Add this function to handle logout
  const handleLogout = () => {
    authLogout(); // Clear auth context
    sessionStorage.removeItem('token'); // Clear token
    sessionStorage.removeItem('user'); // Clear user data
    navigate('/home'); // Redirect to home page
  };

  return (
    <div
      className={` ${
        isOpen
          ? "Layout-expanded-home-container"
          : "Layout-collapsed-home-container"
      }`}
    >
      <div className="Layout-left-container">
        <div className="Layout-misc">
          <i
            onClick={toggleSidebar}
            className="fa-solid fa-bars Layout-sidebar"
          ></i>
          <div className="Layout-image-box">
            {isOpen ? (
              <img
                src={Text_Logo_final_re}
                alt="Re_Store Logo"
                className="expanded-logo"
              />
            ) : (
              <img
                src={Re_Store_image_small}
                alt="Re_Store Icon"
                className="collapsed-logo"
              />
            )}
          </div>
        </div>
        <div className="Layout-bottom-left">
          <div className="Layout-options">
            <button
              className="Layout-Home"
              onClick={() => navigate("/home")}
              style={{
                backgroundColor:
                  location.pathname === "/home" ? "#150c7b" : "auto",
                color: location.pathname === "/home" ? "white" : "inherit",
                fontWeight: location.pathname === "/home" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-home Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Home</span>}
            </button>

            <button
              className="Layout-Messages"
              onClick={() => navigate("/messages")}
              style={{
                backgroundColor: isActiveRoute("/messages") ? "#150c7b" : "transparent",
                color: isActiveRoute("/messages") ? "white" : "inherit",
                fontWeight: isActiveRoute("/messages") ? "bold" : "normal",
              }}
            >
              <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
                <i className="fa-solid fa-message Layout-icons"></i>
                {isOpen && <span>&nbsp;&nbsp;&nbsp; Messages</span>}
                <NotificationBadge count={unreadCount} className="small" />
              </div>
            </button>

            <button
              className="Layout-Favorites"
              onClick={() => navigate("/favorites")}
              style={{
                backgroundColor: isActiveRoute("/favorites") ? "#150c7b" : "transparent",
                color: isActiveRoute("/favorites") ? "white" : "inherit",
                fontWeight: isActiveRoute("/favorites") ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-heart Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Favorites</span>}
            </button>

            <button
              className="Layout-MyOrders"
              onClick={() => navigate("/orders")}
              style={{
                backgroundColor: isActiveRoute("/orders") ? "#150c7b" : "transparent",
                color: isActiveRoute("/orders") ? "white" : "inherit",
                fontWeight: isActiveRoute("/orders") ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-cart-shopping Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; My Orders</span>}
            </button>

            <button
              className="Layout-SellItems"
              onClick={() => navigate("/sellpage")}
              style={{
                backgroundColor: isActiveRoute("/sellpage") ? "#150c7b" : "transparent",
                color: isActiveRoute("/sellpage") ? "white" : "inherit",
                fontWeight: isActiveRoute("/sellpage") ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-circle-plus Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Sell Items</span>}
            </button>

            <button
              className="Layout-Help"
              onClick={() => navigate("/faq")}
              style={{
                backgroundColor: isActiveRoute("/faq") ? "#150c7b" : "transparent",
                color: isActiveRoute("/faq") ? "white" : "inherit",
                fontWeight: isActiveRoute("/faq") ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-circle-question Layout-icons"></i>              {isOpen && <span>&nbsp;&nbsp;&nbsp; Help</span>}
            </button>

            <button
              className="Layout-Logout"
              onClick={user ? handleLogout : () => navigate('/login')}
              style={{
                backgroundColor: "auto",
                color: "inherit",
                fontWeight: "normal",
              }}
            >
              <i className={`fa-solid ${user ? 'fa-right-from-bracket' : 'fa-sign-in-alt'} Layout-icons`}></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; {user ? 'Logout' : 'Login'}</span>}
            </button>
          </div>
        </div>
      </div>
      <div className="Layout-right-container">
        {showHeader && (
          <div className="Layout-header">
            {showSearchBar ? (
              <div className="Layout-search-container">
                <div className="Layout-search-bar">
                  <input 
                    type="text" 
                    placeholder="Search" 
                    value={searchQuery}
                    onChange={handleSearch}
                  />
                  <i className="fa-solid fa-magnifying-glass Layout-search-icon"></i>
                </div>
              </div>
            ) : (
              <div className="custom-header">{customHeaderContent}</div>
            )}
            {showNavBar && (
              <div className="Layout-nav-links">
                {user ? (
                  <>
                    <span onClick={() => navigate("/home")}>Home</span>
                    <span onClick={() => navigate("/cart")}>Cart</span>
                    <span onClick={() => navigate("/sellhistory")}>Sell History</span>
                    <span onClick={() => navigate("/profile")}>Profile</span>
                  </>
                ) : (
                  <>
                    <span onClick={() => navigate("/home")}>Home</span>
                    <span onClick={() => navigate("/login")}>Login</span>
                  </>
                )}
              </div>
            )}
          </div>
        )}
        <div className="Layout-main-content">{childrenWithProps}</div>
      </div>
    </div>
  );
};

export default Layout;
