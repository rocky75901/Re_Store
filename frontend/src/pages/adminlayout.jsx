import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../components/layout.css";
import Text_Logo_final_re from "../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../assets/Re_store_image_small.png";
import { useSidebar } from "../context/SidebarContext";
import { logout } from "../services/authService";

const AdminLayout = ({
  children,
  showHeader = true,
  customHeaderContent = null,
}) => {
  const { isOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();

  const getPageTitle = () => {
    switch (location.pathname) {
      case '/adminpage':
        return 'Dashboard';
      case '/admin/users':
        return 'Manage Users';
      case '/admin/products':
        return 'Manage Products';
      case '/admin/reports':
        return 'Reports';
      default:
        return 'Admin Panel';
    }
  };

  return (
    <div className={isOpen ? "Layout-expanded-home-container" : "Layout-collapsed-home-container"}>
      <div className="Layout-left-container">
        <div className="Layout-misc">
          <i onClick={toggleSidebar} className="fa-solid fa-bars Layout-sidebar"></i>
          <div className="Layout-image-box">
            {isOpen ? (
              <img src={Text_Logo_final_re} alt="Re_Store Logo" className="expanded-logo" />
            ) : (
              <img src={Re_Store_image_small} alt="Re_Store Icon" className="collapsed-logo" />
            )}
          </div>
        </div>
        <div className="Layout-bottom-left">
          <div className="Layout-options">
            <button
              className="Layout-Dashboard"
              onClick={() => navigate("/adminpage")}
              style={{
                backgroundColor: location.pathname === "/adminpage" ? "#150c7b" : "auto",
                color: location.pathname === "/adminpage" ? "white" : "inherit",
                fontWeight: location.pathname === "/adminpage" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-gauge-high Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Dashboard</span>}
            </button>

            <button
              className="Layout-Users"
              onClick={() => navigate("/admin/users")}
              style={{
                backgroundColor: location.pathname === "/admin/users" ? "#150c7b" : "auto",
                color: location.pathname === "/admin/users" ? "white" : "inherit",
                fontWeight: location.pathname === "/admin/users" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-users Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Users</span>}
            </button>

            <button
              className="Layout-Products"
              onClick={() => navigate("/admin/products")}
              style={{
                backgroundColor: location.pathname === "/admin/products" ? "#150c7b" : "auto",
                color: location.pathname === "/admin/products" ? "white" : "inherit",
                fontWeight: location.pathname === "/admin/products" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-box Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Products</span>}
            </button>

            <button
              className="Layout-Reports"
              onClick={() => navigate("/admin/reports")}
              style={{
                backgroundColor: location.pathname === "/admin/reports" ? "#150c7b" : "auto",
                color: location.pathname === "/admin/reports" ? "white" : "inherit",
                fontWeight: location.pathname === "/admin/reports" ? "bold" : "normal",
              }}
            >
              <i className="fa-solid fa-chart-line Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Reports</span>}
            </button>

            <button
              className="Layout-Logout"
              onClick={logout}
              style={{
                marginTop: "auto",
                backgroundColor: "transparent",
                color: "inherit",
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
            <h1 className="page-title">{getPageTitle()}</h1>
          </div>
        )}
        <div className="Layout-content">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;