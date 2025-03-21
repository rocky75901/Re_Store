import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './auctionpage.css';
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import Layout from './layout';
import ToggleButton from './ToggleButton';

const AuctionPage = () => {
  const navigate = useNavigate();
  // Sample auction data - will be replaced with backend data later
  const [auctions] = useState([
    {
      _id: 'AUC123456',
      name: 'Vintage Camera',
      description: 'Rare vintage camera in excellent condition',
      currentBid: 15000,
      startingBid: 10000,
      endTime: '2024-03-25T18:00:00',
      image: Re_store_logo_login,
      seller: 'John Doe',
      bids: 8,
      status: 'active'
    },
    {
      _id: 'AUC123457',
      name: 'Antique Watch',
      description: 'Classic timepiece from the 1950s',
      currentBid: 25000,
      startingBid: 20000,
      endTime: '2024-03-24T15:00:00',
      image: Re_store_logo_login,
      seller: 'Jane Smith',
      bids: 12,
      status: 'active'
    },
    {
      _id: 'AUC123458',
      name: 'Collectible Comics',
      description: 'Limited edition comic book collection',
      currentBid: 8000,
      startingBid: 5000,
      endTime: '2024-03-23T20:00:00',
      image: Re_store_logo_login,
      seller: 'Mike Wilson',
      bids: 5,
      status: 'active'
    }
  ]);

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
    navigate(`/auctionproduct/${auctionId}`);
  };

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
          {auctions.map(auction => (
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
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default AuctionPage;