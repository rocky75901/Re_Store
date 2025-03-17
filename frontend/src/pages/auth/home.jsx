import React from 'react'
import Layout from './layout'
import ProductCard from './productCard'
import './home.css'
import ToggleButton from './ToggleButton'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'

const Home = () => {
    return (
        <>  
            <Layout>
                <ToggleButton className="toggle-button"/>
                <div className="products-grid">
                    <ProductCard image={Re_store_logo_login}/>
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                    <ProductCard />
                </div>
            </Layout>
        </>
    )
}

export default Home