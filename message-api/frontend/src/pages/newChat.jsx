import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import './newChat.css';

const NewChat = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/chats/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          participantEmail: email.trim(),
          userId: user._id
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to create chat');
      }

      if (data.chatId) {
        navigate(`/chat/${data.chatId}`);
      } else {
        throw new Error('No chat ID received');
      }
    } catch (error) {
      setError(error.message || 'Failed to create chat');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="new-chat-container">
      <div className="new-chat-card">
        <h2>Start New Chat</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Enter User's Email</label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter email address"
              required
            />
          </div>
          <div className="button-group">
            <button 
              type="button" 
              className="cancel-button"
              onClick={() => navigate('/chat')}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="submit-button"
              disabled={loading}
            >
              {loading ? 'Creating...' : 'Start Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewChat; 