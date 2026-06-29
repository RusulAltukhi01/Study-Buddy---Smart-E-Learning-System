import { CalendarDays, Mail } from "lucide-react";
import { useAuth } from "../../contexts/AuthContext";
import "./ProfilePreview.css";
import defaultAvatar from "../../assets/default-avatar.png";
import { useRef, useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ProfilePreview = ({ isEditMode, onEditClick }) => {
  const { user, updateUser } = useAuth();
  const [profilePicture, setProfilePicture] = useState(
    user?.profilePicture || "",
  );
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user?.profilePicture) {
      setProfilePicture(user.profilePicture);
    }
  }, [user?.profilePicture]);

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];

    if (!file) {
      toast.error("No file selected");
      return;
    }

    e.target.value = "";

    const validTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];

    if (!validTypes.includes(file.type)) {
      toast.error("Please select a valid image file (JPEG, PNG, GIF, WebP)");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("File size should be less than 5MB");
      return;
    }

    await uploadProfilePicture(file);
  };

  const uploadProfilePicture = async (file) => {
    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("profilePicture", file);

      const token = localStorage.getItem("token");

      const res = await axios.post(`${API_URL}/api/uploads/`, formData, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      console.log("Upload response:", res.data);

      if (res.data.success) {


        updateUser({ ...user, profilePicture: res.data.profilePicture });
        setProfilePicture(res.data.profilePicture);

        toast.success("Profile picture updated successfully!");

        setTimeout(() => {
          refetchUserData();
        }, 500);
      } else {
        toast.error(res.data.error || "Upload failed");
      }
    } catch (err) {
      console.error("Full upload error:", err);

      let errorMessage = "Upload failed";
      if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.response?.status === 401) {
        errorMessage = "Please login again";
      }

      toast.error(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  const refetchUserData = async () => {
    try {
      const token = localStorage.getItem("token");
      const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (userResponse.data.success) {
        localStorage.setItem("user", JSON.stringify(userResponse.data.data));

        updateUser(userResponse.data.data);
        console.log("User data refreshed from backend");
      }
    } catch (error) {
      console.error("Failed to refresh user data:", error);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  };

  const getImageUrl = () => {

    console.log("Profile picture from user:", user?.profilePicture);
    console.log("User object:", user);

    if (!user?.profilePicture || user.profilePicture === "") {
      console.log("No profile picture, using default");
      return defaultAvatar;
    }

    const baseUrl = API_URL.endsWith("/") ? API_URL.slice(0, -1) : API_URL;

  
    let imagePath = user.profilePicture;
    if (!imagePath.startsWith("/")) {
      imagePath = "/" + imagePath;
    }

    const fullUrl = `${baseUrl}${imagePath}`;
    console.log("Constructed URL:", fullUrl);

    return fullUrl;
  };

  const handleRemovePicture = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await axios.delete(`${API_URL}/api/uploads/`, {
        withCredentials: true,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        updateUser({ ...user, profilePicture: "" });
        setProfilePicture("");
        toast.success("Profile picture removed");

        setTimeout(() => {
          refetchUserData();
        }, 500);
      }
    } catch (error) {
      console.error("Remove error:", error);
      toast.error("Failed to remove profile picture");
    }
  };

  return (
    <div className="profile-preview w-full p-2 flex justify-between items-center ">
      <div className="user-info-preview flex gap-x-5 items-center gap-y-3 w-full p-10">
        <div className="user-avatar w-32 h-32 relative group p-1 border-2 border-[var(--electric)] rounded-[50%]">
         
          <img
            src={getImageUrl()}
            crossOrigin="anonymous"
            alt={`${user?.firstName}'s profile`}
            className="w-full h-full rounded-full cursor-pointer object-cover"
            onClick={() => fileInputRef.current.click()}
            onError={(e) => {
              e.target.src = defaultAvatar;
            }}
          />

        
          <div
            className="absolute inset-0 rounded-full bg-gray/50 backdrop-blur-sm flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer"
            onClick={() => fileInputRef.current.click()}
          >
            <svg
              className="w-8 h-8 text-white mb-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <span className="text-white text-sm font-medium">Change</span>
          </div>

          <input
            type="file"
            hidden
            ref={fileInputRef}
            accept="image/*"
            onChange={handleFileSelect}
          />

          {uploading && (
            <div className="absolute inset-0 rounded-full bg-black/70 backdrop-blur-sm flex items-center justify-center">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                <span className="text-white text-sm">Uploading...</span>
              </div>
            </div>
          )}

          {profilePicture && (
            <button
              onClick={handleRemovePicture}
              className="absolute -bottom-2 -right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-colors"
              title="Remove profile picture"
            >
              ×
            </button>
          )}
        </div>

        <div className="user-info">
          <h1 className="font-bold text-2xl text-[var(--dark-navy)] capitalize">
            {user?.firstName} {user?.lastName}
          </h1>
          <div className="detailed-info flex items-center gap-x-10 my-3">
            <span className="flex items-center gap-x-2 font-semibold text-gray-500">
              <Mail color="gray" /> {user?.email}
            </span>
            <span className="flex items-center gap-x-2 font-semibold text-gray-500">
              <CalendarDays color="gray" />
              Joined {user?.createdAt ? formatDate(user.createdAt) : "N/A"}
            </span>
          </div>
          <div className="role-badge inline-block px-3 py-1 bg-(--electric-pastel) text-(--electric) border border-teal-300  rounded-full text-sm font-medium mt-2">
            {user?.role?.toUpperCase()}
          </div>
        </div>
      </div>
      {/* <div className="edit-profile-btn flex justify-between w-[300px]">
        <button
          onClick={onEditClick}
          className="flex p-4 text-center rounded-lg bg-gray-100 ml-14 font-semibold text-[var(--dark-navy)] cursor-pointer hover:bg-gray-200 border-1 border-gray-200 transition-colors"
        >
          {isEditMode ? "Discard Edits" : "Edit Profile"}
        </button>
      </div> */}
    </div>
  );
};

export default ProfilePreview;
