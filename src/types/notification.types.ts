// ============================================
// Notification Types
// ============================================

export interface Notification {
    id: number;
    user_id: number;
    type: 'system' | 'reward' | 'achievement' | 'quest' | 'social';
    title: string;
    message: string;
    data?: any;
    is_read: boolean;
    created_at: string;
    read_at?: string;
}

export interface NotificationPreferences {
    user_id: number;
    email_notifications: boolean;
    push_notifications: boolean;
    quest_notifications: boolean;
    achievement_notifications: boolean;
    social_notifications: boolean;
}

export type NotificationType = 'system' | 'reward' | 'achievement' | 'quest' | 'social';
