import './adminlogin.css'
import React from 'react'
import Login from './Login'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Adminlogin = () => {
  return (
    <div className='Alogin-container'>
      <div className="Aleft-half">
        <div className="Ainputs">
          <div className="Aheading_1">Admin Login</div>
          <input className='Aemail' type='text' placeholder='Username/Email address*' />
          <input className='Apassword' type="password" placeholder='Password*' />
          <button className='ALogin'>Sign in</button>
          <div className="AUserlogin">
            <span className="userlogin">
                        <Link to="/login" style={{ color: "white"}}>User Login</Link>
                      </span>
          </div>
        </div>
      </div>
      <div className="Aright-half">
        <div className="Aimage-box image">
          <img src={Re_store_logo_login} alt="Image" />
        </div>
      </div>
    </div>
  )
};

export default Adminlogin;