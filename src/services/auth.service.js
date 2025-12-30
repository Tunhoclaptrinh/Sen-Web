// ============================================
// src/services/auth.service.js - Authentication Service
// ============================================
import apiClient from '../api/config';

class AuthService {
  /**
   * Login user
   */
  async login(credentials) {
    const response = await apiClient.post('/auth/login', credentials);

    // Save token and user to localStorage
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Register new user
   */
  async register(userData) {
    const response = await apiClient.post('/auth/register', userData);

    // Save token and user to localStorage
    if (response.data?.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  }

  /**
   * Logout current user
   */
  async logout() {
    try {
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  /**
   * Get current user info
   */
  async getMe() {
    return apiClient.get('/auth/me');
  }

  /**
   * Change password
   */
  async changePassword(data) {
    return apiClient.put('/auth/change-password', data);
  }

  /**
   * Get current user from localStorage
   */
  getCurrentUser() {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  /**
   * Get token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return !!this.getToken();
  }
}

export default new AuthService();