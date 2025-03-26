import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import Layout from "./layout";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";
import { removeFromCart, getCart } from '../addtocartservice';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTrash } from '@fortawesome/free-solid-svg-icons';

const CartPage = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCartItems();
  }, []);

  const fetchCartItems = async () => {
    try {
      setLoading(true);
      const response = await getCart();
      console.log('Cart items:', response.data); // Debug log
      if (response.data && response.data.items) {
        setCartItems(response.data.items);
      }
      setError(null);
    } catch (err) {
      console.error('Error fetching cart:', err); // Debug log
      setError(err.message || 'Error fetching cart items');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (productId) => {
    try {
      console.log('Removing product ID:', productId); // Debug log
      const response = await removeFromCart(productId);
      
      if (response.status === 'success') {
        // Only update UI after successful backend update
        await fetchCartItems(); // Refresh the entire cart from backend
      } else {
        throw new Error('Failed to remove item from cart');
      }
    } catch (err) {
      console.error('Error removing item:', err); // Debug log
      setError(err.message || 'Error removing item');
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.sellingPrice) || 0;
      return total + price;
    }, 0);
  };

  const handleCheckout = () => {
    // Pass the cart items data to the shipping page
    navigate('/shipping', {
      state: {
        cartItems: cartItems,
        totalAmount: total
      }
    });
  };

  if (loading) {
    return (
      <Layout>
        <div className="loading">
          <div className="loading-spinner"></div>
          <p>Loading your Cart...</p>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="error-container">
          <p>{error}</p>
          <button onClick={fetchCartItems} className="retry-button">
            Retry
          </button>
        </div>
      </Layout>
    );
  }

  if (!cartItems.length) {
    return (
      <Layout>
        <div className="no-cart">
          <p>Your cart is empty.</p>
          <button onClick={() => navigate('/home')} className="browse-button">
            Browse Products
          </button>
        </div>
      </Layout>
    );
  }

  const subtotal = calculateSubtotal();
  const shipping = 0; // Free shipping
  const total = subtotal + shipping;

  return (
    <Layout>
      <div className="cart-container">
        <h1>Shopping Cart</h1>
        
        <div className="cart-content">
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div key={`${item.product}-${index}`} className="cart-item">
                <div className="item-image">
                  <img src={item.image || Re_store_logo_login} alt={item.name} />
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
            ))}
          </div>

          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-details">
              <div className="summary-row">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
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
            >
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CartPage; 