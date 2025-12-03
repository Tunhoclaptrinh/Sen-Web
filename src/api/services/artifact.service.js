// ============================================
// src/services/artifact.service.js - Artifacts Service
// ============================================
import apiClient from '../api/config';

class ArtifactService {
  /**
   * Get all artifacts with pagination and filters
   */
  async getAll(params = {}) {
    try {
      const response = await apiClient.get('/artifacts', { params });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get single artifact by ID
   */
  async getById(id) {
    try {
      const response = await apiClient.get(`/artifacts/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Create new artifact
   */
  async create(data) {
    try {
      const response = await apiClient.post('/artifacts', data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update artifact
   */
  async update(id, data) {
    try {
      const response = await apiClient.put(`/artifacts/${id}`, data);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete artifact
   */
  async delete(id) {
    try {
      const response = await apiClient.delete(`/artifacts/${id}`);
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Search artifacts
   */
  async search(query, params = {}) {
    try {
      const response = await apiClient.get('/artifacts/search', {
        params: { q: query, ...params },
      });
      return response;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get related artifacts
   */
  async getRelated(id, params = {}) {
    try {
      const response = await apiClient.get(`/artifacts/${id}/related`, {
        params,
      });
      return response;
    } catch (error) {
      throw error;
    }
  }
}

export default new ArtifactService();