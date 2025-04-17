import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import Layout from "../components/layout";
import Re_store_logo_login from "../assets/Re_store_logo_login.png";
import { removeFromCart, getCart } from '../services/addtocartservice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItems, setSelectedItems] = useState([]);
  const navigate = useNavigate();
  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

  // Sophisticated image URL handling function matching FavCard
  const getImageUrl = (item) => {    
    // Handle null product case
    if (!item.product) {
      return Re_store_logo_login;
    }

    // If we have a product object with imageCover
    if (typeof item.product === 'object' && item.product.imageCover) {
      const imagePath = item.product.imageCover;
      
      if (imagePath.startsWith('http')) {
        return imagePath;
      }
      
      return `${BACKEND_URL}/img/products/${imagePath}`;
    }
    
    // If the item itself has an image property
    if (item.image) {
      if (item.image.startsWith('http')) {
        return item.image;
      }
      return `${BACKEND_URL}/img/products/${item.image}`;
    }
    
    // If the item has imageCover property
    if (item.imageCover) {
      if (item.imageCover.startsWith('http')) {
        return item.imageCover;
      }
      return `${BACKEND_URL}/img/products/${item.imageCover}`;
    }
    
    // Use a direct request to the product endpoint as a fallback
    const productId = typeof item.product === 'object' ? item.product._id : item.product;
    if (productId) {
      const imageUrl = `${BACKEND_URL}/uploads/products/product-${productId}-cover.jpeg`;
      return imageUrl;
    }
    
    return Re_store_logo_login;
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      
      if (response.data && response.data.items) {      
        // Filter out items with null products and fetch product details
        const processedItems = await Promise.all(
          response.data.items.map(async (item) => {            
            // Handle null product case
            if (!item.product) {
              await removeFromCart(item._id); // Remove the item from cart
              return null;
            }

            try {
              // Check if product still exists and is available
              const productId = typeof item.product === 'object' ? item.product._id : item.product;
              const productResponse = await fetch(`${BACKEND_URL}/api/v1/products/${productId}`);
              
              if (!productResponse.ok) {
                await removeFromCart(productId); // Remove the item from cart
                return null;
              }

              const productData = await productResponse.json();
              
              // Check if product is available
              if (!productData.data.product.isAvailable) {
                await removeFromCart(productId); // Remove the item from cart
                return null;
              }

              return item;
            } catch (error) {
              await removeFromCart(item._id); // Remove the item from cart
              return null;
            }
          })
        );

        // Filter out null items (deleted or sold products)
        const validItems = processedItems.filter(item => item !== null);
        
        setCartItems(validItems);
        setSelectedItems(validItems.map(item => item.product));
      }
      setError(null);
    } catch (err) {
      setError(err.message || 'Error fetching cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      const response = await removeFromCart(productId);
      
      if (response.status === 'success') {
        // Only update UI after successful backend update
        await fetchCartItems(); // Refresh the entire cart from backend
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err) {
      
      setError(err.message || 'Error removing item');
    }
  };

  const handleItemSelect = (productId) => {
    setSelectedItems(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.length === cartItems.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map(item => item.product));
    }
  };

  const calculateSelectedSubtotal = () => {
    return cartItems
      .filter(item => selectedItems.includes(item.product))
      .reduce((total, item) => total + parseFloat(item.sellingPrice), 0);
  };

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      alert('Please select at least one item to checkout');
      return;
    }

    const selectedCartItems = cartItems.filter(item => 
      selectedItems.includes(item.product)
    );

    // Pass the selected cart items data to the shipping page
    navigate('/shipping', {
      state: {
        cartItems: selectedCartItems,
        totalAmount: calculateSelectedSubtotal()
      }
    });
  };

  if (loading) {
    return (
      <Layout showSearchBar={false} customHeaderContent={<h1 className="cart-title">Shopping Cart</h1>}>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading cart...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout showSearchBar={false} customHeaderContent={<h1 className="cart-title">Shopping Cart</h1>}>
        <div className="error-container">
          <i className="fa-solid fa-exclamation-circle"></i>
          <h2>Error loading cart</h2>
          <p>{error}</p>
          <button onClick={fetchCartItems}>Retry</button>
        </div>
      </Layout>
    );
  }

  if (!cartItems.length) {
    return (
      <Layout showSearchBar={false} customHeaderContent={<h1 className="cart-title">Shopping Cart</h1>}>
        <div className="empty-cart">
          <i className="fa-solid fa-cart-shopping"></i>
          <h2>Your cart is empty</h2>
          <p>Add some items to your cart</p>
          <button onClick={() => navigate('/home')}>Browse Products</button>
        </div>
      </Layout>
    );
  }

  const selectedSubtotal = calculateSelectedSubtotal();
  const shipping = 0; // Free shipping
  const total = selectedSubtotal + shipping;

  return (
    <Layout showSearchBar={false} customHeaderContent={<h1 className="cart-title">Shopping Cart</h1>}>
      <div className="cart-container">
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item, index) => {
              const imageUrl = getImageUrl(item);
              
              return (
                <div key={`${item.product}-${index}`} className="cart-item">
                  <div className="item-select">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item.product)}
                      onChange={() => handleItemSelect(item.product)}
                    />
                  </div>
                  <div className="item-image">
                    <img
                      src={imageUrl}
                      alt={item.name}
                      onError={(e) => {
                        
                        // Try different paths based on what failed
                        if (e.target.src.includes('/img/products/')) {
                          const productId = typeof item.product === 'object' ? item.product._id : item.product;
                          e.target.src = `${BACKEND_URL}/uploads/products/product-${productId}-cover.jpeg`;
                          return;
                        }
                        
                        if (e.target.src.includes('/uploads/products/')) {
                          const productId = typeof item.product === 'object' ? item.product._id : item.product;
                          e.target.src = `${BACKEND_URL}/api/v1/products/${productId}/image`;
                          return;
                        }
                        
                        // Final fallback
                        e.target.src = Re_store_logo_login;
                        e.target.onerror = null;
                      }}
                      className="cart-item-image"
                    />
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="seller">Price: ₹{parseFloat(item.sellingPrice).toFixed(2)}</p>
                    
                    <div className="item-actions">
                      <button 
                        className="remove-btn"
                        onClick={() => handleRemoveItem(item.product)}
                      >
                        <FontAwesomeIcon icon={faTrash} /> Remove
                      </button>
                    </div>
                  </div>
                  
                  <div className="item-total">
                    <p>₹{parseFloat(item.sellingPrice).toFixed(2)}</p>
                  </div>
                </div>
              );
            })}
            <div className="bottom-actions">
              <button 
                className="select-all-btn"
                onClick={handleSelectAll}
              >
                {selectedItems.length === cartItems.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Selected Items Subtotal</span>
                <span>₹{selectedSubtotal.toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span>Shipping</span>
                <span>{shipping === 0 ? 'Free' : `₹${shipping.toFixed(2)}`}</span>
              </div>
              <div className="summary-row total">
                <span>Total</span>
                <span>₹{total.toFixed(2)}</span>
              </div>
            </div>

            <button 
              className="checkout-btn"
              onClick={handleCheckout}
              disabled={selectedItems.length === 0}
            >
              Proceed to Checkout ({selectedItems.length} items)
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage; 