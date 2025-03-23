import React from 'react'
import AdminLayout from './adminlayout'
import { ProductCard } from './productCard'
import './adminpage.css'
import ToggleButton from './ToggleButton'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'

const AdminPage = () => {
    const handleOptionChange = (option) => {
        console.log('Selected option:', option);
        // Handle the option change here
    };

    return (
        <AdminLayout>
            <div className="admin-content">
                <div className="admin-header">
                    <div className="header-title">
                        <h1>Admin Dashboard</h1>
                    </div>
                    <div className="header-controls">
                        <ToggleButton onOptionChange={handleOptionChange} />
                    </div>
                </div>
                <div className="products-grid">
                    <ProductCard 
                        images={[Re_store_logo_login]}
                        title="Sample Product 1"
                        price={99.99}
                        id="1"
                        initialIsFavorite={false}
                        onFavoriteChange={() => {}}
                    />
                    <ProductCard 
                        images={[Re_store_logo_login]}
                        title="Sample Product 2"
                        price={149.99}
                        id="2"
                        initialIsFavorite={false}
                        onFavoriteChange={() => {}}
                    />
                    <ProductCard 
                        images={[Re_store_logo_login]}
                        title="Sample Product 3"
                        price={199.99}
                        id="3"
                        initialIsFavorite={false}
                        onFavoriteChange={() => {}}
                    />
                    <ProductCard 
                        images={[Re_store_logo_login]}
                        title="Sample Product 4"
                        price={299.99}
                        id="4"
                        initialIsFavorite={false}
                        onFavoriteChange={() => {}}
                    />
                    <ProductCard 
                        images={[Re_store_logo_login]}
                        title="Sample Product 5"
                        price={399.99}
                        id="5"
                        initialIsFavorite={false}
                        onFavoriteChange={() => {}}
                    />
                </div>
            </div>
        </AdminLayout>
    )
}

export default AdminPage;