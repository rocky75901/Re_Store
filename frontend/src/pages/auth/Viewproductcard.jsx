import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Viewproductcard.css";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";

const ProductDetails = ({ product }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  
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

  const handleContactSeller = () => {
    // Navigate to messages with seller ID
    navigate('/messages', { 
      state: { 
        sellerId: product.sellerId
      }
    });
  };

  return (
   <>
    <div className="product-details-container">
      <div className="product-images-section">
        <h1>{product?.name || "Product Name"}</h1>
        <div className="main-image-container">
          <button className="favorite-btn">
            <i className="fa-regular fa-heart"></i>
          </button>
          <img
            src={images[currentImage]}
            alt={product?.name}
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
          <h2>Price: ₹{product?.sellingPrice || "0"}/-</h2>
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
          <p>{product?.description || "No description available"}</p>
          
          <div className="product-details">
            <p><strong>Condition:</strong> {product?.condition || "Not specified"}</p>
            <p><strong>Used for:</strong> {product?.usedFor || "0"} months</p>
            <p><strong>Original Price:</strong> ₹{product?.buyingPrice || "0"}/-</p>
          </div>
        </div>
      </div>
    </div>
    </>
  );
};

export default ProductDetails;
