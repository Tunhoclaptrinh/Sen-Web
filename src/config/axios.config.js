import axios from 'axios';
import { message } from 'antd';
import { STORAGE_KEYS } from '../config/constants';

// API Base URL
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

// Create axios instance
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    // Get token from localStorage using constant key
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    // Return the full data object from API (includes success, message, data)
    return response.data;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const { status, data } = response;

      switch (status) {
        case 400:
          message.error(data.message || 'Yêu cầu không hợp lệ');
          break;
        case 401:
          // Token expired or invalid
          message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem(STORAGE_KEYS.TOKEN);
          localStorage.removeItem(STORAGE_KEYS.USER);
          // Only redirect if not already on login page to avoid loops
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
        case 403:
          message.error('Bạn không có quyền truy cập tài nguyên này');
          break;
        case 404:
          message.error(data.message || 'Không tìm thấy dữ liệu');
          break;
        case 422:
          if (data.errors) {
            // Handle validation errors array if present
            const errorMessages = Array.isArray(data.errors)
              ? data.errors.map(err => err.message || JSON.stringify(err)).join(', ')
              : 'Dữ liệu không hợp lệ';
            message.error(errorMessages);
          } else {
            message.error(data.message || 'Dữ liệu không hợp lệ');
          }
          break;
        case 500:
          message.error('Lỗi hệ thống. Vui lòng thử lại sau.');
          break;
        default:
          message.error(data.message || 'Có lỗi xảy ra');
      }
    } else if (error.request) {
      message.error('Không thể kết nối đến server');
    } else {
      message.error('Có lỗi xảy ra trong quá trình thiết lập yêu cầu');
    }

    return Promise.reject(error);
  }
);

export default apiClient;