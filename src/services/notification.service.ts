import BaseService from './base.service';
import type { BaseApiResponse } from '@/types';
import type { Notification, NotificationPreferences } from '@/types/notification.types';

class NotificationService extends BaseService<Notification> {
  constructor() {
    super('/notifications');
  }

  /**
   * Get all notifications for current user
   */
  async getNotifications(params?: {
    is_read?: boolean;
    type?: string;
    limit?: number;
  }): Promise<BaseApiResponse<Notification[]>> {
    const response = await this.get('/', params);
    return response;
  }

  /**
   * Get unread notifications count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.get<{ count: number }>('/unread/count');
    return response.count || 0;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: number): Promise<BaseApiResponse<Notification>> {
    const response = await this.patchRequest<BaseApiResponse<Notification>>(`/${id}/read`);
    return response;
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<BaseApiResponse<void>> {
    const response = await this.post<BaseApiResponse<void>>('/read-all');
    return response;
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<BaseApiResponse<void>> {
    return this.delete(id);
  }

  /**
   * Delete all read notifications
   */
  async deleteAllRead(): Promise<BaseApiResponse<void>> {
    const response = await this.deleteRequest<BaseApiResponse<void>>('/read');
    return response;
  }

  /**
   * Get notification preferences
   */
  async getPreferences(): Promise<BaseApiResponse<NotificationPreferences>> {
    const response = await this.get<BaseApiResponse<NotificationPreferences>>('/preferences');
    return response;
  }

  /**
   * Update notification preferences
   */
  async updatePreferences(preferences: Partial<NotificationPreferences>): Promise<BaseApiResponse<NotificationPreferences>> {
    const response = await this.put<BaseApiResponse<NotificationPreferences>>('/preferences', preferences);
    return response;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
