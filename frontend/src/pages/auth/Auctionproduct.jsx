import React, { useState } from 'react';
import './AuctionProduct.css';

const AuctionProduct = ({ 
  image, 
  title, 
  basePrice, 
  currentBid, 
  seller, 
  timeLeft,
  onViewDetails,
  onMessage,
  onFavorite 
}) => {
  const [isFavorite, setIsFavorite] = useState(false);

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    if (onFavorite) {
      onFavorite(!isFavorite);
    }
  };

  return (
    <div className="auction-product">
      <div className="auction-product-image">
        <img src={image} alt={title} />
        <button 
          className={`favorite-button ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
        </button>
      </div>
      
      <div className="auction-product-info">
        <div className="auction-product-header">
          <h3 className="auction-product-title">{title}</h3>
          <div className="auction-time-left">
            <i className="fa-regular fa-clock"></i>
            <span>Ends in {timeLeft}</span>
          </div>
        </div>

        <div className="auction-product-pricing">
          <div className="price-info">
            <div className="base-price">
              <span className="label">Base Price:</span>
              <span className="amount">₹{basePrice}</span>
            </div>
            <div className="current-bid">
              <span className="label">Current Bid:</span>
              <span className="amount">₹{currentBid}</span>
            </div>
          </div>
          <div className="seller-info">
            <span className="label">Sold by</span>
            <span className="seller-name">{seller}</span>
          </div>
        </div>

        <div className="auction-product-actions">
          <button 
            className="view-details-button"
            onClick={onViewDetails}
          >
            View Details
          </button>
          <button 
            className="message-button"
            onClick={onMessage}
          >
            Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuctionProduct;
