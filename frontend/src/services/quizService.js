import axios from "axios";
import { toast } from "sonner";

const API_URL = "http://localhost:5000/api";

const getAuthHeader = () => ({
  headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
});

const quizService = {
  createQuiz: async (formData, files = []) => {
    try {
      const fd = new FormData();
      Object.entries(formData).forEach(([k, v]) => {
        if (v !== null && v !== undefined) fd.append(k, v);
      });
      files.forEach((f) => fd.append("files", f));

      const res = await axios.post(`${API_URL}/quizzes`, fd, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      toast.success("Quiz created successfully!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create quiz");
      throw err.response?.data;
    }
  },

  getQuizzes: async (params = {}) => {
    try {
      const res = await axios.get(`${API_URL}/quizzes`, {
        ...getAuthHeader(),
        params,
      });
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch quizzes");
      throw err.response?.data;
    }
  },

  getMyPersonalQuizzes: async () => {
    try {
      const res = await axios.get(`${API_URL}/quizzes/my-personal-quizzes`, {
        ...getAuthHeader(),
      });
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch your quizzes");
      throw err.response?.data;
    }
  },

  getStudentQuizzes: async (params = {}) => {
    const res = await axios.get(`${API_URL}/quizzes/student`, {
      ...getAuthHeader(),
      params,
    });
    return res.data;
  },

  getQuizById: async (id) => {
    try {
      console.log("quizService.getQuizById - Fetching quiz:", id);
      const token = localStorage.getItem("token");
      console.log("quizService.getQuizById - Token exists:", !!token);

      const res = await axios.get(`${API_URL}/quizzes/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      console.log("quizService.getQuizById - Response:", res);
      console.log("quizService.getQuizById - Data:", res.data);

      return res.data;
    } catch (err) {
      console.error("quizService.getQuizById - Error:", err);
      console.error("quizService.getQuizById - Error response:", err.response);
      toast.error("Failed to fetch quiz");
      throw err.response?.data;
    }
  },

  publishQuiz: async (id) => {
    try {
      const res = await axios.patch(
        `${API_URL}/quizzes/${id}/publish`,
        {},
        getAuthHeader(),
      );
      toast.success("Quiz published!");
      return res.data;
    } catch (err) {
      toast.error("Failed to publish quiz");
      throw err.response?.data;
    }
  },

  submitQuiz: async (id, answers, timeTaken) => {
    try {
      const res = await axios.post(
        `${API_URL}/quizzes/${id}/submit`,
        { answers, timeTaken },
        getAuthHeader(),
      );
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to submit quiz");
      throw err.response?.data;
    }
  },
  updateQuiz: async (id, data) => {
    try {
      const res = await axios.put(
        `${API_URL}/quizzes/${id}`,
        data,
        getAuthHeader(),
      );
      toast.success("Quiz updated successfully!");
      return res.data;
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to update quiz");
      throw err.response?.data;
    }
  },

  deleteQuiz: async (id) => {
    try {
      const res = await axios.delete(
        `${API_URL}/quizzes/${id}`,
        getAuthHeader(),
      );
      toast.success("Quiz deleted");
      return res.data;
    } catch (err) {
      toast.error("Failed to delete quiz");
      throw err.response?.data;
    }
  },

  getClassroomQuizzes: async (classroomId) => {
    try {
      const res = await axios.get(
        `${API_URL}/quizzes/classroom/${classroomId}`,
        getAuthHeader(),
      );
      return res.data;
    } catch (err) {
      toast.error("Failed to fetch quizzes");
      throw err.response?.data;
    }
  },
};

export default quizService;
