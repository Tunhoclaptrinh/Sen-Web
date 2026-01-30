import { BaseEntity } from "./index";

export interface HistoryArticle extends BaseEntity {
  title: string;
  image?: string;
  content: string; // HTML content
  author?: string;
  author_name?: string;
  publishDate?: string;
  category?: string;
  
  // Status & Metrics
  is_active: boolean;
  is_featured: boolean;
  views: number;
  
  // Relations
  related_heritage_ids?: number[];
  related_artifact_ids?: number[];

  // Populated Data (for Detail View)
  shortDescription?: string;
  timeline_events?: any[];
  related_heritage?: any[];
  related_artifacts?: any[];
  related_levels?: any[];
  related_products?: any[];
}

export interface HistoryArticleDTO {
  title: string;
  image?: string;
  content?: string;
  author?: string;
  publishDate?: string;
  category?: string;
  is_active?: boolean;
  is_featured?: boolean;
  related_heritage_ids?: number[];
  related_artifact_ids?: number[];
}

export interface HistorySearchParams {
  title_like?: string;
  category?: string;
  author?: string;
  is_active?: boolean;
  is_featured?: boolean;
}
