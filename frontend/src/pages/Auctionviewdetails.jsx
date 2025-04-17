import React, { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
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
import { toast } from 'react-hot-toast';
import { createOrGetChat } from '../chat/chatService';

const AuctionViewDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();
  // Get passed image URL from location state if available
  const passedImageUrl = location.state?.imageUrl;

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

      if (distance <= 0) {
        setTimeLeft('Auction Ended');
        // Update auction status if it hasn't been marked as ended
        if (auction.status !== 'ended') {
          setAuction(prev => ({ ...prev, status: 'ended', hasEnded: true }));
        }
        return;
      }

      const days = Math.floor(distance / (1000 * 60 * 60 * 24));
      const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((distance % (1000 * 60)) / 1000);

      setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s remaining`);
    };

    updateTimeLeft();
    const interval = setInterval(updateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [auction?.endTime]);

  // Check if auction has ended
  const isEnded = auction?.status === 'ended' ||
    (auction?.endTime && new Date() > new Date(auction.endTime));

  const fetchAuction = async () => {
    try {
      setLoading(true);
      setError(null);
      let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      if (BACKEND_URL.endsWith('/')) {
        BACKEND_URL = BACKEND_URL.slice(0, -1);
      }

      const response = await axios.get(
        `${BACKEND_URL}/api/v1/auctions/${id}`,
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`
          }
        }
      );

      if (response.data?.status === 'success') {
        const auctionData = response.data.data;
        if (auctionData.product) {
          if (auctionData.product.imageCover && !auctionData.product.imageCover.startsWith('http')) {
            auctionData.product.imageCover = getImageUrl(auctionData.product.imageCover);
          }
          if (auctionData.product.images && Array.isArray(auctionData.product.images)) {
            auctionData.product.images = auctionData.product.images.map(img => 
              img.startsWith('http') ? img : getImageUrl(img)
            );
          }
        }

        setAuction(auctionData);
        setCurrentImage(0);
        setIsFavorite(auctionData.isFavorite || false);
      } else {
        throw new Error(response.data?.message || 'Auction not found');
      }
    } catch (error) {
      const errorMsg = error.response?.data?.message ||
        error.response?.statusText ||
        error.message ||
        'Failed to load auction details';

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath || imagePath === '') {
      return Re_store_logo_login;
    }

    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    if (imagePath.startsWith('http')) {
      return imagePath;
    }

    if (imagePath.startsWith('/img/products/')) {
      return `${BACKEND_URL}${imagePath}`;
    }

    return `${BACKEND_URL}/img/products/${imagePath}`;
  };

  // Get all images from the auction data
  const images = React.useMemo(() => {
    if (passedImageUrl && passedImageUrl !== Re_store_logo_login) {
      return [passedImageUrl];
    }

    if (!auction) {
      return [Re_store_logo_login];
    }

    if (auction.product?.images?.length > 0) {
      return auction.product.images;
    }

    if (auction.product?.imageCover) {
      return [auction.product.imageCover];
    }

    if (auction.image) {
      return [auction.image];
    }

    return [Re_store_logo_login];
  }, [auction, auction?.product?.images, auction?.product?.imageCover, auction?.image, passedImageUrl]);

  const handleContactSeller = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to contact seller');
      return;
    }

    try {
      // Debug auction information
      console.log('Auction data:', auction);
      console.log('Seller info:', {
        seller: auction.seller,
        sellerId: auction.sellerId,
        sellerName: auction.sellerName
      });

      // Try to get seller ID in order of most likely locations
      let sellerId;
      if (auction.seller && typeof auction.seller === 'object' && auction.seller._id) {
        sellerId = auction.seller._id;
      } else if (auction.sellerId && typeof auction.sellerId === 'object' && auction.sellerId._id) {
        sellerId = auction.sellerId._id;
      } else if (typeof auction.seller === 'string') {
        sellerId = auction.seller;
      } else if (typeof auction.sellerId === 'string') {
        sellerId = auction.sellerId;
      }

      if (!sellerId) {
        console.error('Could not find seller ID in auction:', auction);
        toast.error("Could not find seller information");
        return;
      }

      console.log('Using seller ID:', sellerId);

      // Check if sellerId is a MongoDB ObjectId (24 hex chars) or a username
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(sellerId);

      if (!isMongoId) {
        console.log('Seller ID appears to be a username, not a valid MongoDB ObjectId');
        toast.error("Cannot contact this seller directly. The system doesn't support messaging by username.");
        return;
      }

      // Set up retry mechanism for chat creation
      let retryCount = 0;
      const maxRetries = 3;
      let chat = null;

      while (retryCount < maxRetries && !chat) {
        retryCount++;
        try {
          console.log(`Attempt ${retryCount}/${maxRetries}: Creating chat with seller ${sellerId}`);
          chat = await createOrGetChat(sellerId);

          if (chat) {
            console.log('Chat created/found successfully:', chat._id);
          } else {
            console.error('Failed to initialize chat - received null response');
            if (retryCount < maxRetries) {
              // Wait a bit before retrying (increasing delay for each retry)
              const delay = retryCount * 1000;
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (chatError) {
          console.error(`Error creating chat (attempt ${retryCount}/${maxRetries}):`, chatError);
          if (retryCount < maxRetries) {
            // Wait a bit before retrying (increasing delay for each retry)
            const delay = retryCount * 1000;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!chat) {
        toast.error(`Failed to initialize chat after ${maxRetries} attempts. Please try again later.`);
        return;
      }

      console.log('Chat initialized:', chat);

      // Navigate to messages with chat information
      navigate('/messages', {
        state: {
          sellerId: sellerId,
          sellerName: auction.sellerName || (auction.seller?.username) || 'Seller',
          chatId: chat._id,
          openChat: true
        }
      });
    } catch (error) {
      console.error('Error initializing chat:', error);
      if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.message || "Failed to start chat with seller");
      }
    }
  };

  const handleMessageUser = async (userId) => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to send messages');
      return;
    }

    try {
      if (!userId) {
        toast.error("User information not found");
        return;
      }

      // Check if userId is a MongoDB ObjectId (24 hex chars) or a username
      const isMongoId = /^[0-9a-fA-F]{24}$/.test(userId);

      if (!isMongoId) {
        console.log('User ID appears to be a username, not a valid MongoDB ObjectId');
        toast.error("Cannot message this user directly. The system doesn't support messaging by username.");
        return;
      }

      // Check if user is trying to message themselves
      const currentUser = JSON.parse(sessionStorage.getItem('user'));
      if (currentUser && currentUser._id === userId) {
        toast.error("You cannot message yourself");
        return;
      }

      // Set up retry mechanism for chat creation
      let retryCount = 0;
      const maxRetries = 3;
      let chat = null;

      while (retryCount < maxRetries && !chat) {
        retryCount++;
        try {
          console.log(`Attempt ${retryCount}/${maxRetries}: Creating chat with user ${userId}`);
          chat = await createOrGetChat(userId);

          if (chat) {
            console.log('Chat created/found successfully:', chat._id);
          } else {
            console.error('Failed to initialize chat - received null response');
            if (retryCount < maxRetries) {
              // Wait a bit before retrying (increasing delay for each retry)
              const delay = retryCount * 1000;
              console.log(`Waiting ${delay}ms before retry...`);
              await new Promise(resolve => setTimeout(resolve, delay));
            }
          }
        } catch (chatError) {
          console.error(`Error creating chat (attempt ${retryCount}/${maxRetries}):`, chatError);
          if (retryCount < maxRetries) {
            // Wait a bit before retrying (increasing delay for each retry)
            const delay = retryCount * 1000;
            console.log(`Waiting ${delay}ms before retry...`);
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }

      if (!chat) {
        toast.error(`Failed to initialize chat after ${maxRetries} attempts. Please try again later.`);
        return;
      }

      // Navigate to messages with chat information
      navigate('/messages', {
        state: {
          sellerId: userId,
          chatId: chat._id,
          openChat: true
        }
      });
    } catch (error) {
      console.error('Error creating chat:', error);
      if (error.response?.status === 500) {
        toast.error("Server error. Please try again later.");
      } else {
        toast.error(error.message || "Failed to start chat");
      }
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
    const minimumBid = auction.currentPrice === auction.startingPrice ? 
      auction.startingPrice : 
      auction.currentPrice + (auction.bidIncrement || 10);

    if (!bidAmount || Number(bidAmount) < minimumBid) {
      setBidError(`Bid must be at least ₹${minimumBid}`);
      return;
    }

    try {
      setIsBidding(true);
      setBidError('');

      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        navigate('/login');
        return;
      }

      let BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      if (BACKEND_URL.endsWith('/')) {
        BACKEND_URL = BACKEND_URL.slice(0, -1);
      }

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
        const updatedAuction = response.data.data;

        if (updatedAuction.product) {
          if (updatedAuction.product.imageCover && !updatedAuction.product.imageCover.startsWith('http')) {
            updatedAuction.product.imageCover = getImageUrl(updatedAuction.product.imageCover);
          }
          if (updatedAuction.product.images && Array.isArray(updatedAuction.product.images)) {
            updatedAuction.product.images = updatedAuction.product.images.map(img => 
              img.startsWith('http') ? img : getImageUrl(img)
            );
          }
        }

        setAuction(updatedAuction);
        setBidAmount('');
        setBidError('');
      }
    } catch (error) {
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
      <div className="auction-details-container">
        {/* Image carousel section */}
        <div className="image-carousel">
          <div className="main-image-container">
            <img
              src={images[currentImage]}
              alt={auction?.product?.name || "Product"}
              className="main-image"
              onError={(e) => {
                console.error('Failed to load image:', e.target.src);
                e.target.src = Re_store_logo_login;
                e.target.onerror = null; // Prevent infinite loop
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
                      console.error('Failed to load thumbnail:', e.target.src);
                      e.target.src = Re_store_logo_login;
                      e.target.onerror = null; // Prevent infinite loop
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
            <strong>{isEnded ? 'Final Price' : 'Current Bid'}:</strong> {' '}
            {auction.currentPrice === auction.startingPrice ? 
              "No bids currently" : 
              `₹${auction.currentPrice}/-`}
          </p>

          {!isEnded && (
            <>
              <p className="price-info">
                <FontAwesomeIcon icon={faTag} />
                <strong>Bid Increment:</strong> ₹{auction.bidIncrement || 10}/-
              </p>

              <p className="price-info">
                <FontAwesomeIcon icon={faGavel} />
                <strong>Minimum Next Bid:</strong> {' '}
                {auction.currentPrice === auction.startingPrice ? 
                  `₹${auction.startingPrice}/-` : 
                  `₹${auction.currentPrice + (auction.bidIncrement || 10)}/-`}
              </p>
            </>
          )}

          <p className="auction-timer">
            <FontAwesomeIcon icon={faClock} />
            {timeLeft}
          </p>

          {isEnded ? (
            <div className="auction-ended-banner">
              <h3>Auction Ended</h3>
              {auction.bids && auction.bids.length > 0 ? (
                <div className="auction-results">
                  <p className="winner-info">
                    <strong>Winner:</strong> {getWinnerName(auction)}
                  </p>
                  <p className="final-price">
                    <strong>Final Price:</strong> ₹{auction.finalPrice || auction.currentPrice}/-
                  </p>

                  {/* Show contact options only if user is winner or seller */}
                  {userId === auction.winnerId ? (
                    <div className="winner-actions">
                      <p className="congratulations">Congratulations! You won this auction.</p>
                      <button
                        className="contact-seller-btn"
                        onClick={handleContactSeller}
                      >
                        <FontAwesomeIcon icon={faComments} />
                        Contact Seller to Arrange Payment
                      </button>
                    </div>
                  ) : userId === auction.seller?._id ? (
                    <div className="seller-actions">
                      <p>Your auction has ended successfully.</p>
                      <button
                        className="contact-winner-btn"
                        onClick={() => handleMessageUser(auction.winnerId)}
                      >
                        <FontAwesomeIcon icon={faComments} />
                        Contact Winner
                      </button>
                    </div>
                  ) : (
                    <p className="auction-closed-message">
                      This auction has ended. The item was sold to {getWinnerName(auction)}.
                    </p>
                  )}
                </div>
              ) : (
                <p className="no-bids-message">This auction ended with no bids received.</p>
              )}
            </div>
          ) : (
            <>
              {/* Bidding section for active auctions */}
              <div className="bidding-section">
                <input
                  type="number"
                  value={bidAmount}
                  onChange={(e) => setBidAmount(e.target.value)}
                  placeholder={`Minimum bid: ₹${auction.currentPrice === auction.startingPrice ? 
                    auction.startingPrice : 
                    auction.currentPrice + (auction.bidIncrement || 10)}`}
                  min={auction.currentPrice === auction.startingPrice ? 
                    auction.startingPrice : 
                    auction.currentPrice + (auction.bidIncrement || 10)}
                  className="bid-input"
                />
                <button
                  className="place-bid-btn"
                  onClick={handleBid}
                  disabled={isBidding}
                >
                  {isBidding ? 'Placing Bid...' : 'Place Bid'}
                </button>
                {bidError && <p className="bid-error">{bidError}</p>}
              </div>

              <button
                className="contact-seller-btn"
                onClick={handleContactSeller}
              >
                <FontAwesomeIcon icon={faComments} />
                Contact Seller
              </button>
            </>
          )}

          <div className="product-description">
            <h3>
              <FontAwesomeIcon icon={faInfoCircle} />
              Description:
            </h3>
            <p>{auction.product?.description || "No description available"}</p>
          </div>

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
              <p>No bids yet{!isEnded && ". Be the first to bid!"}</p>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionViewDetails;