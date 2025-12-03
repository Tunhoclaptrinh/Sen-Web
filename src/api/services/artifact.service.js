// ============================================
// src/services/artifact.service.js - Artifacts Service
// ============================================
import apiClient from '../config';

class ArtifactService {
  /**
   * Get all artifacts with pagination and filters
   */
  async getAll(params = {}) {
    const response = await apiClient.get('/artifacts', { params });
    return response;
  }

  /**
   * Get single artifact by ID
   */
  async getById(id) {
    const response = await apiClient.get(`/artifacts/${id}`);
    return response;
  }

  /**
   * Create new artifact
   */
  async create(data) {
    const response = await apiClient.post('/artifacts', data);
    return response;
  }

  /**
   * Update artifact
   */
  async update(id, data) {
    const response = await apiClient.put(`/artifacts/${id}`, data);
    return response;
  }

  /**
   * Delete artifact
   */
  async delete(id) {
    const response = await apiClient.delete(`/artifacts/${id}`);
    return response;
  }

  /**
   * Search artifacts
   */
  async search(query, params = {}) {
    const response = await apiClient.get('/artifacts/search', {
      params: { q: query, ...params },
    });
    return response;
  }

  /**
   * Get related artifacts
   */
  async getRelated(id, params = {}) {
    const response = await apiClient.get(`/artifacts/${id}/related`, {
      params,
    });
    return response;
  }
}

export default new ArtifactService();