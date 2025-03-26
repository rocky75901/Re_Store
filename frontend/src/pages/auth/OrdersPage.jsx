import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from './layout';
import './OrdersPage.css';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      // Get orders from localStorage
      const savedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      
      // Filter out any invalid orders
      const validOrders = savedOrders.filter(order => 
        order && 
        order.items && 
        Array.isArray(order.items) && 
        order.items.length > 0 &&
        order.shippingAddress
      );
      
      // Sort orders by date (newest first)
      const sortedOrders = validOrders.sort((a, b) => {
        return new Date(b.date) - new Date(a.date);
      });
      
      setOrders(sortedOrders);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="orders-container">
          <div className="loading">Loading your orders...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="orders-container">
          <div className="error">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!orders.length) {
    return (
      <Layout>
        <div className="orders-container">
          <div className="no-orders">
            <h2>No Orders Yet</h2>
            <p>Start shopping to see your orders here!</p>
            <button onClick={() => navigate('/products')} className="shop-now-btn">
              Shop Now
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="orders-container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        <div className="orders-list">
          {orders.map(order => (
            <div key={order.id} className="order-card">
              <div className="order-header" onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}>
                <div className="order-info">
                  <h3>Order #{order.id}</h3>
                  <p className="order-date">
                    {new Date(order.date).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-total">
                  <span>Total: ₹{order.total}</span>
                </div>
              </div>

              {selectedOrder?.id === order.id && (
                <div className="order-details">
                  {/* Products Section */}
                  <div className="order-section">
                    <h4>Products</h4>
                    <div className="order-items">
                      {order.items && Array.isArray(order.items) && order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-image">
                            <img src={item.image} alt={item.name} />
                          </div>
                          <div className="item-details">
                            <h5>{item.name}</h5>
                            <div className="item-meta">
                              <span>Quantity: {item.quantity}</span>
                              <span className="item-price">₹{item.price}</span>
                            </div>
                            <p className="item-subtotal">
                              Subtotal: ₹{item.price * item.quantity}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Shipping Address Section */}
                  <div className="order-section">
                    <h4>Shipping Address</h4>
                    <div className="shipping-details">
                      {order.shippingAddress ? (
                        <>
                          <p><strong>{order.shippingAddress.fullName}</strong></p>
                          <p>{order.shippingAddress.addressLine1}</p>
                          {order.shippingAddress.addressLine2 && (
                            <p>{order.shippingAddress.addressLine2}</p>
                          )}
                          <p>
                            {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}
                          </p>
                          <p>{order.shippingAddress.country}</p>
                          <p>Phone: {order.shippingAddress.phoneNumber}</p>
                        </>
                      ) : (
                        <p>No shipping address available</p>
                      )}
                    </div>
                  </div>

                  {/* Order Summary Section */}
                  <div className="order-section">
                    <h4>Order Summary</h4>
                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{order.total}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>₹{order.total}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default OrdersPage; 