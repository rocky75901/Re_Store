import React from 'react'
import './Login.css'
import Re_store_logo_login from '../Assets/Re_store_logo_login.png'

const Login = () => {
  return (
    <div className='container'>
      
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Welcome to our Page</div>
          <div className="heading_2">Log in</div>
          <input className='email'type='text'placeholder='Username/Email address*'/>
          <input className='password'type="password"placeholder='Password*'/>
          <div className='forgot'>Forgot Password?</div>
          <div className="Check">
            <input type="checkbox" class="custom-checkbox"className='checkbox'/> 
            <div className='remember'>Keep me logged in</div>
          </div>
          <button className='Login'>Sign in</button>
          <div className="noaccount">Don't have an account? <span className='signup'>Sign up</span></div>
          <div className="Adminlogin">Admin login</div>
        </div>
      </div>

      <div className="right-half">
        <div className="image-box image">
          <img src={Re_store_logo_login} alt="Image"/>
        </div>
      </div>
      <div className="header">
        <div className="text"></div>
        <div className="underline"></div>
      </div>
      
    </div>
  )
}

export default Login
