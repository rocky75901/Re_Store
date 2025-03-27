import React, { useState, useEffect } from 'react';
import AdminLayout from './adminlayout';
import './ManageProducts.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash, FaEdit, FaSpinner, FaPlus } from 'react-icons/fa';

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/v1/products`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch products');
      }

      const data = await response.json();
      setProducts(data.data.products || []);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (!window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingProduct(productId);
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/v1/products/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete product');
      }

      setProducts(products.filter(product => product._id !== productId));
      toast.success('Product deleted successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleEditProduct = (productId) => {
    // Navigate to edit product page
    window.location.href = `/admin/products/edit/${productId}`;
  };

  const getStatusClass = (status) => {
    if (!status) return 'inactive';
    const normalizedStatus = status.toLowerCase();
    return ['active', 'inactive', 'draft'].includes(normalizedStatus) 
      ? normalizedStatus 
      : 'inactive';
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="manage-products-container">
          <div className="loading">
            <FaSpinner className="spinner" /> Loading products...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="manage-products-container">
          <div className="error">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="manage-products-container">
        <div className="header-actions">
          <h1>Manage Products</h1>
          <button 
            className="add-product-button"
            onClick={() => window.location.href = '/admin/products/add'}
          >
            <FaPlus /> Add New Product
          </button>
        </div>
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map(product => (
                <tr key={product._id}>
                  <td>
                    <img 
                      src={product.images?.[0] || '/placeholder-image.jpg'} 
                      alt={product.name} 
                      className="product-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </td>
                  <td>{product.name || 'Unnamed Product'}</td>
                  <td>₹{product.price || '0'}</td>
                  <td>
                    <span className="category-badge">
                      {product.category || 'Uncategorized'}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${getStatusClass(product.status)}`}>
                      {product.status || 'Inactive'}
                    </span>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="edit-button"
                      onClick={() => handleEditProduct(product._id)}
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deletingProduct === product._id}
                    >
                      {deletingProduct === product._id ? (
                        <FaSpinner className="spinner" />
                      ) : (
                        <>
                          <FaTrash /> Delete
                        </>
                      )}
                    </button>
                  </td>
                </tr>
              ))}
              {products.length === 0 && (
                <tr>
                  <td colSpan="6" className="no-products">
                    No products found. Click "Add New Product" to create one.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AdminLayout>
  );
};

export default ManageProducts; 