import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import apiClient from '@/config/axios.config';
import type { Review, QueryParams } from '@/types';

interface ReviewState {
  items: Review[];
  currentItem: Review | null;
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const initialState: ReviewState = {
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
};

// Async Thunks
export const fetchReviews = createAsyncThunk(
  'review/fetchAll',
  async (params: QueryParams, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const url = queryString ? `/reviews?${queryString}` : '/reviews';
      const response = await apiClient.get<any, { data: Review[]; pagination: any; metadata: any }>(url);

      return {
        data: response.data || [],
        pagination: response.pagination || response.metadata,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  'review/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any, { data: Review }>(`/reviews/${id}`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReviewsByItem = createAsyncThunk(
  'review/fetchByItem',
  async ({ type, id, params = {} }: { type: string; id: number | string; params?: QueryParams }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params as any).toString();
      const url = queryString
        ? `/reviews/${type}/${id}?${queryString}`
        : `/reviews/${type}/${id}`;

      const response = await apiClient.get<any, { data: Review[]; pagination: any; metadata: any }>(url);

      return {
        data: response.data || [],
        pagination: response.pagination || response.metadata,
      };
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'review/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any, { data: Review }>('/reviews', data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/update',
  async ({ id, data }: { id: number | string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<any, { data: Review }>(`/reviews/${id}`, data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/reviews/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const reviewSlice = createSlice({
  name: 'review',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentItem: (state) => {
      state.currentItem = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchReviews.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviews.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 10,
            total: action.payload.pagination.total || 0,
            totalPages: action.payload.pagination.totalPages || 0
          };
        }
      })
      .addCase(fetchReviews.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải đánh giá';
      })
      // Fetch By ID
      .addCase(fetchReviewById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewById.fulfilled, (state, action) => {
        state.loading = false;
        const payload = action.payload as any;
        state.currentItem = payload.data || payload;
      })
      .addCase(fetchReviewById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải chi tiết';
      })
      // Fetch By Item
      .addCase(fetchReviewsByItem.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReviewsByItem.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        if (action.payload.pagination) {
          state.pagination = {
            page: action.payload.pagination.page || 1,
            limit: action.payload.pagination.limit || 10,
            total: action.payload.pagination.total || 0,
            totalPages: action.payload.pagination.totalPages || 0
          };
        }
      })
      .addCase(fetchReviewsByItem.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải đánh giá';
      })
      // Create
      .addCase(createReview.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const item = payload.data || payload;
        if (item) state.items.unshift(item);
      })
      // Update
      .addCase(updateReview.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const item = payload.data || payload;
        if (!item) return;

        const index = state.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
          state.items[index] = item;
        }
        if (state.currentItem?.id === item.id) {
          state.currentItem = item;
        }
      })
      // Delete
      .addCase(deleteReview.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
        if (state.currentItem?.id === action.payload) {
          state.currentItem = null;
        }
      });
  },
});

export const { clearError, clearCurrentItem } = reviewSlice.actions;
export default reviewSlice.reducer;