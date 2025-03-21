import React from 'react'
import Layout from './layout'
import { ProductGrid } from './productCard'
import './home.css'
import ToggleButton from './ToggleButton'

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