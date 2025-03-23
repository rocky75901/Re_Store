import React, { useState, useRef, useEffect } from 'react';
import './sellpage.css';
import Layout from './layout';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from './authService';

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
    sellingType: 'Sell it now',
    isAuction: false
  });
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState([]);
  const fileInputRef = useRef(null);
  const [loading, setLoading] = useState(false);

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

  useEffect(() => {
    setFormData(prev => ({
      ...prev,
      isAuction: prev.sellingType === 'List as Auction'
    }));
  }, [formData.sellingType]);

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

  const validateForm = async () => {
    const newErrors = {};
    
    // Check if user is logged in
    const user = JSON.parse(sessionStorage.getItem('user'));
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
    console.log(`Updating ${name} with value:`, value);
    
    // Handle number inputs
    if (name === 'buyingPrice' || name === 'sellingPrice' || name === 'startingPrice' || name === 'usedFor') {
      setFormData(prev => ({
        ...prev,
        [name]: value === '' ? '' : Number(value)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

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
    console.log("Form submitted with type:", formData.sellingType);
    console.log("Current form data:", formData);
    setErrors({});

    // Check authentication first
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (!token || !user || !user._id) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to create a listing',
          from: '/sell'
        } 
      });
      return;
    }

    // Validate form data
    const validationErrors = {};
    if (!formData.name) validationErrors.name = 'Product name is required';
    if (!formData.description) validationErrors.description = 'Description is required';
    if (!formData.condition) validationErrors.condition = 'Condition is required';
    if (!formData.usedFor && formData.usedFor !== 0) validationErrors.usedFor = 'Used for duration is required';
    
    if (formData.sellingType === 'Sell it now') {
      if (!formData.buyingPrice && formData.buyingPrice !== 0) validationErrors.buyingPrice = 'Original price is required';
      if (!formData.sellingPrice && formData.sellingPrice !== 0) {
        validationErrors.sellingPrice = 'Selling price is required';
      }
    } else if (formData.sellingType === 'List as Auction') {
      if (!formData.startingPrice && formData.startingPrice !== 0) {
        validationErrors.startingPrice = 'Starting price is required';
      }
    }

    // Image validation
    if (!formData.imageCover && formData.images.length === 0) {
      validationErrors.images = 'At least one image is required';
    }

    if (Object.keys(validationErrors).length > 0) {
      console.log("Validation errors:", validationErrors);
      setErrors(validationErrors);
      return;
    }

    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const formDataToSend = new FormData();

      // Common fields for both selling types
      formDataToSend.append('name', formData.name);
      formDataToSend.append('description', formData.description);
      formDataToSend.append('condition', formData.condition);
      formDataToSend.append('usedFor', formData.usedFor);
      formDataToSend.append('buyingPrice', formData.buyingPrice || '0');
      formDataToSend.append('isAuction', formData.sellingType === 'List as Auction');

      // Handle image cover and additional images
      if (formData.imageCover) {
        formDataToSend.append('imageCover', formData.imageCover);
      } else if (formData.images.length > 0) {
        // If no specific cover image, use the first image as cover
        formDataToSend.append('imageCover', formData.images[0]);
        // Remove the first image from additional images to avoid duplication
        formData.images.slice(1).forEach(image => {
          formDataToSend.append('images', image);
        });
      }

      if (formData.sellingType === 'Sell it now') {
        // Regular product listing
        formDataToSend.append('sellingType', 'regular');
        formDataToSend.append('sellingPrice', formData.sellingPrice);
        formDataToSend.append('isAuction', false); // Explicitly set to false for regular listings
        console.log("Creating regular listing");

        const response = await fetch(`${BACKEND_URL}/api/v1/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to create listing');
        }

        const data = await response.json();
        alert('Your item has been listed successfully!');
        navigate(`/product/${data.data.product._id}`);
      } else if (formData.sellingType === 'List as Auction') {
        console.log("Creating auction listing");
        // First create the product with auction type
        formDataToSend.delete('sellingType'); // Remove any existing sellingType
        formDataToSend.delete('isAuction'); // Remove any existing isAuction
        formDataToSend.append('sellingType', 'auction');
        formDataToSend.append('sellingPrice', formData.startingPrice);
        formDataToSend.append('isAuction', true);

        console.log("Creating product for auction...");
        console.log("Form data values:");
        for (let [key, value] of formDataToSend.entries()) {
          console.log(key + ': ' + value);
        }

        const productResponse = await fetch(`${BACKEND_URL}/api/v1/products`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formDataToSend
        });

        if (!productResponse.ok) {
          const errorData = await productResponse.json();
          throw new Error(errorData.message || 'Failed to create product for auction');
        }

        const productData = await productResponse.json();
        console.log("Product created:", productData);
        const productId = productData.data.product._id;

        // Get user data from sessionStorage
        let userData = JSON.parse(sessionStorage.getItem('user'));
        if (!userData || !userData.username) {
          // Try to get username from the product response as fallback
          const seller = productData.data.product.seller;
          if (!seller) {
            sessionStorage.removeItem('token'); // Clear invalid session
            navigate('/login', { 
              state: { 
                message: 'Please log in to create an auction'
              }
            });
            return;
          }
          userData = { username: seller };
        }

        // Now create the auction
        const startTime = new Date();
        const endTime = new Date();
        endTime.setDate(endTime.getDate() + 7); // 7-day auction

        const auctionData = {
          productId: productId,
          startingPrice: parseFloat(formData.startingPrice),
          currentPrice: parseFloat(formData.startingPrice),
          startTime: startTime.toISOString(),
          endTime: endTime.toISOString(),
          seller: userData.username,
          status: 'active'
        };

        console.log("Creating auction with data:", auctionData);
        const auctionResponse = await fetch(`${BACKEND_URL}/api/v1/auctions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(auctionData)
        });

        if (!auctionResponse.ok) {
          const errorData = await auctionResponse.json();
          console.error("Auction creation failed:", errorData);
          // If auction creation fails, try to delete the product
          try {
            await fetch(`${BACKEND_URL}/api/v1/products/${productId}`, {
              method: 'DELETE',
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
          } catch (deleteError) {
            console.error("Failed to cleanup product after auction creation failed:", deleteError);
          }
          throw new Error(errorData.message || 'Failed to create auction');
        }

        const auctionResult = await auctionResponse.json();
        console.log("Auction created successfully:", auctionResult);
        alert('Your item has been listed for auction successfully!');
        navigate('/auctionpage');
      }
    } catch (error) {
      console.error('Error creating listing:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to create listing. Please try again.'
      }));
      alert(`Error: ${error.message || 'Failed to create listing. Please try again.'}`);
    } finally {
      setLoading(false);
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
                    console.log("Switching to:", option);
                    setActiveIndex(index);
                    setFormData(prev => {
                      const newData = {
                        ...prev,
                        sellingType: option,
                        // Clear all price fields first
                        buyingPrice: '',
                        sellingPrice: '',
                        startingPrice: ''
                      };
                      return newData;
                    });
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

            {errors.submit && <span className="error-message">{errors.submit}</span>}

            <button type="submit" className="sellpage-submit" disabled={loading}>
              {loading ? 'Creating Product...' : (
                formData.sellingType === 'List as Auction' 
                  ? 'Start Auction' 
                  : 'List For Sale'
              )}
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default SellPage;
