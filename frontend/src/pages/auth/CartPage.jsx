import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
import Layout from "./layout";
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";

const CartPage = () => {
  const navigate = useNavigate();
  // Sample cart data - will be replaced with backend data later
  const [cartItems, setCartItems] = useState([
    {
      _id: '1',
      name: 'Sample Product 1',
      price: 799,
      quantity: 1,
      image: Re_store_logo_login,
      seller: 'John Doe'
    },
    {
      _id: '2',
      name: 'Sample Product 2',
      price: 1299,
      quantity: 2,
      image: Re_store_logo_login,
      seller: 'Jane Smith'
    }
  ]);

  const updateQuantity = (itemId, newQuantity) => {
    if (newQuantity < 1) return;
    setCartItems(items =>
      items.map(item =>
        item._id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeItem = (itemId) => {
    setCartItems(items => items.filter(item => item._id !== itemId));
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCheckout = () => {
    navigate('/checkout');
  };

  if (cartItems.length === 0) {
    return (
      <Layout>
      <div className="empty-cart">
        <i className="fa-solid fa-cart-shopping"></i>
        <h2>Your cart is empty</h2>
        <p>Add items to your cart to start shopping</p>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
      </Layout>
    );
  }

  return (
    <Layout>
    <div className="cart-container">
      <h1>Shopping Cart</h1>
      
      <div className="cart-content">
        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="seller">Seller: {item.seller}</p>
                <p className="price">₹{item.price}</p>
                
                <div className="item-actions">
                  <div className="quantity-controls">
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item._id, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>
                  
                  <button 
                    className="remove-btn"
                    onClick={() => removeItem(item._id)}
                  >
                    <i className="fa-solid fa-trash"></i> Remove
                  </button>
                </div>
              </div>
              
              <div className="item-total">
                <p>₹{item.price * item.quantity}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
          <h2>Order Summary</h2>
          
          <div className="summary-details">
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
            <div className="summary-row">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{calculateSubtotal()}</span>
            </div>
          </div>

          <button 
            className="checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>

          <button 
            className="continue-shopping"
            onClick={() => navigate('/')}
          >
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
    </Layout>
  );
};

export default CartPage; 