import apiClient from "@/config/axios.config";
import type { BaseApiResponse } from "@/types";

/**
 * Favorite item type
 */
export type FavoriteType = "artifact" | "heritage_site" | "exhibition";

/**
 * Favorite interface
 */
export interface Favorite {
  id: number;
  user_id: number;
  type: FavoriteType;
  reference_id: number;
  item?: any;
  created_at: string;
}

/**
 * Favorite stats interface
 */
export interface FavoriteStats {
  total: number;
  byType: Record<FavoriteType, number>;
}

/**
 * Check favorite response
 */
export interface CheckFavoriteResponse {
  isFavorited: boolean;
  favoriteId?: number;
}

/**
 * Toggle favorite response
 */
export interface ToggleFavoriteResponse {
  isFavorited: boolean;
  message?: string;
}

/**
 * Trending item interface
 */
export interface TrendingItem {
  id: number;
  name: string;
  type: FavoriteType;
  favorite_count: number;
  image?: string;
  [key: string]: any;
}

/**
 * Favorite Service
 * Handles all operations for Favorites (unified system)
 */
class FavoriteService {
  private endpoint = "/favorites";

  /**
   * Get all favorites for current user
   */
  async getAll(): Promise<BaseApiResponse<Favorite[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<Favorite[]>>(
        this.endpoint,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] getAll error:", error);
      throw error;
    }
  }

  /**
   * Get favorites by type
   */
  async getByType(type: FavoriteType): Promise<BaseApiResponse<Favorite[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<Favorite[]>>(
        `${this.endpoint}/${type}`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] getByType error:", error);
      throw error;
    }
  }

  /**
   * Get favorite IDs by type (lightweight)
   */
  async getIdsByType(type: FavoriteType): Promise<BaseApiResponse<number[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<number[]>>(
        `${this.endpoint}/${type}/ids`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] getIdsByType error:", error);
      throw error;
    }
  }

  /**
   * Check if item is favorited
   */
  async check(
    type: FavoriteType,
    id: number | string,
  ): Promise<BaseApiResponse<CheckFavoriteResponse>> {
    try {
      const response = await apiClient.get<
        BaseApiResponse<CheckFavoriteResponse>
      >(`${this.endpoint}/${type}/${id}/check`);

      return {
        success: response.success ?? true,
        data: response.data ?? { isFavorited: false },
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] check error:", error);
      throw error;
    }
  }

  /**
   * Add item to favorites
   */
  async add(
    type: FavoriteType,
    id: number | string,
  ): Promise<BaseApiResponse<Favorite>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Favorite>>(
        `${this.endpoint}/${type}/${id}`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã thêm vào yêu thích",
      };
    } catch (error) {
      console.error("[Favorite] add error:", error);
      throw error;
    }
  }

  /**
   * Toggle favorite status (add if not exist, remove if exist)
   */
  async toggle(
    type: FavoriteType,
    id: number | string,
  ): Promise<BaseApiResponse<ToggleFavoriteResponse>> {
    try {
      const response = await apiClient.post<
        BaseApiResponse<ToggleFavoriteResponse>
      >(`${this.endpoint}/${type}/${id}/toggle`);

      return {
        success: response.success ?? true,
        data: response.data ?? { isFavorited: false },
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] toggle error:", error);
      throw error;
    }
  }

  /**
   * Remove item from favorites
   */
  async remove(
    type: FavoriteType,
    id: number | string,
  ): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<void>>(
        `${this.endpoint}/${type}/${id}`,
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã xóa khỏi yêu thích",
      };
    } catch (error) {
      console.error("[Favorite] remove error:", error);
      throw error;
    }
  }

  /**
   * Clear all favorites of a specific type
   */
  async clearByType(type: FavoriteType): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<void>>(
        `${this.endpoint}/${type}`,
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã xóa tất cả",
      };
    } catch (error) {
      console.error("[Favorite] clearByType error:", error);
      throw error;
    }
  }

  /**
   * Clear all favorites
   */
  async clearAll(): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<void>>(
        this.endpoint,
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã xóa tất cả yêu thích",
      };
    } catch (error) {
      console.error("[Favorite] clearAll error:", error);
      throw error;
    }
  }

  /**
   * Get favorite statistics
   */
  async getStats(): Promise<BaseApiResponse<FavoriteStats>> {
    try {
      const response = await apiClient.get<BaseApiResponse<FavoriteStats>>(
        `${this.endpoint}/stats/summary`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? { total: 0, byType: {} as any },
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] getStats error:", error);
      throw error;
    }
  }

  /**
   * Get trending favorites by type
   */
  async getTrending(
    type: FavoriteType,
  ): Promise<BaseApiResponse<TrendingItem[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<TrendingItem[]>>(
        `${this.endpoint}/trending/${type}`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] getTrending error:", error);
      throw error;
    }
  }

  /**
   * Check multiple items at once
   */
  async checkMultiple(
    type: FavoriteType,
    ids: (number | string)[],
  ): Promise<BaseApiResponse<Record<string, boolean>>> {
    try {
      const response = await apiClient.post<
        BaseApiResponse<Record<string, boolean>>
      >(`${this.endpoint}/${type}/check-multiple`, { ids });

      return {
        success: response.success ?? true,
        data: response.data ?? {},
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] checkMultiple error:", error);
      throw error;
    }
  }

  /**
   * Add multiple items to favorites at once
   */
  async addMultiple(
    type: FavoriteType,
    ids: (number | string)[],
  ): Promise<BaseApiResponse<Favorite[]>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Favorite[]>>(
        `${this.endpoint}/${type}/bulk`,
        { ids },
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message ?? "Đã thêm vào yêu thích",
      };
    } catch (error) {
      console.error("[Favorite] addMultiple error:", error);
      throw error;
    }
  }

  /**
   * Remove multiple items from favorites
   */
  async removeMultiple(
    type: FavoriteType,
    ids: (number | string)[],
  ): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        `${this.endpoint}/${type}/bulk/delete`,
        { ids },
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã xóa khỏi yêu thích",
      };
    } catch (error) {
      console.error("[Favorite] removeMultiple error:", error);
      throw error;
    }
  }

  /**
   * Get count by type
   */
  async getCount(type: FavoriteType): Promise<number> {
    try {
      const response = await apiClient.get<{ count: number }>(
        `${this.endpoint}/${type}/count`,
      );

      return response.count ?? 0;
    } catch (error) {
      console.error("[Favorite] getCount error:", error);
      return 0;
    }
  }

  /**
   * Get recent favorites
   */
  async getRecent(limit: number = 10): Promise<BaseApiResponse<Favorite[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<Favorite[]>>(
        `${this.endpoint}/recent?_limit=${limit}`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      console.error("[Favorite] getRecent error:", error);
      throw error;
    }
  }

  /**
   * Export favorites to file
   */
  async export(type?: FavoriteType): Promise<Blob> {
    try {
      const url = type
        ? `${this.endpoint}/${type}/export`
        : `${this.endpoint}/export`;

      const response = await apiClient.get(url, {
        responseType: "blob",
      });

      return response as unknown as Blob;
    } catch (error) {
      console.error("[Favorite] export error:", error);
      throw error;
    }
  }
}

export default new FavoriteService();
