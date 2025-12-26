import axios from 'axios';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

console.log('API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Request interceptor to add token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.response?.data || error.message);
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/';
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => {
    console.log('Login request:', credentials.email);
    return api.post('/auth/login', credentials);
  },
  register: (userData) => {
    console.log('Register request:', userData.email);
    return api.post('/auth/register', userData);
  },
};

// Student API
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

// Course API
export const courseAPI = {
  getAll: () => {
    console.log('Fetching all courses...');
    return api.get('/courses');
  },
  create: (course) => api.post('/courses', course),
  update: (id, course) => api.put(`/courses/${id}`, course),
  delete: (id) => api.delete(`/courses/${id}`),
};

// Request API
export const requestAPI = {
  sendRequest: (courseId) => api.post(`/request/${courseId}`),
  getAllRequests: () => api.get('/requests'),
  approveRequest: (requestId) => api.put(`/request/${requestId}/approve`),
  rejectRequest: (requestId) => api.put(`/request/${requestId}/reject`),
};

// Health check
export const healthCheck = () => api.get('/health');

export default api;