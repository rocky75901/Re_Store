import React, { useState } from "react";
import "./productRequestcard.css";
import Re_store_logo_login from '../assets/Re_store_logo_login.png'

const ProductRequestcard = ({ id, initialMessage, username, isOwner, onMessageUpdate, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState(initialMessage);
  const [editedMessage, setEditedMessage] = useState(initialMessage);

  const handleEdit = () => {
    setIsEditing(true);
    setEditedMessage(message);
  };

  const handleSave = () => {
    if (editedMessage.trim() !== message) {
      setMessage(editedMessage.trim());
      onMessageUpdate(editedMessage.trim());
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditedMessage(message);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(id);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <div className="request-card">
      <div className="user-icon">
        <img src={Re_store_logo_login} alt="User" />
      </div>
      <div className="req-msg-container">
        {isEditing ? (
          <div className="edit-container">
            <textarea
              value={editedMessage}
              onChange={(e) => setEditedMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              className="edit-input"
              autoFocus
            />
            <div className="button-container">
              <button onClick={handleSave} className="save-btn">
                Save
              </button>
              <button onClick={handleCancel} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <div className="message-container">
            <div className="message-content">
              <p className="message-text">{message}</p>
            </div>
            {isOwner && (
              <div className="action-buttons">
                <button className="edit-btn" onClick={handleEdit}>Edit</button>
                <button className="delete-btn" onClick={handleDelete}>Delete</button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductRequestcard;
