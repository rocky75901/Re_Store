import React, { useEffect } from 'react';
import './SuccessMessage.css';

const SuccessMessage = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="success-message-container">
      <div className="success-message-content">
        <i className="fas fa-check-circle"></i>
        <p>{message}</p>
      </div>
    </div>
  );
};

export default SuccessMessage; 