/**
 * Shop Item Types
 * Type definitions for shop items and related entities
 */

import { ShopItemType, ShopCurrency } from '@/constants/shop.constants';

/**
 * Shop Item Interface
 * Represents a purchasable item in the shop
 */
export interface ShopItem {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: ShopCurrency;
  type: ShopItemType;
  image: string;
  effect?: string;
  isConsumable?: boolean;
  maxStack?: number;
  isAvailable?: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * User Inventory Item
 * Represents an item owned by a user
 */
export interface UserInventoryItem {
  itemId: number;
  quantity: number;
  acquiredAt?: string;
}

/**
 * User Inventory
 * Full inventory for a user
 */
export interface UserInventory {
  id: number;
  userId: number;
  items: UserInventoryItem[];
}
