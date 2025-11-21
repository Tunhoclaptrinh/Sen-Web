import apiClient from './config';

const heritageAPI = {
  // Get all heritage sites with filters
  getAll: (params = {}) => {
    return apiClient.get('/heritage-sites', { params });
  },

  // Search heritage sites
  search: (query, params = {}) => {
    return apiClient.get('/heritage-sites/search', {
      params: { q: query, ...params },
    });
  },

  // Get nearby heritage sites
  getNearby: (latitude, longitude, radius = 5, params = {}) => {
    return apiClient.get('/heritage-sites/nearby', {
      params: { latitude, longitude, radius, ...params },
    });
  },

  // Get heritage site by ID
  getById: (id, params = {}) => {
    return apiClient.get(`/heritage-sites/${id}`, { params });
  },

  // Get artifacts of heritage site
  getArtifacts: (id, params = {}) => {
    return apiClient.get(`/heritage-sites/${id}/artifacts`, { params });
  },

  // Get timeline of heritage site
  getTimeline: (id, params = {}) => {
    return apiClient.get(`/heritage-sites/${id}/timeline`, { params });
  },

  // Create heritage site (Admin only)
  create: (data) => {
    return apiClient.post('/heritage-sites', data);
  },

  // Update heritage site (Admin only)
  update: (id, data) => {
    return apiClient.put(`/heritage-sites/${id}`, data);
  },

  // Delete heritage site (Admin only)
  delete: (id) => {
    return apiClient.delete(`/heritage-sites/${id}`);
  },

  // Get heritage sites by type
  getByType: (type, params = {}) => {
    return apiClient.get('/heritage-sites', {
      params: { type, ...params },
    });
  },

  // Get heritage sites by region
  getByRegion: (region, params = {}) => {
    return apiClient.get('/heritage-sites', {
      params: { region, ...params },
    });
  },

  // Get featured heritage sites
  getFeatured: (params = {}) => {
    return apiClient.get('/heritage-sites', {
      params: { is_featured: true, ...params },
    });
  },

  // Get UNESCO listed sites
  getUNESCO: (params = {}) => {
    return apiClient.get('/heritage-sites', {
      params: { unesco_listed: true, ...params },
    });
  },
};

export default heritageAPI;