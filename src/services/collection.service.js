// src/api/services/collection.service.js
import BaseService from './base.service';
import apiClient from '../api/config';

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
    return apiClient.post(
      `${this.endpoint}/${collectionId}/artifacts/${artifactId}`
    );
  }

  /**
   * Remove artifact from collection
   * @param {number|string} collectionId - Collection ID
   * @param {number|string} artifactId - Artifact ID
   * @returns {Promise} Response
   */
  async removeArtifact(collectionId, artifactId) {
    return apiClient.delete(
      `${this.endpoint}/${collectionId}/artifacts/${artifactId}`
    );
  }

  /**
   * Get collection artifacts
   * @param {number|string} collectionId - Collection ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with artifacts
   */
  async getArtifacts(collectionId, params = {}) {
    return apiClient.get(
      `${this.endpoint}/${collectionId}/artifacts`,
      { params }
    );
  }

  /**
   * Toggle collection public status
   * @param {number|string} collectionId - Collection ID
   * @returns {Promise} Response
   */
  async togglePublic(collectionId) {
    return apiClient.patch(
      `${this.endpoint}/${collectionId}/toggle-public`
    );
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
    return apiClient.post(
      `${this.endpoint}/${collectionId}/share`,
      data
    );
  }
}

export default new CollectionService();