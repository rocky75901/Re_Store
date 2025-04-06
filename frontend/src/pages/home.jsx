import React, { useState } from 'react'
import Layout from '../components/layout'
import { ProductGrid } from './productCard'
import './home.css'
import ToggleButton from '../components/ToggleButton'
import { useLocation } from 'react-router-dom'
import FilterSidebar from '../components/FilterSidebar'

const Home = ({ searchQuery = '' }) => {
    const location = useLocation();
    // Get search query from URL directly
    const urlSearchParams = new URLSearchParams(location.search);
    const urlSearchQuery = urlSearchParams.get('q') || '';
    // Use URL search query if available, otherwise use the prop
    const effectiveSearchQuery = urlSearchQuery || searchQuery;
    
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
                    searchQuery={effectiveSearchQuery}
                />
            </Layout>
        </>
    )
}

export default Home