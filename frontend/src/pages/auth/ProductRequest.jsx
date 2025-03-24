import React, { useState } from "react";
import Layout from "./layout";
import ProductRequestcard from "./productRequestcard";
import ToggleButton from "./ToggleButton";
import "./ProductRequest.css";

const ProductRequest = () => {
  const [newRequest, setNewRequest] = useState("");
  const [requests, setRequests] = useState([
    { id: 1, message: "Looking for vintage cameras", timestamp: new Date() },
    { id: 2, message: "Need gaming laptop under $1000", timestamp: new Date() }
  ]);

  const handleNewRequest = (e) => {
    e.preventDefault();
    if (newRequest.trim()) {
      const newRequestObj = {
        id: requests.length + 1,
        message: newRequest.trim(),
        timestamp: new Date()
      };
      setRequests([newRequestObj, ...requests]);
      setNewRequest("");
    }
  };

  const handleMessageUpdate = (id, newMessage) => {
    setRequests(requests.map(request =>
      request.id === id ? { ...request, message: newMessage } : request
    ));
  };

  const handleRequestDelete = (id) => {
    setRequests(requests.filter(request => request.id !== id));
  };

  return (
    <Layout>
      <ToggleButton />
      <div className="product-request-container">
        <h1>Product Requests</h1>
        
        <div className="product-request-list">
          {requests.map(request => (
            <ProductRequestcard
              key={request.id}
              id={request.id}
              initialMessage={request.message}
              onMessageUpdate={(newMessage) => handleMessageUpdate(request.id, newMessage)}
              onDelete={handleRequestDelete}
            />
          ))}
        </div>

        <form className="new-request-form" onSubmit={handleNewRequest}>
          <input
            type="text"
            className="new-request-input"
            placeholder="What product are you looking for?"
            value={newRequest}
            onChange={(e) => setNewRequest(e.target.value)}
          />
          <button type="submit" className="submit-request-btn">
            Submit Request
          </button>
        </form>
      </div>
    </Layout>
  );
};

export default ProductRequest;
