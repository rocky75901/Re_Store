import React, { useState } from 'react'
import Layout from './layout'
import { ProductGrid } from './productCard'
import './home.css'
import ToggleButton from './ToggleButton'
import { useLocation } from 'react-router-dom'
import FilterSidebar from './FilterSidebar'

const Home = () => {
    const location = useLocation();
    const isAuctionPage = location.pathname === '/auctionpage';
    const [filters, setFilters] = useState({
        categories: [],
        priceRange: { min: 0, max: 10000 }
    });
    
    const handleApplyFilters = (newFilters) => {
        setFilters(newFilters);
    };
    
    return (
        <>  
            <Layout>
                <ToggleButton className="toggle-button"/>
                <FilterSidebar onApplyFilters={handleApplyFilters} />
                <ProductGrid 
                    type={isAuctionPage ? 'auction' : 'regular'} 
                    filters={filters}
                />
            </Layout>
        </>
    )
}

export default Home