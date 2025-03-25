import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auctionpage.css';
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import Layout from './layout';
import ToggleButton from './ToggleButton';

const AuctionPage = () => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/auctions`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data?.status === 'success') {
        setAuctions(response.data.data);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError(error.response?.data?.message || 'Failed to fetch auctions');
      }
    } finally {
      setLoading(false);
    }
  };

  const calculateTimeLeft = (endTime) => {
    const difference = new Date(endTime) - new Date();
    if (difference <= 0) return 'Auction Ended';

    const days = Math.floor(difference / (1000 * 60 * 60 * 24));
    const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
    const minutes = Math.floor((difference / 1000 / 60) % 60);

    if (days > 0) return `${days}d ${hours}h left`;
    if (hours > 0) return `${hours}h ${minutes}m left`;
    return `${minutes}m left`;
  };

  const handleViewAuction = (auctionId) => {
    navigate(`/auction/${auctionId}`);
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading auctions...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <i className="fa-solid fa-exclamation-circle"></i>
          <h2>Error loading auctions</h2>
          <p>{error}</p>
          <button onClick={fetchAuctions}>Retry</button>
        </div>
      </Layout>
    );
  }

  if (auctions.length === 0) {
    return (
      <Layout>
        <div className="empty-auctions">
          <i className="fa-solid fa-gavel"></i>
          <h2>No active auctions</h2>
          <p>Check back later for new auctions</p>
          <button onClick={() => navigate('/home')}>Back to Home</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="auction-page">
        <div className="auction-header">
          <h1>Active Auctions</h1>
          <ToggleButton />
        </div>

        <div className="auction-content">
          {loading ? (
            <div className="loading">Loading auctions...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : (
            <div className="auctions-grid">
              {auctions.map(auction => (
                <div 
                  key={auction._id} 
                  className="auction-card"
                  onClick={() => handleViewAuction(auction._id)}
                >
                  <div className="auction-image">
                    <img src={auction.product?.imageCover || "https://via.placeholder.com/150"} alt={auction.product?.name} />
                    <span className="time-left">{calculateTimeLeft(auction.endTime)}</span>
                  </div>
                  
                  <div className="auction-details">
                    <h3>{auction.product?.name}</h3>
                    <p className="description">{auction.product?.description}</p>
                    
                    <div className="bid-info">
                      <div className="current-bid">
                        <span>Starting Price</span>
                        <strong>₹{auction.startingPrice}</strong>
                      </div>
                      <div className="total-bids">
                        <span>Current Price</span>
                        <strong>₹{auction.currentPrice}</strong>
                      </div>
                    </div>

                    <div className="auction-footer">
                      <span className="seller">By {auction.seller?.username || 'Unknown Seller'}</span>
                      <button className="bid-button">
                        Place Bid
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default AuctionPage;