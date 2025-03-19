import React, { useState, useEffect, useCallback } from 'react'
import Layout from './layout'
import AuctionProduct from './Auctionproduct'
import './auctionpage.css'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AuctionPage = () => {
    const [auctions, setAuctions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const [filter, setFilter] = useState('all'); // all, active, ended
    const [sortBy, setSortBy] = useState('newest'); // newest, price-asc, price-desc

    const fetchAuctions = useCallback(async () => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/auctionpage');
                return;
            }

            const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
            const response = await axios.get(`${BACKEND_URL}/api/v1/auctions`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                params: {
                    status: filter,
                    sort: sortBy
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch auctions');
            }

            const data = await response.data;
            setAuctions(data.data.auctions);
            setError(null);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to fetch auctions');
            setAuctions([]);
        } finally {
            setLoading(false);
        }
    }, [filter, sortBy, navigate]);

    useEffect(() => {
        fetchAuctions();
    }, [fetchAuctions]);

    const handleViewDetails = (auctionId) => {
        navigate(`/auctionproduct/${auctionId}`);
    };

    const handleMessage = (sellerId) => {
        navigate('/messages', { state: { userId: sellerId } });
    };

    const handleFavorite = async (auctionId) => {
        try {
            await axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/auctions/${auctionId}/favorite`);
            // Refresh auctions to update favorite status
            fetchAuctions();
        } catch (err) {
            console.error('Failed to favorite auction:', err);
        }
    };

    if (loading) {
        return (
            <Layout>
                <div className="loading">Loading auctions...</div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="error">Error: {error}</div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="auction-page-container">
                <div className="auction-header">
                    <h1>Active Auctions</h1>
                    <div className="auction-filters">
                        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
                            <option value="all">All Auctions</option>
                            <option value="active">Active Auctions</option>
                            <option value="ended">Ended Auctions</option>
                        </select>
                        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                            <option value="newest">Newest First</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                </div>
                <div className="auction-products-grid">
                    {auctions.length > 0 ? (
                        auctions.map(auction => (
                            <AuctionProduct
                                key={auction._id}
                                image={auction.images[0] || Re_store_logo_login}
                                title={auction.name}
                                basePrice={auction.basePrice}
                                currentBid={auction.currentBid}
                                seller={auction.seller.name}
                                timeLeft={auction.endTime}
                                isFavorite={auction.isFavorite}
                                onViewDetails={() => handleViewDetails(auction._id)}
                                onMessage={() => handleMessage(auction.seller._id)}
                                onFavorite={() => handleFavorite(auction._id)}
                            />
                        ))
                    ) : (
                        <div className="no-auctions">No active auctions found</div>
                    )}
                </div>
            </div>
        </Layout>
    );
}

export default AuctionPage;