import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import './auctionpage.css';
import Re_store_logo_login from "../assets/Re_store_logo_login.png";
import Layout from '../components/layout';
import ToggleButton from '../components/ToggleButton';

// Define BACKEND_URL at the top level
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

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
    const checkAuthAndFetchAuctions = async () => {
      try {
        let token;
        try {
          token = sessionStorage.getItem('token') || localStorage.getItem('token');
        } catch (storageError) {
          console.warn('Storage access restricted:', storageError);
          // Redirect to login if we can't verify auth
          navigate('/login');
          return;
        }

        if (!token) {
          navigate('/login');
          return;
        }
        fetchAuctions();
      } catch (error) {
        console.error('Auth check failed:', error);
        setError('Authentication failed. Please try logging in again.');
      }
    };

    checkAuthAndFetchAuctions();
  }, []);

  const fetchAuctions = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching auctions...');
      
      let token;
      try {
        token = sessionStorage.getItem('token') || localStorage.getItem('token');
      } catch (storageError) {
        console.warn('Storage access restricted:', storageError);
        throw new Error('Unable to access authentication token');
      }

      const response = await axios.get(`${BACKEND_URL}/api/v1/auctions`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.status === 'success') {
        console.log(`Received ${response.data.results} auctions from server`);
        // Filter out any auctions without valid products and check end times
        const validAuctions = response.data.data.filter(auction => {
          if (!auction || !auction.product || !auction.product._id) return false;
          
          // Check if auction has ended based on current time
          const now = new Date();
          const endTime = new Date(auction.endTime);
          auction.hasEnded = now > endTime;
          return true;
        });
        
        console.log(`Found ${validAuctions.length} valid auctions to display`);
        setAuctions(validAuctions);
        
        if (validAuctions.length === 0) {
          setError('No active auctions found.');
        }
      } else {
        console.error('Error in auction response:', response.data);
        setError('Failed to fetch auctions');
      }
    } catch (error) {
      console.error('Error fetching auctions:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      } else {
        setError('Failed to fetch auctions. Please try again later.');
      }
    } finally {
      setLoading(false);
    }
  };

  // Add useEffect to refresh auctions periodically
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchAuctions();
      }
    }, 30000); // Refresh every 30 seconds

    return () => clearInterval(interval);
  }, [loading]);

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

  const handleContactSeller = async (auction) => {
    try {
      if (!auction.seller?._id) {
        console.error('No seller ID found for auction:', auction);
        alert('Unable to contact seller at this time.');
        return;
      }

      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chats`,
        { recipientId: auction.seller._id },
        {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token') || localStorage.getItem('token')}`,
          },
        }
      );

      if (response.data.status === 'success') {
        navigate(`/chat/${response.data.data._id}`);
      } else {
        alert('Failed to start chat with seller. Please try again.');
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
      alert('Failed to contact seller. Please try again later.');
    }
  };

  // Filter auctions based on search query
  const filteredAuctions = effectiveSearchQuery 
    ? auctions.filter(auction => 
        auction.product?.name?.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        auction.product?.description?.toLowerCase().includes(effectiveSearchQuery.toLowerCase()) ||
        auction.seller?.username?.toLowerCase().includes(effectiveSearchQuery.toLowerCase())
      )
    : auctions;

  // Sort auctions by creation time (newest first)
  const sortedAuctions = [...filteredAuctions].sort((a, b) => {
    // First sort by status (active first, then ended)
    if (!a.hasEnded && b.hasEnded) return -1;
    if (a.hasEnded && !b.hasEnded) return 1;
    
    // Then sort by start time (newest first)
    return new Date(b.startTime) - new Date(a.startTime);
  });

  const getImageUrl = (auction) => {
    console.log('Getting image URL for auction:', auction._id);
    console.log('Product data:', auction.product);
    
    // Check if we have a product with images array
    if (auction.product?.images?.length > 0) {
      console.log('Using first image from images array:', auction.product.images[0]);
      const imagePath = auction.product.images[0];
      return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
    }
    
    // Check if we have a product with an image cover
    if (auction.product?.imageCover) {
      console.log('Using image cover:', auction.product.imageCover);
      const imagePath = auction.product.imageCover;
      return imagePath.startsWith('http') ? imagePath : `${BACKEND_URL}${imagePath}`;
    }
    
    // If no product image is found, try using the auction's own image if it exists
    if (auction.image) {
      console.log('Using auction image:', auction.image);
      return auction.image.startsWith('http') ? auction.image : `${BACKEND_URL}${auction.image}`;
    }
    
    console.log('No valid image found, using default logo');
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
            {sortedAuctions.map(auction => {
              const isEnded = auction.status === 'ended' || auction.hasEnded;
              return (
                <div key={auction._id} className={`auction-card ${isEnded ? 'auction-ended' : ''}`}>
                  <div className="auction-image" onClick={() => handleViewAuction(auction._id)}>
                    <img 
                      src={getImageUrl(auction)} 
                      alt={auction.product?.name || "Auction item"} 
                      onError={(e) => {
                        e.target.src = Re_store_logo_login;
                        e.target.onerror = null;
                      }}
                    />
                    <span className={`time-left ${isEnded ? 'ended' : ''}`}>
                      {isEnded ? 'Auction Ended' : calculateTimeLeft(auction.endTime)}
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
                        <span>{isEnded ? 'Final Price' : 'Current Price'}</span>
                        <strong>₹{auction.currentPrice}</strong>
                      </div>
                    </div>

                    <div className="auction-footer">
                      <span className="seller">By {getSellerName(auction)}</span>
                      
                      {isEnded ? (
                        <div className="auction-status">
                          {auction.winner ? (
                            <>
                              <span className="winner-tag">Won by: {auction.winner}</span>
                            </>
                          ) : (
                            <span className="no-bids">No bids received</span>
                          )}
                        </div>
                      ) : (
                        <div className="auction-actions">
                          <button 
                            className="bid-button" 
                            onClick={() => handleViewAuction(auction._id)}
                          >
                            Place Bid
                          </button>
                          <button 
                            className="contact-seller-button" 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleContactSeller(auction);
                            }}
                          >
                            Contact Seller
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionPage;