import BaseService from './base.service';
import apiClient from '@/config/axios.config';

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
    try {
      const response = await apiClient.put('/users/profile', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Cập nhật thành công',
      };
    } catch (error) {
      console.error('[User] updateProfile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   * @param {Object} data - Password data
   * @returns {Promise} Response
   */
  async changePassword(data) {
    try {
      const response = await apiClient.put('/users/change-password', data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      console.error('[User] changePassword error:', error);
      throw error;
    }
  }

  /**
   * Get user activity
   * @param {number|string} id - User ID
   * @returns {Promise} Response with user activity
   */
  async getActivity(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}/activity`);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message,
      };
    } catch (error) {
      console.error('[User] getActivity error:', error);
      throw error;
    }
  }

  /**
   * Toggle user status (active/inactive)
   * @param {number|string} id - User ID
   * @returns {Promise} Response
   */
  async toggleStatus(id) {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${id}/status`);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã cập nhật trạng thái',
      };
    } catch (error) {
      console.error('[User] toggleStatus error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics (admin only)
   * @returns {Promise} Response with stats
   */
  async getStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats/summary`);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message,
      };
    } catch (error) {
      console.error('[User] getStats error:', error);
      throw error;
    }
  }

  /**
   * Delete user permanently (admin only)
   * @param {number|string} id - User ID
   * @returns {Promise} Response
   */
  async deletePermanent(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}/permanent`);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã xóa vĩnh viễn',
      };
    } catch (error) {
      console.error('[User] deletePermanent error:', error);
      throw error;
    }
  }

  /**
   * Export users (admin only)
   * @param {Object} params - Export parameters
   * @returns {Promise} Response with file
   */
  async export(params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/export`, {
        params,
        responseType: 'blob',
      });

      return response;
    } catch (error) {
      console.error('[User] export error:', error);
      throw error;
    }
  }

  /**
   * Import users (admin only)
   * @param {File} file - Excel/CSV file
   * @returns {Promise} Response
   */
  async import(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`${this.endpoint}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Import thành công',
      };
    } catch (error) {
      console.error('[User] import error:', error);
      throw error;
    }
  }
}

export default new UserService();