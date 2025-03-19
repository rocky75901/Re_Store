import React, { useState } from "react";
import "./ResetPassword.css"; 
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';
import { Link } from "react-router-dom";

const ResetPassword = () => {
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [touched, setTouched] = useState({});
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const validateForm = () => {
        const newErrors = {};
        
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

    const handleSubmit = (e) => {
        e.preventDefault();
        setTouched({
            password: true,
            confirmPassword: true
        });
        
        if (validateForm()) {
            // Handle successful form submission
            console.log('Form submitted successfully');
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleConfirmPasswordVisibility = () => {
        setShowConfirmPassword(!showConfirmPassword);
    };

    return (
        <div className="reset-container">
            <div className="reset-left-half">
                <div className="reset-inputs">
                    <h2 className="reset-heading_1">Reset Password</h2>
                    
                    <div className="input-wrapper">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password*"
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
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="Confirm password*"
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
                        className="reset-button"
                        onClick={handleSubmit}
                        disabled={Object.keys(errors).length > 0}
                    >
                        Reset Password
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
        </div>
    );
};

export default ResetPassword;