import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { artifactService } from '../../services';
import type { Artifact, ArtifactSearchParams, QueryParams } from '@/types';

interface ArtifactState {
  items: Artifact[];
  currentItem: Artifact | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: ArtifactSearchParams;
}

const initialState: ArtifactState = {
  items: [],
  currentItem: null,
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  },
  filters: {},
};

// Async thunks
export const fetchArtifacts = createAsyncThunk(
  'artifact/fetchAll',
  async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
      const response = await artifactService.getAll(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchArtifactById = createAsyncThunk(
  'artifact/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await artifactService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchArtifacts = createAsyncThunk(
  'artifact/search',
  async ({ query, params }: { query: string; params: QueryParams }, { rejectWithValue }) => {
    try {
      const response = await artifactService.search(query, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createArtifact = createAsyncThunk(
  'artifact/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await artifactService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateArtifact = createAsyncThunk(
  'artifact/update',
  async ({ id, data }: { id: number | string; data: any }, { rejectWithValue }) => {
    try {
      const response = await artifactService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteArtifact = createAsyncThunk(
  'artifact/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await artifactService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const artifactSlice = createSlice({
  name: 'artifact',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<ArtifactSearchParams>) => {
      state.filters = action.payload;
    },
    clearFilters: (state) => {
      state.filters = {};
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchArtifacts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtifacts.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 10,
            total: action.payload.pagination.total || 0,
            totalPages: action.payload.pagination.totalPages || 0
          };
        }
      })
      .addCase(fetchArtifacts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải dữ liệu';
      })
      .addCase(fetchArtifactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtifactById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload || null;
      })
      .addCase(fetchArtifactById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải chi tiết';
      })
      .addCase(createArtifact.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      .addCase(updateArtifact.fulfilled, (state, action) => {
        if (!action.payload) return;
        const index = state.items.findIndex(item => item.id === action.payload!.id);
        if (index !== -1) {
          state.items[index] = action.payload!;
        }
        if (state.currentItem?.id === action.payload!.id) {
          state.currentItem = action.payload!;
        }
      })
      .addCase(deleteArtifact.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const { setFilters, clearFilters, clearCurrentItem, clearError } = artifactSlice.actions;
export default artifactSlice.reducer;