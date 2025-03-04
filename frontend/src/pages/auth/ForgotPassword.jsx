import React from "react";
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';
import './ForgotPassword.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ResetPassword from "./resetpassword";

const ForgotPassword = () => {
    return (
      <div className='forgot-container'>
  
        <div className="left-half">
          <div className="inputs">
            <div className="heading_1">Forgot Password</div>
            <p className="sub-text">Enter your email address and we will send you a reset link.</p>
            <input className='email' type='email' placeholder='Email address*' />
            <Link to = "/verify" style = {{color:'white',textDecoration: 'none'}}>
                        <button className='Submit'>
                          Submit
                        </button>
                        </Link>
            <div className="back-to-login" >
            <i class="fa-solid fa-arrow-left arrow-left"></i>
              <Link to="/login" style={{ color: "white", textDecoration: "underline" }}className='backtologin'> Back to Login</Link>
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

  export default ForgotPassword;