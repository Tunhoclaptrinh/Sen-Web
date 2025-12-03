// src/api/services/heritage.service.js
import BaseService from './base.service';
import apiClient from '../config';

/**
 * Heritage Service
 * Xử lý operations cho Heritage Sites
 */
class HeritageService extends BaseService {
  constructor() {
    super('/heritage-sites');
  }

  /**
   * Get nearby heritage sites based on coordinates
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Search radius in km (default: 10)
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with nearby sites
   */
  async getNearby(latitude, longitude, radius = 10, params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/nearby`, {
        params: { latitude, longitude, radius, ...params },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get artifacts of a heritage site
   * @param {number|string} id - Heritage site ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with artifacts
   */
  async getArtifacts(id, params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}/artifacts`, {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get timeline events of a heritage site
   * @param {number|string} id - Heritage site ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with timeline events
   */
  async getTimeline(id, params = {}) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}/timeline`, {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get heritage sites by region
   * @param {string} region - Region name
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with filtered sites
   */
  async getByRegion(region, params = {}) {
    return this.getAll({ region, ...params });
  }

  /**
   * Get heritage sites by type
   * @param {string} type - Heritage type
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with filtered sites
   */
  async getByType(type, params = {}) {
    return this.getAll({ type, ...params });
  }

  /**
   * Get featured heritage sites
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with featured sites
   */
  async getFeatured(params = {}) {
    return this.getAll({ is_featured: true, ...params });
  }

  /**
   * Get UNESCO listed sites
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with UNESCO sites
   */
  async getUNESCO(params = {}) {
    return this.getAll({ unesco_listed: true, ...params });
  }
}

export default new HeritageService();