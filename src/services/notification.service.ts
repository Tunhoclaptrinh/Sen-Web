
import BaseService from './base.service';
import type { Notification, NotificationPreferences } from '@/types/notification.types';

class NotificationService extends BaseService {
  constructor() {
    super('/notifications');
  }

  async getNotifications(page: number = 1, limit: number = 20, filter: Record<string, any> = {}): Promise<{ items: Notification[]; total: number; unreadCount: number }> {
    const params = { page, limit, ...filter };
    const response = await this.get<any>('/', params);

    // response is the backend body: { success, data, unreadCount, pagination: { total, ... } }
    return {
      items: response.data || [],
      total: response.pagination?.total || response.data?.length || 0,
      unreadCount: response.unreadCount || 0
    };
  }

  async markAsRead(id: number): Promise<boolean> {
    const response = await this.patchRequest(`/${id}/read`, {});
    return response.success ?? true;
  }

  async markAllAsRead(): Promise<boolean> {
    const response = await this.patchRequest('/read-all', {});
    return response.success ?? true;
  }

  async deleteNotification(id: number): Promise<boolean> {
    const response = await this.deleteRequest(`/${id}`);
    return response.success ?? true;
  }

  async deleteAllNotifications(): Promise<boolean> {
    const response = await this.deleteRequest('/');
    return response.success ?? true;
  }

  async getPreferences(): Promise<NotificationPreferences> {
    const response = await this.get('/preferences');
    return response.data;
  }

  async updatePreferences(data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const response = await this.put('/preferences', data);
    return response.data;
  }
}

export const notificationService = new NotificationService();
export default notificationService;
