import { BaseEntity, TimestampEntity } from "./api.types";
import { User as UserType } from "./user.types";

export interface CollectionItem {
    id: number;
    type: 'heritage' | 'artifact';
    addedAt: string;
    note?: string;
    details?: any; // Populated details from backend
}

export interface Collection extends BaseEntity, TimestampEntity {
  user_id: number;
  name: string;
  description?: string;
  items: CollectionItem[];
  total_items: number;
  is_public: boolean;
  user?: UserType; // If populated
}

export interface CollectionDTO {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface ShareCollectionData {
  emails: string[];
  permission: 'view' | 'edit';
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
  user_id: number;
  type: "artifact" | "heritage_site" | "exhibition";
  reference_id: number;
  item?: any;
}

export interface FavoriteStats {
  total: number;
  byType: Record<string, number>;
}

// Review
export interface Review extends BaseEntity, TimestampEntity {
  user_id: number;
  type: "artifact" | "heritage_site";
  heritage_site_id?: number;
  artifact_id?: number;
  rating: number;
  comment?: string;
  images?: string[];
  is_verified?: boolean;
  user?: UserType;
}

export interface ReviewDTO {
  type: "artifact" | "heritage_site";
  heritage_site_id?: number;
  artifact_id?: number;
  rating: number;
  comment?: string;
  images?: string[];
}
