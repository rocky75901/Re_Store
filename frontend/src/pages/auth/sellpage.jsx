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
    buyingPrice: '',
    sellingPrice: '',
    startingPrice: '',
    description: '',
    images: [],
    imageCover: '',
    condition: '',
    usedFor: '',
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

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    console.log("Files selected:", files.length);

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
    
    // Update image previews
    setImagePreview(prev => [...prev, ...previewUrls]);

    // If this is the first image upload, set it as cover image
    if (!formData.imageCover) {
      console.log("Setting first image as cover");
      setFormData(prev => ({
        ...prev,
        imageCover: validFiles[0],
        images: validFiles.slice(1) // Rest of the images go to additional images
      }));
    } else {
      // If we already have a cover image, add new images to additional images
      console.log("Adding to additional images");
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...validFiles]
      }));
    }

    // Clear any existing image errors
    if (errors.images) {
      setErrors(prev => ({
        ...prev,
        images: ''
      }));
    }
  };

  const removeImage = (index) => {
    // Remove from preview
    setImagePreview(prev => prev.filter((_, i) => i !== index));

    // If removing cover image
    if (index === 0 && formData.imageCover) {
      const newImages = formData.images;
      setFormData(prev => ({
        ...prev,
        imageCover: newImages.length > 0 ? newImages[0] : null,
        images: newImages.slice(1)
      }));
    } else {
      // Removing additional image
      setFormData(prev => ({
        ...prev,
        images: prev.images.filter((_, i) => i !== (index - (formData.imageCover ? 1 : 0)))
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Check if user is logged in
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user || !user._id) {
      newErrors.submit = 'Please log in to create a listing';
      return false;
    }

    // Basic field validation
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    }
    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    }
    if (!formData.condition) {
      newErrors.condition = 'Product condition is required';
    }
    if (!formData.usedFor || isNaN(formData.usedFor) || formData.usedFor < 0) {
      newErrors.usedFor = 'Please enter how long the product has been used (in months)';
    }

    // Image validation
    if (!formData.imageCover) {
      newErrors.images = 'Please upload at least one image';
    }

    // Price validation based on selling type
    if (formData.sellingType === 'Sell it now') {
      if (!formData.buyingPrice || isNaN(formData.buyingPrice) || formData.buyingPrice <= 0) {
        newErrors.buyingPrice = 'Please enter a valid original price';
      }
      if (!formData.sellingPrice || isNaN(formData.sellingPrice) || formData.sellingPrice <= 0) {
        newErrors.sellingPrice = 'Please enter a valid selling price';
      }
    } else {
      if (!formData.startingPrice || isNaN(formData.startingPrice) || formData.startingPrice <= 0) {
        newErrors.startingPrice = 'Please enter a valid starting price for auction';
      }
    }

    console.log("Validation errors:", newErrors);
    console.log("Current form state:", formData);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form submitted, validating...");
    console.log("Current form data:", formData);

    if (!validateForm()) {
      console.log("Form validation failed. Errors:", errors);
      return;
    }

    try {
      console.log("Form validation passed, preparing data...");
      const formDataToSend = new FormData();
      
      // Get user data
      const user = JSON.parse(localStorage.getItem('user'));
      const token = localStorage.getItem('token');
      
      console.log("User data:", { userId: user._id, hasToken: !!token });
      
      // Basic product details
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('usedFor', formData.usedFor);
      formDataToSend.append('sellerId', user._id.toString()); // Convert ObjectId to string

      // Add prices for regular listing
      if (formData.sellingType === 'Sell it now') {
        formDataToSend.append('buyingPrice', formData.buyingPrice);
        formDataToSend.append('sellingPrice', formData.sellingPrice);
      }

      console.log("Added basic details to FormData");

      // Log FormData contents for debugging
      for (let pair of formDataToSend.entries()) {
        console.log(pair[0] + ': ' + pair[1]);
      }

      // Add cover image
      if (formData.imageCover instanceof File) {
        formDataToSend.append('imageCover', formData.imageCover);
        console.log("Added cover image:", formData.imageCover.name);
      } else {
        console.error("Cover image is not a File object:", formData.imageCover);
        throw new Error('Invalid cover image format');
      }
      
      // Add additional images
      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image, index) => {
          if (image instanceof File) {
            formDataToSend.append('images', image);
            console.log(`Added image ${index + 1}:`, image.name);
          } else {
            console.error(`Image ${index + 1} is not a File object:`, image);
          }
        });
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      console.log("Using backend URL:", BACKEND_URL);

      if (formData.sellingType === 'Sell it now') {
        // Regular product listing
        console.log("Sending product listing request...");
        const response = await fetch(`${BACKEND_URL}/api/v1/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });

        console.log("Got response:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.message || 'Failed to create listing');
        }

        const data = await response.json();
        console.log("Success response:", data);
        alert('Your item is now listed for sale! Buyers can see your product and purchase it.');
        navigate(`/product/${data.data.product._id}`);
      } else {
        // Auction listing
        formDataToSend.append('startingPrice', formData.startingPrice);
        formDataToSend.append('currentPrice', formData.startingPrice);
        
        // Set auction duration to 7 days
        const startTime = new Date();
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 7);
        
        formDataToSend.append('startTime', startTime.toISOString());
        formDataToSend.append('endTime', endTime.toISOString());
        formDataToSend.append('status', 'active');

        console.log("Sending auction listing request...");
        const response = await fetch(`${BACKEND_URL}/api/v1/auctions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });

        console.log("Got response:", response.status);
        if (!response.ok) {
          const errorData = await response.json();
          console.error("Error response:", errorData);
          throw new Error(errorData.message || 'Failed to create auction');
        }

        const data = await response.json();
        console.log("Success response:", data);
        alert('Your item has been listed for auction! Buyers can now place bids.');
        navigate(`/auctionproduct/${data.data.auction._id}`);
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to create listing. Please try again.'
      }));
      // Display the error to the user
      alert(`Error: ${error.message || 'Failed to create listing. Please try again.'}`);
    }
  };

  return (
    <Layout showHeader={false}>
      <div className="sellpage-container">
        <div className="sellpage-main">
          <form className="sellpage-form" onSubmit={handleSubmit}>
            <div className="sellpage-Item-details">
              <h1 style={{ color: 'white' }}>List Your Item</h1>
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

            {formData.sellingType === 'Sell it now' ? (
              <>
                <div className="sellpage-form-group">
                  <label>Original Price</label>
                  <input
                    type="number"
                    name="buyingPrice"
                    value={formData.buyingPrice}
                    onChange={handleInputChange}
                    placeholder="Enter Original Price"
                    min="0"
                    step="0.01"
                    className={errors.buyingPrice ? 'error' : ''}
                  />
                  {errors.buyingPrice && <span className="error-message">{errors.buyingPrice}</span>}
                </div>

                <div className="sellpage-form-group">
                  <label>Selling Price</label>
                  <input
                    type="number"
                    name="sellingPrice"
                    value={formData.sellingPrice}
                    onChange={handleInputChange}
                    placeholder="Enter Selling Price"
                    min="0"
                    step="0.01"
                    className={errors.sellingPrice ? 'error' : ''}
                  />
                  {errors.sellingPrice && <span className="error-message">{errors.sellingPrice}</span>}
                </div>
              </>
            ) : (
              <div className="sellpage-form-group">
                <label>Starting Bid Price</label>
                <input
                  type="number"
                  name="startingPrice"
                  value={formData.startingPrice}
                  onChange={handleInputChange}
                  placeholder="Enter Starting Bid Price"
                  min="0"
                  step="0.01"
                  className={errors.startingPrice ? 'error' : ''}
                />
                {errors.startingPrice && <span className="error-message">{errors.startingPrice}</span>}
              </div>
            )}

            <div className="sellpage-form-group">
              <label>Product Condition</label>
              <select
                name="condition"
                value={formData.condition}
                onChange={handleInputChange}
                className={errors.condition ? 'error' : ''}
              >
                <option value="">Select Condition</option>
                <option value="New">New</option>
                <option value="Like New">Like New</option>
                <option value="Good">Good</option>
                <option value="Fair">Fair</option>
                <option value="Poor">Poor</option>
              </select>
              {errors.condition && <span className="error-message">{errors.condition}</span>}
            </div>

            <div className="sellpage-form-group">
              <label>Used For (in months)</label>
              <input
                type="number"
                name="usedFor"
                value={formData.usedFor}
                onChange={handleInputChange}
                placeholder="Enter how long the product has been used"
                min="0"
                step="1"
                className={errors.usedFor ? 'error' : ''}
              />
              {errors.usedFor && <span className="error-message">{errors.usedFor}</span>}
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
                  width: "100%",
                  minHeight: "50px",
                  resize: "none",
                  overflow: "hidden",
                }}
                ref={(el) => {
                  if (el) {
                    el.style.height = "50px";
                    el.style.height = `${el.scrollHeight}px`;
                  }
                }}
              />
              {errors.description && <span className="error-message">{errors.description}</span>}
            </div>

            {errors.submit && <span className="error-message">{errors.submit}</span>}

            <button type="submit" className="sellpage-submit">
              {formData.sellingType === 'List as Auction' 
                ? 'Start Auction' 
                : 'List For Sale'}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SellPage;
