import React from 'react'
import './Login.css'
import ForgotPassword from './ForgotPassword';
import SignUp from './Signup';
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Login = () => {
  return (
    <div className='login-container'>
      
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Welcome to our Page</div>
          <div className="heading_2">Log in</div>
          <input className='email'type='text'placeholder='Username/Email address*'/>
          <input className='password'type="password"placeholder='Password*'/>
          <div className="forgot">
            <Link to="/forgot-password" style={{ color: "white", textDecoration :"underline"}}>Forgot Password?</Link>
          </div>
          <div className="Check">
            <input type="checkbox" className="custom-checkbox checkbox"/> 
            <div className='remember'>Keep me logged in</div>
          </div>
          <button className='Login'>Sign in</button>
          <div className="noaccount">Don't have an account? <span className="signup">
            <Link to="/sign-up" style={{ color: "white"}}>Sign Up</Link>
          </span>
          </div>
          <div className="Adminlogin">Admin login</div>
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

export default Login;
