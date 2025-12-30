import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { STORAGE_KEYS } from '../../config/constants';

// Get initial state from localStorage safely
const getTokenFromStorage = () => localStorage.getItem(STORAGE_KEYS.TOKEN);
const getUserFromStorage = () => {
  const userStr = localStorage.getItem(STORAGE_KEYS.USER);
  try {
    return userStr ? JSON.parse(userStr) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    return null;
  }
};

const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  loading: false,
  error: null,
};

// Async thunks
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // API returns: { success: true, message: "...", data: { user, token } }
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (response.success) {
        return response.data;
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message || 'Đăng ký thất bại');
    }
  }
);

export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      if (response.success) {
        return response.data; // Usually returns user object
      } else {
        return rejectWithValue(response.message);
      }
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authService.logout();
      return true;
    } catch (error) {
      // Even if API fails, we should clear local state
      console.error('Logout error:', error);
      return true;
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    // Force logout (used when token expires handled by interceptor)
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem(STORAGE_KEYS.TOKEN);
      localStorage.removeItem(STORAGE_KEYS.USER);
    }
  },
  extraReducers: (builder) => {
    builder
      // Login
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Register
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload.user;
        state.token = action.payload.token;

        // Save to localStorage
        localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload.token);
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload.user));
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Me
      .addCase(getMe.fulfilled, (state, action) => {
        // Update user info if changed
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      })

      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        localStorage.removeItem(STORAGE_KEYS.TOKEN);
        localStorage.removeItem(STORAGE_KEYS.USER);
      });
  },
});

export const { clearError, forceLogout } = authSlice.actions;
export default authSlice.reducer;