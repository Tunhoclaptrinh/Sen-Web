import BaseService from './base.service';
import apiClient from '@/config/axios.config';
import type {
  Artifact,
  ArtifactDTO,
  ArtifactType,
  ArtifactCondition,
  ArtifactSearchParams,
  BaseApiResponse,
  QueryParams,
} from '@/types';
import { logger } from '@/utils/logger.utils';

/**
 * Artifact Service
 * Handles all operations related to Artifacts
 */
class ArtifactService extends BaseService<Artifact, ArtifactDTO, ArtifactDTO> {
  constructor() {
    super('/artifacts');
  }

  /**
   * Get related artifacts (same heritage site or category)
   */
  async getRelated(
    id: number | string,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${id}/related?${queryString}`
        : `${this.endpoint}/${id}/related`;

      const response = await apiClient.get<BaseApiResponse<Artifact[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      logger.error('[Artifact] getRelated error:', error);
      throw error;
    }
  }

  /**
   * Get artifacts by category
   */
  async getByCategory(
    categoryId: number,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      category_id: categoryId,
      ...params,
    });
  }

  /**
   * Get artifacts by period
   */
  async getByPeriod(
    period: string,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      period,
      ...params,
    });
  }

  /**
   * Get artifacts by type
   */
  async getByType(
    type: ArtifactType,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      artifact_type: type,
      ...params,
    });
  }

  /**
   * Get artifacts by condition
   */
  async getByCondition(
    condition: ArtifactCondition,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      condition,
      ...params,
    });
  }

  /**
   * Get featured artifacts (sorted by rating)
   */
  async getFeatured(limit: number = 10): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      _sort: 'rating',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Get trending artifacts (sorted by views)
   */
  async getTrending(limit: number = 10): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      _sort: 'view_count',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Search artifacts with advanced filters
   */
  async searchWithFilters(
    query: string,
    filters: ArtifactSearchParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.search(query, filters);
  }

  /**
   * Get artifacts by heritage site
   */
  async getByHeritageSite(
    heritageId: number | string,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      heritage_site_id: heritageId,
      ...params,
    });
  }

  /**
   * Get artifacts on display
   */
  async getOnDisplay(params: QueryParams = {}): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      is_on_display: true,
      ...params,
    });
  }

  /**
   * Get artifacts by material
   */
  async getByMaterial(
    material: string,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      material,
      ...params,
    });
  }

  /**
   * Get artifacts by year range
   */
  async getByYearRange(
    minYear: number,
    maxYear: number,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      minYear,
      maxYear,
      ...params,
    });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: number | string): Promise<void> {
    try {
      await apiClient.post(`${this.endpoint}/${id}/view`);
    } catch (error) {
      logger.warn('[Artifact] incrementViewCount failed:', error);
    }
  }

  /**
   * Get artifact images
   */
  async getImages(id: number | string): Promise<BaseApiResponse<string[]>> {
    try {
      const artifact = await this.getById(id);
      return {
        success: true,
        data: artifact.data?.images ?? [],
      };
    } catch (error) {
      logger.error('[Artifact] getImages error:', error);
      throw error;
    }
  }

  /**
   * Update artifact images
   */
  async updateImages(
    id: number | string,
    images: string[]
  ): Promise<BaseApiResponse<Artifact>> {
    return this.patch(id, { images } as any);
  }

  /**
   * Get artifacts by creator
   */
  async getByCreator(
    creator: string,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<Artifact[]>> {
    return this.getAll({
      creator,
      ...params,
    });
  }
}

export default new ArtifactService();