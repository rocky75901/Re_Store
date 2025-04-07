import React, { useState, useEffect } from 'react';
import './FilterSidebar.css';

const FilterSidebar = ({ onApplyFilters }) => {
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [priceRange, setPriceRange] = useState({ min: '', max: '' });
  const [isExpanded, setIsExpanded] = useState(false);
  const [isValid, setIsValid] = useState(true);

  const categories = [
    'Electronics',
    'Clothing',
    'Home & Garden',
    'Toys & Games',
    'Books & Media',
    'Sports & Outdoors',
    'Health & Beauty',
    'Automotive',
    'Others'
  ];

  const handleCategoryChange = (category) => {
    console.log('Category selected:', category);
    setSelectedCategories(prev => {
      const newCategories = prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category];
      console.log('New selected categories:', newCategories);
      return newCategories;
    });
  };

  const handlePriceChange = (e, type) => {
    const value = e.target.value;
    if (value === '' || (!isNaN(value) && value >= 0)) {
      setPriceRange(prev => ({
        ...prev,
        [type]: value
      }));
    }
  };

  useEffect(() => {
    const minPrice = Number(priceRange.min);
    const maxPrice = Number(priceRange.max);
    
    if (priceRange.min === '' || priceRange.max === '') {
      setIsValid(true);
    } else {
      setIsValid(maxPrice >= minPrice);
    }
  }, [priceRange]);

  const handleApplyFilters = () => {
    const minPrice = priceRange.min === '' ? '' : Number(priceRange.min);
    const maxPrice = priceRange.max === '' ? '' : Number(priceRange.max);

    if ((minPrice !== '' && maxPrice !== '' && maxPrice < minPrice) || 
        (minPrice !== '' && minPrice < 0) || 
        (maxPrice !== '' && maxPrice < 0)) {
      return;
    }

    console.log('Applying filters with categories:', selectedCategories);
    onApplyFilters({
      categories: selectedCategories,
      priceRange: {
        min: minPrice,
        max: maxPrice
      }
    });
    setIsExpanded(false);
  };

  const handleClearFilters = () => {
    setSelectedCategories([]);
    setPriceRange({ min: '', max: '' });
    onApplyFilters({
      categories: [],
      priceRange: {
        min: '',
        max: ''
      }
    });
  };

  return (
    <>
      <div 
        className={`filter-toggle ${isExpanded ? 'filter-toggle-open' : ''}`} 
        onClick={() => setIsExpanded(!isExpanded)}
        title={isExpanded ? "Hide filters" : "Show filters"}
      >
        <div className="hamburger">
          <span></span>
          <span></span>
          <span></span>
        </div>
        <span className="filter-title">Filters</span>
      </div>

      <div className={`filter-sidebar ${isExpanded ? 'expanded' : ''}`}>
        <div className="filter-header">
          <h2>Filters</h2>
          <button 
            className="close-filter"
            onClick={() => setIsExpanded(false)}
            title="Close filters"
          >
            ×
          </button>
        </div>

        <div className="filter-content">
          <div className="filter-section">
            <h3>Categories</h3>
            {categories.map(category => (
              <div key={category} className="category-item">
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
                  min="0"
                />
              </div>
              <div className="price-input">
                <label>Max Price</label>
                <input
                  type="number"
                  value={priceRange.max}
                  onChange={(e) => handlePriceChange(e, 'max')}
                  placeholder="Enter max price"
                  min="0"
                />
              </div>
              {!isValid && (
                <small style={{ color: '#dc3545', fontSize: '0.8rem', marginTop: '-8px' }}>
                  Maximum price must be greater than minimum price
                </small>
              )}
            </div>
          </div>

          <button 
            className="apply-filters-btn" 
            onClick={handleApplyFilters}
            disabled={!isValid}
          >
            Apply Filters
          </button>
          
          {(selectedCategories.length > 0 || priceRange.min !== '' || priceRange.max !== '') && (
            <button 
              className="apply-filters-btn" 
              onClick={handleClearFilters}
              style={{ marginTop: '10px', background: '#dc3545' }}
            >
              Clear Filters
            </button>
          )}
        </div>
      </div>
    </>
  );
};

export default FilterSidebar; 