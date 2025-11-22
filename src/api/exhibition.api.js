import apiClient from './config';

export const exhibitionAPI = {
  getAll: (params = {}) => apiClient.get('/exhibitions', { params }),
  getActive: (params = {}) => apiClient.get('/exhibitions/active', { params }),
  getById: (id) => apiClient.get(`/exhibitions/${id}`),
  create: (data) => apiClient.post('/exhibitions', data),
  update: (id, data) => apiClient.put(`/exhibitions/${id}`, data),
  delete: (id) => apiClient.delete(`/exhibitions/${id}`),
};