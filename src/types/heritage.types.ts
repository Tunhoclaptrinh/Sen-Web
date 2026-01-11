// ============================================
// Heritage Types
// ============================================

import { BaseEntity, TimestampEntity, Pagination } from "./index";

// Heritage Type Enum
export enum HeritageType {
  MONUMENT = "monument",
  TEMPLE = "temple",
  MUSEUM = "museum",
  ARCHAEOLOGICAL_SITE = "archaeological_site",
  HISTORIC_BUILDING = "historic_building",
  NATURAL_HERITAGE = "natural_heritage",
  INTANGIBLE_HERITAGE = "intangible_heritage",
}

// Significance Level
export enum SignificanceLevel {
  LOCAL = "local",
  NATIONAL = "national",
  INTERNATIONAL = "international",
}

// Heritage Site
export interface HeritageSite extends BaseEntity, TimestampEntity {
  name: string;
  description: string;
  type: HeritageType;
  cultural_period?: string;
  region: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  year_established?: number;
  unesco_listed?: boolean;
  significance?: SignificanceLevel;
  visit_hours?: string;
  entrance_fee?: number;
  contact_info?: string;
  website?: string;
  image?: string;
  images?: string[];
  main_image?: string;
  rating?: number;
  total_reviews?: number;
  view_count?: number;
  is_active?: boolean;
  author?: string;
  publishDate?: string;
  commentCount?: number;
}

// Heritage Site Create/Update DTO
export interface HeritageSiteDTO {
  name: string;
  description: string;
  type: HeritageType;
  cultural_period?: string;
  region: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  year_established?: number;
  unesco_listed?: boolean;
  significance?: SignificanceLevel;
  visit_hours?: string;
  entrance_fee?: number;
  contact_info?: string;
  website?: string;
  images?: string[];
}

// Timeline Event
export interface TimelineEvent extends BaseEntity {
  heritage_site_id: number;
  title: string;
  description: string;
  year: number;
  category: TimelineCategory;
  image?: string;
}

export enum TimelineCategory {
  FOUNDED = "founded",
  DAMAGED = "damaged",
  RESTORED = "restored",
  DISCOVERY = "discovery",
  EVENT = "event",
  RECOGNITION = "recognition",
}

// Exhibition
export interface Exhibition extends BaseEntity, TimestampEntity {
  name: string;
  description: string;
  heritage_site_id: number;
  theme?: string;
  start_date: string;
  end_date?: string;
  curator?: string;
  artifact_ids?: number[];
  is_active: boolean;
}

// Nearby Heritage Query
export interface NearbyQuery {
  latitude: number;
  longitude: number;
  radius?: number;
}

// Heritage with Distance
export interface HeritageWithDistance extends HeritageSite {
  distance: number;
}

// Heritage Filters
export interface HeritageFilters {
  type?: HeritageType;
  region?: string;
  cultural_period?: string;
  unesco_listed?: boolean;
  significance?: SignificanceLevel;
  minRating?: number;
  maxEntranceFee?: number;
}

// Heritage Search Params
export interface HeritageSearchParams extends HeritageFilters {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Heritage State (Redux)
export interface HeritageState {
  items: HeritageSite[];
  currentItem: HeritageSite | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: HeritageFilters;
}

// Heritage Response
export interface HeritageResponse {
  success: boolean;
  data: HeritageSite[];
  pagination?: Pagination;
}

export interface HeritageSingleResponse {
  success: boolean;
  data: HeritageSite;
}
