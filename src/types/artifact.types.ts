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

// Artifact Condition
export enum ArtifactCondition {
  EXCELLENT = "excellent",
  GOOD = "good",
  FAIR = "fair",
  POOR = "poor",
}

// Artifact
export interface Artifact extends BaseEntity, TimestampEntity {
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
  main_image?: string;
  historical_context?: string;
  cultural_significance?: string;
  story?: string;
  rating?: number;
  total_reviews?: number;
  view_count?: number;
  is_active?: boolean;
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
