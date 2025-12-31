import { BaseEntity, TimestampEntity, User } from ".";

export interface Collection extends BaseEntity, TimestampEntity {
  user_id: number;
  name: string;
  description?: string;
  artifact_ids: number[];
  heritage_site_ids: number[];
  total_items: number;
  is_public: boolean;
}

export interface CollectionDTO {
  name: string;
  description?: string;
  is_public?: boolean;
}

export interface CollectionState {
  items: Collection[];
  currentItem: Collection | null;
  loading: boolean;
  error: string | null;
}

export interface CollectionResponse {
  success: boolean;
  data: Collection[];
}

export interface CollectionSingleResponse {
  success: boolean;
  data: Collection;
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
  user?: User;
}

export interface ReviewDTO {
  type: "artifact" | "heritage_site";
  heritage_site_id?: number;
  artifact_id?: number;
  rating: number;
  comment?: string;
  images?: string[];
}
