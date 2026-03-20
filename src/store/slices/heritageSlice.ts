import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import heritageService from '../../services/heritage.service';
import type { HeritageSite, HeritageSearchParams, QueryParams } from '@/types';

interface HeritageState {
  items: HeritageSite[];
  currentItem: HeritageSite | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters: HeritageSearchParams;
}

const initialState: HeritageState = {
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
  async (params: QueryParams | undefined, { rejectWithValue }) => {
    try {
      const response = await heritageService.getAll(params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchHeritageSiteById = createAsyncThunk(
  'heritage/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await heritageService.getById(id);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const searchHeritageSites = createAsyncThunk(
  'heritage/search',
  async ({ query, params }: { query: string; params: QueryParams }, { rejectWithValue }) => {
    try {
      const response = await heritageService.search(query, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchNearbyHeritageSites = createAsyncThunk(
  'heritage/fetchNearby',
  async ({ latitude, longitude, radius, params }: { latitude: number; longitude: number; radius: number; params?: QueryParams }, { rejectWithValue }) => {
    try {
      const response = await heritageService.getNearby(latitude, longitude, radius, params);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createHeritageSite = createAsyncThunk(
  'heritage/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await heritageService.create(data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateHeritageSite = createAsyncThunk(
  'heritage/update',
  async ({ id, data }: { id: number | string; data: any }, { rejectWithValue }) => {
    try {
      const response = await heritageService.update(id, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteHeritageSite = createAsyncThunk(
  'heritage/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await heritageService.delete(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const heritageSlice = createSlice({
  name: 'heritage',
  initialState,
  reducers: {
    setFilters: (state, action: PayloadAction<HeritageSearchParams>) => {
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
        state.items = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 10,
            total: action.payload.pagination.total || 0,
            totalPages: action.payload.pagination.totalPages || 0,
          };
        }
      })
      .addCase(fetchHeritageSites.rejected, (state, action: any) => {
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
        state.currentItem = action.payload || null;
      })
      .addCase(fetchHeritageSiteById.rejected, (state, action: any) => {
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
        state.items = action.payload.data || [];
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 10,
            total: action.payload.pagination.total || 0,
            totalPages: action.payload.pagination.totalPages || 0,
          };
        }
      })
      .addCase(searchHeritageSites.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tìm kiếm';
      })
      // Create
      .addCase(createHeritageSite.fulfilled, (state, action) => {
        if (action.payload) {
          state.items.unshift(action.payload);
        }
      })
      // Update
      .addCase(updateHeritageSite.fulfilled, (state, action) => {
        if (!action.payload) return;
        const index = state.items.findIndex(item => item.id === action.payload!.id);
        if (index !== -1) {
          state.items[index] = action.payload!;
        }
        if (state.currentItem?.id === action.payload!.id) {
          state.currentItem = action.payload!;
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
