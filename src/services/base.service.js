
import apiClient from '../config/axios.config';;

/**
 * Base Service
 * Tương thích hoàn toàn với BaseController và BaseService từ backend
 * Hỗ trợ đầy đủ: pagination, filtering, sorting, searching
 */
class BaseService {
  constructor(endpoint) {
    this.endpoint = endpoint;
  }

  /**
   * Build query string from params
   * Tương thích với backend query parsing
   */
  buildQueryString(params = {}) {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params._page || params.page) {
      queryParams.append('_page', params._page || params.page);
    }
    if (params._limit || params.limit) {
      queryParams.append('_limit', params._limit || params.limit);
    }

    // Sorting
    if (params._sort || params.sort) {
      queryParams.append('_sort', params._sort || params.sort);
    }
    if (params._order || params.order) {
      queryParams.append('_order', params._order || params.order);
    }

    // Search
    if (params.q || params.search) {
      queryParams.append('q', params.q || params.search);
    }

    // Filters - Loop through all other params
    Object.keys(params).forEach((key) => {
      if (
        !['_page', '_limit', '_sort', '_order', 'q', 'page', 'limit', 'sort', 'order', 'search'].includes(key)
      ) {
        const value = params[key];
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value);
        }
      }
    });

    return queryParams.toString();
  }

  /**
   * GET all items with pagination, filters, sorting
   * @param {Object} params - Query parameters
   * @returns {Promise} Response with data and pagination
   */
  async getAll(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString ? `${this.endpoint}?${queryString}` : this.endpoint;

      const response = await apiClient.get(url);

      // Backend response format:
      // {
      //   success: true,
      //   data: [...],
      //   pagination: { page, limit, total, totalPages, hasNext, hasPrev }
      // }

      return {
        success: response.success || true,
        data: response.data || [],
        pagination: response.pagination || {
          page: params._page || params.page || 1,
          limit: params._limit || params.limit || 10,
          total: 0,
          totalPages: 0,
          hasNext: false,
          hasPrev: false,
        },
        metadata: response.metadata || response.pagination, // Backward compatibility
      };
    } catch (error) {
      console.error(`[${this.endpoint}] getAll error:`, error);
      throw error;
    }
  }

  /**
   * GET single item by ID
   * @param {number|string} id - Item ID
   * @returns {Promise} Response with single item
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`${this.endpoint}/${id}`);

      return {
        success: response.success || true,
        data: response.data || response, // Some APIs return data directly
      };
    } catch (error) {
      console.error(`[${this.endpoint}] getById error:`, error);
      throw error;
    }
  }

  /**
   * CREATE new item
   * @param {Object} data - Item data
   * @returns {Promise} Response with created item
   */
  async create(data) {
    try {
      const response = await apiClient.post(this.endpoint, data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Created successfully',
      };
    } catch (error) {
      console.error(`[${this.endpoint}] create error:`, error);
      throw error;
    }
  }

  /**
   * UPDATE existing item
   * @param {number|string} id - Item ID
   * @param {Object} data - Updated data
   * @returns {Promise} Response with updated item
   */
  async update(id, data) {
    try {
      const response = await apiClient.put(`${this.endpoint}/${id}`, data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Updated successfully',
      };
    } catch (error) {
      console.error(`[${this.endpoint}] update error:`, error);
      throw error;
    }
  }

  /**
   * DELETE item
   * @param {number|string} id - Item ID
   * @returns {Promise} Response
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`${this.endpoint}/${id}`);

      return {
        success: response.success || true,
        message: response.message || 'Deleted successfully',
      };
    } catch (error) {
      console.error(`[${this.endpoint}] delete error:`, error);
      throw error;
    }
  }

  /**
   * SEARCH items
   * @param {string} query - Search query
   * @param {Object} params - Additional parameters
   * @returns {Promise} Response with search results
   */
  async search(query, params = {}) {
    try {
      const searchParams = {
        q: query,
        ...params,
      };

      const queryString = this.buildQueryString(searchParams);
      const url = `${this.endpoint}/search?${queryString}`;

      const response = await apiClient.get(url);

      return {
        success: response.success || true,
        data: response.data || [],
        pagination: response.pagination,
        count: response.count,
      };
    } catch (error) {
      console.error(`[${this.endpoint}] search error:`, error);
      throw error;
    }
  }

  /**
   * PATCH item (partial update)
   * @param {number|string} id - Item ID
   * @param {Object} data - Partial data
   * @returns {Promise} Response with updated item
   */
  async patch(id, data) {
    try {
      const response = await apiClient.patch(`${this.endpoint}/${id}`, data);

      return {
        success: response.success || true,
        data: response.data || response,
        message: response.message || 'Updated successfully',
      };
    } catch (error) {
      console.error(`[${this.endpoint}] patch error:`, error);
      throw error;
    }
  }

  /**
   * GET schema for this entity (if supported by backend)
   * @returns {Promise} Schema object
   */
  async getSchema() {
    try {
      const response = await apiClient.get(`${this.endpoint}/schema`);
      return response.data || response;
    } catch (error) {
      console.warn(`[${this.endpoint}] getSchema not supported`);
      return null;
    }
  }

  /**
   * EXPORT data
   * @param {Object} params - Export parameters
   * @returns {Promise} File blob
   */
  async export(params = {}) {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString ? `${this.endpoint}/export?${queryString}` : `${this.endpoint}/export`;

      const response = await apiClient.get(url, {
        responseType: 'blob',
      });

      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] export error:`, error);
      throw error;
    }
  }

  /**
   * IMPORT data
   * @param {File} file - Import file
   * @returns {Promise} Import results
   */
  async import(file) {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post(`${this.endpoint}/import`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] import error:`, error);
      throw error;
    }
  }

  /**
   * BATCH operations
   * @param {string} operation - 'create' | 'update' | 'delete'
   * @param {Array} items - Array of items or IDs
   * @returns {Promise} Batch operation results
   */
  async batch(operation, items) {
    try {
      const response = await apiClient.post(`${this.endpoint}/batch`, {
        operation,
        items,
      });

      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] batch error:`, error);
      throw error;
    }
  }

  /**
   * STATS endpoint (if supported)
   * @returns {Promise} Statistics
   */
  async getStats() {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats/summary`);
      return response.data || response;
    } catch (error) {
      console.warn(`[${this.endpoint}] getStats not supported`);
      return null;
    }
  }

  /**
   * DOWNLOAD template (for import)
   * @returns {Promise} File blob
   */
  async downloadTemplate() {
    try {
      const response = await apiClient.get(`${this.endpoint}/template`, {
        responseType: 'blob',
      });
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] downloadTemplate error:`, error);
      throw error;
    }
  }
}

export default BaseService;