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
      console.log('Complete favorites response:', JSON.stringify(response, null, 2));
      
      // Enhanced logging to see the exact structure
      if (response.data && response.data.items && response.data.items.length > 0) {
        console.log('First favorite item structure:', JSON.stringify(response.data.items[0], null, 2));
        
        // Log specific image fields to debug
        const firstItem = response.data.items[0];
        console.log('Item image fields:', {
          image: firstItem.image,
          imageCover: firstItem.imageCover,
          product: typeof firstItem.product === 'object' ? 
            { 
              id: firstItem.product._id,
              imageCover: firstItem.product.imageCover,
              images: firstItem.product.images
            } : firstItem.product
        });
      }
      
      // Process the favorites to ensure proper image path
      const processedFavorites = (response.data.items || []).map(item => {
        // Log each item's image paths
        console.log(`Processing favorite item ${item.name || 'unknown'}:`, {
          itemId: item.product,
          image: item.image,
          imageCover: item.imageCover,
          productObject: item.product && typeof item.product === 'object' ? 'exists' : 'not an object'
        });
        
        return item;
      });
      
      setFavorites(processedFavorites);
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
  
  // Updated getImageUrl function that directly uses the product ID
  const getImageUrl = (item) => {
    // Try to get image path from various possible locations
    console.log('Getting image for:', item);
    
    // If we have a product object with imageCover
    if (item.product && typeof item.product === 'object' && item.product.imageCover) {
      const imagePath = item.product.imageCover;
      console.log('Using product.imageCover:', imagePath);
      
      // Handle different image path formats
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      return `${BACKEND_URL}/img/products/${imagePath}`;
    }
    
    // If the item itself has an image property
    if (item.image) {
      console.log('Using item.image:', item.image);
      
      if (item.image.startsWith('http')) {
        return item.image;
      }
      
      return `${BACKEND_URL}/img/products/${item.image}`;
    }
    
    // If the item has imageCover property
    if (item.imageCover) {
      console.log('Using item.imageCover:', item.imageCover);
      
      if (item.imageCover.startsWith('http')) {
        return item.imageCover;
      }
      
      return `${BACKEND_URL}/img/products/${item.imageCover}`;
    }
    
    // Use a direct request to the product endpoint as a fallback
    const productId = typeof item.product === 'object' ? item.product._id : item.product;
    if (productId) {
      const imageUrl = `${BACKEND_URL}/uploads/products/product-${productId}-cover.jpeg`;
      console.log('Using fallback product image URL:', imageUrl);
      return imageUrl;
    }
    
    console.log('No image found, using fallback logo');
    return restoreLogo;
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
        {favorites.map((item) => {
          // Log what we're using for this item's image
          const imageUrl = getImageUrl(item);
          console.log(`Rendering item ${item.name || 'unknown'} with image URL:`, imageUrl);
          
          return (
            <div key={item.product._id || item.product} className="product-card-fav">
              <img 
                src={imageUrl}
                alt={item.name || 'Product Image'} 
                onError={(e) => {
                  console.log('Failed to load image from:', e.target.src);
                  
                  // Try different paths based on what failed
                  if (e.target.src.includes('/img/products/')) {
                    console.log('Trying uploads folder path');
                    const productId = typeof item.product === 'object' ? item.product._id : item.product;
                    e.target.src = `${BACKEND_URL}/uploads/products/product-${productId}-cover.jpeg`;
                    return;
                  }
                  
                  if (e.target.src.includes('/uploads/products/')) {
                    console.log('Trying direct API endpoint');
                    const productId = typeof item.product === 'object' ? item.product._id : item.product;
                    e.target.src = `${BACKEND_URL}/api/v1/products/${productId}/image`;
                    return;
                  }
                  
                  // Final fallback
                  e.target.src = restoreLogo;
                  e.target.onerror = null; // Prevent infinite loop
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
                onClick={() => handleRemoveFavorite(typeof item.product === 'object' ? item.product._id : item.product)}
              >
                <FontAwesomeIcon icon={faHeartSolid} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default FavCard;
