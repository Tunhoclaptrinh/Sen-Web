import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import heritageAPI from '@api/heritage.api';

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
export const fetchHeritageSites = createAsyncThunk(
  'heritage/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await heritageAPI.getAll(params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchHeritageSiteById = createAsyncThunk(
  'heritage/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await heritageAPI.getById(id, { _embed: 'artifacts,reviews' });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchHeritageSites = createAsyncThunk(
  'heritage/search',
  async ({ query, params }, { rejectWithValue }) => {
    try {
      const response = await heritageAPI.search(query, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNearbyHeritageSites = createAsyncThunk(
  'heritage/fetchNearby',
  async ({ latitude, longitude, radius, params }, { rejectWithValue }) => {
    try {
      const response = await heritageAPI.getNearby(latitude, longitude, radius, params);
      return response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createHeritageSite = createAsyncThunk(
  'heritage/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await heritageAPI.create(data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateHeritageSite = createAsyncThunk(
  'heritage/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await heritageAPI.update(id, data);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteHeritageSite = createAsyncThunk(
  'heritage/delete',
  async (id, { rejectWithValue }) => {
    try {
      await heritageAPI.delete(id);
      return id;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const heritageSlice = createSlice({
  name: 'heritage',
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
      // Fetch all
      .addCase(fetchHeritageSites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeritageSites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchHeritageSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải dữ liệu';
      })
      // Fetch by ID
      .addCase(fetchHeritageSiteById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHeritageSiteById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentItem = action.payload;
      })
      .addCase(fetchHeritageSiteById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải chi tiết';
      })
      // Search
      .addCase(searchHeritageSites.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchHeritageSites.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(searchHeritageSites.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tìm kiếm';
      })
      // Create
      .addCase(createHeritageSite.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateHeritageSite.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
        }
      })
      // Delete
      .addCase(deleteHeritageSite.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const { setFilters, clearFilters, clearCurrentItem, clearError } = heritageSlice.actions;
export default heritageSlice.reducer;
