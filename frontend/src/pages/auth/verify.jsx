import React, { useState } from "react"; 
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';
import './verify.css';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';

const Verify = () => {
    const [verificationCode, setVerificationCode] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();

    const handleSubmit = async () => {
        if (!verificationCode) {
            setError("Please enter the verification code");
            return;
        }

        setIsLoading(true);
        setError("");

        try {
            const response = await axios.post('http://localhost:3000/api/v1/users/verify', {
                token: verificationCode
            });

            if (response.data.status === 'success') {
                // Store the token and user data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                // Store user role if available
                if (response.data.user && response.data.user.role) {
                    localStorage.setItem('userRole', response.data.user.role);
                }
                // Redirect to home
                navigate('/home');
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Verification failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
      <div className='verify-container'>
        <div className="verify-left-half">
          <div className="verify-inputs">
            <div className="verify-heading_1">Verify Email</div>
            <p className="verify-sub-text">Please enter the verification code sent to your email.</p>
            <input 
              className='verify-verification-code' 
              type='text' 
              placeholder='Enter verification code*'
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
            />
            {error && <div className="verify-error-message">{error}</div>}
            <button 
              className='verify-verify-button'
              onClick={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? 'Verifying...' : 'Verify'}
            </button>
            <div className="verify-back-to-login">
              <Link to="/login" style={{ color: "white", textDecoration: "underline" }} className='verify-backtologin'>
                <i className="fa-solid fa-arrow-left arrow-left verify-icon"></i>Back to Login
              </Link>
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