import React from 'react'
import Layout from './layout'
import AuctionProduct from './Auctionproduct'
import './auctionpage.css'
import Re_store_logo_login from '../../assets/Re_store_logo_login.png'

const AuctionPage = () => {
    return (
        <>  
            <Layout>
                <div className="products-grid">
                    <AuctionProduct  image={Re_store_logo_login}/>
                    <AuctionProduct  />
                    <AuctionProduct  />
                    <AuctionProduct  />
                    <AuctionProduct  />
                </div>
            </Layout>
        </>
    )
}

export default AuctionPage