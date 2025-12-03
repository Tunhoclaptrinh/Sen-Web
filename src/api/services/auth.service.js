// src/api/services/auth.service.js
import apiClient from '../config';

/**
 * Authentication Service
 * Xử lý tất cả authentication operations
 */
class AuthService {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   * @returns {Promise} Response with user and token
   */
  async login(credentials) {
    try {
      const response = await apiClient.post('/auth/login', credentials);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Register new user
   * @param {Object} userData - { name, email, password, phone, address }
   * @returns {Promise} Response with user and token
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Logout current user
   * @returns {Promise} Response
   */
  async logout() {
    try {
      const response = await apiClient.post('/auth/logout');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get current user info
   * @returns {Promise} Response with user data
   */
  async getMe() {
    try {
      const response = await apiClient.get('/auth/me');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword }
   * @returns {Promise} Response
   */
  async changePassword(data) {
    try {
      const response = await apiClient.put('/auth/change-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Refresh token
   * @returns {Promise} Response with new token
   */
  async refreshToken() {
    try {
      const response = await apiClient.post('/auth/refresh-token');
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise} Response
   */
  async forgotPassword(email) {
    try {
      const response = await apiClient.post('/auth/forgot-password', { email });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Reset password with token
   * @param {Object} data - { token, newPassword }
   * @returns {Promise} Response
   */
  async resetPassword(data) {
    try {
      const response = await apiClient.post('/auth/reset-password', data);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new AuthService();