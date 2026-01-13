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

// Heritage Type Labels (Vietnamese)
export const HeritageTypeLabels: Record<HeritageType, string> = {
  [HeritageType.MONUMENT]: "Di tích lịch sử",
  [HeritageType.TEMPLE]: "Đền, chùa, miếu",
  [HeritageType.MUSEUM]: "Bảo tàng",
  [HeritageType.ARCHAEOLOGICAL_SITE]: "Khu khảo cổ",
  [HeritageType.HISTORIC_BUILDING]: "Công trình kiến trúc lịch sử",
  [HeritageType.NATURAL_HERITAGE]: "Di sản thiên nhiên",
  [HeritageType.INTANGIBLE_HERITAGE]: "Di sản phi vật thể",
};

// Significance Level
export enum SignificanceLevel {
  LOCAL = "local",
  NATIONAL = "national",
  INTERNATIONAL = "international",
}

// Significance Level Labels (Vietnamese)
export const SignificanceLevelLabels: Record<SignificanceLevel, string> = {
  [SignificanceLevel.LOCAL]: "Cấp địa phương",
  [SignificanceLevel.NATIONAL]: "Cấp quốc gia",
  [SignificanceLevel.INTERNATIONAL]: "Cấp quốc tế",
};

// Heritage Region
export enum HeritageRegion {
  NORTH = "Bắc",
  CENTRAL = "Trung",
  SOUTH = "Nam",
}

export const HeritageRegionLabels: Record<HeritageRegion, string> = {
  [HeritageRegion.NORTH]: "Miền Bắc",
  [HeritageRegion.CENTRAL]: "Miền Trung",
  [HeritageRegion.SOUTH]: "Miền Nam",
};

// Heritage Site
export interface HeritageSite extends BaseEntity, TimestampEntity {
  name: string;
  short_description?: string;
  shortDescription?: string; // Legacy field support
  description: string;
  type: HeritageType;
  cultural_period?: string;
  region: HeritageRegion | string; // Allow string for backward compat
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
  gallery?: string[];
  main_image?: string;
  rating?: number;
  total_reviews?: number;
  view_count?: number;
  is_active?: boolean;
  author?: string;
  publishDate?: string;
  commentCount?: number;
  timeline?: TimelineEvent[];
  related_artifact_ids?: number[];
  related_artifacts?: any[]; // Full objects if needed
  related_levels?: any[];
  related_products?: any[];
  related_history?: any[];
}

// Heritage Site Create/Update DTO
export interface HeritageSiteDTO {
  name: string;
  short_description?: string;
  description: string;
  type: HeritageType;
  cultural_period?: string;
  region: HeritageRegion | string;
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
  gallery?: string[];
  timeline?: TimelineEvent[];
  related_artifact_ids?: number[];
}

// Timeline Event
export interface TimelineEvent extends BaseEntity {
  heritage_site_id?: number;
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

export const TimelineCategoryLabels: Record<TimelineCategory, string> = {
  [TimelineCategory.FOUNDED]: "Thành lập/Khởi công",
  [TimelineCategory.DAMAGED]: "Bị phá hủy/Hư hại",
  [TimelineCategory.RESTORED]: "Trùng tu/Tôn tạo",
  [TimelineCategory.DISCOVERY]: "Phát hiện/Khai quật",
  [TimelineCategory.EVENT]: "Sự kiện lịch sử",
  [TimelineCategory.RECOGNITION]: "Được công nhận",
};

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
