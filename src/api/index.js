// ============================================
// src/api/index.js (Updated)
// ============================================
export { default as apiClient } from './config';

// Export all services
export {
  authService,
  heritageService,
  artifactService,
  userService,
  favoriteService,
  collectionService,
} from './services';

// Export endpoints
export { API_ENDPOINTS } from './endpoints';

// Legacy exports (backward compatibility)
export { artifactAPI } from './artifact.api';
export { authAPI } from './auth.api';
export { categoryAPI } from './category.api';
export { reviewAPI } from './review.api';
export { favoriteAPI } from './favorite.api';
export { collectionAPI } from './collection.api';
export { userAPI } from './user.api';
export { exhibitionAPI } from './exhibition.api';
export { questAPI } from './quest.api';
export { learningAPI } from './learning.api';
export { default as heritageAPI } from './heritage.api';