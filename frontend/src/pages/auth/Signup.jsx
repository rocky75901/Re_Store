import React, { useState } from "react";
import './Signup.css'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [passwordLengtherror, setPasswordLengtherror] = useState("");
  const [usernameerror, setusernameerror] = useState("");
  const [formError, setFormError] = useState("");

  const handleConfirmPasswordChange = (e) => {
    const value = e.target.value;
    setConfirmPassword(value);
    
    if (password !== value) {
      setError("Password and Confirm Password must be same.");
    } else {
      setError("");
    }
  };

  const minPasswordLengtherror = (e) => {
    const value = e.target.value;
    setPassword(value);

    if (value.length < 8) {
      setPasswordLengtherror("Password must be minimum of 8 characters");
    } else {
      setPasswordLengtherror("");
    }
  };

  const changeUsernameLength = (e) => {
    const value = e.target.value;
    setUsername(value);
    if (value.length === 10) {
      setusernameerror("Username can be a maximum of 10 characters.");
    } else {
      setusernameerror("");
    }
  }

  const isFormValid = () => {
    return (
      username &&
      fullname &&
      email &&
      password &&
      confirmPassword &&
      !error &&
      !passwordLengtherror &&
      !usernameerror
    );
  };

  function handleSubmit() {
    if (!isFormValid()) {
      setFormError("Please fill all required fields correctly.");
    } else {
      setFormError("");
    }
  };

  return (
    <div className='signup-container'>        
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Sign Up</div>
          <input className='username' type='text' placeholder='Username*' onChange={changeUsernameLength} required/>
          {usernameerror && <p style={{ color: "yellow", margin: 0 }}>{usernameerror}</p>}
          <input className='fullname' type='text' placeholder='Full name*' onChange={(e) => setFullname(e.target.value)} required/>
          <input className='email' type='text' placeholder='Email*' onChange={(e) => setEmail(e.target.value)} required/>
          <input className='password' type="password" placeholder='Password*' onChange={minPasswordLengtherror} required/>
          {passwordLengtherror && <p style={{ color: "yellow", margin: 0 }}>{passwordLengtherror}</p>}
          <input className='confirm-password' type="password" placeholder='Confirm Password*' onChange={handleConfirmPasswordChange} required/>
          {error && <p style={{ color: "yellow", margin: 0 }}>{error}</p>}
          <Link to="/verify" style={{ color: 'white', textDecoration: 'none' }}>
            <button className='Submit' onClick = "handleSubmit()"  disabled={!isFormValid()}>
              Submit
            </button>
          </Link>
          {!isFormValid() && <p style={{ color: "orange", margin: 0 }}>Fill all the required columns</p>}
          <div className="back-to-login">
            <i className="fa-solid fa-arrow-left arrow-left"></i>
            <Link to="/login" style={{ color: "white", textDecoration: "underline" }} className='backtologin'>Back to Login</Link>
          </div>
        </div>
      </div>

      <div className="right-half">
        <div className="image-box image">
          <img src={Re_store_logo_login} alt="Image" />
        </div>
      </div>
    </div>
  )
};

export default SignUp;