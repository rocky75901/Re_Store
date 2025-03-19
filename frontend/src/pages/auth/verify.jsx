import React from "react"; 
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';
import './verify.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Verify = () => {
    return (
      <div className='verify-container'>
        <div className="verify-left-half">
          <div className="verify-inputs">
            <div className="verify-heading_1">Verify</div>
            <input className='verify-verification-code' type='text' placeholder='Enter verification code*' />
            <button className='verify-verify-button'>Submit</button>
            <div className="verify-back-to-login">
              
              <Link to="/Forgot-Password" style={{ color: "white", textDecoration: "underline" }} className='verify-backtologin'> <i className="fa-solid fa-arrow-left arrow-left verify-icon"></i>Back</Link>
            </div>
          </div>
        </div>
  
        <div className="right-half">
          <div className="image-box image">
            <img src={Re_store_logo_login} alt="Image"/>
          </div>
        </div>
      </div>
    );
  };

export default Verify;