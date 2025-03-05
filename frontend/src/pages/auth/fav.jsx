import React, { useState } from 'react';
 import "./fav.css";
// import { Icon } from '@material-ui/core';
// import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
const ProductCard = () => {
  const [favorites, setFavorites] = useState({});

  const products = [
    {
      id: 1,
      name: 'Cricket Bat',
      price: 1100,
    //   image: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      name: 'Cooler',
      price: 6000,
    //   image: 'https://via.placeholder.com/150'
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
      {products.map((product) => (
        <div key={product.id} className="product-card">
          <img src={product.image} alt={product.name} />
          <div className="product-info">
          <h3 style={{ color: "red", fontSize: "24px" }}>{product.name}</h3>

            <p className="price">₹{product.price}</p>
            <div className="buttons">
              <button className="view-details">View Details</button>
              <button className="message">Message</button>
            </div>
            <button 
              className="favorite" 
              onClick={() => toggleFavorite(product.id)}
            >
              {/* <Icon>{favorites[product.id] ? 'favorite' : 'favorite_border'}</Icon> */}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductCard;
