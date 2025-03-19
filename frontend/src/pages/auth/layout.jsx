import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./layout.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";
import { useSidebar } from "../../context/SidebarContext";

const Layout = ({
  children,
  showSearchBar = true,
  showNavBar = true,
  showHeader = true,
  customHeaderContent = null,  
}) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation(); // Get current route

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
                backgroundColor:
                  location.pathname === "/messages" ? "#150c7b" : "auto",
                color: location.pathname === "/messages" ? "white" : "inherit",
                fontWeight:
                  location.pathname === "/messages" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-message Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Messages</span>}
            </button>

            <button
              className="Layout-Favorites"
              onClick={() => navigate("/favorites")}
              style={{
                backgroundColor:
                  location.pathname === "/favorites"
                    ? "#150c7b"
                    : "auto",
                color: location.pathname === "/favorites" ? "white" : "inherit",
                fontWeight:
                  location.pathname === "/favorites" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-heart Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Favorites</span>}
            </button>

            <button
              className="Layout-MyOrders"
              onClick={() => navigate("/orders")}
              style={{
                backgroundColor:
                  location.pathname === "/orders" ? "#150c7b" : "auto",
                color: location.pathname === "/orders" ? "white" : "inherit",
                fontWeight: location.pathname === "/orders" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-cart-shopping Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; My Orders</span>}
            </button>

            <button
              className="Layout-SellItems"
              onClick={() => navigate("/sellpage")}
              style={{
                backgroundColor:
                  location.pathname === "/sellpage" ? "#150c7b" : "auto",
                color: location.pathname === "/sellpage" ? "white" : "inherit",
                fontWeight: location.pathname === "/sellpage" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-circle-plus Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Sell Items</span>}
            </button>

            <button
              className="Layout-Help"
              onClick={() => navigate("/faq")}
              style={{
                backgroundColor:
                  location.pathname === "/faq" ? "#150c7b" : "auto",
                color: location.pathname === "/faq" ? "white" : "inherit",
                fontWeight: location.pathname === "/faq" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-circle-question Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Help</span>}
            </button>

            <button
              className="Layout-Logout"
              onClick={() => navigate("/login")}
              style={{
                backgroundColor:
                  location.pathname === "/login" ? "#150c7b" : "auto",
                color: location.pathname === "/login" ? "white" : "inherit",
                fontWeight: location.pathname === "/login" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-right-from-bracket Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Logout</span>}
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
                  <input type="text" placeholder="Search" />
                  <i className="fa-solid fa-magnifying-glass Layout-search-icon"></i>
                </div>
              </div>
            ) : (
              <div className="custom-header">{customHeaderContent}</div>
            )}
            {showNavBar && (
              <div className="Layout-nav-links">
                <span onClick={() => navigate("/")}>Home</span>
                <span onClick={() => navigate("/cart")}>Cart</span>
                <span onClick={() => navigate("/profile")}>Profile</span>
              </div>
            )}
          </div>
        )}
        <div className="Layout-main-content">{children}</div>
      </div>
    </div>
  );
};
console.log("Current Path:", location.pathname);
export default Layout;
