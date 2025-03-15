import React, { useState } from 'react';
import './ProductCard.css';

const ProductCard = ({ image, title, price, onFavorite , onViewDetails }) => {
    const [isFavorite, setIsFavorite] = useState(false);
  
    const handleFavoriteClick = () => {
      setIsFavorite(!isFavorite);
      if (onFavorite) {
        onFavorite(!isFavorite);
      }
    };
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={title} />
      </div>
      <div className="product-info">
        <div className="price-heart-container">
          <div className="product-title-price-container">
            <div className="product-price">₹{price}</div>
            <p className="product-title">{title}</p>
          </div>
          <button 
          className={`favorite-btn ${isFavorite ? 'active' : ''}`}
          onClick={handleFavoriteClick}
        >
          <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
        </button>
        </div>
        <button 
          className="view-details-btn"
          onClick={onViewDetails}
        >
          View Details
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 