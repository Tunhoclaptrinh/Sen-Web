import {BaseEntity} from "./index";

export interface HistoryArticle extends BaseEntity {
  title: string;
  image?: string;
  content: string; // HTML content
  author?: string;
  authorName?: string;
  publishDate?: string;
  category?: string;

  // Status & Metrics
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  rating?: number;
  totalReviews?: number;

  // Relations
  relatedHeritageIds?: number[];
  relatedArtifactIds?: number[];
  relatedHistoryIds?: number[];
  relatedLevelIds?: number[];

  // Populated Data (for Detail View)
  shortDescription?: string;
  timelineEvents?: any[];
  relatedHeritage?: any[];
  relatedArtifacts?: any[];
  relatedLevels?: any[];
  relatedProducts?: any[];
  references?: string;
}

export interface HistoryArticleDTO {
  title: string;
  image?: string;
  content?: string;
  author?: string;
  publishDate?: string;
  category?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  relatedHeritageIds?: number[];
  relatedArtifactIds?: number[];
  relatedHistoryIds?: number[];
  relatedLevelIds?: number[];
  references?: string;
}

export interface HistorySearchParams {
  title_like?: string;
  category?: string;
  author?: string;
  isActive?: boolean;
  isFeatured?: boolean;
}
