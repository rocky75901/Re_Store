import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Viewproductcard.css";
import Layout from "./layout"
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";

const ViewProductCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(0);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch product');
        }
        const data = await response.json();
        if (data && data.data && data.data.product) {
          setProduct(data.data.product);
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        setError('Failed to load product details');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);
  
  // Use product images or fallback to placeholder
  const images = product?.images?.length > 0 
    ? product.images 
    : [Re_store_logo_login, Re_store_logo_login, Re_store_logo_login];

  const handlePrevImage = () => {
    setCurrentImage(prev => prev > 0 ? prev - 1 : images.length - 1);
  };

  const handleNextImage = () => {
    setCurrentImage(prev => prev < images.length - 1 ? prev + 1 : 0);
  };

  const handleFavoriteClick = () => {
    setIsFavorite(!isFavorite);
    // TODO: Add API call to update favorite status
  };

  const handleContactSeller = () => {
    navigate('/messages', { 
      state: { 
        sellerId: product?.sellerId
      }
    });
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p>{error}</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="error-container">
        <p>Product not found</p>
      </div>
    );
  }

  return (
    
    <div className="product-details-container">
      <div className="product-images-section">
        <h1>{product.name}</h1>
        <div className="main-image-container">
          <button 
            className={`favorite-btn ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
          </button>
          <img
            src={images[currentImage]}
            alt={product.name}
            className="main-image"
          />
        </div>
        <div className="thumbnail-container">
          <button className="nav-btn prev" onClick={handlePrevImage}>
            <i className="fa-solid fa-arrow-left"></i>
          </button>
          {images.map((img, index) => (
            <div
              key={index}
              className={`thumbnail ${currentImage === index ? "active" : ""}`}
              onClick={() => setCurrentImage(index)}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
          <button className="nav-btn next" onClick={handleNextImage}>
            <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
      </div>

      <div className="product-info-section">
        <div className="price-section">
          <h2>Price: ₹{product.sellingPrice}/-</h2>
        </div>

        <div className="action-buttons">
          <button className="contact-seller" onClick={handleContactSeller}>
            CONTACT SELLER
          </button>
          <button className="add-to-cart">
            ADD TO CART
          </button>
          <button className="buy-now">
            BUY IT NOW
          </button>
        </div>

        <div className="product-description">
          <h3>Description:</h3>
          <p>{product.description || "No description available"}</p>
          
          <div className="product-details">
            <p><strong>Condition:</strong> {product.condition || "Not specified"}</p>
            <p><strong>Used for:</strong> {product.usedFor || "0"} months</p>
            <p><strong>Original Price:</strong> ₹{product.buyingPrice || "0"}/-</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewProductCard;
