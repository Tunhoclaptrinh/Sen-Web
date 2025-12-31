import BaseService from './base.service';
import apiClient from '@/config/axios.config';

/**
 * Collection Service
 * Xử lý operations cho Collections
 */
class CollectionService extends BaseService {
  constructor() {
    super('/collections');
  }

  /**
   * Add artifact to collection
   * @param {number|string} collectionId - Collection ID
   * @param {number|string} artifactId - Artifact ID
   * @returns {Promise} Response
   */
  async addArtifact(collectionId, artifactId) {
    try {
      const response = await apiClient.post(
        `${this.endpoint}/${collectionId}/artifacts/${artifactId}`
      );

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã thêm vào bộ sưu tập',
      };
    } catch (error) {
      console.error('[Collection] addArtifact error:', error);
      throw error;
    }
  }

  /**
   * Remove artifact from collection
   * @param {number|string} collectionId - Collection ID
   * @param {number|string} artifactId - Artifact ID
   * @returns {Promise} Response
   */
  async removeArtifact(collectionId, artifactId) {
    try {
      const response = await apiClient.delete(
        `${this.endpoint}/${collectionId}/artifacts/${artifactId}`
      );

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã xóa khỏi bộ sưu tập',
      };
    } catch (error) {
      console.error('[Collection] removeArtifact error:', error);
      throw error;
    }
  }

  /**
   * Get collection artifacts
   * @param {number|string} collectionId - Collection ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with artifacts
   */
  async getArtifacts(collectionId, params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${collectionId}/artifacts?${queryString}`
        : `${this.endpoint}/${collectionId}/artifacts`;

      const response = await apiClient.get(url);

      return {
        success: response.success || true,
        data: response.data || [],
        pagination: response.pagination || response.metadata,
        message: response.message,
      };
    } catch (error) {
      console.error('[Collection] getArtifacts error:', error);
      throw error;
    }
  }

  /**
   * Toggle collection public status
   * @param {number|string} collectionId - Collection ID
   * @returns {Promise} Response
   */
  async togglePublic(collectionId) {
    try {
      const response = await apiClient.patch(
        `${this.endpoint}/${collectionId}/toggle-public`
      );

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã cập nhật trạng thái',
      };
    } catch (error) {
      console.error('[Collection] togglePublic error:', error);
      throw error;
    }
  }

  /**
   * Get public collections
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with public collections
   */
  async getPublic(params = {}) {
    return this.getAll({ is_public: true, ...params });
  }

  /**
   * Share collection
   * @param {number|string} collectionId - Collection ID
   * @param {Object} data - Share data (users, permissions)
   * @returns {Promise} Response
   */
  async share(collectionId, data) {
    try {
      const response = await apiClient.post(
        `${this.endpoint}/${collectionId}/share`,
        data
      );

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã chia sẻ bộ sưu tập',
      };
    } catch (error) {
      console.error('[Collection] share error:', error);
      throw error;
    }
  }
}

export default new CollectionService();