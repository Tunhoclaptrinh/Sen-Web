// ============================================
// src/types/user.types.ts
// ============================================

import { BaseEntity, TimestampEntity } from "./index";

export enum UserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
  RESEARCHER = "researcher",
  CURATOR = "curator",
}

export interface User extends BaseEntity, TimestampEntity {
  email: string;
  name: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: UserRole;
  isActive: boolean;
}

export interface UserProfile {
  id: number;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  avatar?: string;
  role: UserRole;
}

export interface UserUpdateDTO {
  name?: string;
  phone?: string;
  address?: string;
  avatar?: string;
}

export interface UserActivity {
  totalOrders: number;
  completedOrders: number;
  totalReviews: number;
  avgRating: number;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
  byRole: Record<UserRole, number>;
  withReviews: number;
  recentSignups: number;
}
