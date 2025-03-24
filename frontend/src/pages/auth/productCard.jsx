import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { addToFavorites, removeFromFavorites, getFavorites } from './favoritesService';
import './productCard.css';

const ProductCard = ({ images, title, price, id: _id, initialIsFavorite = false, onFavoriteChange }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    const handleFavoriteClick = async (e) => {
        e.stopPropagation(); // Prevent navigation when clicking heart
        if (isLoading) return; // Prevent multiple clicks while loading

        setIsLoading(true);
        setError(null);

        try {
            if (isFavorite) {
                await removeFromFavorites(_id);
                setIsFavorite(false);
                onFavoriteChange && onFavoriteChange(_id, false);
            } else {
                await addToFavorites(_id);
                setIsFavorite(true);
                onFavoriteChange && onFavoriteChange(_id, true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError(error.message);

            // If token is invalid or expired, clear it
            if (error.response?.status === 401 || error.message.includes('Please log in')) {
                sessionStorage.removeItem('token');
                sessionStorage.removeItem('user');
                navigate('/login');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetails = () => {
        navigate(`/product/${_id}`);
    };

    useEffect(() => {
        const fetchFavoriteStatus = async () => {
            try {
                const response = await getFavorites();
                const favorites = response?.data?.items || [];
                const favoriteIds = new Set(favorites.map(item => item.product));
                setIsFavorite(favoriteIds.has(_id));
            } catch (error) {
                console.error('Error fetching favorites:', error);
                if (error.response?.status === 401 || error.message.includes('Please log in')) {
                    setIsFavorite(false);
                    sessionStorage.removeItem('token');
                    sessionStorage.removeItem('user');
                }
            }
        };

        // Only fetch if we have a token
        const token = sessionStorage.getItem('token');
        if (token) {
            fetchFavoriteStatus();
        } else {
            setIsFavorite(false);
        }
    }, [_id]);

    return (
        <div className="product-card" onClick={handleViewDetails}>
            <div className="product-image">
                <img
                    src={images && images.length > 0 ? `${BACKEND_URL}${images[0]}` : '/placeholder-image.jpg'}
                    alt={title}
                    className="product-img"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
                <button
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon
                        icon={isFavorite ? faHeartSolid : faHeartRegular}
                    />
                </button>
            </div>
            <div className="product-info">
                <div className="product-title-price-container">
                    <div className="product-price">₹{price || '0'}</div>
                    <p className="product-title">{title || 'Untitled Product'}</p>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button className="view-details-btn">
                    View Details
                </button>
            </div>
        </div>
    );
};

const ProductGrid = ({ searchQuery = '', type = 'regular', filters }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());

    useEffect(() => {
        fetchProducts();
        fetchFavorites();
    }, []); // Remove type dependency since we're filtering on frontend

    const fetchProducts = async () => {
        try {
            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('Please log in to view products');
            }

            const response = await fetch(`${BACKEND_URL}/api/v1/products`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                if (response.status === 401) {
                    localStorage.removeItem('token');
                    throw new Error('Please log in to view products');
                }
                throw new Error('Failed to fetch products');
            }

            const data = await response.json();
            // Filter products based on type
            const allProducts = data.data.products;
            const filteredProducts = type === 'auction'
                ? allProducts.filter(product => product.isAuction)
                : allProducts.filter(product => !product.isAuction);
            setProducts(filteredProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            setError(error.message || 'Failed to load products');
            if (error.message.includes('Please log in')) {
                window.location.href = '/login';
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchFavorites = async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                // If no token, just clear favorites
                setFavorites(new Set());
                return;
            }

            const response = await getFavorites();
            const wishlistItems = response.data?.items || [];
            const favoriteIds = new Set(wishlistItems.map(item => item.product));
            setFavorites(favoriteIds);
        } catch (error) {
            console.error('Error fetching favorites:', error);
            if (error.message.includes('Please log in')) {
                setFavorites(new Set());
            }
        }
    };

    const handleFavoriteChange = (productId, isFavorite) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            if (isFavorite) {
                newFavorites.add(productId);
            } else {
                newFavorites.delete(productId);
            }
            return newFavorites;
        });
    };

    // Filter products based on search query and filters
    const filteredProducts = products.filter(product => {
        // First check search query
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        if (!matchesSearch) return false;

        // Then check categories
        if (filters?.categories?.length > 0) {
            const matchesCategory = filters.categories.some(category => {
                // Convert both to lowercase for case-insensitive comparison
                const productCategory = product.category?.toLowerCase() || '';
                const filterCategory = category.toLowerCase();

                // Special handling for 'Other' category
                if (filterCategory === 'other') {
                    return productCategory === 'others';
                }

                return productCategory === filterCategory;
            });
            if (!matchesCategory) return false;
        }

        // Finally check price range
        if (filters?.priceRange) {
            const price = Number(product.sellingPrice) || 0;
            const minPrice = Number(filters.priceRange.min) || 0;
            const maxPrice = Number(filters.priceRange.max) || Infinity;
            const isInPriceRange = price >= minPrice && price <= maxPrice;
            if (!isInPriceRange) return false;
        }

        return true;
    });

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!products.length) return <div className="no-products">No products found</div>;
    if (filteredProducts.length === 0) return <div className="no-products">No products match your filters</div>;

    return (
        <div className="products-grid">
            {filteredProducts.map((product) => (
                <ProductCard
                    key={product._id}
                    images={product.images}
                    title={product.name}
                    price={product.sellingPrice}
                    id={product._id}
                    initialIsFavorite={favorites.has(product._id)}
                    onFavoriteChange={handleFavoriteChange}
                />
            ))}
        </div>
    );
};

export { ProductCard, ProductGrid };