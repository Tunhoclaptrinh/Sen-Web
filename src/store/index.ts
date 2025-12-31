import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/authSlice";
import heritageReducer from "./slices/heritageSlice";
import artifactReducer from "./slices/artifactSlice";
import uiReducer from "./slices/uiSlice";
import collectionReducer from "./slices/collectionSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    heritage: heritageReducer,
    artifact: artifactReducer,
    ui: uiReducer,
    collection: collectionReducer,
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
