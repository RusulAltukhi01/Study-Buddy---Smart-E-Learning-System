import axios from "axios";

const API_URL = "http://localhost:5000/api";


const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

export const getAnnouncements = async (classroomId) => {
  const res = await axios.get(`${API_URL}/announcements/${classroomId}`, {
    ...getAuthHeader(),
  });
  return res.data;
};

export const postAnnouncement = async (classroomId, content, attachments = []) => {
  const formData = new FormData();
  formData.append("content", content);
  attachments.forEach((file) => formData.append("attachments", file));

  const res = await axios.post(`${API_URL}/announcements/${classroomId}`, formData, {
    headers: {
      ...getAuthHeader().headers,
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data;
};

export const updateAnnouncement = async (announcementId, content) => {
  const res = await axios.put(`${API_URL}/announcements/${announcementId}`, 
    { content },
    { ...getAuthHeader() }
  );
  return res.data;
};
export const deleteAnnouncement = async (announcementId) => {
  const res = await axios.delete(`${API_URL}/announcements/${announcementId}`, {
    ...getAuthHeader(),
  });
  return res.data;
};


export const togglePinAnnouncement = async (announcementId) => {
  const res = await axios.patch(
    `${API_URL}/announcements/${announcementId}/pin`,
    {},
    { ...getAuthHeader() }
  );
  return res.data;
};