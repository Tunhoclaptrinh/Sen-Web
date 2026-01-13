// ============================================
// Artifact Types
// ============================================

import { BaseEntity, TimestampEntity, Pagination } from "./index";

// Artifact Type Enum
export enum ArtifactType {
  SCULPTURE = "sculpture",
  PAINTING = "painting",
  DOCUMENT = "document",
  POTTERY = "pottery",
  TEXTILE = "textile",
  TOOL = "tool",
  WEAPON = "weapon",
  JEWELRY = "jewelry",
  MANUSCRIPT = "manuscript",
  PHOTOGRAPH = "photograph",
  OTHER = "other",
}

// Artifact Type Labels (Vietnamese)
export const ArtifactTypeLabels: Record<ArtifactType, string> = {
  [ArtifactType.SCULPTURE]: "Điều khắc",
  [ArtifactType.PAINTING]: "Hội họa",
  [ArtifactType.DOCUMENT]: "Văn bản",
  [ArtifactType.POTTERY]: "Gốm sứ",
  [ArtifactType.TEXTILE]: "Dệt may",
  [ArtifactType.TOOL]: "Công cụ",
  [ArtifactType.WEAPON]: "Vũ khí",
  [ArtifactType.JEWELRY]: "Trang sức",
  [ArtifactType.MANUSCRIPT]: "Bản thảo",
  [ArtifactType.PHOTOGRAPH]: "Ảnh",
  [ArtifactType.OTHER]: "Khác",
};

// Artifact Condition
export enum ArtifactCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
}

// Artifact Condition Labels (Vietnamese)
export const ArtifactConditionLabels: Record<ArtifactCondition, string> = {
  [ArtifactCondition.EXCELLENT]: "Xuất sắc",
  [ArtifactCondition.GOOD]: "Tốt",
  [ArtifactCondition.FAIR]: "Khá",
  [ArtifactCondition.POOR]: "Kém",
};

// Artifact
export interface Artifact extends BaseEntity, TimestampEntity {
  name: string;
  short_description?: string;
  shortDescription?: string;
  description: string;
  artifact_type: ArtifactType;
  category_id?: number;
  heritage_site_id?: number;
  year_created?: number;
  creator?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  condition: ArtifactCondition;
  origin?: string;
  acquisition_date?: string;
  acquisition_method?: string;
  current_location?: string;
  location_in_site?: string;
  is_on_display: boolean;
  images?: string[];
  image?: string;
  main_image?: string;
  historical_context?: string;
  cultural_significance?: string;
  story?: string;
  rating?: number;
  total_reviews?: number;
  view_count?: number;
  is_active?: boolean;
  // Related items (admin-managed)
  related_heritage_ids?: number[];
  related_history_ids?: number[];
}

// Artifact DTO
export interface ArtifactDTO {
  name: string;
  description: string;
  artifact_type: ArtifactType;
  category_id?: number;
  heritage_site_id?: number;
  year_created?: number;
  creator?: string;
  material?: string;
  dimensions?: string;
  weight?: string;
  condition: ArtifactCondition;
  origin?: string;
  acquisition_date?: string;
  acquisition_method?: string;
  current_location?: string;
  location_in_site?: string;
  is_on_display: boolean;
  images?: string[];
  historical_context?: string;
  cultural_significance?: string;
  story?: string;
  // Related items (admin-managed)
  related_heritage_ids?: number[];
  related_history_ids?: number[];
}

// Category
export interface Category extends BaseEntity {
  name: string;
  icon?: string;
  description?: string;
  parent_id?: number;
}

// Artifact Filters
export interface ArtifactFilters {
  artifact_type?: ArtifactType;
  category_id?: number;
  heritage_site_id?: number;
  condition?: ArtifactCondition;
  is_on_display?: boolean;
  minYear?: number;
  maxYear?: number;
  material?: string;
  origin?: string;
}

// Artifact Search Params
export interface ArtifactSearchParams extends ArtifactFilters {
  q?: string;
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
}

// Artifact State (Redux)
export interface ArtifactState {
  items: Artifact[];
  currentItem: Artifact | null;
  loading: boolean;
  error: string | null;
  pagination: Pagination;
  filters: ArtifactFilters;
}

// Artifact Response
export interface ArtifactResponse {
  success: boolean;
  data: Artifact[];
  pagination?: Pagination;
}

export interface ArtifactSingleResponse {
  success: boolean;
  data: Artifact;
}

// Related Artifacts
export interface RelatedArtifactsResponse {
  success: boolean;
  data: Artifact[];
}
