import axios from 'axios';
import { message } from 'antd';

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
    // Get token from localStorage
    const token = localStorage.getItem(import.meta.env.VITE_TOKEN_KEY || 'sen_token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // // Add timestamp to prevent caching
    // if (config.method === 'get') {
    //   config.params = {
    //     ...config.params,
    //     _t: new Date().getTime(),
    //   };
    // }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
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
          message.error('Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.');
          localStorage.removeItem(import.meta.env.VITE_TOKEN_KEY || 'sen_token');
          localStorage.removeItem(import.meta.env.VITE_USER_KEY || 'sen_user');
          window.location.href = '/login';
          break;
        case 403:
          message.error('Bạn không có quyền truy cập');
          break;
        case 404:
          message.error(data.message || 'Không tìm thấy dữ liệu');
          break;
        case 422:
          if (data.errors) {
            const errorMessages = Object.values(data.errors).flat();
            errorMessages.forEach(msg => message.error(msg));
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
      message.error('Có lỗi xảy ra');
    }

    return Promise.reject(error);
  }
);

export default apiClient;