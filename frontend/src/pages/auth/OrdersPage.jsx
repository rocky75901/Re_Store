import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './OrdersPage.css';
import Re_store_logo_login from "../../assets/Re_store_logo_login.png";

const OrdersPage = () => {
  const navigate = useNavigate();
  // Sample orders data - will be replaced with backend data later
  const [orders] = useState([
    {
      _id: 'ORD123456',
      date: '2024-03-18',
      status: 'Delivered',
      total: 2098,
      items: [
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
          quantity: 1,
          image: Re_store_logo_login,
          seller: 'Jane Smith'
        }
      ]
    },
    {
      _id: 'ORD123457',
      date: '2024-03-15',
      status: 'In Transit',
      total: 1598,
      items: [
        {
          _id: '3',
          name: 'Sample Product 3',
          price: 1599,
          quantity: 1,
          image: Re_store_logo_login,
          seller: 'Mike Johnson'
        }
      ]
    }
  ]);

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'status-delivered';
      case 'in transit':
        return 'status-transit';
      case 'processing':
        return 'status-processing';
      case 'cancelled':
        return 'status-cancelled';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-IN', options);
  };

  if (orders.length === 0) {
    return (
      <div className="empty-orders">
        <i className="fa-solid fa-box-open"></i>
        <h2>No orders yet</h2>
        <p>Looks like you haven't made any purchases yet</p>
        <button onClick={() => navigate('/')}>Start Shopping</button>
      </div>
    );
  }

  return (
    <div className="orders-container">
      <h1>My Orders</h1>
      
      <div className="orders-list">
        {orders.map(order => (
          <div key={order._id} className="order-card">
            <div className="order-header">
              <div className="order-info">
                <h2>Order #{order._id}</h2>
                <p>Placed on {formatDate(order.date)}</p>
              </div>
              <div className="order-status">
                <span className={getStatusColor(order.status)}>
                  {order.status}
                </span>
              </div>
            </div>

            <div className="order-items">
              {order.items.map(item => (
                <div key={item._id} className="order-item">
                  <div className="item-image">
                    <img src={item.image} alt={item.name} />
                  </div>
                  
                  <div className="item-details">
                    <h3>{item.name}</h3>
                    <p className="seller">Seller: {item.seller}</p>
                    <p className="quantity">Quantity: {item.quantity}</p>
                    <p className="price">₹{item.price}</p>
                  </div>

                  <div className="item-actions">
                    <button 
                      className="view-product"
                      onClick={() => navigate(`/product/${item._id}`)}
                    >
                      View Product
                    </button>
                    {order.status === 'Delivered' && (
                      <button className="buy-again">
                        Buy Again
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="order-footer">
              <div className="order-total">
                <span>Order Total:</span>
                <span>₹{order.total}</span>
              </div>
              <div className="order-actions">
                <button className="track-order">
                  Track Order
                </button>
                <button className="download-invoice">
                  Download Invoice
                </button>
                <button className="contact-seller">
                  Contact Seller
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage; 