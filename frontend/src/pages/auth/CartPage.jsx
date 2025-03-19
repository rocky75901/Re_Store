import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './CartPage.css';
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
      <div className="empty-cart">
        <i className="fa-solid fa-cart-shopping"></i>
        <h2>Your cart is empty</h2>
        <p>Add items to your cart to start shopping!</p>
        <button onClick={() => navigate('/')}>Continue Shopping</button>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <div className="cart-container">
        <div className="cart-header">
          <h1>Shopping Cart</h1>
          <span>{cartItems.length} items</span>
        </div>

        <div className="cart-items">
          {cartItems.map(item => (
            <div key={item._id} className="cart-item">
              <div className="item-image">
                <img src={item.image} alt={item.name} />
              </div>
              <div className="item-details">
                <h3>{item.name}</h3>
                <p className="seller">Seller: {item.seller}</p>
                <div className="item-price">₹{item.price}</div>
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
                    <i className="fa-solid fa-trash"></i>
                  </button>
                </div>
              </div>
              <div className="item-total">
                ₹{item.price * item.quantity}
              </div>
            </div>
          ))}
        </div>

        <div className="cart-summary">
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
          <button 
            className="checkout-btn"
            onClick={handleCheckout}
          >
            Proceed to Checkout
          </button>
        </div>
      </div>
    </div>
  );
};

export default CartPage; 