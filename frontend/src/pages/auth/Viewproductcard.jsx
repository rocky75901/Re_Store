import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Viewproductcard.css";
import Layout from "./layout"
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import { toast } from "react-hot-toast";

const ViewProductCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState(null);

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
        console.log('API Response:', data);
        
        if (data && data.status === 'success' && data.data && data.data.product) {
          const productData = data.data.product;
          console.log('Product Data:', productData);
          setProduct(productData);
          if (productData._id) {
            checkFavoriteStatus(productData._id);
          }
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

  useEffect(() => {
    const fetchUser = async () => {
      const userData = JSON.parse(localStorage.getItem('user'));
      if (userData) {
        setUser(userData);
      }
    };

    fetchUser();
  }, []);

  const checkFavoriteStatus = async (productId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.isInWishlist);
      }
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const handleFavoriteClick = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', {
        state: {
          from: `/product/${id}`,
          message: 'Please log in to add items to wishlist'
        }
      });
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/wishlist`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      setIsFavorite(!isFavorite);
    } catch (error) {
      console.error('Error updating favorites:', error);
    }
  };

  const handleAddToCart = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', {
        state: {
          from: `/product/${id}`,
          message: 'Please log in to add items to cart'
        }
      });
      return;
    }

    try {
      setAddingToCart(true);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      const response = await fetch(`${BACKEND_URL}/api/v1/cart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          productId: id,
          quantity: 1,
          price: product.sellingPrice
        })
      });

      if (!response.ok) {
        throw new Error('Failed to add to cart');
      }

      navigate('/cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
    } finally {
      setAddingToCart(false);
    }
  };

  const handleBuyNow = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login', {
        state: {
          from: `/product/${id}`,
          message: 'Please log in to purchase items'
        }
      });
      return;
    }

    navigate('/payment', {
      state: {
        productId: id,
        productName: product.name,
        amount: product.sellingPrice,
        sellerId: product.sellerId,
        type: 'direct_purchase'
      }
    });
  };

  const handleContactSeller = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (product.sellerId._id === user._id) {
      toast.error("You cannot message yourself!");
      return;
    }

    // Navigate to messages with seller's ID
    navigate('/messages', {
      state: {
        userId: product.sellerId._id
      }
    });
  };

  const getImageUrl = (imagePath) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    return imagePath ? `${BACKEND_URL}${imagePath}` : '/restore.png';
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading product details...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error}</p>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="error-container">
          <p>Product not found</p>
        </div>
      </Layout>
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
            <i className={`fas fa-heart ${isFavorite ? 'active' : ''}`}></i>
          </button>
          <img
            src={getImageUrl(currentImage || product?.imageCover)}
            alt={product?.name}
            className="main-image"
          />
        </div>
        <div className="thumbnail-container">
          {product?.imageCover && (
            <div
              className={`thumbnail ${currentImage === product.imageCover ? 'active' : ''}`}
              onClick={() => setCurrentImage(product.imageCover)}
            >
              <img src={getImageUrl(product.imageCover)} alt="Product cover" />
            </div>
          )}
          {product?.images?.map((image, index) => (
            <div
              key={index}
              className={`thumbnail ${currentImage === image ? 'active' : ''}`}
              onClick={() => setCurrentImage(image)}
            >
              <img src={getImageUrl(image)} alt={`Product view ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="product-info-section">
        <div className="price-section">
          <h2>₹{product.sellingPrice}</h2>
          {product.buyingPrice && (
            <p className="original-price">Original Price: ₹{product.buyingPrice}</p>
          )}
        </div>

        <div className="product-description">
          <h3>Description</h3>
          <p>{product.description}</p>
        </div>

        <div className="seller-info">
          <h3>Product Details</h3>
          <p><i className="fas fa-box"></i> Condition: {product.condition}</p>
          <p><i className="fas fa-clock"></i> Used for: {product.usedFor} months</p>
        </div>

        <div className="action-buttons">
          <button
            className="contact-seller"
            onClick={handleContactSeller}
            disabled={addingToCart}
          >
            <i className="fas fa-envelope"></i>
            Contact Seller
          </button>
          <button
            className="add-to-cart"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <i className="fas fa-shopping-cart"></i>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
          <button
            className="buy-now"
            onClick={handleBuyNow}
            disabled={addingToCart}
          >
            <i className="fas fa-bolt"></i>
            Buy Now
          </button>
        </div>
      </div>
    </div>

  );
};

export default ViewProductCard;
