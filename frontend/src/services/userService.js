import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

const userService = {
  getStudentById: async (studentId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      const response = await axios.get(
        `${API_URL}/students/${studentId}`,
        // getAuthHeader(),
      );

      return response.data;
    } catch (err) {
      throw err;
    }
  },

  getInstructorById: async (instructorId) => {
    // eslint-disable-next-line no-useless-catch
    try {
      console.log(
        "Making request to:",
        `${API_URL}/instructor/${instructorId}`,
      );

      const response = await axios.get(`${API_URL}/instructor/${instructorId}`);
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  getCurrentStudent: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/student/me`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch current student:", err);
      toast.error("Failed to fetch student information");
      throw err;
    }
  },

  getStudentProgress: async (classroomId) => {
    try {
      const response = await axios.get(
        `${API_URL}/student/progress/${classroomId}`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch student progress:", err);
      toast.error("Failed to fetch progress data");
      throw err;
    }
  },
  getClassLeaderboard: async (classroomId) => {
    try {
      const response = await axios.get(
        `${API_URL}/student/leaderboard/${classroomId}`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch leaderboard:", err);
      throw err;
    }
  },

  getCurrentInstructor: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/instructor/me`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch current instructor:", err);
      toast.error("Failed to fetch instructor information");
      throw err;
    }
  },
  updateInstructorProfile: async (profileData) => {
    try {
      const response = await axios.put(
        `${API_URL}/instructor/profile`,
        profileData,
        getAuthHeader(),
      );
      toast.success("Profile updated successfully!");
      return response.data;
    } catch (err) {
      console.error("Failed to update instructor profile:", err);
      toast.error(err.response?.data?.error || "Failed to update profile");
      throw err;
    }
  },

  uploadInstructorPhoto: async (file) => {
    try {
      const formData = new FormData();
      formData.append("profilePicture", file);

      const response = await axios.post(
        `${API_URL}/instructor/upload-photo`,
        formData,
        {
          headers: {
            ...getAuthHeader().headers,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      toast.success("Profile picture updated!");
      return response.data;
    } catch (err) {
      console.error("Failed to upload photo:", err);
      toast.error(err.response?.data?.error || "Failed to upload photo");
      throw err;
    }
  },
  getInstructorDashboard: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/instructor/dashboard`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch instructor dashboard:", err);
      toast.error("Failed to fetch dashboard data");
      throw err;
    }
  },

  getInstructorCourses: async (status = null) => {
    try {
      const params = status ? { status } : {};
      const response = await axios.get(`${API_URL}/instructor/courses`, {
        ...getAuthHeader(),
        params,
      });
      return response.data;
    } catch (err) {
      console.error("Failed to fetch instructor courses:", err);
      toast.error("Failed to fetch courses");
      throw err;
    }
  },

  getInstructorStudents: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/instructor/students`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch instructor students:", err);
      toast.error("Failed to fetch students");
      throw err;
    }
  },

  getInstructorAnalytics: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/instructor/analytics`,
        getAuthHeader(),
      );
      return response.data;
    } catch (err) {
      console.error("Failed to fetch instructor analytics:", err);
      toast.error("Failed to fetch analytics");
      throw err;
    }
  },
};

export default userService;
