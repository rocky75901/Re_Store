import React, { useState } from "react";
import "./Signup.css";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import SuccessMessage from '../../components/SuccessMessage';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const SignUp = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors = {};
    
    if (!username.trim()) {
      newErrors.username = "Username is required";
    } else if (username.length > 10) {
      newErrors.username = "Username can be a maximum of 10 characters";
    }
    if (!fullname.trim()) {
      newErrors.fullname = "Full name is required";
    }
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!email.endsWith('@iitk.ac.in')) {
      newErrors.email = "Please use your IITK email address";
    }
    if (!password.trim()) {
      newErrors.password = "Password is required";
    } else if (password.length < 8) {
      newErrors.password = "Password must be minimum of 8 characters";
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = "Confirm Password is required";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Password and Confirm Password must be same";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    validateForm();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({
      username: true,
      fullname: true,
      email: true,
      password: true,
      confirmPassword: true
    });
    
    if (validateForm()) {
      setIsLoading(true);
      setApiError("");
      
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        
        const response = await fetch(`${BACKEND_URL}/api/v1/users/signup`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          body: JSON.stringify({
            username: username,
            name: fullname,
            email: email,
            password: password,
            passwordConfirm: confirmPassword
          }),
        });
        
        const responseText = await response.text();
        
        let data;
        try {
          data = JSON.parse(responseText);
        } catch (e) {
          
          throw new Error('Server returned invalid response');
        }

        if (response.ok && data.status === 'success') {
          localStorage.setItem('token', data.token);
          localStorage.setItem('user', JSON.stringify(data.user));
          if (data.user && data.user.role) {
            localStorage.setItem('userRole', data.user.role);
          }
          
          // Store user data in sessionStorage for email verification
          sessionStorage.setItem('user', JSON.stringify(data.user));
          
          // Update auth context with user data
          login(data.user);
          
          setShowSuccess(true);
          toast.success('Signup successful! Redirecting to verification page...');
          setTimeout(() => {
            navigate('/verify-email', { replace: true });
          }, 3000);
        } else {
          // Check for specific error messages
          if (data.message && (
              data.message.includes('email already exists') || 
              data.message.includes('duplicate key error') ||
              data.message.includes('E11000 duplicate key error')
            )) {
            toast.error('This email is already registered. Please use a different email or login.');
            setApiError('This email is already registered. Please use a different email or login.');
          } else if (data.message && data.message.includes('username already exists')) {
            toast.error('This username is already taken. Please choose a different username.');
            setApiError('This username is already taken. Please choose a different username.');
          } else {
            toast.error(data.message || 'Signup failed. Please try again.');
            setApiError(data.message || 'Signup failed');
          }
        }
      } catch (error) {
        
        
        // Check for MongoDB duplicate key error in the error message
        if (error.message && (
            error.message.includes('duplicate key error') || 
            error.message.includes('E11000 duplicate key error')
          )) {
          toast.error('This email is already registered. Please use a different email or login.');
          setApiError('This email is already registered. Please use a different email or login.');
        } else {
          toast.error('Failed to sign up. Please try again.');
          setApiError('Failed to sign up. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className="signup-container">
      {showSuccess && (
        <SuccessMessage 
          message="Signup successful! Redirecting to verification page..." 
          onClose={() => setShowSuccess(false)} 
        />
      )}
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Sign Up</div>
          <div className="input-wrapper">
            <input
              className="username"
              type="text"
              placeholder="Username*"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              onBlur={() => handleBlur('username')}
              required
            />
            {touched.username && errors.username && (
              <div className="error-message">{errors.username}</div>
            )}
          </div>
          
          <div className="input-wrapper">
            <input
              className="fullname"
              type="text"
              placeholder="Full name*"
              value={fullname}
              onChange={(e) => setFullname(e.target.value)}
              onBlur={() => handleBlur('fullname')}
              required
            />
            {touched.fullname && errors.fullname && (
              <div className="error-message">{errors.fullname}</div>
            )}
          </div>

          <div className="input-wrapper">
            <input
              className="email"
              type="text"
              placeholder="Email*"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => handleBlur('email')}
              required
            />
            {touched.email && errors.email && (
              <div className="error-message">{errors.email}</div>
            )}
          </div>

          <div className="input-wrapper">
            <input
              className="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password*"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={() => handleBlur('password')}
              required
            />
            <i 
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} signup-password-toggle`}
              onClick={togglePasswordVisibility}
            ></i>
            {touched.password && errors.password && (
              <div className="error-message">{errors.password}</div>
            )}
          </div>

          <div className="input-wrapper">
            <input
              className="confirm-password"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password*"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
              required
            />
            <i 
              className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} signup-password-toggle`}
              onClick={toggleConfirmPasswordVisibility}
            ></i>
            {touched.confirmPassword && errors.confirmPassword && (
              <div className="error-message">{errors.confirmPassword}</div>
            )}
          </div>

          <button
            className="Submit"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? 'Signing up...' : 'Submit'}
          </button>

          <div className="back-to-login">
            <i className="fa-solid fa-arrow-left arrow-left"></i>
            <Link
              to="/login"
              style={{ color: "white", textDecoration: "underline" }}
              className="backtologin"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </div>

      <div className="right-half">
        <div className="image-box image">
          <img src={Re_store_logo_login} alt="Image" />
        </div>
      </div>
      <ToastContainer />
    </div>
  );
};

export default SignUp;
