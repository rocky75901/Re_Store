import React, { useState } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onApplyFilters }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isExpanded, setIsExpanded] = useState(false);

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Toys & Games',
    'Books & Media',
    'Sports & Outdoors',
    'Health & Beauty',
    'Automotive',
    'Other'
  ];

  const handleCategoryChange = (category) => {
    setSelectedCategories(prev => {
      if (prev.includes(category)) {
        return prev.filter(c => c !== category);
      }
      return [...prev, category];
    });
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    setPriceRange(prev => ({
      ...prev,
      [type]: value
    }));
  };

  const handleApplyFilters = () => {
    // Convert price values to numbers for comparison
    const minPrice = Number(priceRange.min);
    const maxPrice = Number(priceRange.max);

    // Only apply filters if max is greater than or equal to min
    if (maxPrice >= minPrice) {
      onApplyFilters({
        categories: selectedCategories,
        priceRange: {
          min: minPrice,
          max: maxPrice
        }
      });
      setIsExpanded(false);
    } else {
      alert('Maximum price must be greater than or equal to minimum price');
    }
  };

  return (
    <>
      <div className={`filter-toggle ${isExpanded ? 'filter-toggle-open' : ''}`} onClick={() => setIsExpanded(!isExpanded)}>
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="filter-title">Filters</span>
      </div>

      <div className={`filter-sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-content">
          <div className="filter-section">
            <h3>Categories</h3>
            {categories.map(category => (
              <div key={category} className="category-item">
                &nbsp;&nbsp;&nbsp;&nbsp;
                <input
                  type="checkbox"
                  id={category}
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryChange(category)}
                />
                <label htmlFor={category}>{category}</label>
              </div>
            ))}
          </div>

          <div className="filter-section">
            <h3>Price Range</h3>
            <div className="price-inputs">
              <div className="price-input">
                <label>Min Price</label>
                <input
                  type="number"
                  value={priceRange.min}
                  onChange={(e) => handlePriceChange(e, 'min')}
                  placeholder="Enter min price"
                />
              </div>
              <div className="price-input">
                <label>Max Price</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  placeholder="Enter max price"
                />
              </div>
            </div>
          </div>

          <button className="apply-filters-btn" onClick={handleApplyFilters}>
            Apply Filters
          </button>
        </div>
      </div>
    </>
  );
};

export default FilterSidebar; 