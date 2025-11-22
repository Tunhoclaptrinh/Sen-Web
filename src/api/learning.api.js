import apiClient from './config';

export const learningAPI = {
  getAll: (params = {}) => apiClient.get('/learning', { params }),
  getPath: () => apiClient.get('/learning/path'),
  getById: (id) => apiClient.get(`/learning/${id}`),
  complete: (id, data) => apiClient.post(`/learning/${id}/complete`, data),
};
