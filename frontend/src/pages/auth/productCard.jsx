import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './productCard.css';

const ProductCard = ({ image, title, price, id: _id }) => {
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();

    const handleFavoriteClick = (e) => {
        e.stopPropagation(); // Prevent navigation when clicking heart
        setIsFavorite(!isFavorite);
        // TODO: Add API call to update favorite status
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
                        aria-label="Add to favorites"
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
                const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                const response = await fetch(`${BACKEND_URL}/api/v1/products`);
                if (!response.ok) {
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                setProducts(data.data.products);
            } catch (error) {
                console.error('Error fetching products:', error);
                setError('Failed to load products');
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!products.length) return <div className="no-products">No products found</div>;

    return (
        <div className="products-grid">
            {products.map((product) => (
                <ProductCard 
                    key={product._id}
                    image={product.imageCover}
                    title={product.name}
                    price={product.sellingPrice}
                    id={product._id}
                />
            ))}
        </div>
    );
};

export { ProductCard, ProductGrid };
