import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHeart as faHeartSolid, faUser } from "@fortawesome/free-solid-svg-icons";
import { faHeart as faHeartRegular } from "@fortawesome/free-regular-svg-icons";
import { addToFavorites, removeFromFavorites, getFavorites } from '../services/favoritesService';
import './productCard.css';

// Helper function to get seller name from all possible sources
const getSellerName = (product) => {
    if (!product) return "Unknown";
    
    // Case 1: Populated seller object with username
    if (product.seller?.username) {
        return product.seller.username;
    }
    
    // Case 2: Seller object with name
    if (product.seller?.name) {
        return product.seller.name;
    }
    
    // Case 3: Use sellerName string directly 
    if (product.sellerName) {
        return product.sellerName;
    }
    
    // Fallback to Unknown
    return "Unknown";
};

const ProductCard = ({ images = [], title, price, id, initialIsFavorite = false, onFavoriteChange, product }) => {
    const [isFavorite, setIsFavorite] = useState(initialIsFavorite);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
    const [imageUrl, setImageUrl] = useState('/placeholder-image.jpg');

    useEffect(() => {
        if (images.length > 0) {
            const fullUrl = images[0].startsWith('http') ? images[0] : `${BACKEND_URL}${images[0]}`;
            setImageUrl(fullUrl);
        }
    }, [images, BACKEND_URL]);

    const handleFavoriteClick = async (e) => {
        e.stopPropagation();
        if (isLoading) return;

        setIsLoading(true);
        setError(null);

        try {
            if (isFavorite) {
                await removeFromFavorites(id);
                setIsFavorite(false);
                onFavoriteChange && onFavoriteChange(id, false);
            } else {
                await addToFavorites(id);
                setIsFavorite(true);
                onFavoriteChange && onFavoriteChange(id, true);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setError(error.message);
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
        navigate(`/product/${id}`);
    };

    return (
        <div className="product-card" onClick={handleViewDetails}>
            <div className="product-image">
                <img 
                    src={imageUrl} 
                    alt={title} 
                    className="product-img"
                    onError={(e) => {
                        console.error('Image failed to load:', e.target.src);
                        e.target.src = '/placeholder-image.jpg';
                    }}
                />
                <button 
                    className={`favorite-btn ${isFavorite ? 'active' : ''}`}
                    onClick={handleFavoriteClick}
                    aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                    disabled={isLoading}
                >
                    <FontAwesomeIcon icon={isFavorite ? faHeartSolid : faHeartRegular} />
                </button>
            </div>
            <div className="product-info">
                <div className="product-title-price-container">
                    <div className="product-price">₹{price || '0'}</div>
                    <p className="product-title">{title || 'Untitled Product'}</p>
                    <p className="product-seller">
                        <FontAwesomeIcon icon={faUser} /> {getSellerName(product)}
                    </p>
                </div>
                {error && <div className="error-message">{error}</div>}
                <button className="view-details-btn">View Details</button>
            </div>
        </div>
    );
};

const ProductGrid = ({ searchQuery = '', type = 'regular' }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [favorites, setFavorites] = useState(new Set());
    const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

    // Effect to fetch products (runs once on mount)
    useEffect(() => {
        let isMounted = true;
        const fetchProducts = async () => {
            try {
                console.log("Fetching products...");
                setLoading(true);
                const token = sessionStorage.getItem('token');
                const response = await fetch(`${BACKEND_URL}/api/v1/products`, {
                    headers: {
                        'Authorization': token ? `Bearer ${token}` : '',
                        'Content-Type': 'application/json'
                    }
                });
                if (!response.ok) {
                    if (response.status === 401) {
                        sessionStorage.removeItem('token');
                        throw new Error('Please log in to view products');
                    }
                    throw new Error('Failed to fetch products');
                }
                const data = await response.json();
                console.log('Fetched products:', data);
                const filteredProducts = data?.data?.products?.filter(product => 
                    type === 'auction' ? product.isAuction : !product.isAuction
                ) || [];
                if (isMounted) {
                    setProducts(filteredProducts);
                }
            } catch (error) {
                console.error('Error fetching products:', error);
                if (isMounted) {
                    setError(error.message || 'Failed to load products');
                }
                if (error.message.includes('Please log in')) {
                    window.location.href = '/login';
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchProducts();
        return () => { isMounted = false; };
    }, [BACKEND_URL, type]);

    // Effect to fetch favorites (runs once on mount)
    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const token = sessionStorage.getItem('token');
                if (!token) {
                    setFavorites(new Set());
                    return;
                }
                const response = await getFavorites();
                const wishlistItems = response.data?.items || [];
                const favoriteIds = new Set(wishlistItems.map(item => item.product));
                setFavorites(favoriteIds);
            } catch (error) {
                console.error('Error fetching favorites:', error);
                setFavorites(new Set());
            }
        };
        fetchFavorites();
    }, []);

    const handleFavoriteChange = (productId, isFavorite) => {
        setFavorites(prev => {
            const newFavorites = new Set(prev);
            isFavorite ? newFavorites.add(productId) : newFavorites.delete(productId);
            return newFavorites;
        });
    };

    const filteredProducts = products.filter(product => 
        product.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) return <div className="loading">Loading...</div>;
    if (error) return <div className="error">{error}</div>;
    if (!products.length) return <div className="no-products">No products found</div>;
    if (filteredProducts.length === 0) return <div className="no-products">No products match your search</div>;

    return (
        <div className="products-grid">
            {filteredProducts.map((product) => (
                <ProductCard 
                    key={product._id}
                    images={product.imageCover ? [product.imageCover] : []}
                    title={product.name}
                    price={product.sellingPrice}
                    id={product._id}
                    initialIsFavorite={favorites.has(product._id)}
                    onFavoriteChange={handleFavoriteChange}
                    product={product}
                />
            ))}
        </div>
    );
};

export { ProductCard, ProductGrid };
