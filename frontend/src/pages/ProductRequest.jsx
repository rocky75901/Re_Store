import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "../components/layout";
import ProductRequestcard from "./productRequestcard";
import ToggleButton from "../components/ToggleButton";
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
      setRequests(data.data.productRequests);
    };
    fetchData();
  },[])


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
    window.location.reload();
  };

  const handleMessageUpdate = async (id, newMessage) => {
    try {
      const token = sessionStorage.getItem('token');
      if (!token) {
        toast.error('Please log in to edit requests');
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
      const response = await fetch(`${BACKEND_URL}/api/v1/product-requests/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          description: newMessage
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update request');
      }

      // Update the local state only after successful backend update
      setRequests(requests.map(request =>
        request._id === id ? { ...request, description: newMessage } : request
      ));
      
      toast.success('Request updated successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to update request');
    }
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
      
      const response = await fetch(`${BACKEND_URL}/api/v1/product-requests/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to delete request');
      }

      // Update the local state by removing the deleted request
      setRequests(prevRequests => {
        const updatedRequests = prevRequests.filter(request => request._id !== id);
        return updatedRequests;
      });
      
      toast.success('Request deleted successfully');
    } catch (error) {
      
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
    <Layout showSearchBar={false} customHeaderContent={<h2 className='product-request-heading'>Product Requests</h2>}>
      <ToggleButton />
      <div className="product-request-container">
        <h1>Product Requests</h1>
        
        <div className="product-request-list">
          {filteredRequests.length === 0 && effectiveSearchQuery ? (
            <div className="no-results">
              <p>No requests match your search term: "{effectiveSearchQuery}"</p>
            </div>
          ) : (
            filteredRequests.map(request => {
              // Get current user from session storage
              const currentUser = JSON.parse(sessionStorage.getItem('user'));
              const isOwner = currentUser && currentUser.username === request.username;

              return (
                <ProductRequestcard
                  key={request._id}
                  id={request._id}
                  initialMessage={request.description}
                  username={request.username}
                  isOwner={isOwner}
                  onMessageUpdate={(newMessage) => handleMessageUpdate(request._id, newMessage)}
                  onDelete={() => handleRequestDelete(request._id)}
                />
              );
            })
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
