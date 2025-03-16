import React from 'react'
import Layout from './layout'
import ProductDetails from './Viewproductcard'
import './ViewDetails.css'

const ViewDetails = () => {
    return (
        <>  
            <Layout>
                <div classname="product-view-details">
                    <ProductDetails />
                    </div>
            </Layout>
        </>
    )
}

export default ViewDetails;