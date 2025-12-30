import apiClient from '../config/axios.config';;

class AuthService {
  /**
   * Login user
   * @param {Object} credentials - { email, password }
   */
  async login(credentials) {
    return apiClient.post('/auth/login', credentials);
  }

  /**
   * Register new user
   * @param {Object} userData - User registration data
   */
  async register(userData) {
    return apiClient.post('/auth/register', userData);
  }

  /**
   * Logout current user
   */
  async logout() {
    return apiClient.post('/auth/logout');
  }

  /**
   * Get current user info
   */
  async getMe() {
    return apiClient.get('/auth/me');
  }

  /**
   * Change password
   * @param {Object} data - { currentPassword, newPassword }
   */
  async changePassword(data) {
    return apiClient.put('/auth/change-password', data);
  }
}

export default new AuthService();