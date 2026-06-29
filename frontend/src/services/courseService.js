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

function prepareFormData(data) {
  const { classroomId, ...rest } = data;
  return {
    ...rest,
    ...(classroomId && { classroomId }),
    resources: (rest.resources || []).map((r) => ({
      name: r.name || "",
      size: r.size || "",
      url: r.url || "",
    })),
    sections: rest.sections.map((section, si) => {
      const { _id, ...sectionRest } = section;
      return {
        ...sectionRest,
        order: si,
        lectures: section.lectures.map((lecture, li) => {
          // eslint-disable-next-line no-unused-vars
          const { _id: lecId, ...lectureRest } = lecture;
          return { ...lectureRest, order: li };
        }),
      };
    }),
  };
}

const courseService = {
  createCourse: async (formData) => {
    try {
      const headers = getAuthHeader();
      const response = await axios.post(
        `${API_URL}/courses`,
        prepareFormData(formData),
        headers,
      );
      toast.success("Course published successfully!");
      return response.data;
    } catch (error) {
      console.log("422 errors:", error.response?.data);
      const message =
        error.response?.data?.message || "Failed to create course";
      toast.error(message);
      throw error.response?.data;
    }
  },

  saveDraft: async (formData) => {
    try {
      const response = await axios.post(
        `${API_URL}/courses/draft`,
        prepareFormData(formData),
        getAuthHeader(),
      );
      toast.success("Draft saved!");
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to save draft";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getMyCourses: async () => {
    try {
      const response = await axios.get(
        `${API_URL}/courses/my`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch courses";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getCourseById: async (id) => {
    try {
      const response = await axios.get(
        `${API_URL}/courses/${id}`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || "Failed to fetch course";
      toast.error(message);
      throw error.response?.data;
    }
  },

  updateCourse: async (id, formData) => {
    try {
      const response = await axios.patch(
        `${API_URL}/courses/${id}`,
        prepareFormData(formData),
        getAuthHeader(),
      );
      toast.success("Course updated successfully!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to update course";
      toast.error(message);
      throw error.response?.data;
    }
  },

  archiveCourse: async (id) => {
    try {
      const response = await axios.delete(
        `${API_URL}/courses/${id}`,
        getAuthHeader(),
      );
      toast.success("Course archived");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to archive course";
      toast.error(message);
      throw error.response?.data;
    }
  },

  getCoursesByClassroom: async (classroomId) => {
    try {
      const response = await axios.get(
        `${API_URL}/classrooms/${classroomId}/courses`,
        getAuthHeader(),
      );
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to fetch classroom courses";
      toast.error(message);
      throw error.response?.data;
    }
  },

  assignCourseToClassroom: async (classroomId, courseId) => {
    try {
      const response = await axios.post(
        `${API_URL}/classrooms/${classroomId}/courses/assign`,
        { courseId },
        getAuthHeader(),
      );
      toast.success("Course assigned to classroom!");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to assign course";
      toast.error(message);
      throw error.response?.data;
    }
  },

  unassignCourseFromClassroom: async (classroomId, courseId) => {
    try {
      const response = await axios.delete(
        `${API_URL}/classrooms/${classroomId}/courses/${courseId}/unassign`,
        getAuthHeader(),
      );
      toast.success("Course removed from classroom");
      return response.data;
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to unassign course";
      toast.error(message);
      throw error.response?.data;
    }
  },
};

export default courseService;
