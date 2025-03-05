import React, { useState } from 'react';
import { Icon } from '@material-ui/core';

const Sidebar = ({ isMinimized, onToggle }) => {
  const [activeLink, setActiveLink] = useState('Home');

  const navLinks = [
    { name: 'Home', icon: 'home' },
    { name: 'Messages', icon: 'message' },
    { name: 'Favorites', icon: 'favorite' },
    { name: 'My Orders', icon: 'shopping_cart' },
    { name: 'Sell Items', icon: 'add_circle' },
    { name: 'Help', icon: 'help' },
    { name: 'Logout', icon: 'logout' }
  ];

  return (
    <div className={`sidebar ${isMinimized ? 'minimized' : ''}`}>
      <div className="logo">
        <img src="https://via.placeholder.com/50" alt="Re_Store" />
        <span>Re_Store</span>
      </div>
      <div className="toggle-btn" onClick={onToggle}>
        <Icon>menu</Icon>
      </div>
      <ul className="nav-links">
        {navLinks.map(link => (
          <li
            key={link.name}
            className={activeLink === link.name ? 'active' : ''}
            onClick={() => setActiveLink(link.name)}
          >
            <Icon>{link.icon}</Icon>
            <span className="link-text">{link.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Sidebar; 