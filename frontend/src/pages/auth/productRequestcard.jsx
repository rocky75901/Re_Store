import React from "react";
import "./productRequestcard.css";
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'

export default function ProductRequestcard() {
  return (
    <div className="request-card">
        <div className="user-icon">
            <img src={Re_store_logo_login} alt="Image"/>
        </div>
        <div className="req-msg-container">
      <div className="request-message">Message</div>
      </div>
    </div>
  );
}
