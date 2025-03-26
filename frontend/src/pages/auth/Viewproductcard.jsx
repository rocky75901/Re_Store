import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Viewproductcard.css";
import Layout from "./layout"
import { toast } from "react-hot-toast";
import { addToCart } from "../addtocartservice";

const ViewProductCard = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [sellerName, setSellerName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [addingToCart, setAddingToCart] = useState(false);
  const [user, setUser] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

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
        
        if (data?.status === 'success' && data?.data?.product) {
          const productData = data.data.product;
          console.log('Complete product data:', JSON.stringify(productData, null, 2));
          setProduct(productData);
          
          // Set seller name directly from product data
          if (productData.sellerName) {
            setSellerName(productData.sellerName);
          }
          
          if (productData._id) {
            checkFavoriteStatus(productData._id);
          }
        } else {
          throw new Error('Product not found');
        }
      } catch (error) {
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
    const userData = JSON.parse(sessionStorage.getItem('user'));
    if (userData) {
      setUser(userData);
    }
  }, []);

  const checkFavoriteStatus = async (productId) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        setIsFavorite(false);
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/wishlist/check/${productId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setIsFavorite(data.data.isInWishlist);
      }
    } catch (error) {
      setIsFavorite(false);
    }
  };

  const handleFavoriteClick = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add items to wishlist');
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const method = isFavorite ? 'DELETE' : 'POST';
      const url = isFavorite 
        ? `${BACKEND_URL}/api/v1/wishlist/remove`
        : `${BACKEND_URL}/api/v1/wishlist`;

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ productId: id })
      });

      if (!response.ok) {
        throw new Error('Failed to update wishlist');
      }

      setIsFavorite(!isFavorite);
      toast.success(isFavorite ? 'Removed from favorites' : 'Added to favorites');
    } catch (error) {
      toast.error('Failed to update favorites');
    }
  };

  const handleAddToCart = async () => {
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to add items to cart');
      return;
    }

    try {
      setAddingToCart(true);
      await addToCart(id);
      toast.success('Added to cart');
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setAddingToCart(false);
    }
  };

  const handleContactSeller = () => {
    console.log('Contact seller clicked');
    const token = sessionStorage.getItem('token');
    if (!token) {
      toast.error('Please log in to contact seller');
      navigate('/login');
      return;
    }

    if (!product?.seller) {
      console.error('Seller ID not found:', product);
      toast.error("Seller information not available");
      return;
    }

    const currentUser = JSON.parse(sessionStorage.getItem('user'));
    if (!currentUser) {
      console.error('Current user not found');
      toast.error('Please log in to contact seller');
      navigate('/login');
      return;
    }

    if (product.seller === currentUser._id) {
      toast.error("You cannot message yourself!");
      return;
    }

    console.log('Navigating to messages with seller:', {
      sellerId: product.seller,
      sellerName: product.sellerName || 'Seller'
    });

    navigate('/messages', {
      state: {
        sellerId: product.seller,
        sellerName: product.sellerName || 'Seller',
        openChat: true
      }
    });
  };

  const handleDeleteProduct = async () => {
    if (!user || !product?.sellerId) return;

    try {
      setIsDeleting(true);
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete product');
      }

      toast.success('Product deleted successfully');
      navigate('/home');
    } catch (error) {
      toast.error('Failed to delete product');
    } finally {
      setIsDeleting(false);
    }
  };

  const getImageUrl = (imagePath) => {
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    return imagePath ? `${BACKEND_URL}${imagePath}` : '/restore.png';
  };

  if (loading) {
    return (
      <div className="loading-container-sell">
        <div className="loading-spinner-sell"></div>
        <p>Loading product details...</p>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="error-container-sell">
        <p>{error || 'Product not found'}</p>
      </div>
    );
  }

  return (
    <div className="product-details-container-sell">
      <div className="product-details-container-left-half-sell">
        <div className="product-header-sell">
          <h1>{product?.name || 'Untitled Product'}</h1>
          {user && product?.sellerId && product.sellerId._id === user._id && (
            <button
              className="delete-product-btn-sell"
              onClick={handleDeleteProduct}
              disabled={isDeleting}
            >
              <i className="fas fa-trash"></i>
              {isDeleting ? 'Deleting...' : 'Delete Product'}
            </button>
          )}
        </div>

        <div className="main-image-container-sell">
          <button
            className={`favorite-btn-sell ${isFavorite ? 'active' : ''}`}
            onClick={handleFavoriteClick}
          >
            <i className={`fa-regular fa-heart ${isFavorite ? 'active' : ''}`}></i>
          </button>
          <img
            src={getImageUrl(currentImage || product?.imageCover)}
            alt={product?.name || 'Product Image'}
            className="main-image-sell"
          />
        </div>

        <div className="thumbnail-container-sell">
          {product?.imageCover && (
            <div
              className={`thumbnail-sell ${currentImage === product.imageCover ? 'active' : ''}`}
              onClick={() => setCurrentImage(product.imageCover)}
            >
              <img src={getImageUrl(product.imageCover)} alt="Product cover" />
            </div>
          )}
          {product?.images?.map((image, index) => (
            <div
              key={index}
              className={`thumbnail-sell ${currentImage === image ? 'active' : ''}`}
              onClick={() => setCurrentImage(image)}
            >
              <img src={getImageUrl(image)} alt={`Product view ${index + 1}`} />
            </div>
          ))}
        </div>
      </div>

      <div className="product-info-section-sell">
        <div className="price-section-sell">
          <h2>₹{product.sellingPrice}</h2>
          {product.buyingPrice && (
            <p className="original-price-sell">Original Price: ₹{product.buyingPrice}</p>
          )}
        </div>

        <div className="product-description-sell">
          <h3>Description</h3>
          <p>{product?.description || 'No description available'}</p>
        </div>

          <div className="seller-info-sell">
            <h3>Product Details</h3>
            <p><i className="fas fa-user"></i> Seller: {product.sellerName || (product.seller && typeof product.seller === 'object' ? product.seller.username : 'Unknown Seller')}</p>
            <p><i className="fas fa-box"></i> Condition: {product.condition}</p>
            <p><i className="fas fa-clock"></i> Used for: {product.usedFor} months</p>
          </div>

        <div className="action-buttons-sell">
          <button
            className="contact-seller-sell"
            onClick={handleContactSeller}
            disabled={addingToCart}
          >
            <i className="fas fa-envelope"></i>
            Contact Seller
          </button>
          <button
            className="add-to-cart-sell"
            onClick={handleAddToCart}
            disabled={addingToCart}
          >
            <i className="fas fa-shopping-cart"></i>
            {addingToCart ? 'Adding...' : 'Add to Cart'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewProductCard;
