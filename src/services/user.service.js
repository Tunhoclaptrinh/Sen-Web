// src/api/services/user.service.js
import BaseService from './base.service';
import apiClient from '../api/config';

/**
 * User Service
 * Xử lý operations cho Users
 */
class UserService extends BaseService {
  constructor() {
    super('/users');
  }

  /**
   * Update user profile
   * @param {Object} data - Profile data
   * @returns {Promise} Response with updated profile
   */
  async updateProfile(data) {
    return apiClient.put('/users/profile', data);
  }

  /**
   * Get user activity
   * @param {number|string} id - User ID
   * @returns {Promise} Response with user activity
   */
  async getActivity(id) {
    return apiClient.get(`${this.endpoint}/${id}/activity`);
  }

  /**
   * Toggle user status (active/inactive)
   * @param {number|string} id - User ID
   * @returns {Promise} Response
   */
  async toggleStatus(id) {
    return apiClient.patch(`${this.endpoint}/${id}/status`);
  }

  /**
   * Get user statistics (admin only)
   * @returns {Promise} Response with stats
   */
  async getStats() {
    return apiClient.get(`${this.endpoint}/stats/summary`);
  }

  /**
   * Delete user permanently (admin only)
   * @param {number|string} id - User ID
   * @returns {Promise} Response
   */
  async deletePermanent(id) {
    return apiClient.delete(`${this.endpoint}/${id}/permanent`);
  }

  /**
   * Export users (admin only)
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file
   */
  async export(params = {}) {
    return apiClient.get(`${this.endpoint}/export`, {
      params,
      responseType: 'blob',
    });
  }

  /**
   * Import users (admin only)
   * @param {File} file - Excel/CSV file
   * @returns {Promise} Response
   */
  async import(file) {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post(`${this.endpoint}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
  }
}

export default new UserService();