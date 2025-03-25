import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Layout from './layout';
import './shippingpage.css';

const ShippingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [formData, setFormData] = useState({
    fullName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phoneNumber: ''
  });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    // Get cart items and total amount from location state
    if (location.state) {
      setCartItems(location.state.cartItems || []);
      setTotalAmount(location.state.totalAmount || 0);
    }
  }, [location.state]);

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

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.addressLine1.trim()) {
      newErrors.addressLine1 = 'Address line 1 is required';
    }

    if (!formData.city.trim()) {
      newErrors.city = 'City is required';
    }

    if (!formData.state.trim()) {
      newErrors.state = 'State is required';
    }

    if (!formData.postalCode.trim()) {
      newErrors.postalCode = 'Postal code is required';
    } else if (!/^\d{6}$/.test(formData.postalCode)) {
      newErrors.postalCode = 'Postal code must be 6 digits';
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = 'Phone number must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!validateForm()) {
        setLoading(false);
        return;
      }

      // Format shipping address
      const shippingAddress = {
        fullName: formData.fullName,
        addressLine1: formData.addressLine1,
        addressLine2: formData.addressLine2,
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        phoneNumber: formData.phoneNumber
      };

      // Create order data
      const orderData = {
        items: cartItems,
        totalAmount,
        shippingAddress,
        orderDate: new Date().toISOString()
      };

      // Save order data to localStorage
      localStorage.setItem('currentOrder', JSON.stringify(orderData));
      localStorage.setItem('shippingDetails', JSON.stringify(shippingAddress));

      // Navigate to order summary page with order data
      navigate('/order-summary', {
        state: orderData
      });
    } catch (error) {
      console.error('Error processing order:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to process order. Please try again.'
      }));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="shipping-container">
        <div className="shipping-main">
          <form className="shipping-form" onSubmit={handleSubmit}>
            <div className="shipping-header">
              <h1>Shipping Details</h1>
              <p>Please provide your shipping information</p>
            </div>

            <div className="shipping-form-group">
              <label>Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                className={errors.fullName ? 'error' : ''}
              />
              {errors.fullName && <span className="error-message">{errors.fullName}</span>}
            </div>

            <div className="shipping-form-group">
              <label>Address Line 1</label>
              <input
                type="text"
                name="addressLine1"
                value={formData.addressLine1}
                onChange={handleInputChange}
                placeholder="Enter your street address"
                className={errors.addressLine1 ? 'error' : ''}
              />
              {errors.addressLine1 && <span className="error-message">{errors.addressLine1}</span>}
            </div>

            <div className="shipping-form-group">
              <label>Address Line 2 (Optional)</label>
              <input
                type="text"
                name="addressLine2"
                value={formData.addressLine2}
                onChange={handleInputChange}
                placeholder="Apartment, suite, unit, etc. (optional)"
              />
            </div>

            <div className="shipping-form-row">
              <div className="shipping-form-group">
                <label>City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  placeholder="Enter city"
                  className={errors.city ? 'error' : ''}
                />
                {errors.city && <span className="error-message">{errors.city}</span>}
              </div>

              <div className="shipping-form-group">
                <label>State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  placeholder="Enter state"
                  className={errors.state ? 'error' : ''}
                />
                {errors.state && <span className="error-message">{errors.state}</span>}
              </div>
            </div>

            <div className="shipping-form-row">
              <div className="shipping-form-group">
                <label>Postal Code</label>
                <input
                  type="text"
                  name="postalCode"
                  value={formData.postalCode}
                  onChange={handleInputChange}
                  placeholder="Enter postal code"
                  className={errors.postalCode ? 'error' : ''}
                />
                {errors.postalCode && <span className="error-message">{errors.postalCode}</span>}
              </div>

              <div className="shipping-form-group shipping-form-group-country">
                <label>Country</label>
                <select
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                >
                  <option value="India">India</option>
                  <option value="United States">United States</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="Canada">Canada</option>
                  <option value="Australia">Australia</option>
                </select>
              </div>
            </div>

            <div className="shipping-form-group">
              <label>Phone Number</label>
              <input
                type="tel"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter your phone number"
                className={errors.phoneNumber ? 'error' : ''}
              />
              {errors.phoneNumber && <span className="error-message">{errors.phoneNumber}</span>}
            </div>

            {errors.submit && <span className="error-message">{errors.submit}</span>}

            <div className="shipping-buttons">
              <button
                type="button"
                className="shipping-back"
                onClick={() => navigate(-1)}
              >
                Back
              </button>
              <button
                type="submit"
                className="shipping-continue"
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Continue to Payment'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ShippingPage; 