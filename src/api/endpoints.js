// ============================================
// src/api/endpoints.js
// ============================================
export const API_ENDPOINTS = {
  // Auth
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
    ME: '/auth/me',
    CHANGE_PASSWORD: '/auth/change-password',
  },

  // Users
  USERS: {
    BASE: '/users',
    PROFILE: '/users/profile',
    ACTIVITY: (id) => `/users/${id}/activity`,
    STATUS: (id) => `/users/${id}/status`,
    STATS: '/users/stats/summary',
  },

  // Heritage Sites
  HERITAGE: {
    BASE: '/heritage-sites',
    SEARCH: '/heritage-sites/search',
    NEARBY: '/heritage-sites/nearby',
    DETAIL: (id) => `/heritage-sites/${id}`,
    ARTIFACTS: (id) => `/heritage-sites/${id}/artifacts`,
    TIMELINE: (id) => `/heritage-sites/${id}/timeline`,
  },

  // Artifacts
  ARTIFACTS: {
    BASE: '/artifacts',
    SEARCH: '/artifacts/search',
    DETAIL: (id) => `/artifacts/${id}`,
    RELATED: (id) => `/artifacts/${id}/related`,
  },

  // Favorites
  FAVORITES: {
    BASE: '/favorites',
    BY_TYPE: (type) => `/favorites/${type}`,
    CHECK: (type, id) => `/favorites/${type}/${id}/check`,
    TOGGLE: (type, id) => `/favorites/${type}/${id}/toggle`,
  },

  // Collections
  COLLECTIONS: {
    BASE: '/collections',
    DETAIL: (id) => `/collections/${id}`,
    ADD_ARTIFACT: (collectionId, artifactId) =>
      `/collections/${collectionId}/artifacts/${artifactId}`,
  },
};
