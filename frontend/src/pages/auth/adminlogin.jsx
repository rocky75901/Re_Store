import './adminlogin.css'
import React, { useState } from 'react'
import { useNavigate, Link } from "react-router-dom";
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { login as loginService } from './authService.jsx';
import { useAuth } from '../../context/AuthContext';
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
      console.log('Attempting admin login with:', formData.email);
      const response = await loginService(formData.email, formData.password, true);
      console.log('Login response:', response);
            
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
      <div className='Alogin-container'>
        <div className="Aleft-half">
          <div className="Ainputs">
            <div className="Aheading_1">Admin Login</div>
            <form onSubmit={handleSubmit}>
              <input 
                className='Aemail' 
                type='text' 
                name="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                placeholder='Email address*' 
              />
              <input 
                className='Apassword' 
                type="password" 
                name="password"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder='Password*' 
              />
              {error && (
                <div className="error-box">
                  {error}
                </div>
              )}
              <button 
                className='ALogin' 
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
            <div className="AUserlogin">
              <Link to="/login" style={{ textDecoration: 'underline', color: "white"}}>User Login</Link>
            </div>
          </div>
        </div>
        <div className="Aright-half">
          <div className="Aimage-box image">
            <img src={Re_store_logo_login} alt="Re_Store Logo" />
          </div>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </>
  )
};

export default Adminlogin;
