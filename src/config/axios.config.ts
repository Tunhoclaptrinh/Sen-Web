import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { message } from "antd";
import { STORAGE_KEYS } from "./constants";
// KHÔNG import store ở đây để tránh Circular Dependency

// CONFIGURATION
export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: parseInt(import.meta.env.VITE_API_TIMEOUT || "30000"),
  headers: {
    "Content-Type": "application/json",
  },
});

// Override types to match response interceptor behavior (returns data directly)
import { AxiosRequestConfig } from "axios";
export interface CustomAxiosInstance extends Omit<AxiosInstance, 'get' | 'put' | 'post' | 'delete' | 'patch'> {
  get<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  delete<T = any, R = T, D = any>(url: string, config?: AxiosRequestConfig<D>): Promise<R>;
  post<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  put<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
  patch<T = any, R = T, D = any>(url: string, data?: D, config?: AxiosRequestConfig<D>): Promise<R>;
}

// -- INJECT STORE PATTERN --
let store: any = null; // Sẽ giữ reference tới Redux store
export const injectStore = (_store: any) => {
  store = _store;
};

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
    const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (import.meta.env.DEV) {
      console.log(`[API ${config.method?.toUpperCase()}] ${config.url}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// RESPONSE INTERCEPTOR
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response.data,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };
    const { response } = error;

    // === XỬ LÝ NETWORK ERROR ===
    if (!response) {
      message.error("Không thể kết nối đến server. Vui lòng kiểm tra mạng.");
      return Promise.reject(error);
    }

    const { status, data } = response;

    // === XỬ LÝ 401: REFRESH TOKEN ===
    if (status === 401 && !originalRequest._retry) {
      // Nếu là endpoint login/register, không refresh token
      if (originalRequest.url?.includes('/auth/login') ||
        originalRequest.url?.includes('/auth/register')) {
        // Hiển thị lỗi từ backend
        const errorMessage = data?.message || 'Đăng nhập thất bại';
        message.error(errorMessage);
        return Promise.reject(error);
      }

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

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const currentToken = localStorage.getItem(STORAGE_KEYS.TOKEN);
        // Dùng axios thuần để tránh interceptor loop
        const refreshResponse = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { headers: { Authorization: `Bearer ${currentToken}` } },
        );

        const newToken = refreshResponse.data?.data?.token;

        if (!newToken) {
          throw new Error("Không nhận được token mới");
        }

        // Lưu token
        localStorage.setItem(STORAGE_KEYS.TOKEN, newToken);

        // Dispatch action cập nhật store nếu store đã được inject
        if (store) {
          store.dispatch({
            type: "auth/refreshTokenSuccess",
            payload: newToken,
          });
        }

        processQueue(null, newToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);

        // Logout nếu refresh thất bại
        if (store) {
          store.dispatch({ type: "auth/forceLogout" });
        }
        handleForceLogout();

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // === XỬ LÝ CÁC STATUS CODE KHÁC ===
    if (status === 403) {
      const errorMessage = data?.message || "Bạn không có quyền truy cập tài nguyên này.";
      message.error(errorMessage);
    } else if (status === 404) {
      const errorMessage = data?.message || "Không tìm thấy tài nguyên.";
      message.error(errorMessage);
    } else if (status === 400) {
      const errorMessage = data?.message || "Yêu cầu không hợp lệ.";
      message.error(errorMessage);
    } else if (status === 422) {
      // Validation errors
      if (data?.errors && Array.isArray(data.errors)) {
        const errorMessages = data.errors.map((err: any) =>
          err.field ? `${err.field}: ${err.message}` : err.message
        ).join('\n');
        message.error(errorMessages);
      } else {
        const errorMessage = data?.message || "Dữ liệu không hợp lệ.";
        message.error(errorMessage);
      }
    } else if (status === 500) {
      const errorMessage = data?.message || "Lỗi server. Vui lòng thử lại sau.";
      message.error(errorMessage);
    } else if (status >= 400) {
      // Generic error for other 4xx/5xx
      const errorMessage = data?.message || "Đã xảy ra lỗi. Vui lòng thử lại.";
      message.error(errorMessage);
    }

    return Promise.reject(error);
  },
);

const handleForceLogout = () => {
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  if (window.location.pathname !== "/login") {
    message.error("Phiên đăng nhập hết hạn.");
    window.location.href = "/login";
  }
};

export default apiClient as CustomAxiosInstance;
