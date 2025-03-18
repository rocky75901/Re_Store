import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ image, title, price, id: _id }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    const handleFavoriteClick = () => {
        setIsFavorite(!isFavorite);
    };

    const handleViewDetails = () => {
        navigate(`/product/${_id}`);
    };

    return (
        <div className="product-card">
            <div className="product-image">
                <img src={image || 'https://via.placeholder.com/150'} alt={title} />
            </div>
            <div className="product-info">
                <div className="price-heart-container">
                    <div className="product-title-price-container">
                        <div className="product-price">₹{price || '0'}</div>
                        <p className="product-title">{title || 'Untitled Product'}</p>
                    </div>
                    <button 
                        className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                        onClick={handleFavoriteClick}
                    >
                        <i className={`fa-${isFavorite ? 'solid' : 'regular'} fa-heart`}></i>
                    </button>
                </div>
                <button 
                    className="view-details-btn"
                    onClick={handleViewDetails}
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

// Separate component for displaying all products
const ProductGrid = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                setLoading(true);
                const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                const response = await axios.get(`${BACKEND_URL}/api/v1/products`);
                console.log('API Response:', response.data);
                
                if (response.data && response.data.data && Array.isArray(response.data.data.products)) {
                    setProducts(response.data.data.products);
                } else {
                    console.log('Response data is not in expected format:', response.data);
                    setProducts([]);
                }
            } catch (error) {
                console.error('Error fetching products:', error.response || error);
                setError('Failed to load products. Please try again later.');
                setProducts([]);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return <div className="loading">Loading products...</div>;
    }

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="products-grid">
            {Array.isArray(products) && products.length > 0 ? (
                products.map((product) => (
                    <ProductCard 
                        key={product._id} 
                        image={product.imageCover}
                        title={product.name}
                        price={product.sellingPrice}
                        id={product._id.$oid || product._id}
                    />
                ))
            ) : (
                <div className="no-products">No products found. Please check if the server is running.</div>
            )}
        </div>
    );
};

export { ProductCard, ProductGrid };
