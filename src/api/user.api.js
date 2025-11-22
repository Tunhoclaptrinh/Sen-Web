import apiClient from './config';

export const userAPI = {
  getAll: (params = {}) => apiClient.get('/users', { params }),
  getById: (id) => apiClient.get(`/users/${id}`),
  update: (id, data) => apiClient.put(`/users/${id}`, data),
  updateProfile: (data) => apiClient.put('/users/profile', data),
  toggleStatus: (id) => apiClient.patch(`/users/${id}/status`),
  delete: (id) => apiClient.delete(`/users/${id}`),
};