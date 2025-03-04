
import React from "react";
import "./ResetPassword.css"; 
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';

const ResetPassword = () => {
    return (
        <div className="reset-container">
           
            <div className="left-half">
                <div className="inputs">
                    <h2 className="heading_1">Reset Password</h2>
                    <form>
                        <input type="password" placeholder="Enter password*" />
                        <input type="password" placeholder="Confirm password*" />
                        <button type="submit" className="reset-button">Reset Password</button>
                    </form>
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
