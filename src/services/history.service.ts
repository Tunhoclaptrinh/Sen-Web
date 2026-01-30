import BaseService from './base.service';
import apiClient from '@/config/axios.config';
import type {
  HistoryArticle,
  HistoryArticleDTO,
  BaseApiResponse,
  QueryParams,
} from '@/types';
import { logger } from '@/utils/logger.utils';

/**
 * History Service - Handles Cultural Articles
 */
class HistoryService extends BaseService<HistoryArticle, HistoryArticleDTO, HistoryArticleDTO> {
  constructor() {
    super('/history');
  }

  /**
   * Get related articles
   */
  async getRelated(id: number | string, limit: number = 5): Promise<BaseApiResponse<HistoryArticle[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<HistoryArticle[]>>(
        `${this.endpoint}/${id}/related?_limit=${limit}`
      );
      return {
        success: response.success ?? true,
        data: response.data ?? [],
      };
    } catch (error) {
      logger.error('[History] getRelated error:', error);
      throw error;
    }
  }

  /**
   * Get articles by category
   */
  async getByCategory(
    category: string,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<HistoryArticle[]>> {
    return this.getAll({
      category,
      ...params,
    });
  }

  /**
   * Get featured articles
   */
  async getFeatured(limit: number = 5): Promise<BaseApiResponse<HistoryArticle[]>> {
    return this.getAll({
      is_featured: true,
      _limit: limit,
      _sort: 'views',
      _order: 'desc'
    });
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: number | string): Promise<void> {
    try {
      await apiClient.post(`${this.endpoint}/${id}/view`);
    } catch (error) {
      logger.warn('[History] incrementViewCount failed:', error);
    }
  }
}

export default new HistoryService();
