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
    try {
      const response = await apiClient.get(this.endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get favorites by type
   * @param {string} type - Type (artifact, heritage_site, exhibition)
   * @returns {Promise} Response with favorites of specific type
   */
  async getByType(type) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${type}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get favorite IDs by type
   * @param {string} type - Type
   * @returns {Promise} Response with array of IDs
   */
  async getIdsByType(type) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${type}/ids`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Check if item is favorited
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response with { isFavorite: boolean }
   */
  async check(type, id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${type}/${id}/check`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Add item to favorites
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async add(type, id) {
    try {
      const response = await apiClient.post(`${this.endpoint}/${type}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Toggle favorite status
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async toggle(type, id) {
    try {
      const response = await apiClient.post(`${this.endpoint}/${type}/${id}/toggle`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Remove item from favorites
   * @param {string} type - Type
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async remove(type, id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${type}/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all favorites of a specific type
   * @param {string} type - Type
   * @returns {Promise} Response
   */
  async clearByType(type) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${type}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Clear all favorites
   * @returns {Promise} Response
   */
  async clearAll() {
    try {
      const response = await apiClient.delete(this.endpoint);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get favorite statistics
   * @returns {Promise} Response with stats
   */
  async getStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats/summary`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get trending favorites by type
   * @param {string} type - Type
   * @returns {Promise} Response with trending items
   */
  async getTrending(type) {
    try {
      const response = await apiClient.get(`${this.endpoint}/trending/${type}`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new FavoriteService();