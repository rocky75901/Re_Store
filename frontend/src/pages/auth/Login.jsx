import React from 'react'
import './Login.css'
import './Signup.css'
import './ForgotPassword.css'
import Home from "./home.jsx";
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
            <Link to="/forgot-password" style={{ color: "white"}}>Forgot Password?</Link>
          </div>
          <div className="Check">
            <input type="checkbox" class="custom-checkbox"className='checkbox'/> 
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
}
const ForgotPassword = () => {
  return (
    <div className='forgot-container'>

      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Forgot Password</div>
          <p className="sub-text">Enter your email address and we will send you a reset link.</p>
          <input className='email' type='email' placeholder='Email address*' />
          <button className='send-link'>Submit</button>
          <div className="back-to-login" >
            <Link to="/login" style={{ color: "white", textDecoration: "none" }}>Back to Login</Link>
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
}
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
          <button className='Submit'>
            <Link to = "/home" style = {{color:'white',textDecoration: 'none'}}>Submit</Link>
          </button>
          <div className="back-to-login" >
            <Link to="/login" style={{ color: "white"}}>Back to Login</Link>
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
}



const App = () => (
  <Router>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/home" element={<Home />} />      
      <Route path="/login" element={<Login />} />
      <Route path="/sign-up" element={<SignUp />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  </Router>
);



export default App;
