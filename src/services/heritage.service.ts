import ReviewableBaseService from './reviewable.service';
import apiClient from '@/config/axios.config';
import type {
  HeritageSite,
  HeritageSiteDTO,
  HeritageType,
  HeritageSearchParams,

  HeritageWithDistance,
  TimelineEvent,
  BaseApiResponse,
  QueryParams,
} from '@/types';
import { logger } from '@/utils/logger.utils';

/**
 * Heritage Service
 * Handles all operations related to Heritage Sites
 */
class HeritageService extends ReviewableBaseService<HeritageSite, HeritageSiteDTO, HeritageSiteDTO> {
  constructor() {
    super('/heritage-sites');
  }

  /**
   * Get nearby heritage sites based on coordinates
   */
  async getNearby(
    latitude: number,
    longitude: number,
    radius: number = 10,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<HeritageWithDistance[]>> {
    try {
      const queryParams = {
        latitude,
        longitude,
        radius,
        ...params,
      };

      const queryString = this.buildQueryString(queryParams);
      const url = `${this.endpoint}/nearby?${queryString}`;

      const response = await apiClient.get<BaseApiResponse<HeritageWithDistance[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      logger.error('[Heritage] getNearby error:', error);
      throw error;
    }
  }

  /**
   * Get artifacts of a heritage site
   */
  async getArtifacts(id: number | string, params: QueryParams = {}): Promise<BaseApiResponse<any[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/${id}/artifacts?${queryString}`
        : `${this.endpoint}/${id}/artifacts`;

      const response = await apiClient.get<BaseApiResponse<any[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        pagination: response.pagination ?? response.metadata,
        message: response.message,
      };
    } catch (error) {
      logger.error('[Heritage] getArtifacts error:', error);
      throw error;
    }
  }

  /**
   * Get timeline events of a heritage site
   */
  async getTimeline(id: number | string): Promise<BaseApiResponse<TimelineEvent[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<TimelineEvent[]>>(
        `${this.endpoint}/${id}/timeline`
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message,
      };
    } catch (error) {
      logger.error('[Heritage] getTimeline error:', error);
      throw error;
    }
  }

  /**
   * Get heritage sites by region
   */
  async getByRegion(region: string, params: QueryParams = {}): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.getAll({
      region,
      ...params,
    });
  }

  /**
   * Get heritage sites by type
   */
  async getByType(type: HeritageType, params: QueryParams = {}): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.getAll({
      type,
      ...params,
    });
  }

  /**
   * Get UNESCO listed heritage sites
   */
  async getUNESCO(params: QueryParams = {}): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.getAll({
      unescoListed: true,
      ...params,
    });
  }

  /**
   * Get featured heritage sites (sorted by rating)
   */
  async getFeatured(limit: number = 10): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.getAll({
      _sort: 'rating',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Get popular heritage sites (sorted by views)
   */
  async getPopular(limit: number = 10): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.getAll({
      _sort: 'views',
      _order: 'desc',
      _limit: limit,
    });
  }

  /**
   * Search heritage sites with advanced filters
   */
  async searchWithFilters(
    query: string,
    filters: HeritageSearchParams = {}
  ): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.search(query, filters);
  }

  /**
   * Get heritage sites by cultural period
   */
  async getByCulturalPeriod(period: string, params: QueryParams = {}): Promise<BaseApiResponse<HeritageSite[]>> {
    return this.getAll({
      culturalPeriod: period,
      ...params,
    });
  }

  /**
   * Get heritage sites with entrance fee filter
   */
  async getByEntranceFee(
    maxFee: number,
    params: QueryParams = {}
  ): Promise<BaseApiResponse<HeritageSite[]>> {
    const allSites = await this.getAll(params);

    if (!allSites.data) return allSites;

    const filtered = allSites.data.filter(
      site => !site.entranceFee || site.entranceFee <= maxFee
    );

    return {
      ...allSites,
      data: filtered,
    };
  }

  /**
   * Increment view count
   */
  async incrementViewCount(id: number | string): Promise<void> {
    try {
      await apiClient.post(`${this.endpoint}/${id}/view`);
    } catch (error) {
      logger.warn('[Heritage] incrementViewCount failed:', error);
    }
  }

  /**
   * Get related heritage sites (same type or region)
   */
  async getRelated(id: number | string, limit: number = 6): Promise<BaseApiResponse<HeritageSite[]>> {
    try {
      const response = await apiClient.get<BaseApiResponse<HeritageSite[]>>(
        `${this.endpoint}/${id}/related?_limit=${limit}`
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
      };
    } catch (error) {
      logger.error('[Heritage] getRelated error:', error);
      throw error;
    }
  }
  /**
   * Get heritage site statistics
   * Aggregates data by making parallel requests for counts
   */
  async getStats(): Promise<BaseApiResponse<any>> {
    try {
      const [total, unesco, north, center, south] = await Promise.all([
        this.getAll({ limit: 1 }),
        this.getUNESCO({ limit: 1 }),
        this.getByRegion("Bắc", { limit: 1 }),
        this.getByRegion("Trung", { limit: 1 }),
        this.getByRegion("Nam", { limit: 1 }),
      ]);

      return {
        success: true,
        data: {
          total: total.pagination?.total || 0,
          unesco: unesco.pagination?.total || 0,
          region: {
            north: north.pagination?.total || 0,
            center: center.pagination?.total || 0,
            south: south.pagination?.total || 0,
          }
        }
      };
    } catch (error) {
      logger.error('[Heritage] getStats error:', error);
      return { success: false, message: "Failed to load stats", data: null };
    }
  }
}

export default new HeritageService();