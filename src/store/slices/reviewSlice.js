import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/config/axios.config';

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
};

// Async Thunks
export const fetchReviews = createAsyncThunk(
  'review/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString ? `/reviews?${queryString}` : '/reviews';
      const response = await apiClient.get(url);

      return {
        data: response.data || [],
        pagination: response.pagination || response.metadata,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReviewById = createAsyncThunk(
  'review/fetchById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await apiClient.get(`/reviews/${id}`);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchReviewsByItem = createAsyncThunk(
  'review/fetchByItem',
  async ({ type, id, params = {} }, { rejectWithValue }) => {
    try {
      const queryString = new URLSearchParams(params).toString();
      const url = queryString
        ? `/reviews/${type}/${id}?${queryString}`
        : `/reviews/${type}/${id}`;

      const response = await apiClient.get(url);

      return {
        data: response.data || [],
        pagination: response.pagination || response.metadata,
      };
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createReview = createAsyncThunk(
  'review/create',
  async (data, { rejectWithValue }) => {
    try {
      const response = await apiClient.post('/reviews', data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateReview = createAsyncThunk(
  'review/update',
  async ({ id, data }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put(`/reviews/${id}`, data);
      return response.data || response;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteReview = createAsyncThunk(
  'review/delete',
  async (id, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/reviews/${id}`);
      return id;
    } catch (error) {
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
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchReviews.rejected, (state, action) => {
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
        state.currentItem = action.payload;
      })
      .addCase(fetchReviewById.rejected, (state, action) => {
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
        state.pagination = action.payload.pagination || state.pagination;
      })
      .addCase(fetchReviewsByItem.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải đánh giá';
      })
      // Create
      .addCase(createReview.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      // Update
      .addCase(updateReview.fulfilled, (state, action) => {
        const index = state.items.findIndex(item => item.id === action.payload.id);
        if (index !== -1) {
          state.items[index] = action.payload;
        }
        if (state.currentItem?.id === action.payload.id) {
          state.currentItem = action.payload;
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