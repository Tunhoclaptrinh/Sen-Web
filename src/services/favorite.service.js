// src/api/services/favorite.service.js
import apiClient from '../config/axios.config';;

/**
 * Favorite Service
 * Xử lý operations cho Favorites (unified system)
 */
class FavoriteService {
  constructor() {
    this.endpoint = '/favorites';
  }

  /**
   * Get all favorites
   * @returns {Promise} Response with all favorites
   */
  async getAll() {
    return apiClient.get(this.endpoint);
  }

  /**
   * Get favorites by type
   * @param {string} type - Type (artifact, heritage_site, exhibition)
   * @returns {Promise} Response with favorites of specific type
   */
  async getByType(type) {
    return apiClient.get(`${this.endpoint}/${type}`);
  }

  /**
   * Get favorite IDs by type
   * @param {string} type - Type
   * @returns {Promise} Response with array of IDs
   */
  async getIdsByType(type) {
    return apiClient.get(`${this.endpoint}/${type}/ids`);
  }

  /**
   * Check if item is favorited
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response with { isFavorite: boolean }
   */
  async check(type, id) {
    return apiClient.get(`${this.endpoint}/${type}/${id}/check`);
  }

  /**
   * Add item to favorites
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async add(type, id) {
    return apiClient.post(`${this.endpoint}/${type}/${id}`);
  }

  /**
   * Toggle favorite status
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async toggle(type, id) {
    return apiClient.post(`${this.endpoint}/${type}/${id}/toggle`);
  }

  /**
   * Remove item from favorites
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async remove(type, id) {
    return apiClient.delete(`${this.endpoint}/${type}/${id}`);
  }

  /**
   * Clear all favorites of a specific type
   * @param {string} type - Type
   * @returns {Promise} Response
   */
  async clearByType(type) {
    return apiClient.delete(`${this.endpoint}/${type}`);
  }

  /**
   * Clear all favorites
   * @returns {Promise} Response
   */
  async clearAll() {
    return apiClient.delete(this.endpoint);
  }

  /**
   * Get favorite statistics
   * @returns {Promise} Response with stats
   */
  async getStats() {
    return apiClient.get(`${this.endpoint}/stats/summary`);
  }

  /**
   * Get trending favorites by type
   * @param {string} type - Type
   * @returns {Promise} Response with trending items
   */
  async getTrending(type) {
    return apiClient.get(`${this.endpoint}/trending/${type}`);
  }
}

export default new FavoriteService();