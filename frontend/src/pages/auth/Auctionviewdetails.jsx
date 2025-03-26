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
  faInfoCircle
} from "@fortawesome/free-solid-svg-icons";
import Layout from "./layout";
import "./Auctionviewdetails.css";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import axios from 'axios';
import { addToFavorites, removeFromFavorites } from './favoritesService';

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
  // Get user ID for comparing with winner and seller
  const user = JSON.parse(sessionStorage.getItem('user') || '{}');
  const userId = user._id;

  useEffect(() => {
    fetchAuction();
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
      
      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 60000); // Update every minute

    return () => clearInterval(interval);
  }, [auction?.endTime]);

  const fetchAuction = async () => {
    try {
      setLoading(true);
      setError(null);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.get(
        `${BACKEND_URL}/api/v1/auctions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );
      
      if (response.data?.status === 'success') {
        setAuction(response.data.data);
        setIsFavorite(response.data.data.isFavorite || false);
      } else {
        throw new Error('Auction not found');
      }
    } catch (error) {
      console.error('Error fetching auction:', error);
      setError(error.response?.data?.message || error.message);
    } finally {
      setLoading(false);
    }
  };

  const images = auction?.product?.images?.length > 0 
    ? auction.product.images 
    : [Re_store_logo_login];

  const handleContactSeller = async () => {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      if (!auction.seller || !auction.seller._id) {
        console.error('Seller information is missing');
        return;
      }

      // Create or find chat with the seller
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/with-user/${auction.seller._id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          // Navigate to messages page with this chat selected
          navigate(`/messages?chatId=${data.data._id}`);
        } else {
          console.error('Invalid response from chat API:', data);
        }
      } else {
        console.error('Failed to create/find chat with seller');
      }
    } catch (error) {
      console.error('Error contacting seller:', error);
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

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await axios.post(
        `${BACKEND_URL}/api/v1/auctions/${id}/bid`,
        { 
          bidAmount: Number(bidAmount),
          bidderId: user._id,
          bidderName: user.username
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
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const token = sessionStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      // Create or find chat with this user
      const response = await fetch(`${BACKEND_URL}/api/v1/chats/with-user/${userId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.status === 'success' && data.data) {
          // Navigate to messages page with this chat selected
          navigate(`/messages?chatId=${data.data._id}`);
        }
      } else {
        console.error('Failed to create/find chat');
      }
    } catch (error) {
      console.error('Error creating chat:', error);
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

          {/* Only show message seller button for active auctions or when the user is the winner */}
          {(auction.status === 'active' || (auction.status === 'ended' && auction.winnerId === user._id)) && (
            <button 
              className="message-btn" 
              onClick={handleContactSeller}
            >
              <FontAwesomeIcon icon={faComments} />
              MESSAGE SELLER ({auction.seller?.username || "Unknown"})
            </button>
          )}

          {auction.status === 'ended' ? (
            <div className="auction-ended-banner">
              <h3>Auction Ended</h3>
              {auction.bids && auction.bids.length > 0 ? (
                <div className="auction-results">
                  <p className="winner-info">
                    <strong>Winner:</strong> {auction.winner || "No winner determined"}
                  </p>
                  <p className="final-price">
                    <strong>Final Price:</strong> ₹{auction.finalPrice || auction.currentPrice}
                  </p>
                  
                  {/* User-specific actions based on role */}
                  {user._id === auction.winnerId ? (
                    <div className="winner-actions">
                      <p className="congratulations">Congratulations! You won this auction.</p>
                      <button 
                        className="contact-seller-btn"
                        onClick={handleContactSeller}
                      >
                        <FontAwesomeIcon icon={faComments} />
                        CONTACT SELLER TO ARRANGE PAYMENT
                      </button>
                    </div>
                  ) : user._id === auction.seller?._id ? (
                    <div className="seller-actions">
                      <p>Your auction has ended successfully.</p>
                      <button 
                        className="contact-winner-btn"
                        onClick={() => handleMessageUser(auction.winnerId)}
                      >
                        <FontAwesomeIcon icon={faComments} />
                        CONTACT WINNER
                      </button>
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
