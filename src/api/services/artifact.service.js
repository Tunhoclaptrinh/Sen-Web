// src/api/services/artifact.service.js
import BaseService from './base.service';
import apiClient from '../config';

/**
 * Artifact Service
 * Xử lý operations cho Artifacts
 */
class ArtifactService extends BaseService {
  constructor() {
    super('/artifacts');
  }

  /**
   * Get related artifacts
   * @param {number|string} id - Artifact ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with related artifacts
   */
  async getRelated(id, params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}/related`, {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get artifacts by type
   * @param {string} type - Artifact type
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with filtered artifacts
   */
  async getByType(type, params = {}) {
    return this.getAll({ artifact_type: type, ...params });
  }

  /**
   * Get artifacts by condition
   * @param {string} condition - Artifact condition (excellent, good, fair, poor)
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with filtered artifacts
   */
  async getByCondition(condition, params = {}) {
    return this.getAll({ condition, ...params });
  }

  /**
   * Get artifacts by heritage site
   * @param {number|string} heritageSiteId - Heritage site ID
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with filtered artifacts
   */
  async getByHeritageSite(heritageSiteId, params = {}) {
    return this.getAll({ heritage_site_id: heritageSiteId, ...params });
  }

  /**
   * Get artifacts by period
   * @param {string} period - Historical period
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with filtered artifacts
   */
  async getByPeriod(period, params = {}) {
    return this.getAll({ period, ...params });
  }
}

export default new ArtifactService();