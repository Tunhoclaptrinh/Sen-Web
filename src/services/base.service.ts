import apiClient from "@/config/axios.config";
import type {
  QueryParams,
  BaseApiResponse,
  Pagination,
  ExportParams,
  BatchOperation,
  BatchResult,
  ImportResult,
} from "@/types";

/**
 * Base Service Class
 * Provides CRUD operations with full TypeScript support
 */
class BaseService<T = any, CreateDTO = Partial<T>, UpdateDTO = Partial<T>> {
  protected endpoint: string;

  constructor(endpoint: string) {
    this.endpoint = endpoint;
  }

  /**
   * Build query string from params
   */
  protected buildQueryString(params: QueryParams = {}): string {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params._page || params.page) {
      queryParams.append("_page", String(params._page || params.page));
    }
    if (params._limit || params.limit) {
      queryParams.append("_limit", String(params._limit || params.limit));
    }

    // Sorting
    if (params._sort || params.sort) {
      queryParams.append("_sort", params._sort || params.sort);
    }
    if (params._order || params.order) {
      queryParams.append("_order", params._order || params.order);
    }

    // Search
    if (params.q || params.search) {
      queryParams.append("q", params.q || params.search);
    }

    // Filters
    Object.keys(params).forEach((key) => {
      if (
        ![
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
        ].includes(key)
      ) {
        const value = params[key];
        if (value !== undefined && value !== null && value !== "") {
          queryParams.append(key, String(value));
        }
      }
    });

    return queryParams.toString();
  }

  /**
   * GET all items
   */
  async getAll(params: QueryParams = {}): Promise<BaseApiResponse<T[]>> {
    try {
      const queryString = this.buildQueryString(params);
      const url = queryString
        ? `${this.endpoint}?${queryString}`
        : this.endpoint;

      const response = await apiClient.get<BaseApiResponse<T[]>>(url);

      return {
        success: response.success || true,
        data: response.data || [],
        pagination: response.pagination,
        metadata: response.metadata || response.pagination,
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
        success: response.success || true,
        data: response.data || (response as any),
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
        success: response.success || true,
        data: response.data || (response as any),
        message: response.message || "Created successfully",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] create error:`, error);
      throw error;
    }
  }

  /**
   * UPDATE existing item
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
        success: response.success || true,
        data: response.data || (response as any),
        message: response.message || "Updated successfully",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] update error:`, error);
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
        success: response.success || true,
        message: response.message || "Deleted successfully",
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
        success: response.success || true,
        data: response.data || [],
        pagination: response.pagination,
      };
    } catch (error) {
      console.error(`[${this.endpoint}] search error:`, error);
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
        success: response.success || true,
        data: response.data || (response as any),
        message: response.message || "Updated successfully",
      };
    } catch (error) {
      console.error(`[${this.endpoint}] patch error:`, error);
      throw error;
    }
  }

  /**
   * GET schema
   */
  async getSchema(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.endpoint}/schema`);
      return response.data || response;
    } catch (error) {
      console.warn(`[${this.endpoint}] getSchema not supported`);
      return null;
    }
  }

  /**
   * EXPORT data
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
   * IMPORT data
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
   * BATCH operations
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
   * GET statistics
   */
  async getStats(): Promise<any> {
    try {
      const response = await apiClient.get(`${this.endpoint}/stats/summary`);
      return response.data || response;
    } catch (error) {
      console.warn(`[${this.endpoint}] getStats not supported`);
      return null;
    }
  }

  /**
   * DOWNLOAD template
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
}

export default BaseService;
