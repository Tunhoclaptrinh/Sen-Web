// src/api/services/favorite.service.js
import apiClient from '../config';

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
    const response = await apiClient.get(this.endpoint);
    return response;

  }

  /**
   * Get favorites by type
   * @param {string} type - Type (artifact, heritage_site, exhibition)
   * @returns {Promise} Response with favorites of specific type
   */
  async getByType(type) {
    const response = await apiClient.get(`${this.endpoint}/${type}`);
    return response;

  }

  /**
   * Get favorite IDs by type
   * @param {string} type - Type
   * @returns {Promise} Response with array of IDs
   */
  async getIdsByType(type) {
    const response = await apiClient.get(`${this.endpoint}/${type}/ids`);
    return response;

  }

  /**
   * Check if item is favorited
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response with { isFavorite: boolean }
   */
  async check(type, id) {
    const response = await apiClient.get(`${this.endpoint}/${type}/${id}/check`);
    return response;

  }

  /**
   * Add item to favorites
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async add(type, id) {
    const response = await apiClient.post(`${this.endpoint}/${type}/${id}`);
    return response;

  }

  /**
   * Toggle favorite status
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async toggle(type, id) {
    const response = await apiClient.post(`${this.endpoint}/${type}/${id}/toggle`);
    return response;

  }

  /**
   * Remove item from favorites
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async remove(type, id) {
    const response = await apiClient.delete(`${this.endpoint}/${type}/${id}`);
    return response;

  }

  /**
   * Clear all favorites of a specific type
   * @param {string} type - Type
   * @returns {Promise} Response
   */
  async clearByType(type) {
    const response = await apiClient.delete(`${this.endpoint}/${type}`);
    return response;

  }

  /**
   * Clear all favorites
   * @returns {Promise} Response
   */
  async clearAll() {
    const response = await apiClient.delete(this.endpoint);
    return response;

  }

  /**
   * Get favorite statistics
   * @returns {Promise} Response with stats
   */
  async getStats() {
    const response = await apiClient.get(`${this.endpoint}/stats/summary`);
    return response;

  }

  /**
   * Get trending favorites by type
   * @param {string} type - Type
   * @returns {Promise} Response with trending items
   */
  async getTrending(type) {
    const response = await apiClient.get(`${this.endpoint}/trending/${type}`);
    return response;

  }
}

export default new FavoriteService();