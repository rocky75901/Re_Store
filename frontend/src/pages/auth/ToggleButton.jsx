import React, { useState, useRef, useEffect } from 'react';
import './ToggleButton.css';

const options = ["Buy it now", "Auctions", "Request"];

const ToggleButton = () => {
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
      );
};

export default ToggleButton;