import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { categoryAPI } from '@api';

export const fetchCategories = createAsyncThunk(
  'category/fetchAll',
  async (params, { rejectWithValue }) => {
    try {
      const response = await categoryAPI.getAll(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data || error.message);
    }
  }
);
