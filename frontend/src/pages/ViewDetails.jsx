import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import Layout from "../components/layout";
import ProductDetails from "./Viewproductcard";
import "./ViewDetails.css";

const ViewDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = sessionStorage.getItem("token");
        if (!token) {
          setError("Please log in to view product details");
          return;
        }

        const BACKEND_URL =
          import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
        const response = await fetch(`${BACKEND_URL}/api/v1/products/${id}`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch product");
        }

        const data = await response.json();
        if (data && data.data && data.data.product) {
          setProduct(data.data.product);
        } else {
          throw new Error("Product data not found");
        }
      } catch (error) {
        console.error("Error fetching product:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <Layout>
        <div className="product-view-details">
          <div className="loading">Loading product details...</div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="product-view-details">
          <div className="error-message">{error}</div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="product-view-details">
          <div className="error-message">Product not found</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showSearchBar={false}>
      <div className="product-view-details">
        <ProductDetails product={product} />
      </div>
    </Layout>
  );
};

export default ViewDetails;
