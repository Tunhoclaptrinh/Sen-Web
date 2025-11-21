export const collectionAPI = {
  getAll: () => apiClient.get('/collections'),
  getById: (id) => apiClient.get(`/collections/${id}`),
  create: (data) => apiClient.post('/collections', data),
  update: (id, data) => apiClient.put(`/collections/${id}`, data),
  delete: (id) => apiClient.delete(`/collections/${id}`),
  addArtifact: (collectionId, artifactId) =>
    apiClient.post(`/collections/${collectionId}/artifacts/${artifactId}`),
  removeArtifact: (collectionId, artifactId) =>
    apiClient.delete(`/collections/${collectionId}/artifacts/${artifactId}`),
};