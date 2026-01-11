import apiClient from "@/config/axios.config";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  User,
  BaseApiResponse,
} from "@/types";
import { logger } from "@/utils/logger.utils";

/**
 * Auth Service
 * Handles all authentication-related operations
 */
class AuthService {
  /**
   * Login user
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/login",
        credentials,
      );

      if (!response.success) {
        throw new Error(response.message || "Đăng nhập thất bại");
      }

      const { user, token } = response.data;

      // Validate response data
      if (!user || !token) {
        throw new Error("Dữ liệu phản hồi không hợp lệ");
      }

      return response;
    } catch (error: any) {
      logger.error("[Auth] login error:", error);
      // Không hiển thị message ở đây nữa vì axios interceptor đã xử lý
      throw error;
    }
  }

  /**
   * Register new user
   */
  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>(
        "/auth/register",
        userData,
      );

      if (!response.success) {
        throw new Error(response.message || "Đăng ký thất bại");
      }

      // Backend no longer returns token after registration
      return response;
    } catch (error: any) {
      logger.error("[Auth] register error:", error);
      // Không hiển thị message ở đây nữa vì axios interceptor đã xử lý
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout(): Promise<BaseApiResponse<void>> {
    try {
      const response =
        await apiClient.post<BaseApiResponse<void>>("/auth/logout");

      return {
        success: response.success ?? true,
        message: response.message ?? "Đăng xuất thành công",
      };
    } catch (error) {
      logger.error("[Auth] logout error:", error);
      // Don't throw error on logout - always succeed locally
      return {
        success: true,
        message: "Đăng xuất thành công",
      };
    }
  }

  /**
   * Get current user info
   */
  async getMe(): Promise<BaseApiResponse<User>> {
    try {
      const response = await apiClient.get<BaseApiResponse<User>>("/auth/me");

      if (!response.success) {
        throw new Error(response.message || "Lỗi khi tải thông tin người dùng");
      }

      return {
        success: response.success,
        data: response.data ?? (response as any),
        message: response.message,
      };
    } catch (error: any) {
      logger.error("[Auth] getMe error:", error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(
    data: ChangePasswordData,
  ): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.put<BaseApiResponse<void>>(
        "/auth/change-password",
        data,
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đổi mật khẩu thành công",
      };
    } catch (error: any) {
      logger.error("[Auth] changePassword error:", error);
      throw error;
    }
  }

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        "/auth/forgot-password",
        { email },
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã gửi email đặt lại mật khẩu",
      };
    } catch (error: any) {
      logger.error("[Auth] forgotPassword error:", error);
      throw error;
    }
  }

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
  ): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        "/auth/reset-password",
        { token, newPassword },
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đặt lại mật khẩu thành công",
      };
    } catch (error: any) {
      logger.error("[Auth] resetPassword error:", error);
      throw error;
    }
  }

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        "/auth/verify-email",
        { token },
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Xác thực email thành công",
      };
    } catch (error: any) {
      logger.error("[Auth] verifyEmail error:", error);
      throw error;
    }
  }

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        "/auth/resend-verification",
        { email },
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã gửi lại email xác thực",
      };
    } catch (error: any) {
      logger.error("[Auth] resendVerification error:", error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<AuthResponse> {
    try {
      const response = await apiClient.post<AuthResponse>("/auth/refresh");

      if (!response.success) {
        throw new Error(response.message || "Làm mới token thất bại");
      }

      return response;
    } catch (error: any) {
      logger.error("[Auth] refreshToken error:", error);
      throw error;
    }
  }

  /**
   * Check if email exists
   */
  async checkEmailExists(email: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ exists: boolean }>(
        "/auth/check-email",
        { email },
      );

      return response.exists ?? false;
    } catch (error) {
      logger.error("[Auth] checkEmailExists error:", error);
      return false;
    }
  }

  /**
   * Validate token
   */
  async validateToken(token: string): Promise<boolean> {
    try {
      const response = await apiClient.post<{ valid: boolean }>(
        "/auth/validate-token",
        { token },
      );

      return response.valid ?? false;
    } catch (error) {
      logger.error("[Auth] validateToken error:", error);
      return false;
    }
  }
}

export default new AuthService();
