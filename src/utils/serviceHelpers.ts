import { message } from "antd";
import type { BaseApiResponse, QueryParams } from "@/types";

/**
 * Service Helper Utilities
 * Provides common patterns for working with services
 */

/**
 * Handle service call with automatic error handling
 */
export async function handleServiceCall<T>(
  serviceCall: Promise<BaseApiResponse<T>>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showSuccess?: boolean;
    showError?: boolean;
  } = {},
): Promise<T | null> {
  const {
    successMessage,
    errorMessage,
    showSuccess = true,
    showError = true,
  } = options;

  try {
    const response = await serviceCall;

    if (response.success) {
      if (showSuccess && (successMessage || response.message)) {
        message.success(successMessage || response.message || "Thành công");
      }
      return response.data ?? null;
    } else {
      throw new Error(response.message || "Thao tác thất bại");
    }
  } catch (error: any) {
    if (showError) {
      const errMsg =
        error.response?.data?.message ||
        error.message ||
        errorMessage ||
        "Có lỗi xảy ra";
      message.error(errMsg);
    }
    console.error("Service call error:", error);
    return null;
  }
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Handle export with automatic download
 */
export async function handleExport(
  exportCall: Promise<Blob>,
  filename: string,
  options: {
    errorMessage?: string;
  } = {},
): Promise<boolean> {
  try {
    const blob = await exportCall;
    downloadBlob(blob, filename);
    message.success("Xuất file thành công");
    return true;
  } catch (error: any) {
    const errMsg =
      error.response?.data?.message ||
      error.message ||
      options.errorMessage ||
      "Xuất file thất bại";
    message.error(errMsg);
    console.error("Export error:", error);
    return false;
  }
}

/**
 * Handle import with progress feedback
 */
export async function handleImport(
  importCall: Promise<BaseApiResponse<any>>,
  options: {
    successMessage?: string;
    errorMessage?: string;
  } = {},
): Promise<any | null> {
  try {
    const response = await importCall;

    if (response.success) {
      const { success = 0, failed = 0 } = response.data || {};

      if (failed > 0) {
        message.warning(
          options.successMessage ||
            `Import hoàn tất: ${success} thành công, ${failed} thất bại`,
        );
      } else {
        message.success(
          options.successMessage || `Import thành công: ${success} mục`,
        );
      }

      return response.data;
    } else {
      throw new Error(response.message || "Import thất bại");
    }
  } catch (error: any) {
    const errMsg =
      error.response?.data?.message ||
      error.message ||
      options.errorMessage ||
      "Import thất bại";
    message.error(errMsg);
    console.error("Import error:", error);
    return null;
  }
}

/**
 * Build query params for list operations
 */
export function buildListParams(
  page: number,
  pageSize: number,
  filters: Record<string, any> = {},
  sort?: { field: string; order: "asc" | "desc" | "ascend" | "descend" },
): QueryParams {
  const params: QueryParams = {
    _page: page,
    _limit: pageSize,
    ...filters,
  };

  if (sort) {
    params._sort = sort.field;
    // Normalize Ant Design table sort order
    params._order =
      sort.order === "ascend"
        ? "asc"
        : sort.order === "descend"
          ? "desc"
          : sort.order;
  }

  return params;
}

/**
 * Parse pagination from Ant Design table onChange
 */
export function parseTableChange(
  pagination: any,
  filters: any,
  sorter: any,
): {
  page: number;
  pageSize: number;
  filters: Record<string, any>;
  sort?: { field: string; order: "asc" | "desc" };
} {
  const page = pagination.current || 1;
  const pageSize = pagination.pageSize || 10;

  // Parse filters
  const parsedFilters: Record<string, any> = {};
  Object.keys(filters).forEach((key) => {
    const value = filters[key];
    if (value && value.length > 0) {
      parsedFilters[key] = value.length === 1 ? value[0] : value;
    }
  });

  // Parse sorter
  let sort: { field: string; order: "asc" | "desc" } | undefined;
  if (sorter.field) {
    sort = {
      field: Array.isArray(sorter.field)
        ? sorter.field.join(".")
        : sorter.field,
      order: sorter.order === "ascend" ? "asc" : "desc",
    };
  }

  return { page, pageSize, filters: parsedFilters, sort };
}

/**
 * Format error message from API response
 */
export function formatErrorMessage(error: any): string {
  if (typeof error === "string") return error;

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (
    error.response?.data?.errors &&
    Array.isArray(error.response.data.errors)
  ) {
    return error.response.data.errors
      .map((e: any) => e.message || JSON.stringify(e))
      .join(", ");
  }

  if (error.message) {
    return error.message;
  }

  return "Có lỗi xảy ra";
}

/**
 * Batch operation with progress
 */
export async function handleBatchOperation<T>(
  items: T[],
  operation: (item: T) => Promise<any>,
  options: {
    successMessage?: string;
    errorMessage?: string;
    showProgress?: boolean;
  } = {},
): Promise<{ success: number; failed: number; errors: any[] }> {
  const results = {
    success: 0,
    failed: 0,
    errors: [] as any[],
  };

  for (let i = 0; i < items.length; i++) {
    try {
      await operation(items[i]);
      results.success++;

      if (options.showProgress) {
        message.loading(`Đang xử lý: ${i + 1}/${items.length}`, 0.5);
      }
    } catch (error) {
      results.failed++;
      results.errors.push({ index: i, item: items[i], error });
    }
  }

  // Show final message
  if (results.failed > 0) {
    message.warning(
      options.errorMessage ||
        `Hoàn tất: ${results.success} thành công, ${results.failed} thất bại`,
    );
  } else {
    message.success(
      options.successMessage || `Thành công: ${results.success} mục`,
    );
  }

  return results;
}

/**
 * Retry service call with exponential backoff
 */
export async function retryServiceCall<T>(
  serviceCall: () => Promise<T>,
  options: {
    maxRetries?: number;
    initialDelay?: number;
    maxDelay?: number;
    backoffMultiplier?: number;
  } = {},
): Promise<T> {
  const {
    maxRetries = 3,
    initialDelay = 1000,
    maxDelay = 10000,
    backoffMultiplier = 2,
  } = options;

  let lastError: any;
  let delay = initialDelay;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await serviceCall();
    } catch (error) {
      lastError = error;

      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, delay));
        delay = Math.min(delay * backoffMultiplier, maxDelay);
      }
    }
  }

  throw lastError;
}

/**
 * Debounced service call
 */
export function createDebouncedServiceCall<T extends any[], R>(
  serviceCall: (...args: T) => Promise<R>,
  delay: number = 300,
): (...args: T) => Promise<R> {
  let timeoutId: NodeJS.Timeout | null = null;
  let pendingPromise: Promise<R> | null = null;

  return (...args: T): Promise<R> => {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }

    if (!pendingPromise) {
      pendingPromise = new Promise<R>((resolve, reject) => {
        timeoutId = setTimeout(async () => {
          try {
            const result = await serviceCall(...args);
            resolve(result);
          } catch (error) {
            reject(error);
          } finally {
            pendingPromise = null;
            timeoutId = null;
          }
        }, delay);
      });
    }

    return pendingPromise;
  };
}

/**
 * Cache service call results
 */
export function createCachedServiceCall<T extends any[], R>(
  serviceCall: (...args: T) => Promise<R>,
  options: {
    ttl?: number; // Time to live in milliseconds
    keyGenerator?: (...args: T) => string;
  } = {},
): (...args: T) => Promise<R> {
  const {
    ttl = 5 * 60 * 1000,
    keyGenerator = (...args) => JSON.stringify(args),
  } = options;
  const cache = new Map<string, { data: R; timestamp: number }>();

  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args);
    const cached = cache.get(key);

    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }

    const data = await serviceCall(...args);
    cache.set(key, { data, timestamp: Date.now() });

    return data;
  };
}

/**
 * Validate file before upload
 */
export function validateFile(
  file: File,
  options: {
    maxSize?: number; // in bytes
    allowedTypes?: string[];
    allowedExtensions?: string[];
  } = {},
): { valid: boolean; error?: string } {
  const {
    maxSize = 5 * 1024 * 1024, // 5MB default
    allowedTypes = [],
    allowedExtensions = [],
  } = options;

  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File quá lớn. Kích thước tối đa: ${(maxSize / 1024 / 1024).toFixed(1)}MB`,
    };
  }

  // Check MIME type
  if (allowedTypes.length > 0 && !allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Loại file không được hỗ trợ. Cho phép: ${allowedTypes.join(", ")}`,
    };
  }

  // Check file extension
  if (allowedExtensions.length > 0) {
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (!ext || !allowedExtensions.includes(ext)) {
      return {
        valid: false,
        error: `Định dạng file không được hỗ trợ. Cho phép: ${allowedExtensions.join(", ")}`,
      };
    }
  }

  return { valid: true };
}
