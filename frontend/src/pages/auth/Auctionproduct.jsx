import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FaHeart, FaRegHeart, FaComments } from 'react-icons/fa';
import { IoTimeOutline, IoEyeOutline } from 'react-icons/io5';
import axios from 'axios';
import io from 'socket.io-client';
import Layout from './layout';
import './auctionproduct.css';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

const AuctionProduct = () => {
    const navigate = useNavigate();
    const { id } = useParams(); // Get auction ID from URL
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [auctionData, setAuctionData] = useState(null);
    const [isFavorite, setIsFavorite] = useState(false);
    const [bidAmount, setBidAmount] = useState('');
    const [bidError, setBidError] = useState('');
    const [isBidding, setIsBidding] = useState(false);
    const [remainingTime, setRemainingTime] = useState(0);
    const [currentBid, setCurrentBid] = useState(0);
    const isLoggedIn = !!localStorage.getItem('token');

    // Socket connection for real-time updates (only if logged in)
    useEffect(() => {
        if (!isLoggedIn) return;

        const socket = io(BACKEND_URL);
        socket.on('bid_update', (data) => {
            if (data.auctionId === auctionData?.id) {
                setCurrentBid(data.newBid || 0);
            }
        });
        return () => socket.close();
    }, [auctionData, isLoggedIn]);

    // Countdown timer
    useEffect(() => {
        const timer = setInterval(() => {
            setRemainingTime(prev => {
                if (prev <= 0) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    // Fetch auction data
    useEffect(() => {
        const fetchAuctionData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${BACKEND_URL}/api/v1/auctions/${id}`);
                setAuctionData(response.data.data);
                setError(null);
            } catch (err) {
                setError(err.response?.data?.message || 'Failed to fetch auction data');
            } finally {
                setLoading(false);
            }
        };

        fetchAuctionData();
    }, [id]);

    const formatTime = (seconds) => {
        if (!seconds) return '0d 0h 0m 0s';
        const days = Math.floor(seconds / (24 * 60 * 60));
        const hours = Math.floor((seconds % (24 * 60 * 60)) / (60 * 60));
        const minutes = Math.floor((seconds % (60 * 60)) / 60);
        const secs = seconds % 60;
        return `${days}d ${hours}h ${minutes}m ${secs}s`;
    };

    const handleBid = async () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }

        if (!bidAmount || isNaN(bidAmount) || bidAmount <= 0) {
            setBidError('Please enter a valid bid amount');
            return;
        }

        const bid = parseFloat(bidAmount);
        if (bid <= currentBid) {
            setBidError('Bid must be higher than current bid');
            return;
        }

        try {
            setIsBidding(true);
            setBidError('');
            
            const token = localStorage.getItem('token');
            const response = await axios.post(
                `${BACKEND_URL}/api/v1/auctions/${id}/bid`,
                { bidAmount: bid },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setCurrentBid(response.data.data.newBid || 0);
            setBidAmount('');
        } catch (err) {
            setBidError(err.response?.data?.message || 'Failed to place bid');
        } finally {
            setIsBidding(false);
        }
    };

    const handleFavorite = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        setIsFavorite(!isFavorite);
    };

    const handleMessage = () => {
        if (!isLoggedIn) {
            navigate('/login');
            return;
        }
        navigate(`/messages`, { state: { userId: auctionData.sellerId } });
    };

    if (loading) {
        return (
            <Layout>
                <div className="auction-card">
                    <div className="auction-content">
                        <h3>Loading auction details...</h3>
                    </div>
                </div>
            </Layout>
        );
    }

    if (error) {
        return (
            <Layout>
                <div className="auction-card">
                    <div className="auction-content">
                        <h3>Error: {error}</h3>
                        <button onClick={() => navigate('/auctionpage')} className="bid-button">
                            Back to Auctions
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    if (!auctionData) {
        return (
            <Layout>
                <div className="auction-card">
                    <div className="auction-content">
                        <h3>No auction data found</h3>
                        <button onClick={() => navigate('/auctionpage')} className="bid-button">
                            Back to Auctions
                        </button>
                    </div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="auction-card">
                <div className="auction-image-container">
                    <img src={auctionData.image} alt={auctionData.title} className="auction-image" />
                    <button 
                        className={`favorite-button ${isFavorite ? 'active' : ''}`}
                        onClick={handleFavorite}
                    >
                        {isFavorite ? <FaHeart /> : <FaRegHeart />}
                    </button>
                </div>

                <div className="auction-content">
                    <h3 className="auction-title">{auctionData.title}</h3>
                    
                    <div className="auction-timer">
                        <IoTimeOutline /> {formatTime(remainingTime)}
                    </div>

                    <div className="auction-pricing">
                        <div className="price-info">
                            <span className="label">Current Bid:</span>
                            <span className="amount">${(auctionData.currentBid || 0).toFixed(2)}</span>
                        </div>
                        <div className="price-info">
                            <span className="label">Base Price:</span>
                            <span className="amount">${(auctionData.basePrice || 0).toFixed(2)}</span>
                        </div>
                    </div>

                    {!isLoggedIn ? (
                        <div className="login-prompt">
                            <p>Please log in to place bids and interact with auctions</p>
                            <button onClick={() => navigate('/login')} className="bid-button">
                                Log In to Bid
                            </button>
                        </div>
                    ) : (
                        <div className="bid-section">
                            <input
                                type="number"
                                value={bidAmount}
                                onChange={(e) => setBidAmount(e.target.value)}
                                placeholder="Enter bid amount"
                                min={(auctionData.currentBid || 0) + 1}
                                step="0.01"
                                className="bid-input"
                            />
                            <button 
                                onClick={handleBid}
                                disabled={isBidding || remainingTime <= 0}
                                className={`bid-button ${isBidding ? 'loading' : ''}`}
                            >
                                {isBidding ? 'Placing Bid...' : 'Place Bid'}
                            </button>
                            {bidError && <div className="bid-error">{bidError}</div>}
                        </div>
                    )}

                    <div className="seller-info">
                        <span>Seller: {auctionData.seller || 'Unknown'}</span>
                    </div>

                    <div className="action-buttons">
                        <button onClick={() => navigate('/auctionpage')} className="view-button">
                            <IoEyeOutline /> Back to Auctions
                        </button>
                        <button onClick={handleMessage} className="message-button">
                            <FaComments /> Message
                        </button>
                    </div>
                </div>
            </div>
        </Layout>
    );
};

export default AuctionProduct;
