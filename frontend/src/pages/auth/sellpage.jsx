import React, { useState, useRef, useEffect }  from 'react';
import './sellpage.css';
import Layout from './layout';
const options = ["Sell it now ", "Auctions",];
const SellPage = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (containerRef.current) {
      const optionElements = containerRef.current.querySelectorAll('.option');
      const activeOption = optionElements[activeIndex];
      if (activeOption) {
        const { offsetLeft, clientWidth } = activeOption;
        setSliderStyle({ left: offsetLeft, width: clientWidth });
      }
    }
  }, [activeIndex]);
  return (
  <>
  <Layout showHeader={false}>
    <div className="sellpage-container">
      <div className="sellpage-main">

        <div className="sellpage-form">
          <div className="sellpage-Item-details">
          <h1 style={{color:'white'}}>Item details</h1>
          </div>
          <div className="sellpage-form-group">
            <label>Product Name</label>
            <input type="text" placeholder="Enter Product Name" />
          </div>

          <div className="sellpage-form-group">
            <label>Upload images</label>
            <div className="sellpage-upload-area">
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <p>Click here to upload</p>
            </div>
          </div>
          <div className="filter-bar" ref={containerRef}>
          {/* This is the moving sliding button */}
          <div className="slider-button" style={sliderStyle}>
            {options[activeIndex]}
          </div>
    
          {/* Render the options that can be clicked */}
          {options.map((option, index) => (
            <div
              key={index}
              className={`option ${activeIndex === index ? "active" : ""}`}
              onClick={() => setActiveIndex(index)}
            >
              {option}
            </div>
          ))}
        </div>

          <div className="sellpage-form-group">
            <label>Price</label>
            <input type="text" placeholder="Enter Price" />
          </div>

          <div className="sellpage-form-group">
            <label>Description</label>
            <textarea placeholder="Write a brief description"></textarea>
          </div>

          <button className="sellpage-submit">
            Continue to add payment details
          </button>
        </div>
      </div>
    </div>
  </Layout>
    </>
  );
};

export default SellPage;
