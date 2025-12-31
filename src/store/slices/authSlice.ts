import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authService } from '../../services';
import { STORAGE_KEYS } from '../../config/constants';
import type { User, LoginCredentials, RegisterData } from '../../types';

// Định nghĩa State Interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

// Helpers
const getTokenFromStorage = (): string | null => {
  try {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  } catch (error) {
    console.error('Failed to get token from storage', error);
    return null;
  }
};

const getUserFromStorage = (): User | null => {
  try {
    const userStr = localStorage.getItem(STORAGE_KEYS.USER);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Failed to parse user from storage', error);
    return null;
  }
};

const saveAuthToStorage = (token: string, user: User) => {
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
const initialState: AuthState = {
  user: getUserFromStorage(),
  token: getTokenFromStorage(),
  isAuthenticated: !!getTokenFromStorage(),
  loading: false,
  error: null,
  isInitialized: false,
};

// ASYNC THUNKS

export const login = createAsyncThunk<
  { user: User; token: string },
  LoginCredentials,
  { rejectValue: string }
>(
  'auth/login',
  async (credentials, { rejectWithValue }) => {
    try {
      const response = await authService.login(credentials);
      // authService.login đã throw error nếu !success, nhưng check lại cho chắc
      if (!response.success) {
        return rejectWithValue(response.message || 'Đăng nhập thất bại');
      }

      const { user, token } = response.data;
      saveAuthToStorage(token, user);
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng nhập thất bại');
    }
  }
);

export const register = createAsyncThunk<
  { user: User; token: string },
  RegisterData,
  { rejectValue: string }
>(
  'auth/register',
  async (userData, { rejectWithValue }) => {
    try {
      const response = await authService.register(userData);
      if (!response.success) {
        return rejectWithValue(response.message || 'Đăng ký thất bại');
      }

      const { user, token } = response.data;
      saveAuthToStorage(token, user);
      return { user, token };
    } catch (error: any) {
      return rejectWithValue(error.message || 'Đăng ký thất bại');
    }
  }
);

export const getMe = createAsyncThunk<
  User,
  void,
  { rejectValue: string }
>(
  'auth/getMe',
  async (_, { rejectWithValue }) => {
    try {
      const response = await authService.getMe();
      if (!response.success || !response.data) {
        return rejectWithValue(response.message || 'Lỗi khi tải thông tin người dùng');
      }
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message || 'Lỗi khi tải thông tin người dùng');
    }
  }
);

export const logout = createAsyncThunk(
  'auth/logout',
  async () => {
    try {
      await authService.logout();
    } catch (error) {
      console.error('Logout error', error);
    } finally {
      clearAuthFromStorage();
    }
    return true;
  }
);

export const initializeAuth = createAsyncThunk(
  'auth/initialize',
  async () => {
    const token = getTokenFromStorage();
    if (!token) {
      return { isAuthenticated: false, user: null, token: null };
    }

    try {
      const response = await authService.getMe();
      if (response.success && response.data) {
        return {
          isAuthenticated: true,
          user: response.data,
          token,
        };
      }
    } catch (error) {
      // Token expired or invalid
    }

    clearAuthFromStorage();
    return { isAuthenticated: false, user: null, token: null };
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
    forceLogout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      clearAuthFromStorage();
    },
    updateUserInfo: (state, action: PayloadAction<Partial<User>>) => {
      if (state.user) {
        state.user = { ...state.user, ...action.payload };
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(state.user));
      }
    },
    // Action này được gọi từ axios interceptor khi refresh token thành công
    refreshTokenSuccess: (state, action: PayloadAction<string>) => {
      state.token = action.payload;
      localStorage.setItem(STORAGE_KEYS.TOKEN, action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.isInitialized = false;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isInitialized = true;
        state.isAuthenticated = action.payload.isAuthenticated;
        state.user = action.payload.user;
        state.token = action.payload.token;
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
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.error = action.payload || 'Đăng nhập thất bại';
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
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload || 'Đăng ký thất bại';
      })
      // GetMe
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload;
        localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(action.payload));
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isAuthenticated = false;
      });
  },
});

export const { clearError, forceLogout, updateUserInfo, refreshTokenSuccess } = authSlice.actions;
export default authSlice.reducer;