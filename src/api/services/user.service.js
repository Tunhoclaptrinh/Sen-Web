// src/api/services/user.service.js
import BaseService from './base.service';
import apiClient from '../config';

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
    const response = await apiClient.put('/users/profile', data);
    return response;
  }

  /**
   * Get user activity
   * @param {number|string} id - User ID
   * @returns {Promise} Response with user activity
   */
  async getActivity(id) {
    const response = await apiClient.get(`${this.endpoint}/${id}/activity`);
    return response;
  }

  /**
   * Toggle user status (active/inactive)
   * @param {number|string} id - User ID
   * @returns {Promise} Response
   */
  async toggleStatus(id) {
    const response = await apiClient.patch(`${this.endpoint}/${id}/status`);
    return response;
  }

  /**
   * Get user statistics (admin only)
   * @returns {Promise} Response with stats
   */
  async getStats() {
    const response = await apiClient.get(`${this.endpoint}/stats/summary`);
    return response;
  }

  /**
   * Delete user permanently (admin only)
   * @param {number|string} id - User ID
   * @returns {Promise} Response
   */
  async deletePermanent(id) {
    const response = await apiClient.delete(`${this.endpoint}/${id}/permanent`);
    return response;
  }

  /**
   * Export users (admin only)
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file
   */
  async export(params = {}) {
    const response = await apiClient.get(`${this.endpoint}/export`, {
      params,
      responseType: 'blob',
    });
    return response;
  }

  /**
   * Import users (admin only)
   * @param {File} file - Excel/CSV file
   * @returns {Promise} Response
   */
  async import(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await apiClient.post(`${this.endpoint}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response;
  }
}

export default new UserService();