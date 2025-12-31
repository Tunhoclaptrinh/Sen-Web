import apiClient from "@/config/axios.config";
import type {
  AuthResponse,
  LoginCredentials,
  RegisterData,
  ChangePasswordData,
  User,
  BaseApiResponse,
} from "@/types";

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
      console.error("[Auth] login error:", error);
      const message =
        error.response?.data?.message || error.message || "Đăng nhập thất bại";
      throw new Error(message);
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

      const { user, token } = response.data;

      if (!user || !token) {
        throw new Error("Dữ liệu phản hồi không hợp lệ");
      }

      return response;
    } catch (error: any) {
      console.error("[Auth] register error:", error);
      const message =
        error.response?.data?.message || error.message || "Đăng ký thất bại";
      throw new Error(message);
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
      console.error("[Auth] logout error:", error);
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
      console.error("[Auth] getMe error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Lỗi khi tải thông tin người dùng";
      throw new Error(message);
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
      console.error("[Auth] changePassword error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Đổi mật khẩu thất bại";
      throw new Error(message);
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
      console.error("[Auth] forgotPassword error:", error);
      const message =
        error.response?.data?.message || error.message || "Gửi email thất bại";
      throw new Error(message);
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
      console.error("[Auth] resetPassword error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Đặt lại mật khẩu thất bại";
      throw new Error(message);
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
      console.error("[Auth] verifyEmail error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Xác thực email thất bại";
      throw new Error(message);
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
      console.error("[Auth] resendVerification error:", error);
      const message =
        error.response?.data?.message || error.message || "Gửi email thất bại";
      throw new Error(message);
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
      console.error("[Auth] refreshToken error:", error);
      const message =
        error.response?.data?.message ||
        error.message ||
        "Làm mới token thất bại";
      throw new Error(message);
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
      console.error("[Auth] checkEmailExists error:", error);
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
      console.error("[Auth] validateToken error:", error);
      return false;
    }
  }
}

export default new AuthService();
