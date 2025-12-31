import apiClient from '@/config/axios.config';

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

      return {
        success: response.success || true,
        data: response.data || [],
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] getAll error:', error);
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

      return {
        success: response.success || true,
        data: response.data || [],
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] getByType error:', error);
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

      return {
        success: response.success || true,
        data: response.data || [],
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] getIdsByType error:', error);
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

      return {
        success: response.success || true,
        data: response.data || { isFavorite: false },
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] check error:', error);
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

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã thêm vào yêu thích',
      };
    } catch (error) {
      console.error('[Favorite] add error:', error);
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

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] toggle error:', error);
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

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã xóa khỏi yêu thích',
      };
    } catch (error) {
      console.error('[Favorite] remove error:', error);
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

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã xóa tất cả',
      };
    } catch (error) {
      console.error('[Favorite] clearByType error:', error);
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

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Đã xóa tất cả yêu thích',
      };
    } catch (error) {
      console.error('[Favorite] clearAll error:', error);
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

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] getStats error:', error);
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

      return {
        success: response.success || true,
        data: response.data || [],
        message: response.message,
      };
    } catch (error) {
      console.error('[Favorite] getTrending error:', error);
      throw error;
    }
  }
}

export default new FavoriteService();