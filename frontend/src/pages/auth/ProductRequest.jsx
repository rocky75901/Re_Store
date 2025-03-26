import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./layout";
import ProductRequestcard from "./productRequestcard";
import ToggleButton from "./ToggleButton";
import "./ProductRequest.css";

const ProductRequest = ({ searchQuery = '' }) => {
  const location = useLocation();
  // Get search query from URL directly
  const urlSearchParams = new URLSearchParams(location.search);
  const urlSearchQuery = urlSearchParams.get('q') || '';
  // Use URL search query if available, otherwise use the prop
  const effectiveSearchQuery = urlSearchQuery || searchQuery;

  const [newRequest, setNewRequest] = useState("");
  const [requests, setRequests] = useState([
    { id: 1, message: "Looking for vintage cameras", timestamp: new Date() },
    { id: 2, message: "Need gaming laptop under $1000", timestamp: new Date() }
  ]);

  console.log('ProductRequest searchQuery:', effectiveSearchQuery);

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

  // Filter requests based on search query
  const filteredRequests = effectiveSearchQuery
    ? requests.filter(request => 
        request.message.toLowerCase().includes(effectiveSearchQuery.toLowerCase())
      )
    : requests;

  return (
    <Layout>
      <ToggleButton />
      <div className="product-request-container">
        <h1>Product Requests</h1>
        
        <div className="product-request-list">
          {filteredRequests.length === 0 && effectiveSearchQuery ? (
            <div className="no-results">
              <p>No requests match your search term: "{effectiveSearchQuery}"</p>
            </div>
          ) : (
            filteredRequests.map(request => (
              <ProductRequestcard
                key={request.id}
                id={request.id}
                initialMessage={request.message}
                onMessageUpdate={(newMessage) => handleMessageUpdate(request.id, newMessage)}
                onDelete={handleRequestDelete}
              />
            ))
          )}
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
