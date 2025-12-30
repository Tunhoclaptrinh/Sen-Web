import BaseService from './base.service';
import apiClient from '../config/axios.config';;
class ArtifactService extends BaseService {
  constructor() {
    super('/artifacts');
  }

  /**
   * Get related artifacts
   * @param {number|string} id - Artifact ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Related artifacts
   */
  async getRelated(id, params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${id}/related?${queryString}`
        : `${this.endpoint}/${id}/related`;

      const response = await apiClient.get(url);

      return {
        success: response.success || true,
        data: response.data || [],
      };
    } catch (error) {
      console.error('[Artifact] getRelated error:', error);
      throw error;
    }
  }

  /**
   * Get artifacts by category
   * @param {string} category - Category name
   * @param {Object} params - Additional parameters
   * @returns {Promise} Artifacts in category
   */
  async getByCategory(category, params = {}) {
    return this.getAll({
      category,
      ...params,
    });
  }

  /**
   * Get artifacts by period
   * @param {string} period - Historical period
   * @param {Object} params - Additional parameters
   * @returns {Promise} Artifacts from period
   */
  async getByPeriod(period, params = {}) {
    return this.getAll({
      period,
      ...params,
    });
  }

  /**
   * Get artifacts by type
   * @param {string} type - Artifact type
   * @param {Object} params - Additional parameters
   * @returns {Promise} Artifacts by type
   */
  async getByType(type, params = {}) {
    return this.getAll({
      artifact_type: type,
      ...params,
    });
  }

  /**
   * Get artifacts by condition
   * @param {string} condition - Artifact condition
   * @param {Object} params - Additional parameters
   * @returns {Promise} Artifacts by condition
   */
  async getByCondition(condition, params = {}) {
    return this.getAll({
      condition,
      ...params,
    });
  }

  /**
   * Get featured artifacts
   * @param {number} limit - Number of items
   * @returns {Promise} Featured artifacts
   */
  async getFeatured(limit = 10) {
    return this.getAll({
      _sort: 'rating',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Get trending artifacts
   * @param {number} limit - Number of items
   * @returns {Promise} Trending artifacts
   */
  async getTrending(limit = 10) {
    return this.getAll({
      _sort: 'view_count',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Search artifacts with filters
   * @param {string} query - Search query
   * @param {Object} filters - Additional filters
   * @returns {Promise} Search results
   */
  async searchWithFilters(query, filters = {}) {
    return this.search(query, filters);
  }

  /**
   * Get artifacts by heritage site
   * @param {number|string} heritageId - Heritage site ID
   * @param {Object} params - Query parameters
   * @returns {Promise} Artifacts at heritage site
   */
  async getByHeritageSite(heritageId, params = {}) {
    return this.getAll({
      heritage_site_id: heritageId,
      ...params,
    });
  }
}

export default new ArtifactService();