import React from "react";
import "./ResetPassword.css"; 
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';

const ResetPassword = () => {
    return (
        <div className="reset-container">
           
            <div className="reset-left-half">
                <div className="reset-inputs">
                    <h2 className="reset-heading_1">Reset Password</h2>
                    <div>
                        <input type="password" placeholder="Enter password*" className="reset-input"/>
                        <input type="password" placeholder="Confirm password*" className="reset-input" />
                        <button type="submit" className="reset-button">Reset Password</button>
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

export default ResetPassword;