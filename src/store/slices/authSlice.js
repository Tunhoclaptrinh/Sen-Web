// src/store/slices/authSlice.js - ENHANCED VERSION
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { STORAGE_KEYS } from '../../config/constants';

const getTokenFromStorage = () => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Failed to get token from storage', error);
    return null;
  }
};

const getUserFromStorage = () => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user from storage', error);
    return null;
  }
};

const saveAuthToStorage = (token, user) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  } catch (error) {
    console.error('Failed to save auth to storage', error);
  }
};

const clearAuthFromStorage = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER);
  } catch (error) {
    console.error('Failed to clear auth from storage', error);
  }
};


// INITIAL STATE
const initialState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  loading: false,
  error: null,
  isInitialized: false, // Track if auth check is complete
};

// ASYNC THUNKS

/**
 * Login User
 */
export const login = createAsyncThunk(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Đăng nhập thất bại');
      }

      const { user, token } = response.data;

      // Validate response data
      if (!user || !token) {
        return rejectWithValue('Dữ liệu phản hồi không hợp lệ');
      }

      saveAuthToStorage(token, user);
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || 'Đăng nhập thất bại';
      return rejectWithValue(message);
    }
  }
);

/**
 * Register New User
 */
export const register = createAsyncThunk(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Đăng ký thất bại');
      }

      const { user, token } = response.data;

      if (!user || !token) {
        return rejectWithValue('Dữ liệu phản hồi không hợp lệ');
      }

      saveAuthToStorage(token, user);
      return { user, token };
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || 'Đăng ký thất bại';
      return rejectWithValue(message);
    }
  }
);

/**
 * Get Current User Info
 */
export const getMe = createAsyncThunk(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();

      if (!response.data.success) {
        return rejectWithValue(response.data.message || 'Lỗi khi tải thông tin người dùng');
      }

      return response.data;
    } catch (error) {
      const message = error.response?.data?.message
        || error.message
        || 'Lỗi khi tải thông tin người dùng';
      return rejectWithValue(message);
    }
  }
);

/**
 * Logout User
 */
export const logout = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      // Call logout API (best effort - don't fail if it errors)
      await authService.logout().catch(console.error);

      // Always clear local storage regardless of API result
      clearAuthFromStorage();

      return true;
    } catch (error) {
      // Even if there's an error, we should clear local state
      clearAuthFromStorage();
      return true;
    }
  }
);

/**
 * Initialize Auth (Check if user is logged in on app start)
 */
export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async (_, { rejectWithValue }) => {
    const token = getTokenFromStorage();

    if (!token) {
      return { isAuthenticated: false };
    }

    try {
      // Verify token by fetching user info
      const response = await authService.getMe();

      if (!response.data.success) {
        clearAuthFromStorage();
        return { isAuthenticated: false };
      }

      return {
        isAuthenticated: true,
        user: response.data,
        token,
      };
    } catch (error) {
      // Token is invalid or expired
      clearAuthFromStorage();
      return { isAuthenticated: false };
    }
  }
);

// SLICE
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },

    // Force logout (used by axios interceptor on 401)
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthFromStorage();
    },

    // Update user info locally
    updateUserInfo: (state, action) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
        } catch (error) {
          console.error('Failed to update user in storage', error);
        }
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Initialize Auth
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;

        if (action.payload.isAuthenticated) {
          state.isAuthenticated = true;
          state.user = action.payload.user;
          state.token = action.payload.token;
        } else {
          state.isAuthenticated = false;
          state.user = null;
          state.token = null;
        }
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
      })

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
        state.error = null;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.user = null;
        state.token = null;
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
        state.error = null;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      // Get Me
      .addCase(getMe.pending, (state) => {
        state.loading = true;
      })
      .addCase(getMe.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;

        // Update user in storage
        try {
          localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
        } catch (error) {
          console.error('Failed to update user in storage', error);
        }
      })
      .addCase(getMe.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;

        // If getMe fails, user might be logged out
        // Don't force logout here - let axios interceptor handle it
      })

      // Logout
      .addCase(logout.pending, (state) => {
        state.loading = true;
      })
      .addCase(logout.fulfilled, (state) => {
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      })
      .addCase(logout.rejected, (state) => {
        // Even if logout API fails, clear local state
        state.loading = false;
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
        state.error = null;
      });
  },
});

export const { clearError, forceLogout, updateUserInfo } = authSlice.actions;
export default authSlice.reducer;