export const reviewAPI = {
  getAll: (params = {}) => apiClient.get('/reviews', { params }),
  getByType: (type, params = {}) => apiClient.get(`/reviews/type/${type}`, { params }),
  getById: (id) => apiClient.get(`/reviews/${id}`),
  create: (data) => apiClient.post('/reviews', data),
  update: (id, data) => apiClient.put(`/reviews/${id}`, data),
  delete: (id) => apiClient.delete(`/reviews/${id}`),
  search: (query, params = {}) => apiClient.get('/reviews/search', { params: { q: query, ...params } }),
};