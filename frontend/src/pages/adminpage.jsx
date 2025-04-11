import React, { useState, useEffect } from 'react';
import AdminLayout from './adminlayout';
import './adminpage.css';
import { FaUsers, FaBox, FaShoppingCart, FaRupeeSign } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AdminPage = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = sessionStorage.getItem('token');
        if (!token) {
          toast.error('Please login to view admin dashboard');
          return;
        }

        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        // Fetch users
        const usersResponse = await fetch(`${BACKEND_URL}/api/v1/users`, { headers });
        if (!usersResponse.ok) {
          throw new Error(`Users API failed: ${usersResponse.status}`);
        }
        const usersData = await usersResponse.json();
        console.log('Users data:', usersData);
        const totalUsers = Array.isArray(usersData) ? usersData.length : 
                         usersData.data?.users?.length || 
                         usersData.users?.length || 0;

        // Fetch products
        const productsResponse = await fetch(`${BACKEND_URL}/api/v1/products`, { headers });
        if (!productsResponse.ok) {
          throw new Error(`Products API failed: ${productsResponse.status}`);
        }
        const productsData = await productsResponse.json();
        console.log('Products data:', productsData);
        const totalProducts = Array.isArray(productsData) ? productsData.length :
                            productsData.data?.products?.length ||
                            productsData.products?.length || 0;

        // Fetch orders
        const ordersResponse = await fetch(`${BACKEND_URL}/api/v1/orders`, { headers });
        if (!ordersResponse.ok) {
          throw new Error(`Orders API failed: ${ordersResponse.status}`);
        }
        const ordersData = await ordersResponse.json();
        console.log('Orders data:', ordersData);
        const orders = Array.isArray(ordersData) ? ordersData :
                      ordersData.data?.orders || 
                      ordersData.orders || [];
        
        const totalOrders = orders.length;
        
        // Calculate total revenue from orders
        const totalRevenue = orders.reduce((sum, order) => {
          const amount = typeof order.totalAmount === 'string' ? 
            parseFloat(order.totalAmount.replace(/[^0-9.-]+/g, '')) : 
            parseFloat(order.totalAmount) || 0;
          return sum + amount;
        }, 0);

        console.log('Calculated stats:', {
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue
        });

        setStats({
          totalUsers,
          totalProducts,
          totalOrders,
          totalRevenue: Math.round(totalRevenue * 100) / 100 // Round to 2 decimal places
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        toast.error('Error loading statistics. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <AdminLayout>
        <div className="admin-dashboard-container">
          <div className="loading">
            <div className="loading-spinner"></div>
            Loading statistics...
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="admin-dashboard-container">
        <div className="admin-dashboard-header">
          <div className="admin-dashboard-title">
            
          </div>
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon users">
              <FaUsers />
            </div>
            <div className="stat-info">
              <h3>Total Users</h3>
              <p>{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon products">
              <FaBox />
            </div>
            <div className="stat-info">
              <h3>Total Products</h3>
              <p>{stats.totalProducts.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon orders">
              <FaShoppingCart />
            </div>
            <div className="stat-info">
              <h3>Total Orders</h3>
              <p>{stats.totalOrders.toLocaleString()}</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon revenue">
              <FaRupeeSign />
            </div>
            <div className="stat-info">
              <h3>Total Revenue</h3>
              <p>₹{stats.totalRevenue.toLocaleString('en-IN', {
                maximumFractionDigits: 2,
                minimumFractionDigits: 2
              })}</p>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminPage;