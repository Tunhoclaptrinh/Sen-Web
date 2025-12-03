// ============================================
// src/contexts/AuthContext.jsx - Authentication Context
// ============================================
import React, { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/auth.service';
import { message } from 'antd';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);

  // Check authentication on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = authService.getToken();

    if (token) {
      try {
        const response = await authService.getMe();
        setUser(response.data);
      } catch (error) {
        console.error('Auth check failed:', error);
        // Clear invalid token
        authService.logout();
      }
    }

    setLoading(false);
    setInitialized(true);
  };

  /**
   * Login user
   */
  const login = async (credentials) => {
    try {
      const response = await authService.login(credentials);
      setUser(response.data.user);
      message.success('Đăng nhập thành công!');
      return response;
    } catch (error) {
      message.error(error.message || 'Đăng nhập thất bại');
      throw error;
    }
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      setUser(response.data.user);
      message.success('Đăng ký thành công!');
      return response;
    } catch (error) {
      message.error(error.message || 'Đăng ký thất bại');
      throw error;
    }
  };

  /**
   * Logout user
   */
  const logout = async () => {
    try {
      await authService.logout();
      setUser(null);
      message.success('Đã đăng xuất');
    } catch (error) {
      console.error('Logout error:', error);
      // Still clear user even if API call fails
      setUser(null);
    }
  };

  /**
   * Update user info
   */
  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  /**
   * Check if user is authenticated
   */
  const isAuthenticated = () => {
    return !!user;
  };

  /**
   * Check if user has specific role
   */
  const hasRole = (role) => {
    return user?.role === role;
  };

  const value = {
    user,
    loading,
    initialized,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated,
    hasRole,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
