import React from "react";
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';
import './ForgotPassword.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { useState, useEffect } from "react";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [touched, setTouched] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const validateForm = () => {
    const newErrors = {};

    if (!email.trim()) {
      newErrors.email = "Email is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    
    try {
      const response = await fetch(
        `${BACKEND_URL}/api/v1/users/forgotPassword`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email,
          }),
        }
      );
      
      const data = await response.json();
      
      if (response.ok) {
        setSuccess(true);
        setEmail(""); // Clear the email field
        setCountdown(60); // Start countdown
      } else {
        setErrors(prev => ({
          ...prev,
          submit: data.message || "Failed to send reset link"
        }));
      }
    } catch (error) {
      setErrors(prev => ({
        ...prev,
        submit: "Failed to send reset link. Please try again."
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResend = () => {
    if (countdown > 0) return;
    setSuccess(false);
    setErrors({});
    handleSubmit();
  };

  return (
    <div className='forgot-container'>
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Forgot Password</div>
          <p className="sub-text">Enter your email address and we will send you a reset link.</p>
          
          {success ? (
            <div className="success-message">
              <p>A link has been sent to your email</p>
              <button 
                className={`resend-link ${countdown > 0 ? 'disabled' : ''}`}
                onClick={handleResend}
                disabled={countdown > 0}
              >
                {countdown > 0 ? `Resend in ${countdown}s` : 'Resend Link'}
              </button>
            </div>
          ) : (
            <>
              <input
                className='email'
                type='email'
                placeholder='Email address*'
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onBlur={() => handleBlur("email")}
                disabled={isSubmitting}
              />
              {errors.email && touched.email && (
                <span className="error-message">{errors.email}</span>
              )}
              <button 
                className='send-link' 
                onClick={handleSubmit}
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
            </>
          )}
          
          {errors.submit && (
            <span className="error-message">{errors.submit}</span>
          )}
          
          <div className="back-to-login">
            <i className="fa-solid fa-arrow-left arrow-left"></i>
            <Link to="/login" style={{ color: "white", textDecoration: "underline" }} className='backtologin'>
              Back to Login
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

export default ForgotPassword;