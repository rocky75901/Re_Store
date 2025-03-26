import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from './layout';
import './orderSummary.css';
import SuccessMessage from '../../components/SuccessMessage';
import axios from 'axios';

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Get order data from location state or localStorage
    if (location.state) {
      setOrderData(location.state);
    } else {
      const savedOrder = localStorage.getItem('currentOrder');
      if (savedOrder) {
        setOrderData(JSON.parse(savedOrder));
      }
    }
    setLoading(false);
  }, [location.state]);

  const handleSubmit = async () => {
    try {
      // Get username from sessionStorage
      const userStr = sessionStorage.getItem('user');
      if (!userStr) {
        throw new Error('User not found');
      }
      const user = JSON.parse(userStr);
      const username = user.username || user.email.split('@')[0];

      // Create order object with current orderData
      const order = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        items: orderData.items,
        total: orderData.totalAmount,
        shippingAddress: orderData.shippingAddress
      };

      // Delete products from database
      for (const item of orderData.items) {
        try {
          await axios.delete(`http://localhost:3000/api/v1/products/${item.productId}`, {
            headers: {
              'Authorization': `Bearer ${sessionStorage.getItem('token')}`
            }
          });
          console.log(`Successfully deleted product ${item.productId}`);
        } catch (deleteError) {
          console.error(`Error deleting product ${item.productId}:`, deleteError);
        }
      }

      // Save order to localStorage
      const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      const updatedOrders = [order, ...existingOrders];
      localStorage.setItem('orders', JSON.stringify(updatedOrders));

      // Clear the cart using the backend API
      await axios.delete(
        'http://localhost:3000/api/v1/cart/clear',
        {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          data: { username }
        }
      );
      
      // Clear local storage
      localStorage.removeItem('cart');
      localStorage.removeItem('orderData');
      localStorage.removeItem('currentOrder');
      
      // Show success message
      setShowSuccess(true);
      
      // Navigate to orders page with the order data
      setTimeout(() => {
        navigate('/orders');
      }, 2000);
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order. Please try again.');
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="order-summary-container">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!orderData) {
    return (
      <Layout>
        <div className="order-summary-container">
          <div className="error">No order data found. Please try again.</div>
        </div>
      </Layout>
    );
  }

  const { items, totalAmount, shippingAddress } = orderData;

  return (
    <Layout>
      {showSuccess && (
        <SuccessMessage 
          message="Order placed successfully!" 
          onClose={() => setShowSuccess(false)} 
        />
      )}
      <div className="order-summary-container">
        <div className="order-summary-main">
          <div className="order-summary-header">
            <h1>Order Summary</h1>
            <p>Please review your order details before proceeding to payment</p>
          </div>

          <div className="order-summary-content">
            {/* Shipping Address Section */}
            <div className="order-summary-section">
              <h2>Shipping Address</h2>
              <div className="shipping-details">
                <p><strong>{shippingAddress.fullName}</strong></p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && <p>{shippingAddress.addressLine2}</p>}
                <p>{shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}</p>
                <p>{shippingAddress.country}</p>
                <p>Phone: {shippingAddress.phoneNumber}</p>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="order-summary-section">
              <h2>Order Items</h2>
              <div className="order-items">
                {items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img src={item.image} alt={item.name} />
                    </div>
                    <div className="item-details">
                      <h3>{item.name}</h3>
                      <p>Quantity: {item.quantity}</p>
                      <p>Price: ₹{item.price}</p>
                      <p>Subtotal: ₹{item.price * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total Section */}
            <div className="order-summary-section">
              <h2>Order Total</h2>
              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-summary-buttons">
            <button
              className="back-button"
              onClick={() => navigate(-1)}
            >
              Back
            </button>
            <button
              className="proceed-button"
              onClick={handleSubmit}
            >
              Place Order
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSummary; 