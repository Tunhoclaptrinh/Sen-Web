// ============================================
// src/services/heritage.service.js - Heritage Sites Service
// ============================================
import apiClient from '../config';

class HeritageService {
  /**
   * Get all heritage sites with pagination and filters
   */
  async getAll(params = {}) {
    const response = await apiClient.get('/heritage-sites', { params });
    return response;
  }

  /**
   * Get single heritage site by ID
   */
  async getById(id) {
    const response = await apiClient.get(`/heritage-sites/${id}`);
    return response;
  }

  /**
   * Create new heritage site
   */
  async create(data) {
    const response = await apiClient.post('/heritage-sites', data);
    return response;
  }

  /**
   * Update heritage site
   */
  async update(id, data) {
    const response = await apiClient.put(`/heritage-sites/${id}`, data);
    return response;
  }

  /**
   * Delete heritage site
   */
  async delete(id) {
    const response = await apiClient.delete(`/heritage-sites/${id}`);
    return response;
  }

  /**
   * Search heritage sites
   */
  async search(query, params = {}) {
    const response = await apiClient.get('/heritage-sites/search', {
      params: { q: query, ...params },
    });
    return response;
  }

  /**
   * Get nearby heritage sites
   */
  async getNearby(latitude, longitude, radius = 10) {
    const response = await apiClient.get('/heritage-sites/nearby', {
      params: { latitude, longitude, radius },
    });
    return response;
  }

  /**
   * Get artifacts of a heritage site
   */
  async getArtifacts(id, params = {}) {
    const response = await apiClient.get(`/heritage-sites/${id}/artifacts`, {
      params,
    });
    return response;
  }

  /**
   * Get timeline of a heritage site
   */
  async getTimeline(id) {
    const response = await apiClient.get(`/heritage-sites/${id}/timeline`);
    return response;
  }
}

export default new HeritageService();