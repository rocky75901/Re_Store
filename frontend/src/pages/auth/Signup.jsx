import React from "react";
import './Signup.css'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const SignUp = () => {
    return (
      <div className='signup-container'>
        
        <div className="left-half">
          <div className="inputs">
            <div className="heading_1">Sign Up</div>
            <input className='username'type='text'placeholder='Username*'/>
            <input className='fullname'type='text'placeholder='Full name*'/>
            <input className='email'type='text'placeholder='Email*'/>
            <input className='password'type="password"placeholder='Password*'/>
            <input className='confirm-password'type="password"placeholder='Confirm Password*'/>
            <Link to = "/verify" style = {{color:'white',textDecoration: 'none'}}>
            <button className='Submit'>
              Submit
            </button>
            </Link>
            <div className="back-to-login" >
            <i className="fa-solid fa-arrow-left arrow-left"></i>
              <Link to="/login" style={{ color: "white", textDecoration: "underline"}} className='backtologin'>Back to Login</Link>
            </div>
          </div>
        </div>
  
        <div className="right-half">
          <div className="image-box image">
            <img src={Re_store_logo_login} alt="Image"/>
          </div>
        </div>
        
      </div>
    )
  };

export default SignUp;