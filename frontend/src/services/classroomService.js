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

const classroomService = {
  createClassroom: async (classroomData) => {
    try {
      const response = await axios.post(
        `${API_URL}/classrooms`,
        classroomData,
        getAuthHeader(),
      );
      toast.success("Classroom created successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to create classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getMyClassrooms: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/classrooms`, {
        ...getAuthHeader(),
        params,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch classrooms";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getClassroomById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/classrooms/${id}`,
        getAuthHeader(),
      );
      console.log("getClassroomById: ", response.data);
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  updateClassroom: async (id, data) => {
    try {
      const response = await axios.put(
        `${API_URL}/classrooms/${id}`,
        data,
        getAuthHeader(),
      );
      toast.success("Classroom updated successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to update classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  deleteClassroom: async (id, permanent = false) => {
    try {
      const response = await axios.delete(
        `${API_URL}/classrooms/${id}?permanent=${permanent}`,
        getAuthHeader(),
      );
      toast.success(
        permanent ? "Classroom deleted permanently" : "Classroom archived",
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to delete classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  joinClassroom: async (accessCode) => {
    try {
      const response = await axios.post(
        `${API_URL}/classrooms/join`,
        { accessCode },
        getAuthHeader(),
      );
      toast.success("Successfully joined classroom!");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to join classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  leaveClassroom: async (id) => {
    try {
      const response = await axios.post(
        `${API_URL}/classrooms/${id}/leave`,
        {},
        getAuthHeader(),
      );
      toast.success("Left classroom successfully");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to leave classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getClassroomStudents: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/classrooms/${id}/students`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to fetch students";
      toast.error(message);
      throw error.response?.data;
    }
  },

  archiveClassroom: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/classrooms/${id}/archive`,
        {},
        getAuthHeader(),
      );
      toast.success("Classroom archived");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to archive classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },

  restoreClassroom: async (id) => {
    try {
      const response = await axios.put(
        `${API_URL}/classrooms/${id}/restore`,
        {},
        getAuthHeader(),
      );
      toast.success("Classroom restored");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to restore classroom";
      toast.error(message);
      throw error.response?.data;
    }
  },
  getRecentActivity: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/classrooms/${id}/recent-activity`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      if (
        error.response?.status === 404 ||
        error.response?.data?.error === "No activity found"
      ) {
        return { data: [] };
      }
      const message =
        error.response?.data?.error || "Failed to fetch recent activity";
      toast.error(message);
      throw error.response?.data;
    }
  },
  getInstructorClassrooms: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/classrooms/instructor`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch instructor classrooms";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getClassroomAnalytics: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/classrooms/${id}/analytics`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch analytics";
      toast.error(message);
      throw error.response?.data;
    }
  },
};

export default classroomService;
