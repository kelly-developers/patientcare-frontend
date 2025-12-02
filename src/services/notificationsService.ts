import { apiClient, API_ENDPOINTS } from '@/config/api';

export interface Notification {
  id: string;
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  read: boolean;
  readAt?: string;
  relatedId?: string;
  relatedType?: string;
  createdAt: string;
}

export interface CreateNotificationRequest {
  userId: string;
  type: string;
  title: string;
  message: string;
  priority?: string;
  relatedId?: string;
  relatedType?: string;
}

export const notificationsService = {
  async getAll(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.BASE);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  async getById(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
    return response.data;
  },

  async getByUser(userId: string): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.BY_USER(userId));
      return response.data || [];
    } catch (error) {
      console.error('Error fetching user notifications:', error);
      throw error;
    }
  },

  async getUnread(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.UNREAD);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching unread notifications:', error);
      throw error;
    }
  },

  async getUnreadCount(userId: string): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(API_ENDPOINTS.NOTIFICATIONS.UNREAD_COUNT(userId));
      return response.data?.count || 0;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  async getRecent(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.RECENT);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching recent notifications:', error);
      throw error;
    }
  },

  async getEmergency(): Promise<Notification[]> {
    try {
      const response = await apiClient.get<Notification[]>(API_ENDPOINTS.NOTIFICATIONS.EMERGENCY);
      return response.data || [];
    } catch (error) {
      console.error('Error fetching emergency notifications:', error);
      throw error;
    }
  },

  async create(data: CreateNotificationRequest): Promise<Notification> {
    const response = await apiClient.post<Notification>(API_ENDPOINTS.NOTIFICATIONS.BASE, data);
    return response.data;
  },

  async markAsRead(id: string): Promise<Notification> {
    const response = await apiClient.put<Notification>(API_ENDPOINTS.NOTIFICATIONS.READ(id));
    return response.data;
  },

  async markAllAsRead(): Promise<void> {
    await apiClient.put(API_ENDPOINTS.NOTIFICATIONS.READ_ALL);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(API_ENDPOINTS.NOTIFICATIONS.BY_ID(id));
  },
};
