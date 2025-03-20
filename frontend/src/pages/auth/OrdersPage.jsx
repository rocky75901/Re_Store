import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './OrdersPage.css';
import Layout from './layout';

const OrdersPage = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/v1/orders');
        if (response.data.status === 'success') {
          setOrders(response.data.data);
        } else {
          setError('Failed to fetch orders');
        }
      } catch (err) {
        console.error('Error fetching orders:', err);
        setError(err.response?.data?.message || 'Failed to fetch orders');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (loading) {
    return (
      <div className="loading-state">
        <div className="spinner" />
        <p className="loading-text">Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-state">
        <i className="error-state__icon fas fa-exclamation-circle" />
        <h2 className="error-state__title">Oops! Something went wrong</h2>
        <p className="error-state__message">{error}</p>
        <button className="btn btn-primary" onClick={() => window.location.reload()}>
          Try Again
        </button>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="empty-state">
        <i className="empty-state__icon fas fa-shopping-bag" />
        <h2 className="empty-state__title">No orders yet</h2>
        <p className="empty-state__message">Looks like you haven't made any purchases yet</p>
        <button className="btn btn-primary" onClick={() => navigate('/')}>
          Start Shopping
        </button>
      </div>
    );
  }

  return (
    <Layout>
    <div className="orders-page">
      <div className="orders-page__header">
        <h1 className="orders-page__title">My Orders</h1>
        <p className="orders-page__subtitle">Track and manage your orders</p>
      </div>

      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h3>Order #{order._id}</h3>
                <p>Placed on {formatDate(order.orderDate)}</p>
              </div>
              <div className={`order-status status-${order.status.toLowerCase()}`}>
                {order.status}
              </div>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item._id} className="order-item">
                  <div className="item-details">
                    <h4>{item.name}</h4>
                    <div className="item-meta">
                      <span>Quantity: {item.quantity}</span>
                      <span className="item-price">₹{item.price}</span>
                    </div>
                  </div>

                  <div className="item-actions">
                    <button 
                      className="btn btn-secondary"
                      onClick={() => navigate(`/product/${item.product}`)}
                    >
                      View Product
                    </button>
                    {order.status === 'delivered' && (
                      <button 
                        className="btn btn-primary"
                        onClick={() => navigate(`/product/${item.product}`)}
                      >
                        Buy Again
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Total:</span>
                ₹{order.totalAmount}
              </div>
              
              <div className="order-actions">
                {order.status !== 'delivered' && order.status !== 'cancelled' && (
                  <button 
                    className="btn btn-danger"
                    onClick={async () => {
                      try {
                        await axios.patch(
                          `http://localhost:3000/api/v1/orders/${order._id}/cancel`
                        );
                        window.location.reload();
                      } catch (err) {
                        alert(err.response?.data?.message || 'Failed to cancel order');
                      }
                    }}
                  >
                    Cancel Order
                  </button>
                )}
                <button className="btn btn-secondary">
                  Download Invoice
                </button>
                <button className="btn btn-primary">
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
    </Layout>
  );
};

export default OrdersPage; 