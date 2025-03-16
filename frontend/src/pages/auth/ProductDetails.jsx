import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from './layout';
import './ProductDetails.css';

const ProductDetails = () => {
  const params = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getProduct = async () => {
      try {
        const { data } = await axios.get(`/api/v1/product/get-product/${params.slug}`);
        setProduct(data?.product);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    if (params?.slug) getProduct();
  }, [params?.slug]);

  const handleContactSeller = () => {
    if (!product?.seller) {
      console.error('Seller information not available');
      return;
    }
    navigate('/messages', { 
      state: { sellerId: product.seller }
    });
  };

  return (
    <Layout>
      <div className="product-details-container">
        {loading ? (
          <div className="loading">Loading...</div>
        ) : product ? (
          <>
            <div className="product-image">
              <img
                src={`/api/v1/product/product-photo/${product._id}`}
                alt={product.name}
              />
            </div>
            <div className="product-info">
              <h1>{product.name}</h1>
              <p className="description">{product.description}</p>
              <p className="price">Price: ${product.price}</p>
              <p className="category">Category: {product.category?.name}</p>
              <p className="quantity">Available: {product.quantity}</p>
              <button 
                className="contact-button"
                onClick={handleContactSeller}
              >
                Contact Seller
              </button>
            </div>
          </>
        ) : (
          <div className="not-found">Product not found</div>
        )}
      </div>
    </Layout>
  );
};

export default ProductDetails; 