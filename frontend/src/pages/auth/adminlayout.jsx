import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import "./adminlayout.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";

const AdminLayout = ({
  children,
  showSearchBar = true,
  showNavBar = true,
  showHeader = true,
}) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  console.log("Current Path:", location.pathname); // Moved inside component

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
          <div className="Layout-top">
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
              className="Layout-Reports"
              onClick={() => navigate("/reports")}
              style={{
                backgroundColor:
                  location.pathname === "/reports" ? "#150c7b" : "auto",
                color: location.pathname === "/reports" ? "white" : "inherit",
                fontWeight:
                  location.pathname === "/reports" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-triangle-exclamation Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Reports</span>}
            </button>
          </div>
          <div className="Layout-bottom">
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
            {showSearchBar && (
              <div className="Layout-search-container">
                <div className="Layout-search-bar">
                  <input type="text" placeholder="Search" />
                  <i className="fa-solid fa-magnifying-glass Layout-search-icon"></i>
                </div>
              </div>
            )}
            {showNavBar && (
              <div className="Layout-nav-links">
                <span onClick={() => navigate("/")}>Home</span>
                {/* <span onClick={() => navigate("/cart")}>Cart</span> */}
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

export default AdminLayout;