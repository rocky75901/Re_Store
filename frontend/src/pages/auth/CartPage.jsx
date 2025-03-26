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
  const [selectedItems, setSelectedItems] = useState([]);
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
        // Initialize selected items with all items
        setSelectedItems(response.data.items.map(item => item.product));
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
            {cartItems.map((item, index) => (
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
                    src={`http://localhost:3000/uploads/products/product-${item.product}-cover.jpeg?${Date.now()}`} 
                    alt={item.name}
                    onError={(e) => { e.target.src = Re_store_logo_login; }} 
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
            ))}
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