import React, { useState, useEffect } from "react";
import AdminLayout from "./adminlayout";
import "./ManageProducts.css";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaTrash, FaEdit, FaSpinner } from "react-icons/fa";

const ManageProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const truncateText = (text, maxLength = 30) => {
    if (!text) return "";
    return text.length > maxLength
      ? `${text.substring(0, maxLength)}...`
      : text;
  };

  const fetchProducts = async () => {
    try {
      const token = sessionStorage.getItem("token");
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const response = await fetch(
        `${BACKEND_URL}/api/v1/products/admin-products`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to fetch products");
      }

      const data = await response.json();
      console.log("Products data:", data);

      const productsList = Array.isArray(data)
        ? data
        : data.data?.products
        ? data.data.products
        : data.products
        ? data.products
        : [];

      setProducts(productsList);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching products:", err);
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (
      !window.confirm(
        "WARNING: This action will permanently delete this product. Are you absolutely sure?"
      )
    ) {
      return;
    }

    try {
      setDeletingProduct(productId);
      const token = sessionStorage.getItem("token");
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const response = await fetch(
        `${BACKEND_URL}/api/v1/products/${productId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete product");
      }

      setProducts(products.filter((product) => product._id !== productId));
      toast.success("Product successfully deleted");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingProduct(null);
    }
  };

  const handleEditProduct = (productId) => {
    window.location.href = `/admin/products/edit/${productId}`;
  };

  const getStatusClass = (status) => {
    if (!status) return "inactive";
    const normalizedStatus = status.toLowerCase();
    return ["active", "inactive", "draft"].includes(normalizedStatus)
      ? normalizedStatus
      : "inactive";
  };

  const getImageUrl = (image) => {
    if (!image) return "/placeholder-image.jpg";
    if (image.startsWith("http")) return image;
    if (image.includes("storage.googleapis.com")) return image;
    return `${
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000"
    }${image}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price) => {
    if (!price) return "₹0";
    const formattedPrice = Number(price).toLocaleString("en-IN");
    return formattedPrice.length > 15
      ? `₹${formattedPrice.slice(0, 12)}...`
      : `₹${formattedPrice}`;
  };

  const calculateDiscount = (mrp, sellingPrice) => {
    if (!mrp || !sellingPrice || mrp <= 0) return null;
    const discount = ((mrp - sellingPrice) / mrp) * 100;
    return discount > 0 ? Math.round(discount) : null;
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
        <div className="products-table-container">
          <table className="products-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Product Details</th>
                <th>Pricing</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product._id}>
                  <td className="product-image-cell">
                    <img
                      src={getImageUrl(
                        product.imageCover || product.images?.[0]
                      )}
                      alt={product.name}
                      className="product-thumbnail"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/placeholder-image.jpg";
                      }}
                    />
                  </td>
                  <td className="product-details-cell">
                    <h3 title={product.name || "Unnamed Product"}>
                      {truncateText(product.name) || "Unnamed Product"}
                    </h3>
                    <p
                      className="product-description"
                      title={product.description || "No description available"}
                    >
                      {truncateText(product.description) ||
                        "No description available"}
                    </p>
                    <div className="product-meta">
                      <span
                        className="category-badge"
                        title={product.category || "Uncategorized"}
                      >
                        {truncateText(product.category, 20) || "Uncategorized"}
                      </span>
                      <span className="product-id">
                        ID: {truncateText(product._id, 8)}
                      </span>
                    </div>
                    <div className="timestamps">
                      <small>Created: {formatDate(product.createdAt)}</small>
                      <small>Updated: {formatDate(product.updatedAt)}</small>
                    </div>
                  </td>
                  <td className="pricing-cell">
                    <div className="price-details">
                      <div className="price-row">
                        <div
                          className="selling-price"
                          title={`₹${
                            product.sellingPrice?.toLocaleString("en-IN") || "0"
                          }`}
                        >
                          {formatPrice(product.sellingPrice)}
                        </div>
                        {calculateDiscount(
                          product.mrp,
                          product.sellingPrice
                        ) && (
                          <span className="discount-badge">
                            -
                            {calculateDiscount(
                              product.mrp,
                              product.sellingPrice
                            )}
                            %
                          </span>
                        )}
                      </div>
                      {product.mrp && product.mrp !== product.sellingPrice && (
                        <div
                          className="mrp"
                          title={`₹${product.mrp?.toLocaleString("en-IN")}`}
                        >
                          MRP: {formatPrice(product.mrp)}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="stock-status-cell">
                    <div className="stock-info">
                      <span
                        className={`status-badge ${
                          product.isAvailable
                            ? getStatusClass("active")
                            : getStatusClass("inactive")
                        }`}
                      >
                        {product.isAvailable ? "Available" : "Sold"}
                      </span>
                    </div>
                  </td>
                  <td className="action-buttons">
                    <button
                      className="delete-button"
                      onClick={() => handleDeleteProduct(product._id)}
                      disabled={deletingProduct === product._id}
                      title="Delete this product"
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
                  <td colSpan="5" className="no-products">
                    No products found in the database.
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
