import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { getFavorites, removeFromFavorites } from './favoritesService';
import "./favcard.css";

const FavCard = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const response = await getFavorites();
      setFavorites(response.data.items || []);
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
      setFavorites(prev => prev.filter(item => item.product !== productId));
    } catch (error) {
      console.error('Error removing favorite:', error);
      // If there's an error, refresh the favorites list
      fetchFavorites();
    }
  };

  const handleViewDetails = (productId) => {
    navigate(`/product/${productId}`);
  };

  const handleMessageSeller = (sellerId) => {
    navigate('/messages', { state: { sellerId } });
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
          <div key={item.product} className="product-card-fav">
            <img 
              src={item.image || 'https://via.placeholder.com/150'} 
              alt={item.name} 
            />
            <div className="product-info">
              <h3>{item.name}</h3>
              <p className="price">₹{item.sellingPrice}</p>
              <div className="buttons">
                <button 
                  className="view-details"
                  onClick={() => handleViewDetails(item.product)}
                >
                  View Details
                </button>
                <button 
                  className="message"
                  onClick={() => handleMessageSeller(item.sellerId)}
                >
                  Message Seller
                </button>
              </div>
            </div>
            <button 
              className="favorite" 
              onClick={() => handleRemoveFavorite(item.product)}
            >
              <FontAwesomeIcon icon={faHeartSolid} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FavCard;
