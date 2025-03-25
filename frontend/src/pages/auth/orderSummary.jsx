import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from './layout';
import './orderSummary.css';

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);

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
              onClick={() => navigate('/payment', { state: orderData })}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSummary; 