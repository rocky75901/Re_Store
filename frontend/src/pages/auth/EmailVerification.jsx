import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import "./EmailVerification.css";
import { toast } from "react-toastify";

const EmailVerification = () => {
  const navigate = useNavigate();
  const [verificationStatus, setVerificationStatus] = useState("initial"); // initial, waiting, verified
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes in seconds
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState(null);

  const handleVerifyEmail = async () => {
    setVerificationStatus("waiting");
    setIsChecking(true);
    setError(null);

    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const email = sessionStorage.getItem("email");
      console.log(email);
      const response = await fetch(
        `${BACKEND_URL}/api/v1/users/get-verification-email`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error(
          "Failed to send verification email. Please make sure the backend server is running."
        );
      }

      const data = await response.json();

      if (data.status === "success") {
      } else {
        throw new Error(data.message || "Failed to send verification email");
      }
    } catch (error) {
      console.log(error.message);
      setError(
        "Backend server is not responding. Please make sure the server is running at " +
          (import.meta.env.VITE_BACKEND_URL || "http://localhost:3000")
      );
      setVerificationStatus("initial");
      setIsChecking(false);
    }
  };

  // Format time remaining
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Check verification status
  const checkVerificationStatus = async () => {
    try {
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const email = sessionStorage.getItem("email");
      const response = await fetch(
        `${BACKEND_URL}/api/v1/users/check-is-verified`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ email: email }),
        }
      );

      if (!response.ok) {
        const errorText = await response.text();

        throw new Error("Failed to check verification status");
      }

      const data = await response.json();

      if (data.status === "success" && data.isVerified) {
        setVerificationStatus("verified");
        setIsChecking(false);
        toast.success("Signup Successful");
        setTimeout(() => {
          navigate("/login");
        }, 3000);
      }
    } catch (error) {
      setError(error.message || "Failed to check verification status");
    }
  };

  // Timer effect
  useEffect(() => {
    let timer;
    if (verificationStatus === "waiting" && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsChecking(false);
      setVerificationStatus("initial");
      setTimeLeft(600); // Reset timer
    }
    return () => clearInterval(timer);
  }, [timeLeft, verificationStatus]);

  // Check verification status every 5 seconds
  useEffect(() => {
    let checkInterval;
    if (isChecking) {
      checkInterval = setInterval(checkVerificationStatus, 10000);
    }
    return () => clearInterval(checkInterval);
  }, [isChecking]);

  return (
    <div className="verification-container">
      <div className="left-half">
        <div className="inputs">
          <div className="heading_1">Verify Your Email</div>
          <p className="sub-text">
            Please verify your email address to complete your registration.
          </p>

          {error && <div className="error-message">{error}</div>}

          {verificationStatus === "initial" && (
            <div className="button-container">
              <button className="verify-button" onClick={handleVerifyEmail}>
                Verify Email
              </button>
            </div>
          )}

          {verificationStatus === "waiting" && (
            <div className="waiting-message">
              <div className="spinner"></div>
              <p>Waiting for email verification...</p>
              <p className="sub-text">
                Please check your email and click the verification link.
              </p>
              <p className="timer">Time remaining: {formatTime(timeLeft)}</p>
            </div>
          )}

          {/* {verificationStatus === "verified" && (
            <div className="success-message">
              <i className="fas fa-check-circle"></i>
              <p>Email verified successfully!</p>
              <p className="sub-text">Redirecting to home page...</p>
            </div>
          )} */}

          <div className="back-to-login">
            <i className="fa-solid fa-arrow-left arrow-left"></i>
            <Link
              to="/login"
              style={{ color: "white", textDecoration: "underline" }}
              className="backtologin"
            >
              Back to Signup
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

export default EmailVerification;
