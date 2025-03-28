import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faHeart as faHeartSolid,
  faHeart as faHeartRegular,
  faChevronLeft,
  faChevronRight,
  faTag,
  faGavel,
  faClock,
  faComments,
  faIndianRupeeSign,
  faInfoCircle,
  faUser
} from "@fortawesome/free-solid-svg-icons";
import Layout from "../components/layout";
import "./Auctionviewdetails.css";
import Re_store_logo_login from "../assets/Re_store_logo_login.png";
import axios from 'axios';
import { addToFavorites, removeFromFavorites } from '../services/favoritesService';

const AuctionViewDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [auction, setAuction] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');
  const [timeLeft, setTimeLeft] = useState('');
  const [isBidding, setIsBidding] = useState(false);
  const [chatRoute, setChatRoute] = useState('/messages'); // Default chat route
  // Get user ID for comparing with winner and seller
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user._id;

  // Helper function to get seller name from all possible sources
  const getSellerName = (auctionData) => {
    if (!auctionData) return "Unknown";
    
    // Case 1: Populated seller object with username
    if (auctionData.seller?.username) {
      return auctionData.seller.username;
    }
    
    // Case 2: Use sellerName string directly 
    if (auctionData.sellerName) {
      return auctionData.sellerName;
    }
    
    // Fallback to unknown if neither is available
    return "Unknown";
  };
  
  // Helper function to get winner name from all possible sources
  const getWinnerName = (auctionData) => {
    if (!auctionData) return "Unknown";
    
    // Case 1: Populated winner object with username
    if (auctionData.winner?.username) {
      return auctionData.winner.username;
    }
    
    // Case 2: Use winner string directly
    if (typeof auctionData.winner === 'string') {
      return auctionData.winner;
    }
    
    // Fallback to unknown if neither is available
    return "Unknown";
  };

  useEffect(() => {
    fetchAuction();
    
    // Check for available chat routes
    try {
      // Try to find chat route in navigation
      const allLinks = document.querySelectorAll('a');
      for (const link of allLinks) {
        const href = link.getAttribute('href');
        if (href && (href.includes('/chat') || href.includes('/message'))) {
          console.log('Found chat route:', href);
          setChatRoute(href.split('?')[0]); // Remove any query params
          break;
        }
      }
    } catch (error) {
      console.log('Unable to detect chat route, using default');
    }
  }, [id]);

  // Update time left
  useEffect(() => {
    if (!auction?.endTime) return;

    const updateTimeLeft = () => {
      const now = new Date().getTime();
      const end = new Date(auction.endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        setTimeLeft('Auction ended');
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);
      
      // Format time based on what's available
      let timeString = '';
      if (days > 0) {
        timeString += `${days}d `;
      }
      if (hours > 0 || days > 0) {
        timeString += `${hours}h `;
      }
      if (minutes > 0 || hours > 0 || days > 0) {
        timeString += `${minutes}m`;
      } else {
        // Show seconds when less than 1 minute remains
        timeString += `${seconds}s`;
      }
      
      setTimeLeft(timeString);
    };

    updateTimeLeft();
    // Update more frequently (every second) when less than a minute remains
    const interval = setInterval(updateTimeLeft, 1000);

    return () => clearInterval(interval);
  }, [auction?.endTime]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      setError(null);
      let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      // Ensure BACKEND_URL doesn't end with a slash
      if (BACKEND_URL.endsWith('/')) {
        BACKEND_URL = BACKEND_URL.slice(0, -1);
      }
      
      console.log(`Attempting to fetch auction with ID: ${id}`);
      console.log('Auction API URL:', `${BACKEND_URL}/api/v1/auctions/${id}`);
      
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/auctions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data?.status === 'success') {
        console.log('Auction data received successfully:', response.data.data);
        setAuction(response.data.data);
        setIsFavorite(response.data.data.isFavorite || false);
      } else {
        console.error('Auction response not successful:', response.data);
        throw new Error(response.data?.message || 'Auction not found');
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      console.error('Error response details:', error.response?.data);
      
      // More detailed error message
      const errorMsg = error.response?.data?.message || 
                       error.response?.statusText || 
                       error.message || 
                       'Failed to load auction details';
                       
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const images = auction?.product?.images?.length > 0 
    ? auction.product.images 
    : [Re_store_logo_login];

  const handleContactSeller = async () => {
    try {
      let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      // Ensure BACKEND_URL doesn't end with a slash
      if (BACKEND_URL.endsWith('/')) {
        BACKEND_URL = BACKEND_URL.slice(0, -1);
      }
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Debug seller information
      console.log('Auction data:', auction);
      console.log('Seller info:', auction.seller);
      
      // For ended auctions, seller might be in a different location than active auctions
      let sellerId;
      
      // Try all possible locations where seller ID might be stored
      if (auction.seller?._id) {
        // Case 1: Populated seller object with _id
        sellerId = auction.seller._id;
        console.log('Using seller._id from auction object:', sellerId);
      } else if (typeof auction.seller === 'string') {
        // Case 2: Direct seller ID string
        sellerId = auction.seller;
        console.log('Using direct seller string ID:', sellerId);
      } else if (auction.sellerId) {
        // Case 3: Using the sellerId property
        sellerId = auction.sellerId;
        console.log('Using auction.sellerId:', sellerId);
      } else if (auction._doc?.seller) {
        // Case 4: Check if seller is in _doc (mongoose document structure)
        sellerId = typeof auction._doc.seller === 'string' ? 
                  auction._doc.seller : 
                  auction._doc.seller._id;
        console.log('Using seller from _doc:', sellerId);
      }
      
      // If still no seller ID, try other properties
      if (!sellerId) {
        // Try to extract from sellerName if available (some endpoints include this)
        if (auction.sellerName) {
          console.log('No seller ID found, but sellerName exists:', auction.sellerName);
          alert(`Unable to contact seller directly. Seller username: ${auction.sellerName}`);
          return;
        }
        
        console.error('Seller information is missing entirely');
        alert('Seller information is missing. Please try again later.');
        return;
      }

      console.log('Attempting to contact seller with ID:', sellerId);
      // Use "chat" (singular) instead of "chats" (plural)
      console.log('Chat API URL:', `${BACKEND_URL}/api/v1/chat/with-user/${sellerId}`);

      // Use axios instead of fetch for consistency with other API calls
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chat/with-user/${sellerId}`,
        {}, // Empty body, just need the token and sellerId in URL
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Chat API response:', response.data);

      if (response.data?.status === 'success' && response.data?.data) {
        // Get chat data and chat ID for navigation
        const chatData = response.data.data;
        const chatId = chatData._id;
        console.log('Navigating to messages with seller ID:', sellerId, 'and chat ID:', chatId);
        
        // Use both approaches for better compatibility:
        // 1. Pass state for modern React Router
        // 2. Include chatId as URL parameter for fallback
        navigate(`/messages?chatId=${chatId}`, {
          state: {
            sellerId: sellerId,
            openChat: true
          }
        });
      } else {
        console.error('Invalid response from chat API:', response.data);
        alert('Could not start chat with seller. Please try again later.');
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
      console.error('Error details:', error.response?.data);
      alert('Error connecting to seller. Please try again later.');
    }
  };

  const handleFavoriteClick = async () => {
    try {
      if (isFavorite) {
        await removeFromFavorites(id);
      } else {
        await addToFavorites(id);
      }
      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      if (error.message.includes('Please log in')) {
        navigate('/login');
      }
    }
  };

  const handleBid = async () => {
    // Calculate minimum bid based on current price and bid increment
    const minimumBid = auction.currentPrice + (auction.bidIncrement || 10);
    
    if (!bidAmount || Number(bidAmount) < minimumBid) {
      setBidError(`Bid must be at least ₹${minimumBid} (current bid + ₹${auction.bidIncrement || 10})`);
      return;
    }

    try {
      setIsBidding(true);
      setBidError('');
      
      // Get user information
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        navigate('/login');
        return;
      }

      // Log user info for debugging
      console.log('User from session:', user);
      console.log('User ID:', user._id);

      let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      // Ensure BACKEND_URL doesn't end with a slash
      if (BACKEND_URL.endsWith('/')) {
        BACKEND_URL = BACKEND_URL.slice(0, -1);
      }

      console.log('Bid API URL:', `${BACKEND_URL}/api/v1/auctions/${id}/bid`);
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auctions/${id}/bid`,
        { 
          bidAmount: Number(bidAmount),
          bidderId: user._id,
          bidderName: user.username || 'Anonymous Bidder'
        },
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.data?.status === 'success') {
        // Update auction data with new bid
        setAuction(response.data.data);
        setBidAmount('');
        setBidError('');
      }
    } catch (error) {
      console.error('Error placing bid:', error);
      // Log the complete error for debugging
      console.error('Complete error object:', error);
      console.error('Response data:', error.response?.data);
      
      setBidError(error.response?.data?.message || 'Failed to place bid');
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setIsBidding(false);
    }
  };

  const handlePrevImage = () => {
    setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const handleNextImage = () => {
    setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  // Function to handle messaging a specific user
  const handleMessageUser = async (userId) => {
    try {
      let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      // Ensure BACKEND_URL doesn't end with a slash
      if (BACKEND_URL.endsWith('/')) {
        BACKEND_URL = BACKEND_URL.slice(0, -1);
      }
      
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      console.log('Raw winner data:', userId);
      console.log('Auction winner info:', auction.winner, auction.winnerId);
      
      // Try to get a valid user ID from various possible sources
      let targetUserId = userId;
      
      if (!targetUserId && auction.winnerId) {
        targetUserId = auction.winnerId;
        console.log('Using auction.winnerId:', targetUserId);
      } else if (!targetUserId && auction.winner && typeof auction.winner === 'object' && auction.winner._id) {
        targetUserId = auction.winner._id;
        console.log('Using auction.winner._id:', targetUserId);
      }
      
      if (!targetUserId) {
        console.error('User ID is missing');
        alert('Cannot contact user. User information is missing.');
        return;
      }

      console.log('Attempting to message user with ID:', targetUserId);
      // Use "chat" (singular) instead of "chats" (plural)
      console.log('Chat API URL:', `${BACKEND_URL}/api/v1/chat/with-user/${targetUserId}`);

      // Use axios instead of fetch for consistency
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/chat/with-user/${targetUserId}`,
        {}, // Empty body, just need the token and userId in URL
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Chat API response for messaging user:', response.data);

      if (response.data?.status === 'success' && response.data?.data) {
        // Get chat data and chat ID for navigation
        const chatData = response.data.data;
        const chatId = chatData._id;
        console.log('Navigating to messages with user ID:', targetUserId, 'and chat ID:', chatId);
        
        // Use both approaches for better compatibility:
        // 1. Pass state for modern React Router
        // 2. Include chatId as URL parameter for fallback
        navigate(`/messages?chatId=${chatId}`, {
          state: {
            sellerId: targetUserId, // We reuse the sellerId property for consistency
            openChat: true
          }
        });
      } else {
        console.error('Failed to create/find chat:', response.data);
        alert('Could not start conversation. Please try again later.');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
      console.error('Error details:', error.response?.data);
      alert('Error connecting to user. Please try again later.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading auction details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !auction) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error || 'Auction not found'}</p>
          <button onClick={fetchAuction} className="retry-button">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="product-details-container">
        {/* Image Section */}
        <div className="product-images-section">
          <div className="main-image-container">
            <button 
              className={`favorite-btn ${isFavorite ? "active" : ""}`}
              onClick={handleFavoriteClick}
            >
              <FontAwesomeIcon icon={isFavorite ? faHeartSolid : faHeartRegular} />
            </button>
            <img
              src={images[currentImage]}
              alt={auction.product?.name || "Product"}
              className="main-image"
              onError={(e) => {
                e.target.src = Re_store_logo_login;
              }}
            />
          </div>
          {images.length > 1 && (
            <div className="thumbnail-container">
              <button 
                className="nav-btn prev" 
                onClick={handlePrevImage}
              >
                <FontAwesomeIcon icon={faChevronLeft} />
              </button>
              {images.map((img, index) => (
                <button
                  key={index}
                  className={`thumbnail ${currentImage === index ? "active" : ""}`}
                  onClick={() => setCurrentImage(index)}
                >
                  <img 
                    src={img} 
                    alt={`Thumbnail ${index + 1}`}
                    onError={(e) => {
                      e.target.src = Re_store_logo_login;
                    }}
                  />
                </button>
              ))}
              <button 
                className="nav-btn next" 
                onClick={handleNextImage}
              >
                <FontAwesomeIcon icon={faChevronRight} />
              </button>
            </div>
          )}
        </div>

        {/* Auction Info Section */}
        <div className="product-info-section">
          <h2>{auction.product?.name}</h2>

          {/* Seller information display */}
          <div className="seller-info">
            <p className="seller-username">
              <FontAwesomeIcon icon={faUser} />
              <strong>Seller:</strong> {getSellerName(auction)}
            </p>
          </div>

          <p className="price-info">
            <FontAwesomeIcon icon={faTag} />
            <strong>Starting Bid:</strong> ₹{auction.startingPrice}/-
          </p>
          <p className="price-info">
            <FontAwesomeIcon icon={faGavel} />
            <strong>Current Bid:</strong> ₹{auction.currentPrice}/-
          </p>

          <p className="price-info">
            <FontAwesomeIcon icon={faTag} />
            <strong>Bid Increment:</strong> ₹{auction.bidIncrement || 10}/-
          </p>

          <p className="price-info">
            <FontAwesomeIcon icon={faGavel} />
            <strong>Minimum Next Bid:</strong> ₹{auction.currentPrice + (auction.bidIncrement || 10)}/-
          </p>

          <p className="auction-timer">
            <FontAwesomeIcon icon={faClock} />
            {timeLeft}
          </p>

          {/* Only show message seller button for active auctions or when the user is the winner but not showing if we have winner actions below */}
          {auction.status === 'active' && (
            <button 
              className="message-btn" 
              onClick={handleContactSeller}
            >
              <FontAwesomeIcon icon={faComments} />
              MESSAGE SELLER ({getSellerName(auction)})
            </button>
          )}

          {auction.status === 'ended' ? (
            <div className="auction-ended-banner">
              <h3>Auction Ended</h3>
              {auction.bids && auction.bids.length > 0 ? (
                <div className="auction-results">
                  <p className="winner-info">
                    <strong>Winner:</strong> {getWinnerName(auction)}
                  </p>
                  <p className="final-price">
                    <strong>Final Price:</strong> ₹{auction.finalPrice || auction.currentPrice}
                  </p>
                  
                  {/* User-specific actions based on role */}
                  {user._id === auction.winnerId ? (
                    <div className="winner-actions">
                      <p className="congratulations">Congratulations! You won this auction.</p>
                      {/* Only show contact button if seller information exists */}
                      {(auction.seller || auction.sellerId) && (
                        <button 
                          className="contact-seller-btn"
                          onClick={handleContactSeller}
                        >
                          <FontAwesomeIcon icon={faComments} />
                          CONTACT SELLER TO ARRANGE PAYMENT ({getSellerName(auction)})
                        </button>
                      )}
                    </div>
                  ) : user._id === auction.seller?._id || (typeof auction.seller === 'string' && user._id === auction.seller) ? (
                    <div className="seller-actions">
                      <p>Your auction has ended successfully.</p>
                      {/* Only show contact button if winner information exists */}
                      {(auction.winnerId || (typeof auction.winner === 'object' && auction.winner?._id)) && (
                        <button 
                          className="contact-winner-btn"
                          onClick={() => handleMessageUser(auction.winnerId)}
                        >
                          <FontAwesomeIcon icon={faComments} />
                          CONTACT WINNER ({getWinnerName(auction)})
                        </button>
                      )}
                    </div>
                  ) : (
                    <p className="auction-closed-message">This auction has ended and is no longer accepting bids.</p>
                  )}
                </div>
              ) : (
                <p>This auction ended with no bids received.</p>
              )}
            </div>
          ) : (
            <div className="bid-section">
              <div className="bid-input">
                <FontAwesomeIcon icon={faIndianRupeeSign} />
                <input 
                  type="number" 
                  placeholder={`Minimum bid: ₹${auction.currentPrice + (auction.bidIncrement || 10)}`}
                  step={auction.bidIncrement || 10}
                  min={auction.currentPrice + (auction.bidIncrement || 10)}
                  value={bidAmount}
                  onChange={(e) => {
                    setBidAmount(e.target.value);
                    const minimumBid = auction.currentPrice + (auction.bidIncrement || 10);
                    if (Number(e.target.value) < minimumBid) {
                      setBidError(`Bid must be at least ₹${minimumBid} (current bid + ₹${auction.bidIncrement || 10})`);
                    } else {
                      setBidError('');
                    }
                  }}
                />
              </div>
              {bidError && <div className="bid-error">{bidError}</div>}
              <button 
                className="place-bid-btn"
                onClick={handleBid}
                disabled={isBidding}
              >
                <FontAwesomeIcon icon={faGavel} />
                {isBidding ? 'PLACING BID...' : 'PLACE BID'}
              </button>
            </div>
          )}

          <div className="product-description">
            <h3>
              <FontAwesomeIcon icon={faInfoCircle} />
              Description:
            </h3>
            <p>{auction.product?.description || "No description available"}</p>
          </div>
          
          {/* Bid History Section */}
          <div className="bid-history">
            <h3>
              <FontAwesomeIcon icon={faGavel} />
              Bid History:
            </h3>
            {auction.bids && auction.bids.length > 0 ? (
              <div className="bid-list">
                {[...auction.bids].reverse().map((bid, index) => (
                  <div key={index} className="bid-item">
                    <span className="bidder">{bid.bidder}</span>
                    <span className="bid-amount">₹{bid.amount}</span>
                    <span className="bid-time">{new Date(bid.timestamp).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p>No bids yet. Be the first to bid!</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionViewDetails;
