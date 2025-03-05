import React, { useState } from 'react';
import './App.css';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import ProductCard from './components/ProductCard';

const App = () => {
  const [isSidebarMinimized, setIsSidebarMinimized] = useState(false);
  
  const products = [
    {
      id: 1,
      name: 'Cricket Bat',
      price: 1100,
      image: 'https://via.placeholder.com/150'
    },
    {
      id: 2,
      name: 'Cooler',
      price: 6000,
      image: 'https://via.placeholder.com/150'
    }
  ];

  const toggleSidebar = () => {
    setIsSidebarMinimized(!isSidebarMinimized);
  };

  return (
    <div className="app">
      <Sidebar isMinimized={isSidebarMinimized} onToggle={toggleSidebar} />
      <div className="main-content">
        <Header />
        <div className="products">
          {products.map(product => (
            <ProductCard key={product.id} {...product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default App; 