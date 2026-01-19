import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import collectionService from '../../services/collection.service';
import type { Collection } from '@/types';

interface CollectionState {
  items: Collection[];
  currentItem: Collection | null;
  loading: boolean;
  error: string | null;
}

const initialState: CollectionState = {
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
      const response = await collectionService.getAll();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCollection = createAsyncThunk(
  'collection/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await collectionService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCollection = createAsyncThunk(
  'collection/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await collectionService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const toggleArtifactInCollection = createAsyncThunk(
  'collection/toggleArtifact',
  async ({ collectionId, artifactId, isAdding }: { collectionId: number | string; artifactId: number | string; isAdding: boolean }, { rejectWithValue }) => {
    try {
      let response;
      if (isAdding) {
        response = await collectionService.addItem(collectionId, { id: artifactId, type: 'artifact' });
      } else {
        response = await collectionService.removeItem(collectionId, artifactId, 'artifact');
      }
      return response.data;
    } catch (error: any) {
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
        state.items = action.payload || [];
      })
      .addCase(fetchCollections.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải bộ sưu tập';
      })
      // Create
      .addCase(createCollection.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      // Delete
      .addCase(deleteCollection.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      })
      // Toggle Artifact (Update item in state)
      .addCase(toggleArtifactInCollection.fulfilled, (state, action) => {
        const updatedCollection = action.payload;
        if (!updatedCollection) return;

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