import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from './layout';
import './PaymentDetails.css';

const PaymentDetails = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { listingId, listingType } = location.state || {};

  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiryDate: '',
    cvv: '',
    upiId: '',
    paymentMethod: 'card' // 'card' or 'upi'
  });

  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').match(/.{1,4}/g)?.join(' ') || '';
    }

    // Format expiry date
    if (name === 'expiryDate') {
      formattedValue = value
        .replace(/\D/g, '')
        .replace(/^(\d{2})/, '$1/')
        .substr(0, 5);
    }

    setFormData(prev => ({
      ...prev,
      [name]: formattedValue
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

    if (formData.paymentMethod === 'card') {
      if (!formData.cardNumber || formData.cardNumber.replace(/\s/g, '').length !== 16) {
        newErrors.cardNumber = 'Please enter a valid 16-digit card number';
      }
      if (!formData.cardName) {
        newErrors.cardName = 'Please enter the name on card';
      }
      if (!formData.expiryDate || !/^(0[1-9]|1[0-2])\/([0-9]{2})$/.test(formData.expiryDate)) {
        newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
      }
      if (!formData.cvv || !/^[0-9]{3,4}$/.test(formData.cvv)) {
        newErrors.cvv = 'Please enter a valid CVV';
      }
    } else {
      if (!formData.upiId || !formData.upiId.includes('@')) {
        newErrors.upiId = 'Please enter a valid UPI ID';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';

      const response = await fetch(`${BACKEND_URL}/api/v1/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          listingId,
          listingType,
          paymentMethod: formData.paymentMethod,
          paymentDetails: formData.paymentMethod === 'card' ? {
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            cardName: formData.cardName,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv
          } : {
            upiId: formData.upiId
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to process payment');
      }

      // Navigate based on listing type
      navigate(listingType === 'auction' ? '/auctionpage' : '/home', {
        state: { message: 'Payment processed successfully!' }
      });
    } catch (error) {
      console.error('Error processing payment:', error);
      setErrors(prev => ({
        ...prev,
        submit: error.message || 'Failed to process payment. Please try again.'
      }));
    }
  };

  return (
    <Layout showHeader={false}>
      <div className="payment-container">
        <div className="payment-main">
          <form className="payment-form" onSubmit={handleSubmit}>
            <div className="payment-header">
              <h1>Payment Details</h1>
            </div>

            <div className="payment-method-toggle">
              <button
                type="button"
                className={`method-button ${formData.paymentMethod === 'card' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'card' }))}
              >
                <i className="fa-solid fa-credit-card"></i>
                Card Payment
              </button>
              <button
                type="button"
                className={`method-button ${formData.paymentMethod === 'upi' ? 'active' : ''}`}
                onClick={() => setFormData(prev => ({ ...prev, paymentMethod: 'upi' }))}
              >
                <i className="fa-solid fa-mobile-screen-button"></i>
                UPI Payment
              </button>
            </div>

            {formData.paymentMethod === 'card' ? (
              <>
                <div className="payment-form-group">
                  <label>Card Number</label>
                  <input
                    type="text"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleInputChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength="19"
                    className={errors.cardNumber ? 'error' : ''}
                  />
                  {errors.cardNumber && <span className="error-message">{errors.cardNumber}</span>}
                </div>

                <div className="payment-form-group">
                  <label>Name on Card</label>
                  <input
                    type="text"
                    name="cardName"
                    value={formData.cardName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className={errors.cardName ? 'error' : ''}
                  />
                  {errors.cardName && <span className="error-message">{errors.cardName}</span>}
                </div>

                <div className="payment-form-row">
                  <div className="payment-form-group">
                    <label>Expiry Date</label>
                    <input
                      type="text"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleInputChange}
                      placeholder="MM/YY"
                      maxLength="5"
                      className={errors.expiryDate ? 'error' : ''}
                    />
                    {errors.expiryDate && <span className="error-message">{errors.expiryDate}</span>}
                  </div>

                  <div className="payment-form-group">
                    <label>CVV</label>
                    <input
                      type="password"
                      name="cvv"
                      value={formData.cvv}
                      onChange={handleInputChange}
                      placeholder="123"
                      maxLength="4"
                      className={errors.cvv ? 'error' : ''}
                    />
                    {errors.cvv && <span className="error-message">{errors.cvv}</span>}
                  </div>
                </div>
              </>
            ) : (
              <div className="payment-form-group">
                <label>UPI ID</label>
                <input
                  type="text"
                  name="upiId"
                  value={formData.upiId}
                  onChange={handleInputChange}
                  placeholder="username@upi"
                  className={errors.upiId ? 'error' : ''}
                />
                {errors.upiId && <span className="error-message">{errors.upiId}</span>}
              </div>
            )}

            {errors.submit && <span className="error-message">{errors.submit}</span>}

            <button type="submit" className="payment-submit">
              Process Payment
            </button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default PaymentDetails; 