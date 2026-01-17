import { BaseEntity } from "./index";

export interface HistoryArticle extends BaseEntity {
  title: string;
  image?: string;
  content: string; // HTML content
  author?: string;
  publishDate?: string;
  category?: string;
  
  // Status & Metrics
  is_active: boolean;
  is_featured: boolean;
  views: number;
  
  // Relations
  related_heritage_ids?: number[];
  related_artifact_ids?: number[];
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
