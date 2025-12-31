import apiClient from '@/config/axios.config';

class AuthService {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đăng nhập thành công',
      };
    } catch (error) {
      console.error('[Auth] login error:', error);
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đăng ký thành công',
      };
    } catch (error) {
      console.error('[Auth] register error:', error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đăng xuất thành công',
      };
    } catch (error) {
      console.error('[Auth] logout error:', error);
      throw error;
    }
  }

  /**
   * Get current user info
   */
  async getMe() {
    try {
      const response = await apiClient.get('/auth/me');

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message,
      };
    } catch (error) {
      console.error('[Auth] getMe error:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword }
   */
  async changePassword(data) {
    try {
      const response = await apiClient.put('/auth/change-password', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      console.error('[Auth] changePassword error:', error);
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {Object} data - { email }
   */
  async forgotPassword(data) {
    try {
      const response = await apiClient.post('/auth/forgot-password', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã gửi email đặt lại mật khẩu',
      };
    } catch (error) {
      console.error('[Auth] forgotPassword error:', error);
      throw error;
    }
  }

  /**
   * Reset password
   * @param {Object} data - { token, newPassword }
   */
  async resetPassword(data) {
    try {
      const response = await apiClient.post('/auth/reset-password', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đặt lại mật khẩu thành công',
      };
    } catch (error) {
      console.error('[Auth] resetPassword error:', error);
      throw error;
    }
  }

  /**
   * Verify email
   * @param {Object} data - { token }
   */
  async verifyEmail(data) {
    try {
      const response = await apiClient.post('/auth/verify-email', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Xác thực email thành công',
      };
    } catch (error) {
      console.error('[Auth] verifyEmail error:', error);
      throw error;
    }
  }

  /**
   * Resend verification email
   * @param {Object} data - { email }
   */
  async resendVerification(data) {
    try {
      const response = await apiClient.post('/auth/resend-verification', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã gửi lại email xác thực',
      };
    } catch (error) {
      console.error('[Auth] resendVerification error:', error);
      throw error;
    }
  }
}

export default new AuthService();