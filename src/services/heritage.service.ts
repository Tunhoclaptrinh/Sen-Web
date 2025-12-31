import BaseService from './base.service';
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

/**
 * Heritage Service
 * Handles all operations related to Heritage Sites
 */
class HeritageService extends BaseService<HeritageSite, HeritageSiteDTO, HeritageSiteDTO> {
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
      console.error('[Heritage] getNearby error:', error);
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
      console.error('[Heritage] getArtifacts error:', error);
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
      console.error('[Heritage] getTimeline error:', error);
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
      unesco_listed: true,
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
      _sort: 'view_count',
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
      cultural_period: period,
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
      site => !site.entrance_fee || site.entrance_fee <= maxFee
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
      console.warn('[Heritage] incrementViewCount failed:', error);
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
      console.error('[Heritage] getRelated error:', error);
      throw error;
    }
  }
}

export default new HeritageService();