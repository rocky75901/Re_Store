import React, { useState, useEffect } from "react";
import "./profile.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";
import { Link } from "react-router-dom";
import Layout from "./layout";
import { getUserProfile, updateProfile } from "./authService";
import { useAuth } from "../../context/AuthContext";
const Profile = () => {
  const { updateUser } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    name: "",
    email: "",
    photo: "",
  });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const profileData = await getUserProfile();
        const url = new URL(profileData.photo);
        profileData.photo = url.href;
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
    console.log({
      ...tempInfo,
      [field]: e.target.value,
    });
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

  const handleImageChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setProfileImage(file);
      setPreviewUrl(URL.createObjectURL(file));
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
        <div className="profile-image-container">
          <div className="profile-image-wrapper">
            {previewUrl ? (
              <img src={previewUrl} alt="Profile" className="profile-image" />
            ) : (
              <div className="profile-image-placeholder">
                <svg viewBox="0 0 24 24" fill="currentColor" className="profile-icon">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                </svg>
              </div>
            )}
            <label className="profile-image-upload">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: 'none' }}
              />
              <div className="upload-icon">+</div>
            </label>
          </div>
        </div>

        <div className="edit-icon-container">
          {isEditing ? (
            <>
              <i
                className="fa-solid fa-check save-icon"
                onClick={handleEdit}
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
                className="edit-input room"
                value={tempInfo.room || ''}
                onChange={(e) => handleChange(e, "room")}
                placeholder="Room Number (e.g., H-123, A101)"
                pattern=".*"
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
