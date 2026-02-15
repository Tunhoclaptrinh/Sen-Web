import {BaseEntity, TimestampEntity} from "./api.types";
import {User as UserType} from "./user.types";

export interface CollectionItem {
  id: number;
  type: "heritage" | "artifact" | "article" | "exhibition";
  addedAt: string;
  note?: string;
  details?: any; // Populated details from backend
}

export interface Collection extends BaseEntity, TimestampEntity {
  userId: number;
  name: string;
  description?: string;
  items: CollectionItem[];
  totalItems: number;
  isPublic: boolean;
  user?: UserType; // If populated
}

export interface CollectionDTO {
  name: string;
  description?: string;
  isPublic?: boolean;
}

export interface ShareCollectionData {
  emails: string[];
  permission: "view" | "edit";
}

export interface CollectionStats {
  totalCollections: number;
  totalItems: number;
  publicCollections: number;
  privateCollections: number;
}

export interface CollectionState {
  items: Collection[];
  currentItem: Collection | null;
  loading: boolean;
  error: string | null;
}

// Favorite
export interface Favorite extends BaseEntity {
  userId: number;
  type: "artifact" | "heritageSite" | "exhibition" | "article";
  referenceId: number;
  item?: any;
}

export interface FavoriteStats {
  total: number;
  byType: Record<string, number>;
}

// Review types moved to review.types.ts
