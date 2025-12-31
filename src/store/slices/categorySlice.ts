import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import apiClient from '@/config/axios.config';
import type { Category } from '@/types';

interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
};

// Async Thunks
export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any, { data: Category[] }>('/categories');
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const fetchCategoryById = createAsyncThunk(
  'category/fetchById',
  async (id: number | string, { rejectWithValue }) => {
    try {
      const response = await apiClient.get<any, { data: Category }>(`/categories/${id}`);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const createCategory = createAsyncThunk(
  'category/create',
  async (data: any, { rejectWithValue }) => {
    try {
      const response = await apiClient.post<any, { data: Category }>('/categories', data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const updateCategory = createAsyncThunk(
  'category/update',
  async ({ id, data }: { id: number | string; data: any }, { rejectWithValue }) => {
    try {
      const response = await apiClient.put<any, { data: Category }>(`/categories/${id}`, data);
      return response.data || response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

export const deleteCategory = createAsyncThunk(
  'category/delete',
  async (id: number | string, { rejectWithValue }) => {
    try {
      await apiClient.delete(`/categories/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch All
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        // Handle if response is array or object with data property
        const payload = action.payload as any;
        state.items = Array.isArray(payload) ? payload : (payload.data || []);
      })
      .addCase(fetchCategories.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload?.message || 'Lỗi khi tải danh mục';
      })
      // Create
      .addCase(createCategory.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const item = payload.data || payload;
        if (item) state.items.unshift(item);
      })
      // Update
      .addCase(updateCategory.fulfilled, (state, action) => {
        const payload = action.payload as any;
        const item = payload.data || payload;
        if (!item) return;
        const index = state.items.findIndex(i => i.id === item.id);
        if (index !== -1) {
          state.items[index] = item;
        }
      })
      // Delete
      .addCase(deleteCategory.fulfilled, (state, action) => {
        state.items = state.items.filter(item => item.id !== action.payload);
      });
  },
});

export const { clearError } = categorySlice.actions;
export default categorySlice.reducer;