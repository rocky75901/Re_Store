import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './auctionpage.css';
import Re_store_logo_login from "../assets/Re_store_logo_login.png";
import Layout from '../components/layout';
import ToggleButton from '../components/ToggleButton';

const AuctionPage = ({ searchQuery = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // Get search query from URL directly
  const urlSearchParams = new URLSearchParams(location.search);
  const urlSearchQuery = urlSearchParams.get('q') || '';
  // Use URL search query if available, otherwise use the prop
  const effectiveSearchQuery = urlSearchQuery || searchQuery;
  
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to get seller name from all possible sources
  const getSellerName = (auction) => {
    if (!auction) return "Unknown";
    
    // Case 1: Seller name directly on auction
    if (auction.sellerName) {
      return auction.sellerName;
    }
    
    // Case 2: Populated seller object with username
    if (auction.seller?.username) {
      return auction.seller.username;
    }
    
    // Case 3: Populated seller object with name
    if (auction.seller?.name) {
      return auction.seller.name;
    }
    
    // Fallback
    return "Unknown Seller";
  };

  console.log('AuctionPage searchQuery:', effectiveSearchQuery);

  useEffect(() => {
    const token = sessionStorage.getItem('token');
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
      const token = sessionStorage.getItem('token');
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
        console.log('Complete auction data:', JSON.stringify(response.data.data[0], null, 2));
        const auctionsData = response.data.data;
        setAuctions(auctionsData);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching auctions:', error);
      if (error.response?.status === 401) {
        sessionStorage.removeItem('token');
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

  // Filter auctions based on search query
  const filteredAuctions = effectiveSearchQuery 
    ? auctions.filter(auction => 
        auction.product?.name?.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        auction.product?.description?.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        auction.seller?.username?.toLowerCase().includes(effectiveSearchQuery.toLowerCase())
      )
    : auctions;

  const getImageUrl = (auction) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    
    // Check if we have a product with an image cover
    if (auction.product && auction.product.imageCover) {
      const imagePath = auction.product.imageCover;
      
      // Handle different image path formats
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      // If it's just a filename (no slashes)
      if (!imagePath.includes('/')) {
        return `${BACKEND_URL}/uploads/products/${imagePath}`;
      }
      
      // If it has a path
      const formattedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
      return `${BACKEND_URL}${formattedPath}`;
    }
    
    // If product has an ID but no image, try to construct a URL based on the ID
    if (auction.product && auction.product._id) {
      return `${BACKEND_URL}/uploads/products/product-${auction.product._id}-cover.jpeg`;
    }
    
    // If auction has a productId
    if (auction.productId) {
      return `${BACKEND_URL}/uploads/products/product-${auction.productId}-cover.jpeg`;
    }
    
    // If no product info, try using the auction ID
    if (auction._id) {
      return `${BACKEND_URL}/uploads/products/product-${auction._id}-cover.jpeg`;
    }
    
    // Default fallback
    return Re_store_logo_login;
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

  if (filteredAuctions.length === 0 && effectiveSearchQuery) {
    return (
      <Layout>
        <div className="empty-auctions">
          <i className="fa-solid fa-search"></i>
          <h2>No matching auctions found</h2>
          <p>Try a different search term</p>
          <ToggleButton />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="auction-page">
        <div className="auction-header">
          <ToggleButton />
        </div>

        <div className="auction-content">
          <div className="auctions-grid">
            {filteredAuctions.map(auction => (
              <div 
                key={auction._id} 
                className={`auction-card ${auction.status === 'ended' ? 'auction-ended' : ''}`}
              >
                <div className="auction-image" onClick={() => handleViewAuction(auction._id)}>
                  <img 
                    src={getImageUrl(auction)} 
                    alt={auction.product?.name || "Auction item"} 
                    onError={(e) => {
                      console.log('Failed to load auction image:', e.target.src);
                      
                      // Try different paths based on what failed
                      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                      
                      // If using uploads/products failed, try img/products
                      if (e.target.src.includes('/uploads/products/')) {
                        e.target.src = `${BACKEND_URL}/img/products/${auction.product?.imageCover || `product-${auction._id}-cover.jpeg`}`;
                        return;
                      }
                      
                      // If using img/products failed, try API endpoint
                      if (e.target.src.includes('/img/products/')) {
                        e.target.src = `${BACKEND_URL}/api/v1/products/${auction.product?._id || auction.productId}/image`;
                        return;
                      }
                      
                      // Final fallback
                      e.target.src = Re_store_logo_login;
                      e.target.onerror = null; // Prevent infinite loop
                    }}
                  />
                  <span className={`time-left ${auction.status === 'ended' ? 'ended' : ''}`}>
                    {auction.status === 'ended' ? 'Auction Ended' : calculateTimeLeft(auction.endTime)}
                  </span>
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
                      <span>{auction.status === 'ended' ? 'Final Price' : 'Current Price'}</span>
                      <strong>₹{auction.currentPrice}</strong>
                    </div>
                  </div>

                  <div className="auction-footer">
                    <span className="seller">By {getSellerName(auction)}</span>
                    
                    {auction.status === 'ended' && auction.winner ? (
                      <div className="auction-status">
                        <span className="winner-tag">Won by: {auction.winner}</span>
                        <button className="view-details-button" onClick={() => handleViewAuction(auction._id)}>
                          View Details
                        </button>
                      </div>
                    ) : auction.status === 'ended' ? (
                      <div className="auction-status">
                        <span className="no-bids">No bids received</span>
                        <button className="view-details-button" onClick={() => handleViewAuction(auction._id)}>
                          View Details
                        </button>
                      </div>
                    ) : (
                      <button className="bid-button" onClick={() => handleViewAuction(auction._id)}>
                        Place Bid
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionPage;