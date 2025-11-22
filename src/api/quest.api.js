import apiClient from './config';

export const questAPI = {
  getAll: (params = {}) => apiClient.get('/quests', { params }),
  getAvailable: () => apiClient.get('/quests/available'),
  getLeaderboard: () => apiClient.get('/quests/leaderboard'),
  getById: (id) => apiClient.get(`/quests/${id}`),
  complete: (id, data) => apiClient.post(`/quests/${id}/complete`, data),
};