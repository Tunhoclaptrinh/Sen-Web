import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { collectionAPI } from '@api';

const initialState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCollections = createAsyncThunk(
  'collection/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.getAll();
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCollection = createAsyncThunk(
  'collection/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await collectionAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  'collection/delete',
  async (id, { rejectWithValue }) => {
    try {
      await collectionAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleArtifactInCollection = createAsyncThunk(
  'collection/toggleArtifact',
  async ({ collectionId, artifactId, isAdding }, { rejectWithValue, dispatch }) => {
    try {
      let response;
      if (isAdding) {
        response = await collectionAPI.addArtifact(collectionId, artifactId);
      } else {
        response = await collectionAPI.removeArtifact(collectionId, artifactId);
      }
      // Re-fetch collections or update item directly for real-time UI update
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);


const collectionSlice = createSlice({
  name: 'collection',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCollections.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollections.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchCollections.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải bộ sưu tập';
      })
      // Create
      .addCase(createCollection.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Delete
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Toggle Artifact (Update item in state)
      .addCase(toggleArtifactInCollection.fulfilled, (state, action) => {
        const updatedCollection = action.payload;
        const index = state.items.findIndex(item => item.id === updatedCollection.id);
        if (index !== -1) {
          state.items[index] = updatedCollection;
        }
        if (state.currentItem?.id === updatedCollection.id) {
          state.currentItem = updatedCollection;
        }
      });
  },
});

export const { clearError, clearCurrentItem } = collectionSlice.actions;
export default collectionSlice.reducer;