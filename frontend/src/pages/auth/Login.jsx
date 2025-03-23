import React, { useState } from 'react'
import './Login.css'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login as loginService } from './authService.jsx';
import { useAuth } from '../../context/AuthContext';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    keepLoggedIn: false
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    if (!formData.password.trim()) {
      newErrors.password = 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      try {
        const response = await loginService(formData.email, formData.password);
        console.log('Login response:', response);
        
        if (response.user) {
          // Update auth context
          login(response.user);
          
          // Get the return URL from location state or default to home
          const returnUrl = location.state?.from || '/home';
          console.log('Redirecting to:', returnUrl);
          navigate(returnUrl, { replace: true });
        } else {
          console.error('Login successful but no user data received');
          setErrors({ form: 'Login successful but failed to get user data' });
        }
      } catch (error) {
        console.error('Login error:', error);
        setErrors({ 
          form: error.message || 'Login failed. Please check your credentials.' 
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className='login-container'>
      
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Welcome to our Page</div>
          <div className="heading_2">Log in</div>
          <form onSubmit={handleSubmit}>
          {errors.form && <div className="error-message">{errors.form}</div>}
            {errors.email && <div className="error-message-email">{errors.email}</div>}
            <input 
              className='email'
              type='email'
              placeholder='Email address*'
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
            />
            
            {errors.password && <div className="error-message-password">{errors.password}</div>}
            <div className="password-container">
              <input 
                className='password'
                type={showPassword ? "text" : "password"}
                placeholder='Password*'
                name="password"
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
              />
              <i 
                className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} password-toggle`}
                onClick={togglePasswordVisibility}
              ></i>
            </div>
            
            <div className="forgot">
              <Link to="/forgot-password" style={{ color: "white", textDecoration :"underline"}}>Forgot Password?</Link>
            </div>
            
            <div className="Check">
              <input 
                type="checkbox" 
                className="custom-checkbox checkbox"
                name="keepLoggedIn"
                checked={formData.keepLoggedIn}
                onChange={handleChange}
                disabled={isLoading}
              /> 
              <div className='remember'>Keep me logged in</div>
            </div>
            
            <button 
              type="submit" 
              className='Login'
              disabled={isLoading}
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
          <div className="noaccount">Don't have an account? <span className="signup">
            <Link to="/sign-up" style={{ color: "white"}}>Sign Up</Link>
          </span>
          </div>
          <div className="Adminlogin"><span className="adminlogin">
            <Link to="/adminlogin" style={{ color: "white"}}>Admin Login</Link>
          </span>
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

export default Login;
