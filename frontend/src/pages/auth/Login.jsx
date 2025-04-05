import React, { useState } from 'react'
import './Login.css'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { login as loginService } from '../../services/authService.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      setErrors({}); // Clear any previous errors
      
      try {
        console.log('Submitting login form with email:', formData.email);
        const response = await loginService(formData.email, formData.password, false);
              
        if (response.user) {
          if (response.user.role === 'admin') {
            setErrors({ 
              form: 'Admin users must use the admin login page.' 
            });
            toast.error('Admin users must use the admin login page.');
            return;
          }
          
          // Update auth context
          login(response.user);
          
          // Get the return URL from location state or default to home
          const returnUrl = location.state?.from || '/home';
          console.log('Redirecting to:', returnUrl);
          toast.success('Login successful!');
          setTimeout(() => {
            navigate(returnUrl, { replace: true });
          }, 1500);
        } else {
          console.error('Invalid login response:', response);
          setErrors({ 
            form: 'Login failed: Invalid response from server' 
          });
          toast.error('Login failed: Invalid response from server');
        }
      } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error cases
        if (error.message.includes('Invalid EmailId or Password')) {
          setErrors({ 
            form: 'Invalid email or password. Please check your credentials.' 
          });
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Cannot connect to server')) {
          setErrors({ 
            form: 'Cannot connect to server. Please try again later.' 
          });
          toast.error('Cannot connect to server. Please try again later.');
        } else {
          setErrors({ 
            form: error.message || 'Login failed. Please try again.' 
          });
          toast.error(error.message || 'Login failed. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <>
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
              <div className="login-password-container">
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
                  className={`fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'} login-password-toggle`}
                  onClick={togglePasswordVisibility}
                ></i>
              </div>
              
              <div className="forgot">
                <Link to="/forgot-password" style={{ color: "white", textDecoration :"underline"}}>Forgot Password?</Link>
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
      <ToastContainer
      />
    </>
  );
};

export default Login;
