import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/layout';
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
      const token = sessionStorage.getItem('token');
      const userStr = sessionStorage.getItem('user');
      if (!token || !userStr) {
        throw new Error('Please login to view your orders');
      }

      const user = JSON.parse(userStr);
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      const response = await fetch(`${BACKEND_URL}/api/v1/orders/user/${user.username}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch orders');
      }

      const data = await response.json();
      setOrders(data.data);
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
            <button onClick={() => navigate('/home')} className="shop-now-btn">
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
            <div key={order._id} className="order-card">
              <div className="order-header" onClick={() => setSelectedOrder(selectedOrder?._id === order._id ? null : order)}>
                <div className="order-info">
                  <h3>Order #{order._id.slice(-6)}</h3>
                  <p className="order-date">
                    {new Date(order.orderDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="order-total">
                  <span>Total: ₹{order.totalAmount}</span>
                </div>
              </div>

              {selectedOrder?._id === order._id && (
                <div className="order-details">
                  {/* Products Section */}
                  <div className="order-section">
                    <h4>Products</h4>
                    <div className="order-items">
                      {order.items.map((item, index) => (
                        <div key={index} className="order-item">
                          <div className="item-details">
                            <h5>{item.name}</h5>
                            <div className="item-meta">
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
                      <p>{order.shippingAddress}</p>
                    </div>
                  </div>

                  {/* Order Status Section */}
                  <div className="order-section">
                    <h4>Order Status</h4>
                    <div className="order-status">
                      <p>Status: <span className={`status-${order.status.toLowerCase()}`}>{order.status}</span></p>
                      <p>Payment Status: <span className={`status-${order.paymentStatus.toLowerCase()}`}>{order.paymentStatus}</span></p>
                    </div>
                  </div>

                  {/* Order Summary Section */}
                  <div className="order-section">
                    <h4>Order Summary</h4>
                    <div className="order-summary">
                      <div className="summary-row">
                        <span>Subtotal:</span>
                        <span>₹{order.totalAmount}</span>
                      </div>
                      <div className="summary-row">
                        <span>Shipping:</span>
                        <span>Free</span>
                      </div>
                      <div className="summary-row total">
                        <span>Total:</span>
                        <span>₹{order.totalAmount}</span>
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