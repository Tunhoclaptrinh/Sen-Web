import {useState, useCallback, useEffect, useRef} from "react";
import {message} from "antd";

/**
 * ECRUD Hook
 * Tương thích hoàn toàn với BaseController và BaseService backend
 *
 * @param service - Service instance (extend từ BaseService)
 * @param options - Configuration options
 * @returns CRUD operations and state
 */
export const useCRUD = (service: any, options: any = {}) => {
  // State
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<any[]>([]);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: options.pageSize || 10,
    total: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false,
  });

  // Filter state
  const [filters, setFilters] = useState(options.initialFilters || {});

  // Sort state
  const [sorter, setSorter] = useState({
    field: options.defaultSort || "createdAt",
    order: options.defaultOrder || "desc",
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState("");

  // Memoize options to prevent de-structuring from creating new object references
  const {autoFetch = false, onSuccess, onError} = options;

  const fetchErrorMessage = options.errorMessage?.fetch || "Lỗi khi tải dữ liệu";
  const createSuccessMessage = options.successMessage?.create || "Tạo thành công";
  const updateSuccessMessage = options.successMessage?.update || "Cập nhật thành công";
  const deleteSuccessMessage = options.successMessage?.delete || "Xóa thành công";
  const importSuccessMessage = options.successMessage?.import || "Import thành công";
  const exportSuccessMessage = options.successMessage?.export || "Export thành công";

  const fetchErrorMessageRef = useRef(fetchErrorMessage);
  const createErrorMessage = options.errorMessage?.create || "Lỗi khi tạo";
  const updateErrorMessage = options.errorMessage?.update || "Lỗi khi cập nhật";
  const deleteErrorMessage = options.errorMessage?.delete || "Lỗi khi xóa";
  const importErrorMessage = options.errorMessage?.import || "Lỗi khi import";
  const exportErrorMessage = options.errorMessage?.export || "Lỗi khi export";

  useEffect(() => {
    fetchErrorMessageRef.current = fetchErrorMessage;
  }, [fetchErrorMessage]);

  // Use refs for callbacks to prevent re-renders when they change
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onSuccessRef.current = onSuccess;
    onErrorRef.current = onError;
  }, [onSuccess, onError]);

  // Update filters when initialFilters changes (deeply)
  const initialFiltersStr = JSON.stringify(options.initialFilters || {});
  useEffect(() => {
    setFilters((prev: any) => {
      if (JSON.stringify(prev) === initialFiltersStr) return prev;
      return options.initialFilters || {};
    });
    setPagination((prev) => {
      if (prev.current === 1) return prev;
      return {...prev, current: 1};
    });
  }, [initialFiltersStr]);

  /**
   * Build query parameters for API
   */
  const buildQueryParams = useCallback(() => {
    const params: any = {
      _page: pagination.current,
      _limit: pagination.pageSize,
    };

    // Process filters
    Object.keys(filters).forEach((key) => {
      const value = filters[key];
      if (Array.isArray(value)) {
        // Handle special operators like _like (search) which shouldn't use _in
        if (key.includes("_like") || key.includes("_ilike")) {
          // Safety check: if array is empty or value[0] is empty, don't set param
          if (value.length > 0 && value[0]) {
            params[key] = value[0];
          }
        }
        // For other filters (typically select/checkbox), use _in for multiple values
        else if (value.length > 0) {
          params[`${key}_in`] = value.join(",");
        }
      } else {
        params[key] = value;
      }
    });

    // Clean up undefined params (crucial for clearing filters)
    Object.keys(params).forEach((key) => {
      if (params[key] === undefined || params[key] === null || params[key] === "") {
        delete params[key];
      }
    });

    // Add sorting
    if (sorter.field) {
      params._sort = sorter.field;
      params._order = sorter.order === "descend" ? "desc" : "asc";
    }

    // Add search
    if (searchTerm) {
      params.q = searchTerm;
    }

    return params;
  }, [pagination.current, pagination.pageSize, filters, sorter, searchTerm]);

  /**
   * Fetch all items
   */
  const fetchAll = useCallback(
    async (customParams = {}) => {
      try {
        setLoading(true);
        setError(null);

        const params = {...buildQueryParams(), ...customParams};
        const response = await service.getAll(params);

        setData(response.data || []);

        // Update pagination từ backend response
        if (response.pagination) {
          const {page, limit, total, totalPages, hasNext, hasPrev} = response.pagination;
          setPagination((prev) => {
            // Use backend values or fall back to current values to determine if an actual change occurred
            const nextCurrent = page !== undefined ? page : prev.current;
            const nextPageSize = limit !== undefined ? limit : prev.pageSize;
            const nextTotal = total !== undefined ? total : prev.total;
            const nextTotalPages = totalPages !== undefined ? totalPages : prev.totalPages;
            const nextHasNext = hasNext !== undefined ? hasNext : prev.hasNext;
            const nextHasPrev = hasPrev !== undefined ? hasPrev : prev.hasPrev;

            // Deep bailout: if all values would result in no change, return previous state identity
            if (
              prev.current === nextCurrent &&
              prev.pageSize === nextPageSize &&
              prev.total === nextTotal &&
              prev.totalPages === nextTotalPages &&
              prev.hasNext === nextHasNext &&
              prev.hasPrev === nextHasPrev
            ) {
              return prev;
            }

            return {
              ...prev,
              current: nextCurrent,
              pageSize: nextPageSize,
              total: nextTotal,
              totalPages: nextTotalPages,
              hasNext: nextHasNext,
              hasPrev: nextHasPrev,
            };
          });
        }

        if (onSuccessRef.current) onSuccessRef.current("fetch", response);
        return response;
      } catch (err) {
        setError(err);
        message.error(fetchErrorMessage);
        if (onErrorRef.current) onErrorRef.current("fetch", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, buildQueryParams, fetchErrorMessage],
  );

  /**
   * Get single item by ID
   */
  const getById = useCallback(
    async (id: any) => {
      try {
        setLoading(true);
        const response = await service.getById(id);
        if (onSuccessRef.current) onSuccessRef.current("getById", response);
        return response.data;
      } catch (err) {
        message.error(fetchErrorMessage);
        if (onErrorRef.current) onErrorRef.current("getById", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchErrorMessage],
  );

  /**
   * Create new item
   */
  const create = useCallback(
    async (values: any) => {
      try {
        setLoading(true);
        const response = await service.create(values);
        message.success(createSuccessMessage);
        await fetchAll();
        if (onSuccess) onSuccess("create", response);
        return true;
      } catch (err) {
        message.error(createErrorMessage);
        if (onError) onError("create", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, createSuccessMessage, createErrorMessage, onSuccess, onError],
  );

  /**
   * Update existing item
   */
  const update = useCallback(
    async (id: any, values: any) => {
      try {
        setLoading(true);
        const response = await service.update(id, values);
        message.success(updateSuccessMessage);
        await fetchAll();
        if (onSuccess) onSuccess("update", response);
        return true;
      } catch (err) {
        message.error(updateErrorMessage);
        if (onError) onError("update", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, updateSuccessMessage, updateErrorMessage, onSuccess, onError],
  );

  /**
   * Delete item
   */
  const remove = useCallback(
    async (id: any) => {
      try {
        setLoading(true);
        await service.delete(id);
        message.success(deleteSuccessMessage);
        await fetchAll();
        if (onSuccess) onSuccess("delete", {id});
        return true;
      } catch (err) {
        message.error(deleteErrorMessage);
        if (onError) onError("delete", err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, deleteSuccessMessage, deleteErrorMessage, onSuccess, onError],
  );

  /**
   * Search items
   */
  const search = useCallback(async (query: string) => {
    setSearchTerm(query);
    setPagination((prev) => ({...prev, current: 1})); // Reset to page 1
  }, []);

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchTerm("");
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters: any) => {
    setFilters((prev: any) => {
      const hasChange = Object.keys(newFilters).some((key) => prev[key] !== newFilters[key]);
      if (!hasChange) return prev;
      return {...prev, ...newFilters};
    });
    setPagination((prev) => {
      if (prev.current === 1) return prev;
      return {...prev, current: 1};
    });
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters(options.initialFilters || {});
    setPagination((prev) => ({...prev, current: 1}));
  }, [initialFiltersStr, options.initialFilters]);

  /**
   * Update sorter
   */
  const updateSorter = useCallback((field: string, order: string) => {
    setSorter({field, order});
    setPagination((prev) => ({...prev, current: 1})); // Reset to page 1
  }, []);

  /**
   * Handle Ant Design Table onChange
   */
  const handleTableChange = useCallback((newPagination: any, newFilters: any, sorter: any) => {
    // Update pagination
    setPagination((prev) => {
      // Bail out if values are identical
      if (prev.current === newPagination.current && prev.pageSize === newPagination.pageSize) {
        return prev;
      }
      return {
        ...prev,
        current: newPagination.current,
        pageSize: newPagination.pageSize,
      };
    });

    // Update filters
    if (newFilters) {
      setFilters((prev: any) => {
        const updated = {...prev};
        let hasChanged = false;

        Object.keys(newFilters).forEach((key) => {
          const val = newFilters[key];
          const currentVal = prev[key];

          // Simple comparison for AntD filter arrays
          const isValEmpty = !val || (Array.isArray(val) && val.length === 0);
          const isCurrentEmpty = !currentVal || (Array.isArray(currentVal) && currentVal.length === 0);

          if (isValEmpty && isCurrentEmpty) return;

          if (JSON.stringify(val) !== JSON.stringify(currentVal)) {
            hasChanged = true;
            if (!isValEmpty) {
              updated[key] = val;
            } else {
              delete updated[key];
            }
          }
        });

        return hasChanged ? updated : prev;
      });
    }

    // Update sorter
    if (sorter.field) {
      setSorter((prev) => {
        if (prev.field === sorter.field && prev.order === sorter.order) return prev;
        return {
          field: sorter.field as string,
          order: sorter.order as string,
        };
      });
    }
  }, []);

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    return fetchAll();
  }, [fetchAll]);

  /**
   * Reset pagination to page 1
   */
  const resetPagination = useCallback(() => {
    setPagination((prev) => ({
      ...prev,
      current: 1,
    }));
  }, []);

  /**
   * Batch delete
   */
  const batchDelete = useCallback(
    async (ids: any[]) => {
      try {
        setLoading(true);
        // Use Promise.all for individual deletes as requested
        await Promise.all(ids.map((id) => service.delete(id)));
        message.success(`Đã xóa ${ids.length} mục`);
        setSelectedIds([]);
        await fetchAll();
        return true;
      } catch (err) {
        message.error("Lỗi khi xóa hàng loạt");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll],
  );

  /**
   * Export data
   */
  /**
   * Export data
   */
  const exportData = useCallback(
    async (options: any = "xlsx", ids: any[] = []) => {
      try {
        setLoading(true);
        let params: any = {};

        // Determine format and scope from options
        // Backward compatibility: if options is string, treat as format only (default scope=page)
        const format = typeof options === "string" ? options : options.format || "xlsx";
        const scope = typeof options === "object" ? options.scope || "page" : "page";
        const limit = typeof options === "object" ? options.limit : undefined;

        // If specific IDs are provided (Batch Export), use them exclusively
        if (ids && ids.length > 0) {
          params = {
            id_in: ids.join(","),
            format,
          };
        } else {
          // Decide which filters to use: options.filters (from Ad-hoc Export) or current URL params
          let baseParams = {};
          if (options.filters) {
            // Build params manually from options.filters object if provided
            baseParams = {...options.filters};
          } else {
            // Fallback to current table filters
            baseParams = buildQueryParams();
          }

          // Otherwise construct params based on scope
          if (scope === "all") {
            // Export ALL: use filter params but REMOVE pagination
            const {_page, _limit, ...rest} = baseParams as any;
            params = {...rest, format};
            params._limit = -1;
          } else if (scope === "custom") {
            // Custom Limit: use filters but override limit
            const {_page, ...rest} = baseParams as any;
            params = {...rest, _limit: limit, _page: 1, format};
          } else {
            // scope === 'page'
            // Current Page: use exactly what's provided (including pagination if it came from buildQueryParams, or default if ad-hoc)
            params = {...baseParams, format};
            // If ad-hoc filters were used, they don't have pagination params, so we might need defaults?
            // Actually 'page' scope implies "Current visible page".
            // If we changed filters ad-hoc, "Current Page" concept is vague.
            // Let's assume for ad-hoc, "page" means "First Page" unless specified.
          }
        }

        const blob = await (service.exportCollection
          ? service.exportCollection(params)
          : service.export
            ? service.export(params)
            : null);

        if (!blob) throw new Error("Export function not found");

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `export_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        message.success(exportSuccessMessage);
        return true;
      } catch (err) {
        console.error("Export error", err);
        message.error(exportErrorMessage);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, buildQueryParams, exportSuccessMessage, exportErrorMessage],
  );

  /**
   * Import data
   */
  const importData = useCallback(
    async (file: any) => {
      try {
        setLoading(true);
        const response = await service.import(file);
        message.success(importSuccessMessage);
        await fetchAll();
        return response;
      } catch (err) {
        message.error(importErrorMessage);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, importSuccessMessage, importErrorMessage],
  );
  /**
   * Download template
   */
  const downloadTemplate = useCallback(async () => {
    try {
      setLoading(true);
      if (service.downloadTemplate) {
        const blob = await service.downloadTemplate();
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `import_template.xlsx`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        message.success("Tải mẫu thành công");
      } else {
        message.warning("Chức năng chưa được hỗ trợ");
      }
    } catch (err) {
      message.error("Tải mẫu thất bại");
    } finally {
      setLoading(false);
    }
  }, [service]);

  const submitReview = useCallback(
    async (id: any) => {
      try {
        setLoading(true);
        await service.submitReview(id);
        message.success("Gửi duyệt thành công");
        await fetchAll();
        return true;
      } catch (err) {
        message.error("Gửi duyệt thất bại");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll],
  );

  const approveReview = useCallback(
    async (id: any) => {
      try {
        setLoading(true);
        await service.approveReview(id);
        message.success("Phê duyệt thành công");
        await fetchAll();
        return true;
      } catch (err) {
        message.error("Phê duyệt thất bại");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll],
  );

  const rejectReview = useCallback(
    async (id: any, comment: string) => {
      try {
        setLoading(true);
        await service.rejectReview(id, comment);
        message.success("Đã từ chối bản ghi");
        await fetchAll();
        return true;
      } catch (err) {
        message.error("Thao tác thất bại");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll],
  );

  const revertReview = useCallback(
    async (id: any) => {
      try {
        setLoading(true);
        await service.revertReview(id);
        message.success("Đã hoàn về bản nháp");
        await fetchAll();
        return true;
      } catch (err) {
        message.error("Thao tác thất bại");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll],
  );

  const requestUnpublish = useCallback(
    async (id: any, reason: string) => {
      try {
        setLoading(true);
        await service.requestUnpublish(id, reason);
        message.success("Đã gửi yêu cầu gỡ bài");
        await fetchAll();
        return true;
      } catch (err) {
        message.error("Gửi yêu cầu thất bại");
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll],
  );

  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  return {
    // Data
    data,
    loading,
    error,
    selectedIds,

    // Pagination
    pagination,
    setPagination,

    // Filters
    filters,
    updateFilters,
    clearFilters,

    // Sorter
    sorter,
    updateSorter,

    // Search
    searchTerm,
    search,
    clearSearch,

    // CRUD Actions
    fetchAll,
    getById,
    create,
    update,
    remove,
    refresh,

    // Review Actions
    submitReview: typeof service.submitReview === "function" ? submitReview : undefined,
    approveReview: typeof service.approveReview === "function" ? approveReview : undefined,
    rejectReview: typeof service.rejectReview === "function" ? rejectReview : undefined,
    revertReview: typeof service.revertReview === "function" ? revertReview : undefined,
    requestUnpublish: typeof service.requestUnpublish === "function" ? requestUnpublish : undefined,

    // Batch operations
    batchDelete,
    setSelectedIds,

    // Import/Export
    exportData,
    importData,
    downloadTemplate,

    // Table helpers
    handleTableChange,
    resetPagination,

    // State setters
    setData,
    setLoading,
    setError,
  };
};

export default useCRUD;
