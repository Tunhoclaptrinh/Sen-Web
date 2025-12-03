// ============================================
// src/services/heritage.service.js - Heritage Sites Service
// ============================================
import apiClient from '../api/config';

class HeritageService {
  /**
   * Get all heritage sites with pagination and filters
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/heritage-sites', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single heritage site by ID
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/heritage-sites/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new heritage site
   */
  async create(data) {
    try {
      const response = await apiClient.post('/heritage-sites', data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update heritage site
   */
  async update(id, data) {
    try {
      const response = await apiClient.put(`/heritage-sites/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete heritage site
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/heritage-sites/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search heritage sites
   */
  async search(query, params = {}) {
    try {
      const response = await apiClient.get('/heritage-sites/search', {
        params: { q: query, ...params },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get nearby heritage sites
   */
  async getNearby(latitude, longitude, radius = 10) {
    try {
      const response = await apiClient.get('/heritage-sites/nearby', {
        params: { latitude, longitude, radius },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get artifacts of a heritage site
   */
  async getArtifacts(id, params = {}) {
    try {
      const response = await apiClient.get(`/heritage-sites/${id}/artifacts`, {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get timeline of a heritage site
   */
  async getTimeline(id) {
    try {
      const response = await apiClient.get(`/heritage-sites/${id}/timeline`);
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new HeritageService();