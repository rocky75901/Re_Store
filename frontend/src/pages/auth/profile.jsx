import React, { useState } from "react";
import "./profile.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png"
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Profile = () => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <div className={` ${isOpen ? 'profile-expanded-home-container' : 'profile-collapsed-home-container'}`}>
      <div className="profile-left-container">
        <div className="profile-misc">
          <i onClick={() => setIsOpen(!isOpen)} className="fa-solid fa-bars Layout-sidebar"></i>
          <div className="profile-image-box">
            {isOpen ? (
              <img src={Text_Logo_final_re} alt="Re_Store Logo" className="expanded-logo" />
            ) : (
              <img src={Re_Store_image_small} alt="Re_Store Icon" className="collapsed-logo" />
            )}
          </div>
        </div>
        <div className="profile-bottom-left">
          <div className="profile-options">
            <button className="profile-Home">
              <Link to="/" style={{ color: "white", textDecoration: "none" }}>
                <i className="fa-solid fa-home Layout-icons"></i>
                {isOpen && <span>&nbsp;&nbsp;&nbsp; Home</span>}
              </Link>
            </button>
            <button className="profile-Messages">
              <Link to="/messages" style={{ color: "white", textDecoration: "none" }}>
                <i className="fa-solid fa-message Layout-icons"></i>
                {isOpen && <span>&nbsp;&nbsp;&nbsp;Messages</span>}
              </Link>
            </button>
            <button className="profile-Favorites">
              <i className="fa-solid fa-heart Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Favorites</span>}
            </button>
            <button className="profile-My Orders">
              <i className="fa-solid fa-cart-shopping Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;My Orders</span>}
            </button>
            <button className="profile-Sell Items">
              <i className="fa-solid fa-circle-plus Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Sell Items</span>}
            </button>
            <button className="profile-Help">
              <i className="fa-solid fa-circle-question Layout-icons"></i>
              {isOpen && <span>&nbsp;&nbsp;&nbsp;Help</span>}
            </button>
            <button className="profile-Logout">
              <Link to="/login" style={{ color: "white", textDecoration: "none" }}>
                <i className="fa-solid fa-right-from-bracket Layout-icons"></i>
                {isOpen && <span>&nbsp;&nbsp;&nbsp;Logout</span>}
              </Link>
            </button>
          </div>
        </div>
      </div>
      <div className="profileright-half">
        <div className="profile-image">
          <i
            className="fa-solid fa-circle-user"
            style={{ color: " #4152b3", fontSize: "220px" }}
          ></i>
        </div>
        <div className="edit-icon-container">

<<<<<<< HEAD
        <i className="fa-solid fa-pen edit-icon" style={{color:" #0c0d0d", fontSize: "24px",cursor:"pointer"}}></i>

        </div>
        <div className="profileinfo">
          <div className="profileinfobox">
            <h2>iSaha</h2>
            <p className="name">Indranil Saha</p>
            <p className="email">saha@iitk.ac.in</p>
            <p className="room">RM408</p>
          </div>
=======
        <div className="profileinfobox">
          <h2 className="username">iSaha</h2>
          <p className="name">Indranil Saha</p>
          <p className="email">saha@iitk.ac.in</p>
          <p className="room">RM408</p>
>>>>>>> 240f58615f66f0e9523754578ad1b69cc1ff939f
        </div>
      </div>
    </div>
  );
};

export default Profile;


