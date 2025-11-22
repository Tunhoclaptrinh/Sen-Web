import apiClient from './config';

export const favoriteAPI = {
  getAll: () => apiClient.get('/favorites'),
  getByType: (type) => apiClient.get(`/favorites/${type}`),
  check: (type, id) => apiClient.get(`/favorites/${type}/${id}/check`),
  add: (type, id) => apiClient.post(`/favorites/${type}/${id}`),
  toggle: (type, id) => apiClient.post(`/favorites/${type}/${id}/toggle`),
  remove: (type, id) => apiClient.delete(`/favorites/${type}/${id}`),
};
