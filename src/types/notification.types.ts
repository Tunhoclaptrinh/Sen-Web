// ============================================
// Notification Types
// ============================================

export interface Notification {
  id: number;
  userId: number;
  type:
    | "system"
    | "reward"
    | "achievement"
    | "quest"
    | "social"
    | "learning"
    | "history"
    | "artifact"
    | "heritage"
    | "review"
    | "exhibition";
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface NotificationPreferences {
  userId: number;
  emailNotifications: boolean;
  pushNotifications: boolean;
  questNotifications: boolean;
  achievementNotifications: boolean;
  socialNotifications: boolean;
}

export type NotificationType =
  | "system"
  | "reward"
  | "achievement"
  | "quest"
  | "social"
  | "learning"
  | "history"
  | "artifact"
  | "heritage"
  | "review"
  | "exhibition";
