// ============================================
// src/api/config.js - API Client Configuration
// ============================================
import axios from 'axios';

const API_BASE_URL = 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token to headers
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
apiClient.interceptors.response.use(
  (response) => {
    // Return data directly if success
    return response.data;
  },
  (error) => {
    // Handle errors
    if (error.response) {
      // Server responded with error
      const { status, data } = error.response;

      if (status === 401) {
        // Unauthorized - clear token and redirect to login
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }

      // Return error message from server
      return Promise.reject(new Error(data.message || 'Server Error'));
    } else if (error.request) {
      // Request made but no response
      return Promise.reject(new Error('Network Error - No response from server'));
    } else {
      // Something else happened
      return Promise.reject(new Error(error.message || 'Unknown Error'));
    }
  }
);

export default apiClient;