import React, { useState, useRef, useEffect } from 'react';
import './sellpage.css';
import Layout from './layout';
import { useNavigate } from 'react-router-dom';
import { getUserProfile } from './authService';
import { toast } from 'react-hot-toast';

const options = ["Sell it now", "List as Auction"];
const auctionDurationOptions = [
  { label: "1 minute (for testing)", value: 1, unit: "minutes" },
  { label: "1 day", value: 1, unit: "days" },
  { label: "2 days", value: 2, unit: "days" },
  { label: "7 days", value: 7, unit: "days" }
];

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
    imageCover: null,
    condition: '',
    usedFor: '',
    category: '',
    sellingType: 'Sell it now',
    isAuction: false,
    auctionDuration: auctionDurationOptions[0].value,
    auctionDurationUnit: auctionDurationOptions[0].unit,
    bidIncrement: 10 // Default bid increment is Rs. 10
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

    // Check if adding new files would exceed the 5 image limit
    const totalImages = imagePreview.length + files.length;
    if (totalImages > 5) {
      setErrors(prev => ({
        ...prev,
        images: 'You can only upload a maximum of 5 images'
      }));
      return;
    }

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

    // Basic field validation with detailed messages
    if (!formData.name?.trim()) {
      newErrors.name = 'Product name is required';
    } else if (formData.name.trim().length < 3) {
      newErrors.name = 'Product name must be at least 3 characters';
    }

    if (!formData.category?.trim()) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Description is required';
    } else if (formData.description.trim().length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    }

    if (!formData.condition || formData.condition === '') {
      newErrors.condition = 'Please select a product condition';
    }

    if (!formData.usedFor && formData.usedFor !== 0) {
      newErrors.usedFor = 'Please specify how long the product has been used';
    } else if (isNaN(formData.usedFor) || formData.usedFor < 0) {
      newErrors.usedFor = 'Used for must be a non-negative number';
    }

    // Image validation
    if (!formData.imageCover) {
      newErrors.images = 'Please upload at least one image';
    }

    // Price validation based on selling type
    if (formData.sellingType === 'Sell it now') {
      if (!formData.buyingPrice) {
        newErrors.buyingPrice = 'Original price is required';
      } else if (isNaN(formData.buyingPrice) || formData.buyingPrice <= 0) {
        newErrors.buyingPrice = 'Please enter a valid original price greater than 0';
      }

      if (!formData.sellingPrice) {
        newErrors.sellingPrice = 'Selling price is required';
      } else if (isNaN(formData.sellingPrice) || formData.sellingPrice <= 0) {
        newErrors.sellingPrice = 'Please enter a valid selling price greater than 0';
      }
    } else {
      if (!formData.startingPrice) {
        newErrors.startingPrice = 'Starting price is required';
      } else if (isNaN(formData.startingPrice) || formData.startingPrice <= 0) {
        newErrors.startingPrice = 'Please enter a valid starting price greater than 0';
      }
    }

    console.log("Validation results:", {
      formData: {
        name: formData.name?.trim() || 'missing',
        description: formData.description?.trim() || 'missing',
        condition: formData.condition || 'missing',
        usedFor: formData.usedFor || 'missing',
        prices: formData.sellingType === 'Sell it now' 
          ? { buying: formData.buyingPrice, selling: formData.sellingPrice }
          : { starting: formData.startingPrice },
        hasImage: !!formData.imageCover,
        seller: user._id,
        sellerName: user.username
      },
      errors: newErrors
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Updating ${name} with value:`, value);
    
    // Handle number inputs
    if (name === 'buyingPrice' || name === 'sellingPrice' || name === 'startingPrice' || name === 'usedFor') {
      // Only allow integers
      const intValue = value === '' ? '' : Math.floor(Number(value));
      setFormData(prev => ({
        ...prev,
        [name]: intValue
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
    setLoading(true);

    try {
      // Debug log the current form state
      console.log('Current form state:', {
        name: formData.name,
        description: formData.description,
        condition: formData.condition,
        usedFor: formData.usedFor,
        buyingPrice: formData.buyingPrice,
        sellingPrice: formData.sellingPrice,
        imageCover: formData.imageCover ? 'Present' : 'Missing',
        images: formData.images.length
      });
      console.log("Form data:", formData);
      // Validate form first
      const isValid = await validateForm();
      if (!isValid) {
        console.log('Form validation failed. Current errors:', errors);
        setLoading(false);
        return;
      }

      // Get token and user data
      const token = sessionStorage.getItem('token');
      const user = JSON.parse(sessionStorage.getItem('user'));
      
      if (!token || !user) {
        navigate('/login', { 
          state: { 
            message: 'Please log in to create a listing',
            from: '/sell'
          } 
        });
        return;
      }

      // Create FormData object for file upload
      const formDataToSend = new FormData();
      
      // Add basic fields with proper formatting and validation
      const fields = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        condition: formData.condition,
        usedFor: formData.usedFor.toString(),
        category: formData.category,
        isAuction: formData.sellingType === 'List as Auction' ? 'true' : 'false',
        sellingType: formData.sellingType === 'List as Auction' ? 'auction' : 'regular',
        seller: user._id, // Add seller ID
        sellerName: user.username, // Add seller name
        auctionDuration: formData.auctionDuration.toString(),
        auctionDurationUnit: formData.auctionDurationUnit,
        bidIncrement: formData.bidIncrement.toString()
      };

      // Log the fields before sending
      console.log('Fields to send:', fields);

      // Append each field to FormData
      Object.entries(fields).forEach(([key, value]) => {
        if (!value) {
          console.error(`Missing or empty value for ${key}:`, value);
          throw new Error(`Missing required field: ${key}`);
        }
        formDataToSend.append(key, value);
      });

      // Handle prices based on selling type
      if (formData.sellingType === 'List as Auction') {
        formDataToSend.append('buyingPrice', '0');
        formDataToSend.append('sellingPrice', formData.startingPrice.toString());
      } else {
        formDataToSend.append('buyingPrice', formData.buyingPrice.toString());
        formDataToSend.append('sellingPrice', formData.sellingPrice.toString());
      }

      // Add image files
      if (formData.imageCover) {
        formDataToSend.append('imageCover', formData.imageCover);
      }

      if (formData.images && formData.images.length > 0) {
        formData.images.forEach((image) => {
          formDataToSend.append('images', image);
        });
      }

      // Log all FormData entries
      for (let pair of formDataToSend.entries()) {
        console.log(`${pair[0]}:`, pair[1]);
      }

      // Determine which endpoint to use based on selling type
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const endpoint = `${BACKEND_URL}/api/v1/products`;
    
      console.log('Sending request to:', endpoint);
    
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formDataToSend
      });

      // Log response details
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      let responseData;
      try {
        responseData = await response.json();
        console.log('Response data:', responseData);
      } catch (error) {
        console.error('Error parsing response:', error);
        throw new Error('Failed to parse server response');
      }

      if (!response.ok) {
        console.error('Error response from server:', {
          status: response.status,
          statusText: response.statusText,
          data: responseData,
          headers: Object.fromEntries(response.headers.entries())
        });
        
        // Log the actual form data that was sent
        console.error('Form data that was sent:', {
          name: formData.name,
          description: formData.description,
          condition: formData.condition,
          usedFor: formData.usedFor,
          category: formData.category,
          sellingType: formData.sellingType,
          isAuction: formData.isAuction,
          buyingPrice: formData.buyingPrice,
          sellingPrice: formData.sellingPrice,
          startingPrice: formData.startingPrice,
          hasImageCover: !!formData.imageCover,
          additionalImages: formData.images.length,
          seller: user._id,
          sellerName: user.username
        });

        setErrors(prev => ({
          ...prev,
          submit: responseData.message || `Server error: ${response.status} ${response.statusText}`
        }));
        return;
      }

      // If this is an auction, create the auction with the product ID
      if (formData.sellingType === 'List as Auction') {
        const auctionData = {
          productId: responseData.data.product._id,
          startingPrice: Number(formData.startingPrice),
          currentPrice: Number(formData.startingPrice),
          startTime: new Date().toISOString(),
          endTime: new Date(Date.now() + formData.auctionDuration * 60 * 1000).toISOString(), // Convert minutes to milliseconds
          seller: user._id,
          status: 'active'
        };

        console.log('Creating auction with data:', auctionData);

        const auctionResponse = await fetch(`${BACKEND_URL}/api/v1/auctions`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(auctionData)
        });

        const auctionResponseData = await auctionResponse.json();

        if (!auctionResponse.ok) {
          console.error('Auction creation failed:', auctionResponseData);
          throw new Error(auctionResponseData.message || 'Failed to create auction');
        }

        // Show success alert and redirect
        toast.success('Auction created successfully!');
        navigate(`/auction/${auctionResponseData.data._id}`);
      } else {
        // Show success alert and redirect for regular product
        toast.success('Product created successfully!');
        navigate(`/product/${responseData.data.product._id}`);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrors(prev => ({
        ...prev,
        submit: 'An error occurred while creating the product'
      }));
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
              <h1 style={{ color: 'white', fontSize: '3rem' }}>List Your Item</h1>
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
                        startingPrice: '',
                        auctionDuration: auctionDurationOptions[0].value,
                        auctionDurationUnit: auctionDurationOptions[0].unit,
                        bidIncrement: 10 // Default bid increment is Rs. 10
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
                    step="1"
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
                    step="1"
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
                  step="1"
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
              <label>Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className={errors.category ? 'error' : ''}
              >
                <option value="">Select Category</option>
                {formData.sellingType === 'Sell it now' ? (
                  // Regular product categories
                  <>
                    <option value="Electronics">Electronics</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Home & Garden">Home & Garden</option>
                    <option value="Toys & Games">Toys & Games</option>
                    <option value="Books & Media">Books & Media</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                    <option value="Health & Beauty">Health & Beauty</option>
                    <option value="Automotive">Automotive</option>
                    <option value="Other">Other</option>
                  </>
                ) : (
                  // Auction-specific categories
                  <>
                    <option value="Collectibles">Collectibles</option>
                    <option value="Art">Art</option>
                    <option value="Antiques">Antiques</option>
                    <option value="Jewelry">Jewelry</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Memorabilia">Memorabilia</option>
                    <option value="Rare Items">Rare Items</option>
                    <option value="Luxury Goods">Luxury Goods</option>
                    <option value="Other">Other</option>
                  </>
                )}
              </select>
              {errors.category && <span className="error-message">{errors.category}</span>}
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

            {/* Only show auction fields for auction listings */}
            {formData.sellingType === 'List as Auction' && (
              <>
                <div className="sellpage-form-group">
                  <label>Auction Duration</label>
                  <select
                    name="auctionDuration"
                    value={formData.auctionDuration}
                    onChange={handleInputChange}
                    className={errors.auctionDuration ? 'error' : ''}
                  >
                    {auctionDurationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.auctionDuration && <span className="error-message">{errors.auctionDuration}</span>}
                </div>

                <div className="sellpage-form-group">
                  <label>Bid Increment</label>
                  <input
                    type="number"
                    name="bidIncrement"
                    value={formData.bidIncrement}
                    onChange={handleInputChange}
                    placeholder="Enter Bid Increment"
                    min="0"
                    step="1"
                    className={errors.bidIncrement ? 'error' : ''}
                  />
                  {errors.bidIncrement && <span className="error-message">{errors.bidIncrement}</span>}
                </div>
              </>
            )}

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
