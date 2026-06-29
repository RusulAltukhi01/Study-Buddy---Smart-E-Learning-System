/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from "react";
import axios from "axios";
import { toast } from "sonner";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const initAuth = async () => {
      const savedUser = localStorage.getItem("user");
      const token = localStorage.getItem("token");

      if (savedUser && token) {
        try {
          const parsedUser = JSON.parse(savedUser);
          await checkAuthWithBackend(parsedUser);
        } catch (err) {
          console.warn("Auth initialization failed:", err);
          clearAuth();
        }
      } else {
        clearAuth();
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const checkAuthWithBackend = async (cachedUser) => {
    try {
      const response = await api.get("/api/auth/me");

      if (response.data.success) {
        const updatedUser = {
          ...cachedUser,
          ...response.data.data,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        console.log("Auth verified with backend:", updatedUser);
      } else {
        console.warn("Backend auth check failed");
        clearAuth();
      }
    } catch (err) {
      console.warn("Backend auth check failed:", err.message);

      if (err.code === "ERR_NETWORK" || err.code === "ECONNREFUSED") {
        setUser(cachedUser);
        toast.warning("Using cached session. Some features may be limited.");
      } else {
        clearAuth();
      }
    }
  };

  const clearAuth = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setError("");
    console.log("Auth cleared");
  };

  const login = async (email, password) => {
    try {
      setError("");
      console.log("Logging in with:", email);

      const response = await api.post("/api/auth/login", { email, password });
      console.log("Login response:", response.data);

      if (response.data.success) {
        const userData = response.data.data;

        if (userData.token) {
          localStorage.setItem("token", userData.token);
        }

        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        console.log("Login successful, user set:", userData);
        toast.success("Logged in successfully!");
        return {
          success: true,
          user: userData,
        };
      } else {
        const errorMsg = response.data.error || "Login failed";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Login error:", err);
      const errorMsg = err.response?.data?.error || "Login failed";
      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch (err) {
      console.log("Logout API error: ", err);
    } finally {
      clearAuth();
      toast.info("Logged out successfully");
    }
  };

  const studentSignup = async (signupData) => {
    try {
      setError("");

      console.log("Signup attempt with:", signupData);

      const studentData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        phoneNumber: signupData.phoneNumber,
      };

      const response = await api.post("/api/auth/signup/student", studentData);
      // console.log("Student signup response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        return { success: true };
        // const userData = response.data.data;

        // if (userData.token) {
        //   localStorage.setItem("token", userData.token);
        //   console.log("Token stored");
        // }

        // localStorage.setItem("user", JSON.stringify(userData));
        // setUser(userData);

        // console.log("Student signup successful, user set:", userData);
        // toast.success("Account created successfully!");
        // return {
        //   success: true,
        //   user: userData,
        // };
      } else {
        const errorMsg = response.data.error || "Signup failed";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Student signup error:", err);

      let errorMsg = "Signup failed";
      if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      } else if (err.response?.status === 400) {
        errorMsg = "Validation error. Please check your inputs.";
      } else if (err.response?.status === 500) {
        errorMsg = "Server error. Please try again later.";
      }

      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const instructorSignup = async (signupData) => {
    try {
      setError("");
      console.log("Instructor signup attempt:", signupData);

      const instructorData = {
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: signupData.password,
        confirmPassword: signupData.confirmPassword,
        phoneNumber: signupData.phoneNumber,
        headline: signupData.headline,
        bio: signupData.bio,
      };

      const response = await api.post(
        "/api/auth/signup/instructor",
        instructorData,
      );
      console.log("Instructor signup response:", response.data);

      if (response.data.success) {
        localStorage.setItem("token", response.data.data.token);
        return { success: true };
        // const userData = response.data.data;

        // if (userData.token) {
        //   localStorage.setItem("token", userData.token);
        // }

        // localStorage.setItem("user", JSON.stringify(userData));
        // setUser(userData);

        // console.log("Instructor signup successful:", userData);
        // // toast.success("Instructor account created successfully!");
        // return {
        //   success: true,
        //   user: userData,
        // };
      } else {
        const errorMsg = response.data.error || "Signup failed";
        setError(errorMsg);
        toast.error(errorMsg);
        return { success: false, error: errorMsg };
      }
    } catch (err) {
      console.error("Instructor signup error:", err);

      let errorMsg = "Signup failed. Please try again.";
      if (err.response?.status === 400) {
        errorMsg = err.response.data?.error || "Validation error";
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }

      setError(errorMsg);
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const signup = async (signupData) => {
    const { role } = signupData;

    if (role === "instructor") {
      return instructorSignup(signupData);
    } else {
      return studentSignup(signupData);
    }
  };

  const updateProfile = async (updates) => {
    try {
      if (!user) {
        toast.error("No user found. Please log in.");
        throw new Error("No user found");
      }

      console.log("Updating profile with:", updates);

      const response = await api.put("/api/auth/profile", updates);

      if (response.data.success) {
        const updatedUser = {
          ...user,
          ...response.data.data,
        };

        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));

        console.log("Profile updated successfully:", updatedUser);
        // toast.success("Profile updated successfully!");

        return {
          success: true,
          user: updatedUser,
        };
      } else {
        throw new Error(response.data.error || "Update failed");
      }
    } catch (error) {
      console.error("Profile update error:", error);

      let errorMsg = "Failed to update profile. Please try again.";
      if (error.response?.status === 401) {
        errorMsg = "Session expired. Please log in again.";
        clearAuth();
        window.location.href = "/login";
      } else if (error.response?.data?.error) {
        errorMsg = error.response.data.error;
      }

      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const updateUser = async (updates) => {
    if (
      updates.firstName ||
      updates.lastName ||
      updates.phoneNumber ||
      updates.profilePicture ||
      updates.bio ||
      updates.headline
    ) {
      return updateProfile(updates);
    }

    try {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));

      toast.success("Settings updated!");
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Update user error:", error);
      toast.error("Failed to update settings");
      return { success: false, error: error.message };
    }
  };

  const updateProfilePicture = async (profilePicture) => {
    try {
      if (!user) {
        toast.error("No user found");
        throw new Error("No user found");
      }

      return updateProfile({ profilePicture });
    } catch (error) {
      console.error("Profile picture update error:", error);
      toast.error("Failed to update profile picture");
      return { success: false, error: error.message };
    }
  };

  const isStudent = () => {
    return user?.role === "student";
  };

  const isInstructor = () => {
    return user?.role === "instructor";
  };

  //  const isVerifiedInstructor = () => {
  //   return user?.role === "instructor" && user?.verificationStatus === "verified";
  // };

  const isAdmin = () => {
    return user?.role === "admin";
  };

  const forgotPassword = async (email) => {
    try {
      const res = await api.post("/api/auth/forgot-password", { email });
      if (res.data.success) {
        toast.success("Reset code sent! Check your email.");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Failed to send reset code";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const verifyResetOtp = async (email, otp) => {
    try {
      const res = await api.post("/api/auth/verify-reset-otp", { email, otp });
      if (res.data.success)
        return { success: true, resetToken: res.data.resetToken };
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid or expired code";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const resetPassword = async (email, resetToken, password) => {
    try {
      const res = await api.post("/api/auth/reset-password", {
        email,
        resetToken,
        password,
      });
      if (res.data.success) {
        toast.success("Password reset! Please log in.");
        return { success: true };
      }
    } catch (err) {
      const msg = err.response?.data?.error || "Reset failed";
      toast.error(msg);
      return { success: false, error: msg };
    }
  };

  const verifyOTP = async (otp) => {
    try {
      const response = await api.post("/api/auth/verify-otp", { otp });
      if (response.data.success) {
        const userData = response.data.data;
       
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);
        toast.success("Email verified successfully!");
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Invalid or expired OTP";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const resendOTP = async () => {
    try {
      const response = await api.post("/api/auth/resend-otp");
      if (response.data.success) {
        toast.success("New OTP sent to your email!");
        return { success: true };
      }
    } catch (err) {
      const errorMsg = err.response?.data?.error || "Failed to resend OTP";
      toast.error(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const value = {
   
    user,
    error,
    loading,

    login,
    logout,
    signup,
    studentSignup,
    instructorSignup,
    clearAuth,

    updateUser,
    updateProfile,
    updateProfilePicture,

    isStudent,
    isInstructor,
    isAdmin,

    verifyOTP,
    resendOTP,

    forgotPassword,
    verifyResetOtp,
    resetPassword,

   
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
