import React, { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './ToggleButton.css';

const options = ["Buy Now", "Auctions", "Request"];

const ToggleButton = ({ onOptionChange }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    
    // Initialize activeIndex based on current route
    const getInitialIndex = () => {
        switch(location.pathname) {
            case '/home':
                return 0;
            case '/auctionpage':
                return 1;
            case '/productrequest':
                return 2;
            default:
                return 0;
        }
    };

    const [activeIndex, setActiveIndex] = useState(getInitialIndex());
    const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

    // Update activeIndex when route changes
    useEffect(() => {
        setActiveIndex(getInitialIndex());
    }, [location.pathname]);
  
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

    const handleOptionClick = (index) => {
        setActiveIndex(index);
        // Navigate based on selected option
        const currentParams = new URLSearchParams(location.search);
        const searchQuery = currentParams.get('q') || '';
        
        let targetPath;
        switch(index) {
            case 0: // Buy it now
                targetPath = '/home';
                break;
            case 1: // Auctions
                targetPath = '/auctionpage';
                break;
            case 2: // Request
                targetPath = '/productrequest';
                break;
            default:
                targetPath = '/home';
        }
        
        // Preserve search query when navigating
        if (searchQuery) {
            navigate(`${targetPath}?q=${searchQuery}`);
        } else {
            navigate(targetPath);
        }
        
        if (onOptionChange) {
            onOptionChange(options[index]);
        }
    };
  
    return (
        <div className="filter-bar" ref={containerRef}>
            {/* Moving slider button */}
            <div 
                className="slider-button" 
                style={{
                    ...sliderStyle,
                    backgroundColor: '#4152b3', // Match your app's theme color
                }}
            />
  
            {/* Clickable options */}
            {options.map((option, index) => (
                <div
                    key={index}
                    className={`option ${activeIndex === index ? "active" : ""}`}
                    onClick={() => handleOptionClick(index)}
                >
                    {option}
                </div>
            ))}
        </div>
    );
};

export default ToggleButton;