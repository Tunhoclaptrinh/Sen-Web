export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
  createdAt?: string;
  created_at?: string;
  updated_at?: string;
  lastLogin?: string;
  address?: string;
  bio?: string;
}

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
  RESEARCHER = "researcher",
  CURATOR = "curator",
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  isInitialized: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  address?: string;
}

export interface ChangePasswordData {
  id?: number | string;
  currentPassword: string;
  newPassword: string;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}
