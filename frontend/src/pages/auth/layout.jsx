import React, { useState } from "react";
import "./layout.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_Store_image_small.png"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Layout = ({ children, showSearchBar = true, showNavBar = true, showHeader = true }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={` ${isOpen ? 'Layout-expanded-home-container' : 'Layout-collapsed-home-container'}`}>
      <div className="Layout-left-container">
        <div className="Layout-misc">
          <i onClick={() => setIsOpen(!isOpen)} class="fa-solid fa-bars Layout-sidebar"></i>
          <div className="Layout-image-box">
            {isOpen && <img src={Text_Logo_final_re} alt="Image" />}
            {!isOpen && <img src={Re_Store_image_small} alt="Image" />}
          </div>
        </div>
        <div className="Layout-bottom-left">
          <div className="Layout-options">
            <button className="Layout-Home">
              <i class="fa-solid fa-home Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp; Home</span>}
            </button>
            <button className="Layout-Messages">
              <i class="fa-solid fa-message Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Messages</span>}
            </button>
            <button className="Layout-Favorites">
              <i class="fa-solid fa-heart Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Favorites</span>}
            </button>
            <button className="Layout-My Orders">
              <i class="fa-solid fa-cart-shopping Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;My Orders</span>}
            </button>
            <button className="Layout-Sell Items">
              <i class="fa-solid fa-circle-plus Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Sell Items</span>}
            </button>
            <button className="Layout-Help">
              <i class="fa-solid fa-circle-question Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Help</span>}
            </button>
            <button className="Layout-Logout">
              <Link to="/login" style={{ color: "white", textDecoration :"none"}}>
              <i class="fa-solid fa-right-from-bracket Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Logout</span>}</Link>
            </button>
          </div>
        </div>
      </div>
      <div className="Layout-right-container">
        {showHeader && <div className="Layout-header">
          {showSearchBar && <div className="Layout-search-container">
            <div className="Layout-search-bar">
              <input type="text" placeholder="Search" />
              <i className="fa-solid fa-magnifying-glass Layout-search-icon"></i>
            </div>
          </div>}
          {showNavBar && <div className="Layout-nav-links">
            <span>Home</span>
            <span>Cart</span>
            <span>Profile</span>
          </div>}
        </div>}
        <div className="Layout-main-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;
