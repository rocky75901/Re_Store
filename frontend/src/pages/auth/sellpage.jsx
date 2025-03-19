import React, { useState, useRef, useEffect } from 'react';
import './sellpage.css';
import Layout from './layout';
import { useNavigate } from 'react-router-dom';

const options = ["Sell it now", "List as Auction"];

const SellPage = () => {
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    images: [],
    sellingType: 'Sell it now'
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);

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

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.price || isNaN(formData.price) || formData.price <= 0) {
      newErrors.price = 'Please enter a valid price';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    if (formData.images.length === 0) {
      newErrors.images = 'Please upload at least one image';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);

    // Validate file types and sizes
    const validFiles = files.filter(file => {
      const isValidType = ['image/jpeg', 'image/png', 'image/jpg'].includes(file.type);
      const isValidSize = file.size <= 5 * 1024 * 1024; // 5MB limit
      return isValidType && isValidSize;
    });

    if (validFiles.length !== files.length) {
      setErrors(prev => ({
        ...prev,
        images: 'Please upload valid images (JPEG, PNG, JPG) under 5MB'
      }));
      return;
    }

    // Create preview URLs
    const previewUrls = validFiles.map(file => URL.createObjectURL(file));
    setImagePreview(prev => [...prev, ...previewUrls]);

    // Update form data
    setFormData(prev => ({
      ...prev,
      images: [...prev.images, ...validFiles]
    }));
  };

  const removeImage = (index) => {
    setImagePreview(prev => prev.filter((_, i) => i !== index));
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('name', formData.name);
      formDataToSend.append('price', formData.price);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('sellingType', formData.sellingType);

      // Append each image
      formData.images.forEach((image) => {
        formDataToSend.append('images', image);
      });

      const token = localStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      // Choose endpoint based on selling type
      const endpoint = formData.sellingType === 'Auctions'
        ? `${BACKEND_URL}/api/v1/auctions`
        : `${BACKEND_URL}/api/v1/products`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      if (!response.ok) {
        throw new Error('Failed to create listing');
      }

      const data = await response.json();

      // Navigate based on selling type
      if (formData.sellingType === 'Auctions') {
        navigate(`/auctionproduct/${data.data.auction._id}`);
      } else {
        navigate(`/product/${data.data.product._id}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'Failed to create listing. Please try again.'
      }));
    }
  };

  return (
    <Layout showHeader={false}>
      <div className="sellpage-container">
        <div className="sellpage-main">
          <form className="sellpage-form" onSubmit={handleSubmit}>
            <div className="sellpage-Item-details">
              <h1 style={{ color: 'white' }}>Item details</h1>
            </div>

            <div className="sellpage-form-group">
              <label>Product Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter Product Name"
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="sellpage-form-group">
              <label>Upload images</label>
              <div
                className="sellpage-upload-area"
                onClick={() => fileInputRef.current?.click()}
              >
                <i className="fa-solid fa-cloud-arrow-up"></i>
                <p>Click here to upload</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  multiple
                  accept="image/*"
                  style={{ display: 'none' }}
                />
              </div>
              {errors.images && <span className="error-message">{errors.images}</span>}

              {imagePreview.length > 0 && (
                <div className="image-preview-container">
                  {imagePreview.map((url, index) => (
                    <div key={index} className="image-preview">
                      <img src={url} alt={`Preview ${index + 1}`} />
                      <button
                        type="button"
                        className="remove-image"
                        onClick={() => removeImage(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="filter-bar" ref={containerRef}>
              <div className="slider-button" style={sliderStyle}>
                {options[activeIndex]}
              </div>
              {options.map((option, index) => (
                <div
                  key={index}
                  className={`option ${activeIndex === index ? "active" : ""}`}
                  onClick={() => {
                    setActiveIndex(index);
                    setFormData(prev => ({
                      ...prev,
                      sellingType: option
                    }));
                  }}
                >
                  {option}
                </div>
              ))}
            </div>

            <div className="sellpage-form-group">
              <label>Price</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="Enter Price"
                min="0"
                step="0.01"
                className={errors.price ? 'error' : ''}
              />
              {errors.price && <span className="error-message">{errors.price}</span>}
            </div>

            <div className="sellpage-form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Enter Description"
                maxLength="1000"
                className={errors.description ? "error" : ""}
                style={{
                  width: "100%", // Fixed width
                  minHeight: "50px", // Minimum height
                  resize: "none", // Prevent manual resizing
                  overflow: "hidden", // Hide scrollbar
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "50px"; // Reset height
                    el.style.height = `${el.scrollHeight}px`; // Adjust height
                  }
                }}
              />

              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {errors.submit && <span className="error-message">{errors.submit}</span>}

            <button type="submit" className="sellpage-submit">
              Continue to add payment details
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SellPage;
