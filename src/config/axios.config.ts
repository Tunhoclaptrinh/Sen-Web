import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { message } from "antd";
import { STORAGE_KEYS } from "./constants";

// CONFIGURATION
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// REQUEST INTERCEPTOR
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from localStorage
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Log request in development
    if (import.meta.env.DEV) {
      console.log(`🚀 [${config.method?.toUpperCase()}] ${config.url}`, {
        params: config.params,
        data: config.data,
      });
    }

    return config;
  },
  (error: AxiosError) => {
    console.error("❌ Request Error:", error);
    return Promise.reject(error);
  },
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in development
    if (import.meta.env.DEV) {
      console.log(
        `✅ [${response.config.method?.toUpperCase()}] ${response.config.url}`,
        response.data,
      );
    }

    // Return the data object from API
    return response.data;
  },
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const { response } = error;

    // Log error in development
    if (import.meta.env.DEV) {
      console.error("❌ Response Error:", {
        url: originalRequest?.url,
        method: originalRequest?.method,
        status: response?.status,
        data: response?.data,
      });
    }

    // Handle No Response (Network Error)
    if (!response) {
      message.error(
        "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
      );
      return Promise.reject(error);
    }

    const { status, data } = response;

    // Handle Specific Status Codes
    switch (status) {
      case 400: {
        // Bad Request
        const errorMessage = data.message || "Yêu cầu không hợp lệ";
        message.error(errorMessage);
        break;
      }

      case 401: {
        // Unauthorized - Token expired or invalid

        // Prevent infinite loop
        if (originalRequest._retry) {
          handleForceLogout();
          return Promise.reject(error);
        }

        // If already refreshing, queue this request
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then((token) => {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
              return apiClient(originalRequest);
            })
            .catch((err) => Promise.reject(err));
        }

        // Mark as retrying
        originalRequest._retry = true;
        isRefreshing = true;

        // For now, just force logout
        // TODO: Implement token refresh logic when backend supports it
        handleForceLogout();
        processQueue(error, null);
        isRefreshing = false;
        return Promise.reject(error);
      }

      case 403: {
        // Forbidden
        message.error("Bạn không có quyền truy cập tài nguyên này");
        break;
      }

      case 404: {
        // Not Found
        const errorMessage = data.message || "Không tìm thấy dữ liệu";
        message.error(errorMessage);
        break;
      }

      case 422: {
        // Validation Error
        if (data.errors && Array.isArray(data.errors)) {
          const errorMessages = data.errors
            .map((err: any) => err.message || JSON.stringify(err))
            .join(", ");
          message.error(errorMessages);
        } else {
          message.error(data.message || "Dữ liệu không hợp lệ");
        }
        break;
      }

      case 429: {
        // Too Many Requests
        message.warning("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau.");
        break;
      }

      case 500: {
        // Internal Server Error
        message.error("Lỗi hệ thống. Vui lòng thử lại sau.");
        break;
      }

      case 503: {
        // Service Unavailable
        message.error("Dịch vụ tạm thời không khả dụng. Vui lòng thử lại sau.");
        break;
      }

      default: {
        // Unknown Error
        const errorMessage = data.message || "Có lỗi xảy ra";
        message.error(errorMessage);
      }
    }

    return Promise.reject(error);
  },
);

// HELPER FUNCTIONS

/**
 * Handle Force Logout
 * Clears auth data and redirects to login
 */
const handleForceLogout = () => {
  // Clear storage
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);

  // Show notification
  message.error("Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");

  // Redirect to login (only if not already on login page)
  if (window.location.pathname !== "/login") {
    window.location.href = "/login";
  }
};

// EXPORTS
export default apiClient;
