import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './auctionpage.css';
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import Layout from './layout';
import ToggleButton from './ToggleButton';

const AuctionPage = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/auctions`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data?.status === 'success') {
        console.log('Auction data:', response.data.data);
        setAuctions(response.data.data);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      setError(error.response?.data?.message || 'Failed to fetch auctions');
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

  // Add console log to see what we're getting
  console.log('Search Query:', searchQuery);
  console.log('Auctions:', auctions);

  // Filter auctions based on search query from Layout
  const filteredAuctions = searchQuery.trim() === '' 
    ? auctions // Show all auctions if search is empty
    : auctions.filter(auction => 
        auction.name?.toLowerCase().includes(searchQuery.toLowerCase()) || // Search in auction name
        auction.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) // Search in product name
      );

  // Add console log to see filtered results
  console.log('Filtered Auctions:', filteredAuctions);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading auctions...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <i className="fa-solid fa-exclamation-circle"></i>
        <h2>Error loading auctions</h2>
        <p>{error}</p>
        <button onClick={fetchAuctions}>Retry</button>
      </div>
    );
  }

  if (auctions.length === 0) {
    return (
      <div className="empty-auctions">
        <i className="fa-solid fa-gavel"></i>
        <h2>No active auctions</h2>
        <p>Check back later for new auctions</p>
        <button onClick={() => navigate('/home')}>Back to Home</button>
      </div>
    );
  }

  return (
    <>
      <ToggleButton />
      <div className="auctions-container">
        <div className="auctions-header">
          <h1>Live Auctions</h1>
          <div className="auction-filters">
            <select defaultValue="all">
              <option value="all">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="collectibles">Collectibles</option>
              <option value="fashion">Fashion</option>
              <option value="art">Art</option>
            </select>
            <select defaultValue="ending-soon">
              <option value="ending-soon">Ending Soon</option>
              <option value="newest">Newest</option>
              <option value="price-high">Highest Bid</option>
              <option value="price-low">Lowest Bid</option>
            </select>
          </div>
        </div>

        <div className="auctions-grid">
          {filteredAuctions.length > 0 ? (
            filteredAuctions.map(auction => (
              <div 
                key={auction._id} 
                className="auction-card"
                onClick={() => handleViewAuction(auction._id)}
              >
                <div className="auction-image">
                  <img src={auction.image} alt={auction.name} />
                  <span className="time-left">{calculateTimeLeft(auction.endTime)}</span>
                </div>
                
                <div className="auction-details">
                  <h3>{auction.name}</h3>
                  <h4 className="product-name">{auction.product?.name || 'Unnamed Product'}</h4>
                  <p className="description">{auction.description}</p>
                  
                  <div className="bid-info">
                    <div className="current-bid">
                      <span>Current Bid</span>
                      <strong>₹{auction.currentBid}</strong>
                    </div>
                    <div className="total-bids">
                      <span>Total Bids</span>
                      <strong>{auction.bids}</strong>
                    </div>
                  </div>

                  <div className="auction-footer">
                    <span className="seller">By {auction.seller}</span>
                    <button className="bid-button">
                      Place Bid
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-auctions">
              <i className="fa-solid fa-search"></i>
              <h2>No auctions found</h2>
              <p>Try adjusting your search criteria</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Create a wrapped version of AuctionPage that includes the Layout
const WrappedAuctionPage = () => (
  <Layout>
    <AuctionPage />
  </Layout>
);

export default WrappedAuctionPage;