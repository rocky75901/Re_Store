import axios from "axios";
import { getUserProfile } from "./authService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

// Helper function to get auth header
const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to manage favorites");
  }
  return {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  };
};

// Helper function to get current username
const getUsername = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) {
    throw new Error("Please log in to manage favorites");
  }

  try {
    // Try to get user data from sessionStorage
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const userInfo = JSON.parse(userStr);
      if (userInfo?.username) {
        return userInfo.username;
      } else if (userInfo?.email) {
        return userInfo.email.split("@")[0];
      }
    }

    // If no user data in sessionStorage, fetch it from the API
    const userProfile = await getUserProfile();
    if (userProfile) {
      // Store the user data for future use
      sessionStorage.setItem("user", JSON.stringify(userProfile));
      if (userProfile.username) {
        return userProfile.username;
      } else if (userProfile.email) {
        return userProfile.email.split("@")[0];
      }
    }

    throw new Error("User information not found");
  } catch (error) {
    throw new Error("Please log in to manage favorites");
  }
};

export const addToFavorites = async (productId) => {
  try {
    const username = await getUsername();
    const response = await axios.post(
      `${BACKEND_URL}/api/v1/wishlist`,
      { username, productId },
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.message.includes("Please log in")
    ) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      throw new Error("Please log in to add favorites");
    }
    throw new Error(
      error.response?.data?.message || "Failed to add to favorites"
    );
  }
};

export const removeFromFavorites = async (productId) => {
  try {
    const username = await getUsername();
    const response = await axios.delete(
      `${BACKEND_URL}/api/v1/wishlist/remove`,
      {
        headers: getAuthHeader(),
        data: { username, productId },
      }
    );
    return response.data;
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.message.includes("Please log in")
    ) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      throw new Error("Please log in to remove favorites");
    }
    throw new Error(
      error.response?.data?.message || "Failed to remove from favorites"
    );
  }
};

export const getFavorites = async () => {
  try {
    const username = await getUsername();
    const response = await axios.get(
      `${BACKEND_URL}/api/v1/wishlist?username=${encodeURIComponent(username)}`,
      { headers: getAuthHeader() }
    );
    return response.data;
  } catch (error) {
    if (
      error.response?.status === 401 ||
      error.message.includes("Please log in")
    ) {
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("user");
      throw new Error("Please log in to view favorites");
    }
    throw new Error(
      error.response?.data?.message || "Failed to fetch favorites"
    );
  }
};
