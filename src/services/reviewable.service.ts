import BaseService from "./base.service";
import type { BaseApiResponse } from "@/types";
import apiClient from "@/config/axios.config";

/**
 * ReviewableBaseService - Extension of BaseService for entities
 * that require content approval workflow.
 */
class ReviewableBaseService<T = any, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> 
  extends BaseService<T, CreateDTO, UpdateDTO> {

  /**
   * SUBMIT item for review
   */
  async submitReview(id: number | string): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.patch<BaseApiResponse<T>>(
        `${this.endpoint}/${id}/submit`
      );
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] submitReview error:`, error);
      throw error;
    }
  }

  /**
   * APPROVE item (status -> published)
   */
  async approveReview(id: number | string): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.patch<BaseApiResponse<T>>(
        `${this.endpoint}/${id}/approve`
      );
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] approveReview error:`, error);
      throw error;
    }
  }

  /**
   * REJECT item (status -> rejected)
   */
  async rejectReview(
    id: number | string,
    comment: string
  ): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.patch<BaseApiResponse<T>>(
        `${this.endpoint}/${id}/reject`,
        { comment }
      );
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] rejectReview error:`, error);
      throw error;
    }
  }
}

export default ReviewableBaseService;
