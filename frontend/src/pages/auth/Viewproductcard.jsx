import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Viewproductcard.css";
import Layout from "./layout";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";

const ProductDetails = ({ product }) => {
  const navigate = useNavigate();
  const [currentImage, setCurrentImage] = useState(0);
  const images = product?.images || [
    Re_store_logo_login,
    Re_store_logo_login,
    Re_store_logo_login,
  ];

  const handleMessageClick = () => {
    // Get the current user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Navigate to messages page with seller ID
    navigate('/messages', { 
      state: { 
        sellerId: product.sellerId // Using the sellerId from product data
      }
    });
  };

  return (
    <Layout>
    <div className="product-details-container">
      <div className="product-images-section">
        <div className="main-image-container">
          <button className="favorite-btn">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
            >
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
            </svg>
          </button>
          <img
            src={images[currentImage]}
            alt={product?.name || "Product Image"}
            className="main-image"
          />
        </div>
        <div className="thumbnail-container">
          <i
            className="fa-solid fa-arrow-left nav-btn"
            onClick={() =>
              setCurrentImage((prev) =>
                prev > 0 ? prev - 1 : images.length - 1
              )
            }
          />
          {images.map((img, index) => (
            <div
              key={index}
              className={`thumbnail ${currentImage === index ? "active" : ""}`}
              onClick={() => setCurrentImage(index)}
            >
              <img src={img} alt={`Thumbnail ${index + 1}`} />
            </div>
          ))}
          <i className="fa-solid fa-arrow-right nav-btn"
            onClick={() =>
              setCurrentImage((prev) =>
                prev < images.length - 1 ? prev + 1 : 0
              )
            }
          />
        </div>
      </div>

      <div className="product-info-section">
        <div className="top-half">
          <div className="top-left">
            <div className="product-title">
              {product?.name || "Product Name"}
            </div>

            <div className="product-price">
              <span className="label">Price:</span>
              <span className="amount">{product?.sellingPrice || "0"}/-</span>
            </div>
          </div>
          <div className="top-right">
            <div className="action-buttons">
              <button className="message-btn" onClick={handleMessageClick}>CONTACT SELLER</button>
              <button className="add-to-cart-btn">ADD TO CART</button>
              <button className="buy-now-btn">BUY IT NOW</button>
            </div>
          </div>
        </div>
        <div className="bottom-half">
          <div className="product-description">
            <h2>Description:</h2>
            <p>{product?.description || "No description available"}</p>
            <ul>
              <li>Condition: {product?.condition || "Not specified"}</li>
              <li>Used for: {product?.usedFor || "Not specified"} months</li>
              <li>Original Price: {product?.buyingPrice || "Not specified"}/-</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default ProductDetails;
