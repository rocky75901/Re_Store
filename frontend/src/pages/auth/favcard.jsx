import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { getFavorites, removeFromFavorites } from './favoritesService';
import restoreLogo from '../../assets/Re_store_logo_login.png';
import "./favcard.css";

const FavCard = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      
      if (response?.data?.items) {
        const processedFavorites = response.data.items.map(item => {
          // Ensure we have the correct product data structure
          const product = typeof item.product === 'object' ? item.product : {
            _id: item.product,
            name: item.name,
            imageCover: item.imageCover,
            sellingPrice: item.sellingPrice
          };
          
          return {
            ...item,
            product,
            imageUrl: product.imageCover || item.image || 'https://via.placeholder.com/150'
          };
        });
        
        setFavorites(processedFavorites);
      } else {
        setFavorites([]);
      }
      setError(null);
    } catch (error) {
      console.error('Error fetching favorites:', error);
      setError(error.message);
      if (error.message.includes('Please log in')) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (productId) => {
    try {
      await removeFromFavorites(productId);
      // Update local state immediately for better UX
      setFavorites(prev => prev.filter(item => 
        (typeof item.product === 'object' ? item.product._id : item.product) !== productId
      ));
    } catch (error) {
      console.error('Error removing favorite:', error);
      // If there's an error, refresh the favorites list
      fetchFavorites();
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="loading">
        <div className="loading-spinner"></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
        <button onClick={fetchFavorites} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  if (!favorites.length) {
    return (
      <div className="no-favorites">
        <p>You haven't added any favorites yet.</p>
        <button onClick={() => navigate('/home')} className="browse-button">
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="product-list">
      <div className="products">
        {favorites.map((item) => (
          <div key={typeof item.product === 'object' ? item.product._id : item.product} className="product-card-fav">
            <img 
              src={item.imageUrl} 
              alt={item.name || 'Product'} 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = 'https://via.placeholder.com/150';
              }}
            />
            <div className="product-info">
              <h3>{item.name}</h3>
              <p className="price">₹{item.sellingPrice}</p>
              <div className="buttons">
                <button 
                  className="view-details"
                  onClick={() => handleViewDetails(typeof item.product === 'object' ? item.product._id : item.product)}
                >
                  View Details
                </button>
              </div>
              <button 
                className="favorite" 
                onClick={() => handleRemoveFavorite(typeof item.product === 'object' ? item.product._id : item.product)}
              >
                <FontAwesomeIcon icon={faHeartSolid} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavCard;
