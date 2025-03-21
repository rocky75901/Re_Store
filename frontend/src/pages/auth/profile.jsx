import React, { useState, useEffect } from "react";
import "./profile.css";
import Text_Logo_final_re from "../../assets/Text_Logo_final_re.png";
import Re_Store_image_small from "../../assets/Re_store_image_small.png";
import { Link } from "react-router-dom";
import Layout from "./layout";
import { getUserProfile, updateProfile } from "./authService";
import { useNavigate } from "react-router-dom";

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [userInfo, setUserInfo] = useState({
    username: "",
    name: "",
    email: "",
    room: ""
  });
  const [tempInfo, setTempInfo] = useState({ ...userInfo });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState(null);
  const navigate = useNavigate();

  const fetchProfile = async () => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user'));

    if (!token || !user) {
      navigate('/login');
      return;
    }

    try {
      const profileData = await getUserProfile();
      setProfile(profileData);
      setUserInfo(profileData);
      setTempInfo(profileData);
    } catch (error) {
      console.error('Error fetching profile:', error);
      // Only redirect on auth errors
      if (error.response?.status === 401) {
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleEdit = async () => {
    if (isEditing) {
      try {
        await updateProfile(tempInfo);
        setUserInfo({ ...tempInfo });
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
      [field]: e.target.value
    });
  };

  const handleCancel = () => {
    setTempInfo({ ...userInfo });
    setIsEditing(false);
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
      <div className="profileright-half">
        <div className="profile-image">
          <i
            className="fa-solid fa-circle-user"
            style={{ color: " #4152b3", fontSize: "220px" }}
          ></i>
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
                value={tempInfo.username}
                onChange={(e) => handleChange(e, "username")}
              />
              <input
                type="text"
                className="edit-input name"
                value={tempInfo.name}
                onChange={(e) => handleChange(e, "name")}
              />
              <input
                type="email"
                className="edit-input email"
                value={tempInfo.email}
                onChange={(e) => handleChange(e, "email")}
              />
              <input
                type="text"
                className="edit-input room"
                value={tempInfo.room}
                onChange={(e) => handleChange(e, "room")}
              />
            </>
          ) : (
            <>
              <h2 className="username">{userInfo.username}</h2>
              <p className="name">{userInfo.name}</p>
              <p className="email">{userInfo.email}</p>
              <p className="room">{userInfo.room}</p>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Profile;