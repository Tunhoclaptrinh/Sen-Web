// ============================================
// API Types
// ============================================

import { Pagination, Metadata } from "./index";

// Base API Response
export interface BaseApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  pagination?: Pagination;
  metadata?: Metadata;
  errors?: ApiError[];
}

export interface ApiError {
  field?: string;
  message: string;
  code?: string;
}

// API Request Config
export interface ApiRequestConfig {
  headers?: Record<string, string>;
  params?: Record<string, any>;
  timeout?: number;
}

// Query Builder
export interface QueryBuilder {
  page?: number;
  limit?: number;
  sort?: string;
  order?: "asc" | "desc";
  search?: string;
  filters?: Record<string, any>;
}

// HTTP Methods
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

// API Endpoint
export interface ApiEndpoint {
  method: HttpMethod;
  path: string;
  requiresAuth?: boolean;
}

// Upload Config
export interface UploadConfig {
  maxSize?: number;
  allowedTypes?: string[];
  folder?: string;
}

export interface UploadResponse {
  success: boolean;
  data: {
    url: string;
    filename: string;
    size: number;
    mimetype: string;
  };
  message?: string;
}

// Export/Import
export interface ExportParams {
  format?: "xlsx" | "csv" | "json";
  fields?: string[];
  filters?: Record<string, any>;
}

export interface ImportResult {
  success: number;
  failed: number;
  total: number;
  errors?: Array<{
    row: number;
    errors: string[];
  }>;
}

// Batch Operations
export interface BatchOperation<T = any> {
  operation: "create" | "update" | "delete";
  items: T[];
}

export interface BatchResult {
  success: number;
  failed: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
}

// Statistics
export interface StatsResponse {
  total: number;
  active?: number;
  inactive?: number;
  byCategory?: Record<string, number>;
  byType?: Record<string, number>;
  [key: string]: any;
}

// Search
export interface SearchRequest {
  query: string;
  fields?: string[];
  filters?: Record<string, any>;
  limit?: number;
}

export interface SearchResponse<T = any> {
  results: T[];
  total: number;
  query: string;
  suggestions?: string[];
}

// Cache
export interface CacheConfig {
  ttl?: number;
  key?: string;
  enabled?: boolean;
}

// Rate Limit
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
