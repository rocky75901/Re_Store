import React from "react";
import "./home.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";

const Home = () => {
  return (
    <div className="home-container">
      <div className="left-container">
        <div className="misc">
          <i class="fa-solid fa-bars sidebar"></i>
          <div className="image-box">
            <img src={Text_Logo_final_re} alt="Image" />
          </div>
        </div>
        <div className="bottom-left">
          <div className="options">
            <div className="Home">
              <i class="fa-solid fa-home icons"></i>
              &nbsp;&nbsp;&nbsp; Home
            </div>
            <div className="Messages">
              <i class="fa-solid fa-message icons"></i>
              &nbsp;&nbsp;&nbsp;Messages
            </div>
            <div className="Favorites">
              <i class="fa-solid fa-heart icons"></i>
              &nbsp;&nbsp;&nbsp;Favorites
            </div>
            <div className="My Orders">
              <i class="fa-solid fa-cart-shopping icons"></i>
              &nbsp;&nbsp;&nbsp;My Orders
            </div>
            <div className="Sell Items">
              <i class="fa-solid fa-circle-plus icons"></i>
              &nbsp;&nbsp;&nbsp;Sell Items
            </div>
            <div className="Help">
              <i class="fa-solid fa-circle-question icons"></i>
              &nbsp;&nbsp;&nbsp;Help
            </div>
            <div className="Logout">
              <i class="fa-solid fa-right-from-bracket icons"></i>
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
              <i class="fa-solid fa-magnifying-glass search-icon"></i>
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
