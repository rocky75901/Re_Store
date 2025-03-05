import React from 'react';

const Header = () => {
  const navButtons = ['Home', 'Cart', 'Profile'];

  return (
    <div className="header">
      <h1>Favourites</h1>
      <div className="nav-buttons">
        {navButtons.map(button => (
          <button key={button}>{button}</button>
        ))}
      </div>
    </div>
  );
};

export default Header; 