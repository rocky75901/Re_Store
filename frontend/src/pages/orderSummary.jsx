import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Layout from "../components/layout";
import "./orderSummary.css";
import SuccessMessage from "../components/SuccessMessage";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderData, setOrderData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    // Get order data from location state or localStorage
    if (location.state) {
      setOrderData(location.state);
    } else {
      const savedOrder = localStorage.getItem("currentOrder");
      if (savedOrder) {
        setOrderData(JSON.parse(savedOrder));
      }
    }
    setLoading(false);
  }, [location.state]);

  const handleSubmit = async () => {
    try {
      // Get username from sessionStorage
      const userStr = sessionStorage.getItem("user");
      if (!userStr) {
        throw new Error("User not found");
      }
      const user = JSON.parse(userStr);
      const shippingAddressString = Object.values(orderData.shippingAddress)
        .filter(Boolean)
        .join(", ");
      // Create order object with current orderData
      const prevItems = orderData.items;
      let newItems = [];
      prevItems.forEach((element) => {
        newItems.push({
          product: element.product._id,
          name: element.product.name,
          quantity: element.quantity,
          price: element.sellingPrice,
        });
      });
      const order = {
        items: newItems,
        totalAmount: orderData.totalAmount,
        shippingAddress: shippingAddressString,
        paymentStatus: "completed",
      };
      // request payment form
      const token = sessionStorage.getItem("token");
      const BACKEND_URL =
        import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

      const response = await fetch(
        `${BACKEND_URL}/api/v1/orders/get-payment-form`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ totalAmount: orderData.totalAmount }),
        }
      );
      if (!response.ok) {
        const errorDetails = await response.json();
        throw new Error(errorDetails.message || "Something went wrong");
      }
      const data = await response.json();
      const options = {
        key: "rzp_test_j34PFFCMbkVnLL",
        amount: data.order.amount,
        currency: data.order.currency,
        name: "Re_Store",
        description: "Payment",
        order_id: data.order.id,
        handler: async function (response) {
          // verify payment
          const paymentDetails = {
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
          };
          const BACKEND_URL =
            import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
          const verifyResponse = await fetch(
            `${BACKEND_URL}/api/v1/orders/verify-payment`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify(paymentDetails),
            }
          );
          const result = await verifyResponse.json();
          if (result.status === "fail") {
            toast.error("Payment Verification Failed");
          } else if (result.status === "success") {
            setOrderData(null);
            toast.success("Payment Successful");
            console.log("HELLO");
            // add order to database
            const response = await fetch(`${BACKEND_URL}/api/v1/orders`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                ...order,
                razorpay_order_id: paymentDetails.razorpay_order_id,
              }),
            });
            if (response.ok) {
              navigate("/orders");
              toast.success("Order Placed");
            } else {
              navigate("/cart");
              toast.error("Failed To Place Order");
              toast.error("Amount Will Be Refunded");
            }
          }
        },
      };
      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // // Show success message
      // setShowSuccess(true);

      // // Navigate to orders page with the order data
      // setTimeout(() => {
      //   navigate("/orders");
      // }, 2000);
    } catch (error) {
      toast.error("Failed to place order. Please try again.");
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="order-summary-container">
          <div className="loading">Loading...</div>
        </div>
      </Layout>
    );
  }

  if (!orderData) {
    return (
      <Layout>
        <div className="order-summary-container">
          <div className="error">No order data found. Please try again.</div>
        </div>
      </Layout>
    );
  }

  const { items, totalAmount, shippingAddress } = orderData;

  return (
    <Layout>
      {showSuccess && (
        <SuccessMessage
          message="Order placed successfully!"
          onClose={() => setShowSuccess(false)}
        />
      )}
      <div className="order-summary-container">
        <div className="order-summary-main">
          <div className="order-summary-header">
            <h1>Order Summary</h1>
            <p>Please review your order details before proceeding to payment</p>
          </div>

          <div className="order-summary-content">
            {/* Shipping Address Section */}
            <div className="order-summary-section">
              <h2>Shipping Address</h2>
              <div className="shipping-details">
                <p>
                  <strong>{shippingAddress.fullName}</strong>
                </p>
                <p>{shippingAddress.addressLine1}</p>
                {shippingAddress.addressLine2 && (
                  <p>{shippingAddress.addressLine2}</p>
                )}
                <p>
                  {shippingAddress.city}, {shippingAddress.state}{" "}
                  {shippingAddress.postalCode}
                </p>
                <p>{shippingAddress.country}</p>
                <p>Phone: {shippingAddress.phoneNumber}</p>
              </div>
            </div>

            {/* Order Items Section */}
            <div className="order-summary-section">
              <h2>Order Items</h2>
              <div className="order-items">
                {items.map((item, index) => (
                  <div key={index} className="order-item">
                    <div className="item-image">
                      <img
                        src={item.product.imageCover || item.product.images[0]}
                        alt={item.product.name}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src =
                            "https://via.placeholder.com/150?text=No+Image";
                        }}
                      />
                    </div>
                    <div className="item-details">
                      <h3>{item.product.name}</h3>
                      <p>Price: ₹{item.sellingPrice}</p>
                      <p>Subtotal: ₹{item.sellingPrice * item.quantity}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Total Section */}
            <div className="order-summary-section">
              <h2>Order Total</h2>
              <div className="order-total">
                <div className="total-row">
                  <span>Subtotal:</span>
                  <span>₹{totalAmount}</span>
                </div>
                <div className="total-row">
                  <span>Shipping:</span>
                  <span>Free</span>
                </div>
                <div className="total-row grand-total">
                  <span>Total:</span>
                  <span>₹{totalAmount}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="order-summary-buttons">
            <button className="back-button" onClick={() => navigate(-1)}>
              Back
            </button>
            <button className="proceed-button" onClick={handleSubmit}>
              Place Order
            </button>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSummary;
