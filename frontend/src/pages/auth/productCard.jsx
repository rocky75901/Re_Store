import React from 'react';
import './ProductCard.css';

const ProductCard = ({ image, title, price, onViewDetails }) => {
  return (
    <div className="product-card">
      <div className="product-image">
        <img src={image} alt={title} />
      </div>
      <div className="product-info">
        <div className="price-heart-container">
          <div className="product-title-price-container">
            <div className="product-price">₹4,500</div>
            <p className="product-title">Hero Cycle</p>
          </div>
          <button className="favorite-btn">
            <i className="fa-solid fa-heart"></i>
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