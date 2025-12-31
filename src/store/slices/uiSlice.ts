import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Notification {
  id: number;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  [key: string]: any;
}

interface UiState {
  sidebarCollapsed: boolean;
  theme: string;
  loading: boolean;
  notifications: Notification[];
}

const initialState: UiState = {
  sidebarCollapsed: false,
  theme: localStorage.getItem('theme') || 'light',
  loading: false,
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
    },
    setSidebarCollapsed: (state, action: PayloadAction<boolean>) => {
      state.sidebarCollapsed = action.payload;
    },
    setTheme: (state, action: PayloadAction<string>) => {
      state.theme = action.payload;
      localStorage.setItem('theme', action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    addNotification: (state, action: PayloadAction<Omit<Notification, 'id'>>) => {
      const payload: Omit<Notification, 'id'> = action.payload;
      const notification = {
        id: Date.now(),
        ...payload,
      } as Notification;
      state.notifications.push(notification);
    },
    removeNotification: (state, action: PayloadAction<number>) => {
      state.notifications = state.notifications.filter(
        (n) => n.id !== action.payload
      );
    },
  },
});

export const {
  toggleSidebar,
  setSidebarCollapsed,
  setTheme,
  setLoading,
  addNotification,
  removeNotification,
} = uiSlice.actions;

export default uiSlice.reducer;