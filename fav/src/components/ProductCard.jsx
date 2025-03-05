import React, { useState } from 'react';
import { Icon } from '@material-ui/core';

const ProductCard = ({ name, price, image }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <div className="product-card">
      <img src={image} alt={name} />
      <div className="product-info">
        <h3>{name}</h3>
        <p className="price">₹{price}</p>
        <div className="buttons">
          <button className="view-details">View Details</button>
          <button className="message">Message</button>
        </div>
        <button 
          className="favorite" 
          onClick={() => setIsFavorite(!isFavorite)}
        >
          <Icon>{isFavorite ? 'favorite' : 'favorite_border'}</Icon>
        </button>
      </div>
    </div>
  );
};

export default ProductCard; 