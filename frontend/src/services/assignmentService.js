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

const buildRequestConfig = (files = []) => {
  if (files.length > 0) {
    return {
      headers: {
        ...getAuthHeader().headers,
        "Content-Type": "multipart/form-data",
      },
    };
  }
  return getAuthHeader();
};

const buildBody = (payload, files = []) => {
  if (files.length > 0) {
    const fd = new FormData();
    fd.append("data", JSON.stringify(payload));
    files.forEach((f) => fd.append("files", f));
    return fd;
  }
  return payload;
};

const assignmentService = {
  createAssignment: async (assignmentData, files = []) => {
    try {
      const response = await axios.post(
        `${API_URL}/assignments`,

        buildBody(assignmentData, files),
        buildRequestConfig(files),
      );

      console.log(response, "from services");
      toast.success("Assignment created successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to create assignment";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getAssignments: async (params = {}) => {
    try {
    
      console.log("Fetching assignments with params:", params);
      const response = await axios.get(`${API_URL}/assignments`, {
        ...getAuthHeader(),
        params,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch assignments";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getStudentAssignments: async (params = {}) => {
    try {
      const response = await axios.get(`${API_URL}/assignments/student`, {
        ...getAuthHeader(),
        params,
      });
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch assignments";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getAssignmentById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/assignments/${id}`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to fetch assignment";
      toast.error(message);
      throw error.response?.data;
    }
  },

  updateAssignment: async (id, assignmentData, files = []) => {
    try {
      const response = await axios.put(
        `${API_URL}/assignments/${id}`,
        buildBody(assignmentData, files),
        buildRequestConfig(files),
      );
      toast.success("Assignment updated successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to update assignment";
      toast.error(message);
      throw error.response?.data;
    }
  },

  deleteAssignment: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/assignments/${id}`,
        getAuthHeader(),
      );
      toast.success("Assignment deleted successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.error || "Failed to delete assignment";
      toast.error(message);
      throw error.response?.data;
    }
  },

  removeAttachedFile: async (assignmentId, fileId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/assignments/${assignmentId}/files/${fileId}`,
        getAuthHeader(),
      );
      toast.success("File removed");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to remove file";
      toast.error(message);
      throw error.response?.data;
    }
  },
  submitAssignment: async (assignmentId, files = []) => {
    try {
      console.log(
        "submitting to:",
        `${API_URL}/assignments/${assignmentId}/submit`,
      ); 
      console.log("files:", files); 
      const fd = new FormData();
      files.forEach((f) => fd.append("files", f));
      const response = await axios.post(
        `${API_URL}/assignments/${assignmentId}/submit`,
        fd,
        {
          headers: {
            ...getAuthHeader().headers,
            "Content-Type": "multipart/form-data",
          },
        },
      );
      console.log("submit response:", response.data); 
      return response.data;
    } catch (error) {
      console.error("submit error:", error.response?.data);
      const message =
        error.response?.data?.error || "Failed to submit assignment";
      toast.error(message);
      throw error.response?.data;
    }
  },
  
gradeSubmission: async (assignmentId, studentId, gradeData) => {

  const response = await axios.put(
    `${API_URL}/assignments/${assignmentId}/submissions/${studentId}/grade`,
    gradeData,       
    getAuthHeader(),
  );
  return response.data;
},
  getMyGrade: async (assignmentId) => {
    try {
      const response = await axios.get(
        `${API_URL}/assignments/student/my-grade/${assignmentId}`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to fetch grade";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getMyGrades: async (classroomId) => {
    try {
      const response = await axios.get(
        `${API_URL}/assignments/student/my-grades/${classroomId}`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.error || "Failed to fetch grades";
      toast.error(message);
      throw error.response?.data;
    }
  },
};

export default assignmentService;
