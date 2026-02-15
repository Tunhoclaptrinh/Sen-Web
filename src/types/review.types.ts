import {BaseEntity, TimestampEntity, Pagination} from "./index";

export interface Review extends BaseEntity, TimestampEntity {
  userId: number;
  userName?: string;
  userAvatar?: string;
  type: "heritage_site" | "artifact" | "exhibition" | "history_article";
  referenceId: number;
  rating: number;
  comment: string;
  authorName?: string;
}

export interface ReviewDTO {
  type: "heritage_site" | "artifact" | "exhibition" | "history_article";
  referenceId: number;
  rating: number;
  comment: string;
}

export interface ReviewFilters {
  type?: "heritage_site" | "artifact" | "exhibition" | "history_article";
  referenceId?: number;
  userId?: number;
  rating?: number;
}

export interface ReviewState {
  items: Review[];
  currentItem: Review | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

export interface ReviewResponse {
  success: boolean;
  data: Review[];
  pagination?: Pagination;
}
