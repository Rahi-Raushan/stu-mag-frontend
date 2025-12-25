import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
};

export const studentAPI = {
  getMyCourses: () => api.get('/students/my-courses'),
  getMyRequests: () => api.get('/students/my-requests'),
  getProfile: () => api.get('/students/profile'),
  updateProfile: (data) => api.put('/students/profile', data),
  getAll: () => api.get('/students'),
  update: (id, data) => api.put(`/students/${id}`, data),
  delete: (id) => api.delete(`/students/${id}`),
  getCourses: (id) => api.get(`/students/${id}/courses`),
};

export const courseAPI = {
  getAll: () => api.get('/courses'),
  create: (course) => api.post('/courses', course),
  update: (id, course) => api.put(`/courses/${id}`, course),
  delete: (id) => api.delete(`/courses/${id}`),
};

export const requestAPI = {
  sendRequest: (courseId) => api.post(`/request/${courseId}`),
  getAllRequests: () => api.get('/requests'),
  approveRequest: (requestId) => api.put(`/request/${requestId}/approve`),
  rejectRequest: (requestId) => api.put(`/request/${requestId}/reject`),
};

export default api;