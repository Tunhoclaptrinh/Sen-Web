import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import heritageReducer from "./slices/heritageSlice";
import artifactReducer from "./slices/artifactSlice";
import categoryReducer from "./slices/categorySlice";
import reviewReducer from "./slices/reviewSlice";
import collectionReducer from "./slices/collectionSlice";
import uiReducer from "./slices/uiSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    heritage: heritageReducer,
    artifact: artifactReducer,
    category: categoryReducer,
    review: reviewReducer,
    collection: collectionReducer,
    ui: uiReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST"],
      },
    }),
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
