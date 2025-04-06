import './adminlogin.css'
import React, { useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import Re_store_logo_login from '../assets/Re_store_logo_login.png'
import { login as loginService } from '../services/authService.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Adminlogin = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const response = await loginService(formData.email, formData.password, true);
            
      if (response.user && response.user.role === 'admin') {
        login(response.user);
        toast.success('Admin login successful!');
        navigate('/adminpage');
      } else {
        setError('Access denied. Admin privileges required.');
        toast.error('Access denied. Admin privileges required.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid EmailId or Password');
      toast.error(error.message || 'Invalid EmailId or Password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className='admin-Alogin-container'>
        <div className="admin-Aleft-half">
          <div className="admin-Ainputs">
            <div className="admin-Aheading_1">Admin Login</div>
            <form onSubmit={handleSubmit}>
              <input 
                className='admin-Aemail' 
                type='text' 
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder='Email address*' 
              />
              <input 
                className='admin-Apassword' 
                type="password" 
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder='Password*' 
              />
              {error && (
                <div className="admin-error-box">
                  {error}
                </div>
              )}
              <button 
                className='admin-ALogin' 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <div className="admin-AUserlogin">
              <Link to="/login" style={{ textDecoration: 'underline', color: "white"}}>User Login</Link>
            </div>
          </div>
        </div>
        <div className="admin-Aright-half">
          <div className="admin-Aimage-box image">
            <img src={Re_store_logo_login} alt="Re_Store Logo" />
          </div>
        </div>
      </div>
      <ToastContainer
      />
    </>
  )
};

export default Adminlogin;
