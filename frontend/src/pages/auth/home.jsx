import React from "react";
import "./home.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
//import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
// import {
//   faBars,
//   faHome,
//   faHeart,
//   faCircleQuestion,
//   faRightFromBracket,
//   faCirclePlus,
//   faMessage,
//   faCartShopping,
//   faMagnifyingGlass
// } from "@fortawesome/free-solid-svg-icons";

const Home = () => {
  return (
    <div className="home-container">
      <div className="left-container">
        <div className="misc">
          <FontAwesomeIcon icon={faBars} className="sidebar" />
          <div className="image-box">
            <img src={Text_Logo_final_re} alt="Image" />
          </div>
        </div>
        <div className="bottom-left">
          <div className="options">
            <div className="Home">
              {/* <FontAwesomeIcon icon={faHome} className="icons" /> */}
              <i class="fa-solid fa-bars"></i>
              &nbsp;&nbsp;&nbsp; Home
            </div>
            <div className="Messages">
              {/* <FontAwesomeIcon icon={faMessage} className="icons" /> */}
              <i class="fa-solid fa-message"></i>
              &nbsp;&nbsp;&nbsp;Messages
            </div>
            <div className="Favorites">
              {/* <FontAwesomeIcon icon={faHeart} className="icons" /> */}
              <i class="fa-solid fa-heart"></i>
              &nbsp;&nbsp;&nbsp;Favorites
            </div>
            <div className="My Orders">
              {/* <FontAwesomeIcon icon={faCartShopping} className="icons" /> */}
              <i class="fa-solid fa-cart-shopping"></i>
              &nbsp;&nbsp;&nbsp;My Orders
            </div>
            <div className="Sell Items">
              {/* <FontAwesomeIcon icon={faCirclePlus} className="icons" /> */}
              <i class="fa-solid fa-circle-plus"></i>
              &nbsp;&nbsp;&nbsp;Sell Items
            </div>
            <div className="Help">
              {/* <FontAwesomeIcon icon={faCircleQuestion} className="icons" /> */}
              <i class="fa-solid fa-circle-question"></i>
              &nbsp;&nbsp;&nbsp;Help
            </div>
            <div className="Logout">
              {/* <FontAwesomeIcon icon={faRightFromBracket} className="icons" /> */}
              <i class="fa-solid fa-right-from-bracket"></i>
              &nbsp;&nbsp;&nbsp;Logout
            </div>
          </div>
        </div>
      </div>
      <div className="right-container">
        <div className="header">
          <div className="search-container">
            <div className="search-bar">
              <input type="text" placeholder="Search" />
              {/* <FontAwesomeIcon icon={faMagnifyingGlass} className="search-icon" /> */}
              <i class="fa-solid fa-magnifying-glass"></i>
            </div>
            
          </div>
          <div className="nav-links">
            <span>Home</span>
            <span>Cart</span>
            <span>Profile</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
