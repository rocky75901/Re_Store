import React from 'react'
import Layout from './layout'
import { ProductGrid } from './productCard'
import './home.css'
import ToggleButton from './ToggleButton'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'

const Home = () => {
    return (
        <>  
            <Layout>
                <ToggleButton className="toggle-button"/>
                <ProductGrid />
            </Layout>
        </>
    )
}

export default Home