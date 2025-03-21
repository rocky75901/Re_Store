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

const SignUp = () => {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [fullname, setFullname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState("");

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
        console.log('Sending signup request with data:', {
          username,
          name: fullname,
          email,
          password,
          passwordConfirm: confirmPassword,
          role: 'user'
        });

        // First try to check if server is reachable
        try {
          const testResponse = await axios.get('http://localhost:3000/api/test', {
            timeout: 5000
          });
          console.log('Server is reachable:', testResponse.data);
        } catch (testError) {
          console.error('Server test failed:', testError);
          throw new Error('Cannot connect to server. Is the backend running on port 3000?');
        }

        // If server is reachable, proceed with signup
        const response = await axios.post('http://localhost:3000/api/v1/users/signup', {
          username: username,
          name: fullname,
          email: email,
          password: password,
          passwordConfirm: confirmPassword,
          role: 'user'
        }, {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 5000
        });

        console.log('Signup response:', response.data);
        
        if (response.data && response.data.status === 'success') {
          console.log('Signup successful, storing token...');
          localStorage.setItem('token', response.data.token);
          localStorage.setItem('user', JSON.stringify(response.data.user));
          if (response.data.user && response.data.user.role) {
            localStorage.setItem('userRole', response.data.user.role);
          }
          console.log('Navigating to home...');
          navigate('/home');
        } else {
          setApiError('Unexpected response from server');
        }
      } catch (error) {
        console.error('Signup error:', error);
        if (error.code === 'ECONNABORTED') {
          setApiError('Request timed out. Please check if the server is running and try again.');
        } else if (error.response) {
          console.error('Error response:', error.response.data);
          setApiError(error.response.data.message || 'An error occurred during signup');
        } else if (error.request) {
          console.error('No response received:', error.request);
          setApiError('Cannot connect to server. Please check if the server is running at http://localhost:3000');
        } else {
          console.error('Error setting up request:', error.message);
          setApiError('Error: ' + error.message);
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
              className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
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
              className={`fa-solid ${showConfirmPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
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

          {apiError && (
            <div className="error-message" style={{ textAlign: 'center', marginBottom: '20px' }}>
              {apiError}
            </div>
          )}

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
    </div>
  );
};

export default SignUp;
