import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Layout from '../components/layout';
import './sellHistory.css';
import { toast } from 'react-hot-toast';

const SellHistory = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // Check if user is logged in
        const token = sessionStorage.getItem('token');
        if (!token) {
          navigate('/login', { 
            state: { 
              message: 'Please log in to view your selling history',
              from: '/sell-history'
            } 
          });
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const response = await fetch(`${BACKEND_URL}/api/v1/products/seller/products`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch your products');
        }

        const data = await response.json();
        setProducts(data.data.products);
      } catch (err) {
        setError(err.message);
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [navigate]);

  const handleDelete = async (productId) => {
    if (confirmDelete !== productId) {
      setConfirmDelete(productId);
      return;
    }

    setDeleteLoading(true);
    try {
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      // Get the user ID from session storage
      const user = JSON.parse(sessionStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User session expired. Please log in again.');
      }
      
      // Use a different endpoint that allows users to delete their own products
      const response = await fetch(`${BACKEND_URL}/api/v1/products/seller/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ seller: user._id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      // Remove the product from the state
      setProducts(products.filter(product => product._id !== productId));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleteLoading(false);
      setConfirmDelete(null);
    }
  };

  const cancelDelete = () => {
    setConfirmDelete(null);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const renderProductType = (product) => {
    if (product.isAuction) {
      return <span className="product-tag auction">Auction</span>;
    }
    return <span className="product-tag regular">Regular Sale</span>;
  };

  return (
    <Layout>
      <div className="sell-history-container">
        <h1>My Selling History</h1>
        
        {loading ? (
          <div className="loading-spinner">
            <div className="spinner"></div>
          </div>
        ) : error ? (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={() => navigate('/sellpage')} className="action-button">
              Sell a Product
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="no-products">
            <h2>You haven't listed any products yet</h2>
            <p>Start selling your items today!</p>
            <button onClick={() => navigate('/sellpage')} className="action-button">
              Sell Your First Product
            </button>
          </div>
        ) : (
          <div className="products-grid">
            {products.map(product => (
              <div key={product._id} className="product-card">
                <div className="product-image">
                  <img src={product.imageCover} alt={product.name} />
                  {renderProductType(product)}
                </div>
                <div className="product-info">
                  <h2>{product.name}</h2>
                  <p className="price">{product.sellingPrice}</p>
                  <p className="condition">Condition: {product.condition}</p>
                  <p className="date">Listed on: {formatDate(product.createdAt)}</p>
                </div>
                <div className="product-actions">
                  <Link to={`/product/${product._id}`} className="view-button">
                    View Details
                  </Link>
                  {confirmDelete === product._id ? (
                    <div className="confirm-delete">
                      <p>Are you sure?</p>
                      <div className="confirm-buttons">
                        <button 
                          onClick={() => handleDelete(product._id)} 
                          className="confirm-yes"
                          disabled={deleteLoading}
                        >
                          {deleteLoading ? 'Deleting...' : 'Yes, Delete'}
                        </button>
                        <button 
                          onClick={cancelDelete} 
                          className="confirm-no"
                          disabled={deleteLoading}
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button onClick={() => handleDelete(product._id)} className="delete-button">
                      Delete Listing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SellHistory; 