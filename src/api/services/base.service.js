// src/api/services/base.service.js
import apiClient from '../config';

/**
 * Base Service Class
 * Chứa các phương thức CRUD cơ bản cho tất cả entities
 * Mọi service khác sẽ extend từ class này
 */
class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * GET all items with pagination & filters
   * @param {Object} params - Query parameters (_page, _limit, filters, etc.)
   * @returns {Promise} Response with data and pagination
   */
  async getAll(params = {}) {

    const response = await apiClient.get(this.endpoint, { params });
    return response;
  }

  /**
   * GET single item by ID
   * @param {number|string} id - Item ID
   * @param {Object} params - Additional query parameters
   * @returns {Promise} Response with single item
   */
  async getById(id, params = {}) {

    const response = await apiClient.get(`${this.endpoint}/${id}`, { params });
    return response;

  }

  /**
   * CREATE new item
   * @param {Object} data - Item data
   * @returns {Promise} Response with created item
   */
  async create(data) {
    const response = await apiClient.post(this.endpoint, data);
    return response;
  }

  /**
   * UPDATE existing item
   * @param {number|string} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise} Response with updated item
   */
  async update(id, data) {
    const response = await apiClient.put(`${this.endpoint}/${id}`, data);
    return response;
  }

  /**
   * DELETE item
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async delete(id) {
    const response = await apiClient.delete(`${this.endpoint}/${id}`);
    return response;
  }

  /**
   * SEARCH items
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with search results
   */
  async search(query, params = {}) {
    const response = await apiClient.get(`${this.endpoint}/search`, {
      params: { q: query, ...params },
    });
    return response;
  }

  /**
   * PATCH item (partial update)
   * @param {number|string} id - Item ID
   * @param {Object} data - Partial data
   * @returns {Promise} Response with updated item
   */
  async patch(id, data) {

    const response = await apiClient.patch(`${this.endpoint}/${id}`, data);
    return response;
  }
}

export default BaseService;