
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faHeart as faHeartSolid,
  faChevronLeft,
  faChevronRight,
  faTag,
  faGavel,
  faClock,
  faComments,
  faIndianRupeeSign,
  faInfoCircle
} from '@fortawesome/free-solid-svg-icons';
import { faHeart as faHeartRegular } from '@fortawesome/free-regular-svg-icons';
import "./Auctionviewdetails.css";
import Layout from "./layout";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";

const AuctionViewDetails = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidError, setBidError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      setError(null);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      
      const data = await response.json();
      if (data?.data?.product) {
        setProduct(data.data.product);
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const images = product?.images?.length > 0 
    ? product.images 
    : [Re_store_logo_login, Re_store_logo_login, Re_store_logo_login];

  const handleContactSeller = () => {
    navigate('/messages', { state: { sellerId: product?.sellerId } });
  };

  const toggleFavorite = () => {
    setIsFavorite(prev => !prev);
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
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error || !product) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error || 'Product not found'}</p>
          <button onClick={fetchProduct} className="retry-button">
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
              onClick={toggleFavorite}
              aria-label="Add to favorites"
            >
              <FontAwesomeIcon 
                icon={isFavorite ? faHeartSolid : faHeartRegular} 
                className="favorite-icon"
              />
            </button>
            <img
              src={images[currentImage]}
              alt="Product main view"
              className="main-image"
              onError={(e) => {
                e.target.src = Re_store_logo_login;
              }}
            />
          </div>
          <div className="thumbnail-container">
            <button 
              className="nav-btn prev" 
              onClick={handlePrevImage}
              aria-label="Previous image"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            {images.map((img, index) => (
              <button
                key={index}
                className={`thumbnail ${currentImage === index ? "active" : ""}`}
                onClick={() => setCurrentImage(index)}
                aria-label={`View image ${index + 1}`}
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
              aria-label="Next image"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        {/* Product Info Section */}
        <div className="product-info-section">
          <h2>{product.name}</h2>

          <p className="price-info">
            <FontAwesomeIcon icon={faTag} />
            <strong>Base Price:</strong> ₹{product.buyingPrice}/-
          </p>
          <p className="price-info">
            <FontAwesomeIcon icon={faGavel} />
            <strong>Current Bid:</strong> ₹{product.sellingPrice}/-
          </p>

          <p className="auction-timer">
            <FontAwesomeIcon icon={faClock} />
            Ends in <span className="red-text">3d 9h</span>
          </p>

          <button className="message-btn" onClick={handleContactSeller}>
            <FontAwesomeIcon icon={faComments} />
            MESSAGE
          </button>

          <div className="bid-section">
            <div className="bid-input">
              <FontAwesomeIcon icon={faIndianRupeeSign} />
              <input 
                type="number" 
                placeholder="Enter your bid"
                step="10"
                min={product.sellingPrice + 10}
                value={bidAmount}
                onChange={(e) => {
                  setBidAmount(e.target.value);
                  if (Number(e.target.value) <= product.sellingPrice) {
                    setBidError(`Bid must be higher than current bid (₹${product.sellingPrice})`);
                  } else {
                    setBidError('');
                  }
                }}
              />
            </div>
            {bidError && <div className="bid-error">{bidError}</div>}
            <button 
              className="place-bid-btn"
              onClick={() => {
                if (!bidAmount || Number(bidAmount) <= product.sellingPrice) {
                  setBidError(`Bid must be higher than current bid (₹${product.sellingPrice})`);
                  return;
                }
                // TODO: Handle bid submission
              }}
            >
              <FontAwesomeIcon icon={faGavel} />
              PLACE BID
            </button>
          </div>

          <div className="product-description">
            <h3>
              <FontAwesomeIcon icon={faInfoCircle} />
              Description:
            </h3>
            <p>{product.description || "No description available"}</p>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AuctionViewDetails;
