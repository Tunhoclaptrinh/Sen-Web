import BaseService from './base.service';
import apiClient from '@/config/axios.config';
import type {
  User,

  UserUpdateDTO,
  UserActivity,
  UserStats,
  BaseApiResponse,
  QueryParams,
  ChangePasswordData,
} from '@/types';
import { logger } from '@/utils/logger.utils';

/**
 * User Service
 * Handles all operations related to Users
 */
class UserService extends BaseService<User, Partial<User>, UserUpdateDTO> {
  constructor() {
    super('/users');
  }

  /**
   * Update user profile
   */
  async updateProfile(data: UserUpdateDTO): Promise<BaseApiResponse<User>> {
    try {
      const response = await apiClient.put<BaseApiResponse<User>>(
        '/users/profile',
        data
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? 'Cập nhật thành công',
      };
    } catch (error) {
      logger.error('[User] updateProfile error:', error);
      throw error;
    }
  }

  /**
   * Change password
   */
  async changePassword(data: ChangePasswordData): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.put<BaseApiResponse<void>>(
        '/auth/change-password',
        data
      );

      return {
        success: response.success ?? true,
        message: response.message ?? 'Đổi mật khẩu thành công',
      };
    } catch (error) {
      logger.error('[User] changePassword error:', error);
      throw error;
    }
  }

  /**
   * Get user activity
   */
  async getActivity(id: number | string): Promise<BaseApiResponse<UserActivity>> {
    try {
      const response = await apiClient.get<BaseApiResponse<UserActivity>>(
        `${this.endpoint}/${id}/activity`
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message,
      };
    } catch (error) {
      logger.error('[User] getActivity error:', error);
      throw error;
    }
  }

  /**
   * Toggle user status (active/inactive)
   */
  async toggleStatus(id: number | string): Promise<BaseApiResponse<User>> {
    try {
      const response = await apiClient.patch<BaseApiResponse<User>>(
        `${this.endpoint}/${id}/status`
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? 'Đã cập nhật trạng thái',
      };
    } catch (error) {
      logger.error('[User] toggleStatus error:', error);
      throw error;
    }
  }

  /**
   * Get user statistics (admin only)
   */
  async getStats(): Promise<BaseApiResponse<UserStats>> {
    try {
      const response = await apiClient.get<BaseApiResponse<UserStats>>(
        `${this.endpoint}/stats/summary`
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message,
      };
    } catch (error) {
      logger.error('[User] getStats error:', error);
      throw error;
    }
  }

  /**
   * Delete user permanently (admin only)
   */
  async deletePermanent(id: number | string): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<void>>(
        `${this.endpoint}/${id}/permanent`
      );

      return {
        success: response.success ?? true,
        message: response.message ?? 'Đã xóa vĩnh viễn',
      };
    } catch (error) {
      logger.error('[User] deletePermanent error:', error);
      throw error;
    }
  }

  /**
   * Export users (admin only)
   */
  async export(params: QueryParams = {}): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.endpoint}/export`, {
        params,
        responseType: 'blob',
      });

      return response as unknown as Blob;
    } catch (error) {
      logger.error('[User] export error:', error);
      throw error;
    }
  }

  /**
   * Download user import template (admin only)
   */
  async downloadTemplate(): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.endpoint}/template`, {
        responseType: 'blob',
      });

      return response as unknown as Blob;
    } catch (error) {
      logger.error('[User] downloadTemplate error:', error);
      throw error;
    }
  }

  /**
   * Import users (admin only)
   */
  async import(file: File): Promise<BaseApiResponse<any>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<BaseApiResponse<any>>(
        `${this.endpoint}/import`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? 'Import thành công',
      };
    } catch (error) {
      logger.error('[User] import error:', error);
      throw error;
    }
  }

  /**
   * Get users by role
   */
  async getByRole(role: string, params: QueryParams = {}): Promise<BaseApiResponse<User[]>> {
    return this.getAll({
      role,
      ...params,
    });
  }

  /**
   * Get active users
   */
  async getActive(params: QueryParams = {}): Promise<BaseApiResponse<User[]>> {
    return this.getAll({
      isActive: true,
      ...params,
    });
  }

  /**
   * Upload avatar
   */
  async uploadAvatar(file: File): Promise<BaseApiResponse<{ url: string }>> {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await apiClient.post<BaseApiResponse<{ url: string }>>(
        '/upload/avatar',
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? 'Upload thành công',
      };
    } catch (error) {
      logger.error('[User] uploadAvatar error:', error);
      throw error;
    }
  }

  /**
   * Search users by name or email
   */
  async searchUsers(query: string, params: QueryParams = {}): Promise<BaseApiResponse<User[]>> {
    return this.search(query, params);
  }

  /**
   * Get user by email
   */
  async getByEmail(email: string): Promise<BaseApiResponse<User>> {
    try {
      const response = await this.getAll({ email, _limit: 1 });
      const user = response.data?.[0];

      if (!user) {
        throw new Error('User not found');
      }

      return {
        success: true,
        data: user,
      };
    } catch (error) {
      logger.error('[User] getByEmail error:', error);
      throw error;
    }
  }
}

export default new UserService();