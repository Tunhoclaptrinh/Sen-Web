import apiClient from "@/config/axios.config";
import BaseService from "./base.service";
import type {BaseApiResponse, QueryParams} from "@/types";
import {logger} from "@/utils/logger.utils";
import {Collection, CollectionDTO, ShareCollectionData, CollectionStats} from "@/types/collection.types";

/**
 * Collection with items populated
 */
export interface CollectionWithItems extends Collection {
  artifacts?: any[];
  heritageSites?: any[];
}

/**
 * Collection Service
 * Handles all operations for Collections
 */
class CollectionService extends BaseService<Collection, CollectionDTO, CollectionDTO> {
  constructor() {
    super("/collections");
  }

  /**
   * Add item to collection
   */
  async addItem(
    collectionId: number | string,
    item: {id: number | string; type: "heritage" | "artifact" | "article" | "exhibition"; note?: string},
  ): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Collection>>(
        `${this.endpoint}/${collectionId}/items`,
        item,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã thêm vào bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] addItem error:", error);
      throw error;
    }
  }

  /**
   * Remove item from collection
   */
  async removeItem(
    collectionId: number | string,
    itemId: number | string,
    type: "heritage" | "artifact" | "article" | "exhibition",
  ): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<Collection>>(
        `${this.endpoint}/${collectionId}/items/${itemId}?type=${type}`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã xóa khỏi bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] removeItem error:", error);
      throw error;
    }
  }

  /**
   * Get collection artifacts with details
   */
  async getArtifacts(collectionId: number | string, params: QueryParams = {}): Promise<BaseApiResponse<any[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${collectionId}/artifacts?${queryString}`
        : `${this.endpoint}/${collectionId}/artifacts`;

      const response = await apiClient.get<BaseApiResponse<any[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        pagination: response.pagination ?? response.metadata,
        message: response.message,
      };
    } catch (error) {
      logger.error("[Collection] getArtifacts error:", error);
      throw error;
    }
  }

  /**
   * Get collection heritage sites with details
   */
  async getHeritageSites(collectionId: number | string, params: QueryParams = {}): Promise<BaseApiResponse<any[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${collectionId}/heritage-sites?${queryString}`
        : `${this.endpoint}/${collectionId}/heritage-sites`;

      const response = await apiClient.get<BaseApiResponse<any[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        pagination: response.pagination ?? response.metadata,
        message: response.message,
      };
    } catch (error) {
      logger.error("[Collection] getHeritageSites error:", error);
      throw error;
    }
  }

  /**
   * Toggle collection public status
   */
  async togglePublic(collectionId: number | string): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.patch<BaseApiResponse<Collection>>(
        `${this.endpoint}/${collectionId}/toggle-public`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã cập nhật trạng thái",
      };
    } catch (error) {
      logger.error("[Collection] togglePublic error:", error);
      throw error;
    }
  }

  /**
   * Get public collections
   */
  async getPublic(params: QueryParams = {}): Promise<BaseApiResponse<Collection[]>> {
    return this.getAll({isPublic: true, ...params});
  }

  /**
   * Get user's private collections
   */
  async getPrivate(params: QueryParams = {}): Promise<BaseApiResponse<Collection[]>> {
    return this.getAll({isPublic: false, ...params});
  }

  /**
   * Share collection with other users
   */
  async share(collectionId: number | string, data: ShareCollectionData): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(`${this.endpoint}/${collectionId}/share`, data);

      return {
        success: response.success ?? true,
        message: response.message ?? "Đã chia sẻ bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] share error:", error);
      throw error;
    }
  }

  /**
   * Duplicate collection
   */
  async duplicate(collectionId: number | string, newName?: string): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Collection>>(`${this.endpoint}/${collectionId}/duplicate`, {
        name: newName,
      });

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã sao chép bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] duplicate error:", error);
      throw error;
    }
  }

  /**
   * Merge collections
   */
  async merge(sourceIds: (number | string)[], targetId: number | string): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Collection>>(`${this.endpoint}/merge`, {
        sourceIds,
        targetId,
      });

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã gộp bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] merge error:", error);
      throw error;
    }
  }

  /**
   * Get collection statistics
   */
  async getStats(): Promise<BaseApiResponse<CollectionStats>> {
    try {
      const response = await apiClient.get<BaseApiResponse<CollectionStats>>(`${this.endpoint}/stats/summary`);

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message,
      };
    } catch (error) {
      logger.error("[Collection] getStats error:", error);
      throw error;
    }
  }

  /**
   * Check if item is in collection
   */
  async checkItem(
    collectionId: number | string,
    type: "heritage" | "artifact" | "article" | "exhibition",
    itemId: number | string,
  ): Promise<boolean> {
    try {
      const response = await apiClient.get<{exists: boolean}>(
        `${this.endpoint}/${collectionId}/check/${type}/${itemId}`,
      );

      return response.exists ?? false;
    } catch (error) {
      logger.error("[Collection] checkItem error:", error);
      return false;
    }
  }

  /**
   * Add multiple artifacts at once
   */
  async addMultipleArtifacts(
    collectionId: number | string,
    artifactIds: (number | string)[],
  ): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Collection>>(
        `${this.endpoint}/${collectionId}/artifacts/bulk`,
        {artifactIds},
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã thêm vào bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] addMultipleArtifacts error:", error);
      throw error;
    }
  }

  /**
   * Remove multiple artifacts at once
   */
  async removeMultipleArtifacts(
    collectionId: number | string,
    artifactIds: (number | string)[],
  ): Promise<BaseApiResponse<Collection>> {
    try {
      const response = await apiClient.post<BaseApiResponse<Collection>>(
        `${this.endpoint}/${collectionId}/artifacts/bulk/delete`,
        {artifactIds},
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Đã xóa khỏi bộ sưu tập",
      };
    } catch (error) {
      logger.error("[Collection] removeMultipleArtifacts error:", error);
      throw error;
    }
  }

  /**
   * Export collection to file
   */
  async exportCollection(collectionId: number | string): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.endpoint}/${collectionId}/export`, {responseType: "blob"});

      return response as unknown as Blob;
    } catch (error) {
      logger.error("[Collection] export error:", error);
      throw error;
    }
  }

  /**
   * Get featured/popular collections
   */
  async getFeatured(limit: number = 10): Promise<BaseApiResponse<Collection[]>> {
    return this.getPublic({
      _sort: "totalItems",
      _order: "desc",
      _limit: limit,
    });
  }

  /**
   * Search collections by name
   */
  async searchByName(name: string, params: QueryParams = {}): Promise<BaseApiResponse<Collection[]>> {
    return this.search(name, params);
  }
}

export default new CollectionService();
