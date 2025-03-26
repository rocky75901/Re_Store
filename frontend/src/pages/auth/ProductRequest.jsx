import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "./layout";
import ProductRequestcard from "./productRequestcard";
import ToggleButton from "./ToggleButton";
import "./ProductRequest.css";
import { toast } from "react-hot-toast";

const ProductRequest = ({ searchQuery = '' }) => {
  const location = useLocation();
  // Get search query from URL directly
  const urlSearchParams = new URLSearchParams(location.search);
  const urlSearchQuery = urlSearchParams.get('q') || '';
  // Use URL search query if available, otherwise use the prop
  const effectiveSearchQuery = urlSearchQuery || searchQuery;

  const [newRequest, setNewRequest] = useState("");
  const [requests, setRequests] = useState([]);

  useEffect(()=>{
    const fetchData = async () => {
      const BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${BACKEND_URL}/api/v1/product-requests`, {
        method: "GET",
      });
      const data = await response.json();
      console.log('Fetched requests data:', JSON.stringify(data, null, 2));
      setRequests(data.data.productRequests);
    };
    fetchData();
  },[])

  console.log('ProductRequest searchQuery:', effectiveSearchQuery);

  const handleNewRequest = async (e) => {
    e.preventDefault();
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (newRequest.trim()) {
      const newRequestObj = {
        username: user.username,
        description: newRequest.trim(),
      };
      const BACKEND_URL =  import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${BACKEND_URL}/api/v1/product-requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRequestObj)
      });
    }
  };

  const handleMessageUpdate = (id, newMessage) => {
    setRequests(requests.map(request =>
      request.id === id ? { ...request, message: newMessage } : request
    ));
  };

  const handleRequestDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm('Are you sure you want to delete this request? This action cannot be undone.');
    if (!isConfirmed) {
      return;
    }

    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to delete requests');
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      console.log('Deleting request with ID:', id);
      
      const response = await fetch(`${BACKEND_URL}/api/v1/product-requests/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      const data = await response.json();
      console.log('Delete response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete request');
      }

      // Update the local state by removing the deleted request
      setRequests(prevRequests => {
        const updatedRequests = prevRequests.filter(request => request._id !== id);
        console.log('Updated requests after deletion:', updatedRequests);
        return updatedRequests;
      });
      
      toast.success('Request deleted successfully');
    } catch (error) {
      console.error('Error deleting request:', error);
      toast.error(error.message || 'Failed to delete request');
    }
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
                key={request._id}
                id={request._id}
                initialMessage={request.description}
                onMessageUpdate={(newMessage) => handleMessageUpdate(request._id, newMessage)}
                onDelete={() => handleRequestDelete(request._id)}
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
