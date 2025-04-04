import React, { useState, useEffect } from 'react';
import AdminLayout from './adminlayout';
import './ManageUsers.css';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaTrash, FaCheck, FaSpinner } from 'react-icons/fa';

const ManageUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [deletingUser, setDeletingUser] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/v1/users`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data.data.users);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      setDeletingUser(userId);
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/v1/users/adminDelete`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ id: userId })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete user');
      }

      setUsers(users.filter(user => user._id !== userId));
      toast.success('User deleted successfully');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeletingUser(null);
    }
  };

  const handleVerifyUser = async (userId) => {
    try {
      const token = sessionStorage.getItem('token');
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      
      const response = await fetch(`${BACKEND_URL}/api/v1/users/verify/${userId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to verify user');
      }

      setUsers(users.map(user => 
        user._id === userId ? { ...user, isVerified: true } : user
      ));
      toast.success('User verified successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="manage-users-container">
          <div className="loading">
            <FaSpinner className="spinner" /> Loading users...
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout>
        <div className="manage-users-container">
          <div className="error">Error: {error}</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="manage-users-container">
        <h1>Manage Users</h1>
        <div className="users-table-container">
          <table className="users-table">
            <thead>
              <tr>
                <th>Username</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Verified</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(user => (
                <tr key={user._id}>
                  <td>{user.username}</td>
                  <td>{user.name}</td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${user.role}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    {user.isVerified ? (
                      <span className="verified">
                        <FaCheck />
                      </span>
                    ) : (
                      <button 
                        className="verify-button"
                        onClick={() => handleVerifyUser(user._id)}
                      >
                        Verify
                      </button>
                    )}
                  </td>
                  <td>
                    {user.role !== 'admin' && (
                      <button
                        className="delete-button"
                        onClick={() => handleDeleteUser(user._id)}
                        disabled={deletingUser === user._id}
                      >
                        {deletingUser === user._id ? (
                          <FaSpinner className="spinner" />
                        ) : (
                          <>
                            <FaTrash /> Delete
                          </>
                        )}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <ToastContainer
      />
    </AdminLayout>
  );
};

export default ManageUsers; 