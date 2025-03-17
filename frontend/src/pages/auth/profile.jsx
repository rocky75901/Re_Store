import React, { useState } from "react";
import "./profile.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Layout from "./layout";

const profile = ({ children }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Layout showHeader={false}>
      <div className="profileright-half">
        <div className="profile-image">
          <i
            className="fa-solid fa-circle-user"
            style={{ color: " #4152b3", fontSize: "220px" }}
          ></i>
        </div>
        <div className="edit-icon-container">
          <i
            className="fa-solid fa-pen edit-icon"
            style={{ color: " #0c0d0d", fontSize: "24px", cursor: "pointer" }}
          ></i>
        </div>

        <div className="profileinfobox">
          <h2>iSaha</h2>
          <p className="name">Indranil Saha</p>
          <p className="email">saha@iitk.ac.in</p>
          <p className="room">RM408</p>
        </div>
      </div>
    </Layout>
  );
};

export default profile;
