import React, { useState, useEffect } from "react";
import "./profile.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";
import { Link } from "react-router-dom";
import Layout from "./layout";
import { getUserProfile, updateProfile } from "./authService";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    name: "",
    email: "",
    photo: "",
    phone: "",
  });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        // Ensure photo is a full URL if provided
        if (profileData.photo) {
          const url = new URL(profileData.photo);
          profileData.photo = url.href;
        }
        setUserInfo(profileData);
        setTempInfo(profileData);
      } catch (error) {
        console.error("Error fetching user profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  useEffect(() => {
    const userDataStr = sessionStorage.getItem('user');
    if (!userDataStr) {
      navigate('/login', { 
        state: { 
          message: 'Please log in to view your profile',
          from: '/profile'
        } 
      });
      return;
    }

    try {
      const userData = JSON.parse(userDataStr);
      if (!userData) {
        navigate('/login', { 
          state: { 
            message: 'Please log in to view your profile',
            from: '/profile'
          } 
        });
        return;
      }
      setUser(userData);
    } catch (error) {
      console.error('Error parsing user data:', error);
      sessionStorage.removeItem('user');
      navigate('/login', { 
        state: { 
          message: 'Please log in to view your profile',
          from: '/profile'
        } 
      });
    }
  }, [navigate]);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        const updatedUser = await updateProfile(tempInfo);
        setUserInfo(updatedUser);
        updateUser(updatedUser);
        setError("");
      } catch (err) {
        setError(err.message);
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e, field) => {
    setTempInfo({
      ...tempInfo,
      [field]: e.target.value,
    });
  };

  const handleCancel = () => {
    setTempInfo({ ...userInfo });
    setIsEditing(false);
    setError("");
  };

  const handleSaveEdit = async () => {
    try {
      const userDataStr = sessionStorage.getItem('user');
      const token = sessionStorage.getItem('token');

      if (!userDataStr || !token) {
        navigate('/login', { 
          state: { 
            message: 'Please log in to edit your profile',
            from: '/profile'
          } 
        });
        return;
      }

      let userData;
      try {
        userData = JSON.parse(userDataStr);
      } catch (parseError) {
        console.error('Error parsing user data:', parseError);
        sessionStorage.removeItem('user');
        navigate('/login', { 
          state: { 
            message: 'Please log in to edit your profile',
            from: '/profile'
          } 
        });
        return;
      }

      if (!userData) {
        navigate('/login', { 
          state: { 
            message: 'Please log in to edit your profile',
            from: '/profile'
          } 
        });
        return;
      }

      const formData = new FormData();
      
      // Append only changed fields from tempInfo
      if (tempInfo.name && tempInfo.name !== userData.name) {
        formData.append('name', tempInfo.name.trim());
      }
      if (tempInfo.username && tempInfo.username !== userData.username) {
        formData.append('username', tempInfo.username.trim());
      }
      if (tempInfo.email && tempInfo.email !== userData.email) {
        formData.append('email', tempInfo.email.trim());
      }
      if (tempInfo.phone && tempInfo.phone !== userData.phone) {
        formData.append('phone', tempInfo.phone.trim());
      }
      if (profileImage) {
        formData.append('photo', profileImage);
      }

      // Check if any fields were appended
      if ([...formData.keys()].length === 0) {
        setIsEditing(false);
        return;
      }

      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000';
      const response = await fetch(`${BACKEND_URL}/api/v1/users`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`
          // Do not set 'Content-Type' header when sending FormData
        },
        body: formData
      });

      if (!response.ok) {
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'Failed to update profile');
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const resContentType = response.headers.get('content-type');
      if (!resContentType || !resContentType.includes('application/json')) {
        throw new Error('Server returned non-JSON response');
      }

      const updatedData = await response.json();
      
      if (!updatedData || !updatedData.data) {
        throw new Error('Invalid response format from server');
      }

      // Update session storage with new user data
      sessionStorage.setItem('user', JSON.stringify(updatedData.data));
      
      // Update local state
      setUser(updatedData.data);
      setUserInfo(updatedData.data);
      setTempInfo(updatedData.data);
      
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.message.includes('Failed to fetch')) {
        alert('Unable to connect to server. Please check your connection and try again.');
      } else {
        alert(error.message || 'Failed to update profile');
      }
    }
  };

  if (loading) {
    return (
      <Layout showHeader={false}>
        <div className="profileright-half">
          <div className="loading">Loading profile...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout showHeader={false}>
      <div className="profileright-half">
        <div className="profile-image">
          <img
            src={tempInfo.photo}
            className="fa-solid fa-circle-user"
            style={{ color: "#4152b3", fontSize: "220px" }}
            alt="Profile"
          />
        </div>
        <div className="edit-icon-container">
          {isEditing ? (
            <>
              <i
                className="fa-solid fa-check save-icon"
                onClick={handleSaveEdit}
                style={{
                  color: "#0c0d0d",
                  fontSize: "24px",
                  cursor: "pointer",
                  marginRight: "15px",
                }}
              ></i>
              <i
                className="fa-solid fa-xmark cancel-icon"
                onClick={handleCancel}
                style={{
                  color: "#0c0d0d",
                  fontSize: "24px",
                  cursor: "pointer",
                }}
              ></i>
            </>
          ) : (
            <i
              className="fa-solid fa-pen edit-icon"
              onClick={handleEdit}
              style={{ color: "#0c0d0d", fontSize: "24px", cursor: "pointer" }}
            ></i>
          )}
        </div>

        {isEditing && (
          <div className="photo-upload-container" style={{ margin: "15px 0" }}>
            <label 
              htmlFor="photo-upload" 
              style={{
                padding: "8px 16px",
                backgroundColor: "#4152b3",
                color: "white",
                borderRadius: "4px",
                cursor: "pointer",
                display: "inline-block",
                transition: "background-color 0.3s ease"
              }}
            >
              Change Profile Photo
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (file.size > 5 * 1024 * 1024) {
                      alert('File size should be less than 5MB');
                      return;
                    }
                    if (!file.type.startsWith('image/')) {
                      alert('Please upload an image file');
                      return;
                    }
                    setProfileImage(file);
                    // Create a preview URL
                    const previewUrl = URL.createObjectURL(file);
                    setTempInfo({
                      ...tempInfo,
                      photo: previewUrl
                    });
                  }
                }}
              />
            </label>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        <div className="profileinfobox">
          {isEditing ? (
            <>
              <input
                type="text"
                className="edit-input username"
                value={tempInfo.username || ""}
                onChange={(e) => handleChange(e, "username")}
                placeholder="Username"
              />
              <input
                type="text"
                className="edit-input name"
                value={tempInfo.name || ""}
                onChange={(e) => handleChange(e, "name")}
                placeholder="Full Name"
              />
              <input
                type="email"
                className="edit-input email"
                value={tempInfo.email || ""}
                onChange={(e) => handleChange(e, "email")}
                placeholder="Email"
              />
              <input
                type="text"
                className="edit-input phone"
                value={tempInfo.phone || ""}
                onChange={(e) => handleChange(e, "phone")}
                placeholder="Phone Number"
              />
            </>
          ) : (
            <>
              <h2 className="username">{userInfo.username || "Username"}</h2>
              <p className="name">{userInfo.name || "Name"}</p>
              <p className="email">{userInfo.email || "Email"}</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
