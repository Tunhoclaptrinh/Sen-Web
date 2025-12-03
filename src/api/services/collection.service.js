// src/api/services/collection.service.js
import BaseService from './base.service';
import apiClient from '../config';

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
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
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
      const response = await apiClient.get(
        `${this.endpoint}/${collectionId}/artifacts`,
        { params }
      );
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
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
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new CollectionService();