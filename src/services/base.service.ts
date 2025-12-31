import apiClient from "@/config/axios.config";
import type {
  QueryParams,
  BaseApiResponse,

  ExportParams,

  BatchResult,
  ImportResult,
} from "@/types";

/**
 * Base Service Class
 * Provides complete CRUD operations with full TypeScript support
 *
 * @template T - Entity type
 * @template CreateDTO - Create data transfer object type
 * @template UpdateDTO - Update data transfer object type
 */
class BaseService<T = any, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Build query string from params
   * Supports both backend formats (_page, _limit) and frontend formats (page, limit)
   */
  protected buildQueryString(params: QueryParams = {}): string {
    const queryParams = new URLSearchParams();

    // Pagination - support both formats
    const page = params._page || params.page;
    const limit = params._limit || params.limit;

    if (page) queryParams.append("_page", String(page));
    if (limit) queryParams.append("_limit", String(limit));

    // Sorting - support both formats
    const sort = params._sort || params.sort;
    const order = params._order || params.order;

    if (sort) queryParams.append("_sort", sort);
    if (order) {
      // Normalize order format
      const normalizedOrder =
        order === "ascend" ? "asc" : order === "descend" ? "desc" : order;
      queryParams.append("_order", normalizedOrder);
    }

    // Search - support both formats
    const search = params.q || params.search;
    if (search) queryParams.append("q", search);

    // Filters - add all other params
    const excludedKeys = [
      "_page",
      "_limit",
      "_sort",
      "_order",
      "q",
      "page",
      "limit",
      "sort",
      "order",
      "search",
    ];

    Object.entries(params).forEach(([key, value]) => {
      if (!excludedKeys.includes(key)) {
        if (value !== undefined && value !== null && value !== "") {
          // Handle array values
          if (Array.isArray(value)) {
            value.forEach((v) => queryParams.append(key, String(v)));
          } else {
            queryParams.append(key, String(value));
          }
        }
      }
    });

    return queryParams.toString();
  }

  /**
   * Protected HTTP helper methods for child services
   * These allow child services to make custom API calls while maintaining consistency
   */

  /**
   * Protected GET request
   */
  protected async get<T = any>(path: string, params?: QueryParams): Promise<T> {
    try {
      const queryString = params ? this.buildQueryString(params) : '';
      const url = queryString ? `${this.endpoint}${path}?${queryString}` : `${this.endpoint}${path}`;

      const response = await apiClient.get<T>(url);
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] GET ${path} error:`, error);
      throw error;
    }
  }

  /**
   * Protected POST request
   */
  protected async post<T = any>(path: string, data?: any): Promise<T> {
    try {
      const url = `${this.endpoint}${path}`;
      const response = await apiClient.post<T>(url, data);
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] POST ${path} error:`, error);
      throw error;
    }
  }

  /**
   * Protected PUT request
   */
  protected async put<T = any>(path: string, data?: any): Promise<T> {
    try {
      const url = `${this.endpoint}${path}`;
      const response = await apiClient.put<T>(url, data);
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] PUT ${path} error:`, error);
      throw error;
    }
  }

  /**
   * Protected PATCH request
   */
  protected async patchRequest<T = any>(path: string, data?: any): Promise<T> {
    try {
      const url = `${this.endpoint}${path}`;
      const response = await apiClient.patch<T>(url, data);
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] PATCH ${path} error:`, error);
      throw error;
    }
  }

  /**
   * Protected DELETE request
   */
  protected async deleteRequest<T = any>(path: string): Promise<T> {
    try {
      const url = `${this.endpoint}${path}`;
      const response = await apiClient.delete<T>(url);
      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] DELETE ${path} error:`, error);
      throw error;
    }
  }


  /**
   * GET all items with pagination and filtering
   */
  async getAll(params: QueryParams = {}): Promise<BaseApiResponse<T[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}?${queryString}`
        : this.endpoint;

      const response = await apiClient.get<BaseApiResponse<T[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        pagination: response.pagination,
        metadata: response.metadata ?? response.pagination,
      };
    } catch (error) {
      console.error(`[${this.endpoint}] getAll error:`, error);
      throw error;
    }
  }

  /**
   * GET single item by ID
   */
  async getById(id: number | string): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.get<BaseApiResponse<T>>(
        `${this.endpoint}/${id}`,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
      };
    } catch (error) {
      console.error(`[${this.endpoint}] getById error:`, error);
      throw error;
    }
  }

  /**
   * CREATE new item
   */
  async create(data: CreateDTO): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.post<BaseApiResponse<T>>(
        this.endpoint,
        data,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Tạo thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] create error:`, error);
      throw error;
    }
  }

  /**
   * UPDATE existing item (full update)
   */
  async update(
    id: number | string,
    data: UpdateDTO,
  ): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.put<BaseApiResponse<T>>(
        `${this.endpoint}/${id}`,
        data,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Cập nhật thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] update error:`, error);
      throw error;
    }
  }

  /**
   * PATCH item (partial update)
   */
  async patch(
    id: number | string,
    data: Partial<UpdateDTO>,
  ): Promise<BaseApiResponse<T>> {
    try {
      const response = await apiClient.patch<BaseApiResponse<T>>(
        `${this.endpoint}/${id}`,
        data,
      );

      return {
        success: response.success ?? true,
        data: response.data ?? (response as any),
        message: response.message ?? "Cập nhật thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] patch error:`, error);
      throw error;
    }
  }

  /**
   * DELETE item
   */
  async delete(id: number | string): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.delete<BaseApiResponse<void>>(
        `${this.endpoint}/${id}`,
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Xóa thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] delete error:`, error);
      throw error;
    }
  }

  /**
   * SEARCH items
   */
  async search(
    query: string,
    params: QueryParams = {},
  ): Promise<BaseApiResponse<T[]>> {
    try {
      const searchParams: QueryParams = {
        q: query,
        ...params,
      };

      const queryString = this.buildQueryString(searchParams);
      const url = `${this.endpoint}/search?${queryString}`;

      const response = await apiClient.get<BaseApiResponse<T[]>>(url);

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error(`[${this.endpoint}] search error:`, error);
      throw error;
    }
  }

  /**
   * GET schema definition
   */
  async getSchema(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.endpoint}/schema`);
      return response.data ?? response;
    } catch (error) {
      console.warn(`[${this.endpoint}] getSchema not supported`);
      return null;
    }
  }

  /**
   * EXPORT data to file
   */
  async export(params: ExportParams = {}): Promise<Blob> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/export?${queryString}`
        : `${this.endpoint}/export`;

      const response = await apiClient.get(url, {
        responseType: "blob",
      });

      return response as unknown as Blob;
    } catch (error) {
      console.error(`[${this.endpoint}] export error:`, error);
      throw error;
    }
  }

  /**
   * IMPORT data from file
   */
  async import(file: File): Promise<BaseApiResponse<ImportResult>> {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post<BaseApiResponse<ImportResult>>(
        `${this.endpoint}/import`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );

      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] import error:`, error);
      throw error;
    }
  }

  /**
   * BATCH operations (create/update/delete multiple items)
   */
  async batch<ItemType = T>(
    operation: "create" | "update" | "delete",
    items: ItemType[],
  ): Promise<BaseApiResponse<BatchResult>> {
    try {
      const response = await apiClient.post<BaseApiResponse<BatchResult>>(
        `${this.endpoint}/batch`,
        {
          operation,
          items,
        },
      );

      return response;
    } catch (error) {
      console.error(`[${this.endpoint}] batch error:`, error);
      throw error;
    }
  }

  /**
   * GET statistics summary
   */
  async getStats(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats/summary`);
      return response.data ?? response;
    } catch (error) {
      console.warn(`[${this.endpoint}] getStats not supported`);
      return null;
    }
  }

  /**
   * DOWNLOAD import template
   */
  async downloadTemplate(): Promise<Blob> {
    try {
      const response = await apiClient.get(`${this.endpoint}/template`, {
        responseType: "blob",
      });
      return response as unknown as Blob;
    } catch (error) {
      console.error(`[${this.endpoint}] downloadTemplate error:`, error);
      throw error;
    }
  }

  /**
   * VALIDATE data before create/update
   */
  async validate(
    data: CreateDTO | UpdateDTO,
  ): Promise<{ valid: boolean; errors?: any[] }> {
    try {
      const response = await apiClient.post(`${this.endpoint}/validate`, data);
      return response.data ?? { valid: true };
    } catch (error) {
      console.warn(`[${this.endpoint}] validate not supported`);
      return { valid: true };
    }
  }

  /**
   * COUNT items with filters
   */
  async count(params: QueryParams = {}): Promise<number> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}/count?${queryString}`
        : `${this.endpoint}/count`;

      const response = await apiClient.get<{ count: number }>(url);
      return response.count ?? 0;
    } catch (error) {
      console.warn(`[${this.endpoint}] count not supported`);
      return 0;
    }
  }

  /**
   * CHECK if item exists
   */
  async exists(id: number | string): Promise<boolean> {
    try {
      await this.getById(id);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * BULK CREATE multiple items
   */
  async bulkCreate(items: CreateDTO[]): Promise<BaseApiResponse<T[]>> {
    try {
      const response = await apiClient.post<BaseApiResponse<T[]>>(
        `${this.endpoint}/bulk`,
        { items },
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message ?? "Tạo hàng loạt thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] bulkCreate error:`, error);
      throw error;
    }
  }

  /**
   * BULK UPDATE multiple items
   */
  async bulkUpdate(
    updates: Array<{ id: number | string; data: UpdateDTO }>,
  ): Promise<BaseApiResponse<T[]>> {
    try {
      const response = await apiClient.put<BaseApiResponse<T[]>>(
        `${this.endpoint}/bulk`,
        { updates },
      );

      return {
        success: response.success ?? true,
        data: response.data ?? [],
        message: response.message ?? "Cập nhật hàng loạt thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] bulkUpdate error:`, error);
      throw error;
    }
  }

  /**
   * BULK DELETE multiple items
   */
  async bulkDelete(ids: (number | string)[]): Promise<BaseApiResponse<void>> {
    try {
      const response = await apiClient.post<BaseApiResponse<void>>(
        `${this.endpoint}/bulk/delete`,
        { ids },
      );

      return {
        success: response.success ?? true,
        message: response.message ?? "Xóa hàng loạt thành công",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] bulkDelete error:`, error);
      throw error;
    }
  }
}

export default BaseService;
