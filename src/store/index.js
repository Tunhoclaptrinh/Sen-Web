import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import heritageReducer from './slices/heritageSlice';
import artifactReducer from './slices/artifactSlice';
import uiReducer from './slices/uiSlice';
import categoryReducer from './slices/categorySlice';
import reviewReducer from './slices/reviewSlice';
import collectionReducer from './slices/collectionSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    heritage: heritageReducer,
    artifact: artifactReducer,
    ui: uiReducer,
    category: categoryReducer,
    review: reviewReducer,
    collection: collectionReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
});

export default store;