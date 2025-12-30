
import BaseService from './base.service';
import apiClient from '../config/axios.config';;

/**
 * Heritage Service
 * Xử lý operations cho Heritage Sites
 */
class HeritageService extends BaseService {
  constructor() {
    super('/heritage-sites');
  }

  /**
   * Get nearby heritage sites
   * @param {number} latitude - Latitude
   * @param {number} longitude - Longitude
   * @param {number} radius - Radius in km (default: 10)
   * @returns {Promise} Nearby heritage sites
   */
  async getNearby(latitude, longitude, radius = 10) {
    try {
      const response = await apiClient.get(`${this.endpoint}/nearby`, {
        params: { latitude, longitude, radius },
      });

      return {
        success: response.success || true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('[Heritage] getNearby error:', error);
      throw error;
    }
  }

  /**
   * Get artifacts of a heritage site
   * @param {number|string} id - Heritage site ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Artifacts
   */
  async getArtifacts(id, params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${id}/artifacts?${queryString}`
        : `${this.endpoint}/${id}/artifacts`;

      const response = await apiClient.get(url);

      return {
        success: response.success || true,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error('[Heritage] getArtifacts error:', error);
      throw error;
    }
  }

  /**
   * Get timeline of a heritage site
   * @param {number|string} id - Heritage site ID
   * @returns {Promise} Timeline events
   */
  async getTimeline(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}/timeline`);

      return {
        success: response.success || true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('[Heritage] getTimeline error:', error);
      throw error;
    }
  }

  /**
   * Get heritage sites by region
   * @param {string} region - Region name
   * @param {Object} params - Additional parameters
   * @returns {Promise} Heritage sites in region
   */
  async getByRegion(region, params = {}) {
    return this.getAll({
      region,
      ...params,
    });
  }

  /**
   * Get heritage sites by type
   * @param {string} type - Heritage type
   * @param {Object} params - Additional parameters
   * @returns {Promise} Heritage sites by type
   */
  async getByType(type, params = {}) {
    return this.getAll({
      type,
      ...params,
    });
  }

  /**
   * Get UNESCO listed heritage sites
   * @param {Object} params - Additional parameters
   * @returns {Promise} UNESCO heritage sites
   */
  async getUNESCO(params = {}) {
    return this.getAll({
      unesco_listed: true,
      ...params,
    });
  }

  /**
   * Get featured heritage sites
   * @param {number} limit - Number of items
   * @returns {Promise} Featured heritage sites
   */
  async getFeatured(limit = 10) {
    return this.getAll({
      _sort: 'rating',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Get popular heritage sites
   * @param {number} limit - Number of items
   * @returns {Promise} Popular heritage sites
   */
  async getPopular(limit = 10) {
    return this.getAll({
      _sort: 'view_count',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Search heritage sites with filters
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  async searchWithFilters(query, filters = {}) {
    return this.search(query, filters);
  }
}

export default new HeritageService();