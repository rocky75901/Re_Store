export const signup = async (userData) => {
  try {
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const response = await fetch(`${BACKEND_URL}/api/v1/users/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(userData),
    });

    let data;
    try {
      data = await response.json();
    } catch (error) {
      throw new Error(
        "Server error: Invalid response format. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Signup failed. Please check your input."
      );
    }

    if (!data.user) {
      throw new Error("Invalid response from server: Missing user data");
    }

    // Store in sessionStorage
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // Generate and store a unique session ID
    const sessionId =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("sessionId", sessionId);

    return data;
  } catch (error) {
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend server is running."
      );
    }

    throw error;
  }
};

export const login = async (email, password, isAdmin = false) => {
  try {
    sessionStorage.setItem("email", email);
    console.log(email);
    console.log(sessionStorage.getItem("email"));
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const endpoint = isAdmin ? "adminlogin" : "login";
    const response = await fetch(`${BACKEND_URL}/api/v1/users/${endpoint}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    // Get the raw response text first
    const responseText = await response.text();

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (error) {
      throw new Error(
        "Server error: Invalid response format. Please try again."
      );
    }

    if (!response.ok) {
      throw new Error(
        data.message || "Login failed. Please check your credentials."
      );
    }

    if (!data.token || !data.user) {
      throw new Error(
        "Invalid response from server: Missing token or user data"
      );
    }

    // Store in sessionStorage
    sessionStorage.setItem("token", data.token);
    sessionStorage.setItem("user", JSON.stringify(data.user));

    // Generate and store a unique session ID
    const sessionId =
      Math.random().toString(36).substring(2) + Date.now().toString(36);
    sessionStorage.setItem("sessionId", sessionId);

    return data;
  } catch (error) {
    console.log(error.message);
    if (error.message.includes("Failed to fetch")) {
      throw new Error(
        "Cannot connect to server. Please make sure the backend server is running."
      );
    }

    throw error;
  }
};

export const logout = () => {
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("sessionId");
  window.location.href = "/login";
};

export const getAuthHeader = () => {
  const token = sessionStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const isAuthenticated = () => {
  const token = sessionStorage.getItem("token");
  const user = sessionStorage.getItem("user");
  const sessionId = sessionStorage.getItem("sessionId");
  return !!(token && user && sessionId);
};

export const getCurrentUser = () => {
  const user = sessionStorage.getItem("user");
  return user ? JSON.parse(user) : null;
};

export const verifySession = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("No token found");
    }

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`${BACKEND_URL}/api/v1/users/verify`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Session invalid");
    }

    return true;
  } catch (error) {
    logout();
    return false;
  }
};

export const getUserProfile = async () => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }
    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`${BACKEND_URL}/api/v1/users/currentUser`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to get profile");
    }

    const data = await response.json();
    return data.data.user;
  } catch (error) {
    if (error.message.includes("unauthorized")) {
      logout();
    }
    throw error;
  }
};

export const updateProfile = async (formData) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    // Log the form data contents for debugging
    const formDataEntries = {};
    formData.forEach((value, key) => {
      formDataEntries[key] = value instanceof File ? value.name : value;
    });

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`${BACKEND_URL}/api/v1/users`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    });

    const responseText = await response.text();

    if (!response.ok) {
      let errorMessage;
      try {
        const errorData = JSON.parse(responseText);
        errorMessage = errorData.message;
      } catch (e) {
        errorMessage = "Failed to update profile";
      }
      throw new Error(errorMessage);
    }

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (e) {
      throw new Error("Invalid response format from server");
    }

    if (data.data && data.data.user) {
      const userData = data.data.user;
      // Update the photo URL to include the backend URL
      if (userData.photo) {
        userData.photo = `${BACKEND_URL}/img/users/${userData.photo}`;
      }
      sessionStorage.setItem("user", JSON.stringify(userData));
      return userData;
    } else if (data.user) {
      // Update the photo URL to include the backend URL
      if (data.user.photo) {
        data.user.photo = `${BACKEND_URL}/img/users/${data.user.photo}`;
      }
      sessionStorage.setItem("user", JSON.stringify(data.user));
      return data.user;
    } else {
      throw new Error("Invalid response format from server");
    }
  } catch (error) {
    throw error;
  }
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const token = sessionStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    const BACKEND_URL =
      import.meta.env.VITE_BACKEND_URL || "http://localhost:3000";

    const response = await fetch(`${BACKEND_URL}/api/v1/users/updatePassword`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword: currentPassword,
        newPassword: newPassword,
        newPasswordConfirm: newPassword,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.message || "Password change failed. Please check your input."
      );
    }

    // Update token if provided
    if (data.token) {
      sessionStorage.setItem("token", data.token);
    }
    return data;
  } catch (error) {
    throw error;
  }
};
