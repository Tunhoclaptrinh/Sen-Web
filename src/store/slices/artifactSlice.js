import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { artifactService } from '@services';

const initialState = {
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
  async (params, { rejectWithValue }) => {
    try {
      const response = await artifactService.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchArtifactById = createAsyncThunk(
  'artifact/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await artifactService.getById(id);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchArtifacts = createAsyncThunk(
  'artifact/search',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await artifactService.search(query, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createArtifact = createAsyncThunk(
  'artifact/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await artifactService.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateArtifact = createAsyncThunk(
  'artifact/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await artifactService.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteArtifact = createAsyncThunk(
  'artifact/delete',
  async (id, { rejectWithValue }) => {
    try {
      await artifactService.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const artifactSlice = createSlice({
  name: 'artifact',
  initialState,
  reducers: {
    setFilters: (state, action) => {
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
        state.items = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchArtifacts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải dữ liệu';
      })
      .addCase(fetchArtifactById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArtifactById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchArtifactById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải chi tiết';
      })
      .addCase(createArtifact.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateArtifact.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
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