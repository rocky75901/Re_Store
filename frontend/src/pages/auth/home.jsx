import React from 'react'
import Layout from './layout'
import { ProductGrid } from './productCard'
import './home.css'
import ToggleButton from './ToggleButton'
import { useLocation } from 'react-router-dom'

const Home = () => {
    const location = useLocation();
    const isAuctionPage = location.pathname === '/auctionpage';
    
    return (
        <>  
            <Layout>
                <ToggleButton className="toggle-button"/>
                <ProductGrid type={isAuctionPage ? 'auction' : 'regular'} />
            </Layout>
        </>
    )
}

export default Home