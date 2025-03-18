import React, { useState } from 'react';
import "./favcard.css";
import Re_store_logo_login from '../../assets/Re_store_logo_login.png';

const FavCard = () => {
  const [favorites, setFavorites] = useState({});

  const products = [
    {
      id: 1,
      name: 'Cricket Bat',
      price: 1100,
      image: Re_store_logo_login
    },
    {
      id: 2,
      name: 'Cooler',
      price: 6000,
      image: Re_store_logo_login
    }
  ];

  const toggleFavorite = (id) => {
    setFavorites((prevFavorites) => ({
      ...prevFavorites,
      [id]: !prevFavorites[id]
    }));
  };

  return (
    <div className="product-list">
      <div className="products">
        {products.map((product) => (
          <div key={product.id} className="product-card-fav">
            <img src={product.image} alt={product.name} />
            <div className="product-info">
            <p className="price">₹{product.price}</p>
              <h3>{product.name}</h3>
              
              <div className="buttons">
                <button className="view-details">View Details</button>
                <button className="message">Message</button>
              </div>
            </div>
            <button 
              className="favorite" 
              onClick={() => toggleFavorite(product.id)}
            >
              {favorites[product.id] ? <i className="fa-solid fa-heart"></i> : <i className="fa-regular fa-heart"></i>}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavCard;
