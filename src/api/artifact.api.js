import apiClient from './config';

export const artifactAPI = {
  getAll: (params = {}) => apiClient.get('/artifacts', { params }),
  search: (query, params = {}) => apiClient.get('/artifacts/search', { params: { q: query, ...params } }),
  getById: (id, params = {}) => apiClient.get(`/artifacts/${id}`, { params }),
  getRelated: (id, params = {}) => apiClient.get(`/artifacts/${id}/related`, { params }),
  create: (data) => apiClient.post('/artifacts', data),
  update: (id, data) => apiClient.put(`/artifacts/${id}`, data),
  delete: (id) => apiClient.delete(`/artifacts/${id}`),
  getByType: (type, params = {}) => apiClient.get('/artifacts', { params: { artifact_type: type, ...params } }),
  getByCondition: (condition, params = {}) => apiClient.get('/artifacts', { params: { condition, ...params } }),
};
