import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Layout from './layout'
import ProductDetails from './Viewproductcard'
import './ViewDetails.css'

const ViewDetails = () => {
    const { _id } = useParams();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
                const response = await fetch(`${BACKEND_URL}/api/v1/products/${_id}`, {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
                
                if (!response.ok) {
                    throw new Error('Failed to fetch product');
                }
                
                const data = await response.json();
                console.log('Product data:', data);
                if (data && data.data && data.data.product) {
                    setProduct(data.data.product);
                } else {
                    throw new Error('Product data not found');
                }
            } catch (error) {
                console.error('Error fetching product:', error);
            } finally {
                setLoading(false);
            }
        };

        if (_id) {
            fetchProduct();
        }
    }, [_id]);

    if (loading) {
        return (
            <Layout>
                <div className="product-view-details">
                    <div>Loading...</div>
                </div>
            </Layout>
        );
    }

    if (!product) {
        return (
            <Layout>
                <div className="product-view-details">
                    <div>Product not found</div>
                </div>
            </Layout>
        );
    }

    return (
        <Layout>
            <div className="product-view-details">
                <ProductDetails product={product} />
            </div>
        </Layout>
    );
}

export default ViewDetails;