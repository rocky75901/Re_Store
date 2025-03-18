import React from 'react'
import Layout from './layout';
import FavCard from './favcard';
import './favorites.css';
function Favorites() {
  return (
    <Layout showSearchBar={false} customHeaderContent={<h2 className='favorites-heading'>Favorites</h2>}>
        <FavCard/>
    </Layout>
  )
}

export default Favorites;

