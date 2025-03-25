import React, { useState, useEffect } from "react";
import "./profile.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";
import { Link } from "react-router-dom";
import Layout from "./layout";
import { getUserProfile, updateProfile, changePassword } from "./authService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Profile = () => {
  const { user: authUser, updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [userInfo, setUserInfo] = useState({
    username: "",
    name: "",
    email: "",
    room: "", // this maps to address in the backend
    photo: ""
  });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });
  const [passwordInfo, setPasswordInfo] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [passwordVisibility, setPasswordVisibility] = useState({
    currentPassword: false,
    newPassword: false,
    confirmPassword: false
  });

  const fetchProfile = async () => {
    const token = sessionStorage.getItem('token');
    const user = JSON.parse(sessionStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const profileData = await getUserProfile();
      const formattedData = {
        ...profileData,
        room: profileData.address || '', // map address to room
        photo: profileData.photo || ''
      };
      setUserInfo(formattedData);
      setTempInfo(formattedData);
      setPreviewUrl(formattedData.photo);
      updateUser(formattedData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      const formattedUser = {
        ...authUser,
        room: authUser.address || '', // map address to room
        photo: authUser.photo || ''
      };
      setUserInfo(formattedUser);
      setTempInfo(formattedUser);
      setPreviewUrl(formattedUser.photo);
      setLoading(false);
    } else {
      fetchProfile();
    }
  }, [authUser]);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size should not exceed 5MB");
        return;
      }
      if (!file.type.startsWith('image/')) {
        setError("Please select an image file");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleEdit = async () => {
    if (isEditing) {
      try {
        // Validate fields
        if (!tempInfo.username || !tempInfo.name) {
          setError("Username and Name are required");
          return;
        }
        if (tempInfo.username.length > 10) {
          setError("Username cannot be more than 10 characters");
          return;
        }

        const formData = new FormData();
        formData.append('username', tempInfo.username);
        formData.append('name', tempInfo.name);
        if (tempInfo.room) {
          formData.append('address', tempInfo.room);
        }
        
        if (selectedFile) {
          formData.append('photo', selectedFile, selectedFile.name);
          console.log('Appending file:', selectedFile.name, selectedFile.type, selectedFile.size);
        }

        console.log('Submitting form data:', {
          username: tempInfo.username,
          name: tempInfo.name,
          address: tempInfo.room,
          hasPhoto: !!selectedFile,
          photoName: selectedFile?.name
        });

        const updatedUser = await updateProfile(formData);
        console.log('Updated user data:', updatedUser);

        const formattedUser = {
          ...updatedUser,
          room: updatedUser.address || '',
          photo: updatedUser.photo || ''
        };
        setUserInfo(formattedUser);
        setTempInfo(formattedUser);
        updateUser(formattedUser);
        setSelectedFile(null);
        setError("");
        setSuccessMessage("Profile updated successfully!");
        setTimeout(() => setSuccessMessage(""), 3000);
      } catch (err) {
        console.error('Profile update error:', err);
        setError(err.message || "Failed to update profile");
        return;
      }
    }
    setIsEditing(!isEditing);
  };

  const handleChange = (e, field) => {
    setTempInfo({
      ...tempInfo,
      [field]: e.target.value
    });
  };

  const handlePasswordChange = (e, field) => {
    const value = e.target.value || "";
    setPasswordInfo(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear any existing error messages when user starts typing
    setError("");
  };

  const togglePasswordVisibility = (field) => {
    setPasswordVisibility(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const validatePassword = (password) => {
    if (!password || password.length < 8) {
      return "Password must be at least 8 characters long";
    }
    return "";
  };

  const handleChangePassword = async () => {
    try {
      // Reset messages
      setError("");
      setSuccessMessage("");

      // Validate all fields are filled
      if (!passwordInfo.currentPassword || !passwordInfo.newPassword || !passwordInfo.confirmPassword) {
        setError("All password fields are required");
        return;
      }

      // Validate new password length
      const passwordError = validatePassword(passwordInfo.newPassword);
      if (passwordError) {
        setError(passwordError);
        return;
      }

      // Validate password confirmation
      if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
        setError("New passwords don't match");
        return;
      }

      // Call the API to change password
      await changePassword(passwordInfo.currentPassword, passwordInfo.newPassword);

      // Reset form and show success message
      setSuccessMessage("Password changed successfully!");
      setIsChangingPassword(false);
      setPasswordInfo({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      setPasswordVisibility({
        currentPassword: false,
        newPassword: false,
        confirmPassword: false
      });

      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError(err.message || "Failed to change password");
      console.error("Password change error:", err);
    }
  };

  const handleCancel = () => {
    setTempInfo({ ...userInfo });
    setIsEditing(false);
    setError("");
  };

  const handleCancelPassword = () => {
    setIsChangingPassword(false);
    setPasswordInfo({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    setPasswordVisibility({
      currentPassword: false,
      newPassword: false,
      confirmPassword: false
    });
    setError("");
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
      {successMessage && (
        <div className="success-message">
          <i className="fas fa-check-circle"></i>
          {successMessage}
        </div>
      )}
      <div className="profileright-half">
        <div className="profile-image">
          {previewUrl ? (
            <img 
              src={previewUrl} 
              alt="Profile" 
              className="profile-photo"
            />
          ) : (
            <i
              className="fa-solid fa-circle-user"
              style={{ color: " #4152b3", fontSize: "220px" }}
            ></i>
          )}
          {isEditing && (
            <div className="photo-upload-container">
              <label htmlFor="photo-upload" className="photo-upload-label">
                <i className="fa-solid fa-camera"></i>
                Change Photo
              </label>
              <input
                id="photo-upload"
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                style={{ display: 'none' }}
              />
            </div>
          )}
        </div>
        <div className="edit-icon-container">
          {isEditing ? (
            <>
              <i
                className="fa-solid fa-check save-icon"
                onClick={handleEdit}
                style={{ color: "#0c0d0d", fontSize: "24px", cursor: "pointer", marginRight: "15px" }}
              ></i>
              <i
                className="fa-solid fa-xmark cancel-icon"
                onClick={handleCancel}
                style={{ color: "#0c0d0d", fontSize: "24px", cursor: "pointer" }}
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

        {error && <div className="error-message">{error}</div>}

        <div className="profileinfobox">
          {isEditing ? (
            <>
              <input
                type="text"
                className="edit-input username"
                value={tempInfo.username || ''}
                onChange={(e) => handleChange(e, "username")}
                placeholder="Username"
              />
              <input
                type="text"
                className="edit-input name"
                value={tempInfo.name || ''}
                onChange={(e) => handleChange(e, "name")}
                placeholder="Full Name"
              />
              <input
                type="email"
                className="edit-input email"
                value={tempInfo.email || ''}
                onChange={(e) => handleChange(e, "email")}
                placeholder="Email"
              />
              <input
                type="text"
                className="edit-input room"
                value={tempInfo.room || ''}
                onChange={(e) => handleChange(e, "room")}
                placeholder="Room Number"
              />
            </>
          ) : (
            <>
              <h2 className="username">{userInfo.username || 'No username set'}</h2>
              <p className="name">{userInfo.name || 'No name set'}</p>
              <p className="email">{userInfo.email || 'No email set'}</p>
              <p className="room">{userInfo.room || 'No room set'}</p>
            </>
          )}
        </div>

        <div className="password-section">
          {!isChangingPassword ? (
            <button 
              className="change-password-btn"
              onClick={() => setIsChangingPassword(true)}
            >
              Change Password
            </button>
          ) : (
            <div className="change-password-form">
              <h3>Change Password</h3>
              <div className="password-input-container">
                <input
                  type={passwordVisibility.currentPassword ? "text" : "password"}
                  className="password-input"
                  value={passwordInfo.currentPassword}
                  onChange={(e) => handlePasswordChange(e, "currentPassword")}
                  placeholder="Current Password"
                />
                <i
                  className={`fa-solid ${passwordVisibility.currentPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                  onClick={() => togglePasswordVisibility("currentPassword")}
                ></i>
              </div>
              <div className="password-input-container">
                <input
                  type={passwordVisibility.newPassword ? "text" : "password"}
                  className="password-input"
                  value={passwordInfo.newPassword}
                  onChange={(e) => handlePasswordChange(e, "newPassword")}
                  placeholder="New Password"
                />
                <i
                  className={`fa-solid ${passwordVisibility.newPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                  onClick={() => togglePasswordVisibility("newPassword")}
                ></i>
              </div>
              <div className="password-input-container">
                <input
                  type={passwordVisibility.confirmPassword ? "text" : "password"}
                  className="password-input"
                  value={passwordInfo.confirmPassword}
                  onChange={(e) => handlePasswordChange(e, "confirmPassword")}
                  placeholder="Confirm New Password"
                />
                <i
                  className={`fa-solid ${passwordVisibility.confirmPassword ? "fa-eye-slash" : "fa-eye"} password-toggle`}
                  onClick={() => togglePasswordVisibility("confirmPassword")}
                ></i>
              </div>
              <div className="password-buttons">
                <button 
                  className="save-password-btn"
                  onClick={handleChangePassword}
                >
                  Save Password
                </button>
                <button 
                  className="cancel-password-btn"
                  onClick={handleCancelPassword}
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;