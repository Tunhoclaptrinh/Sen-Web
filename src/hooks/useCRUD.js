import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

/**
 * ECRUD Hook
 * Tương thích hoàn toàn với BaseController và BaseService backend
 * 
 * Features:
 * - Full CRUD operations (Create, Read, Update, Delete)
 * - Pagination (tương thích backend pagination)
 * - Filtering (theo cấu trúc backend)
 * - Sorting (theo cấu trúc backend)
 * - Searching (theo cấu trúc backend)
 * - Batch operations
 * - Import/Export
 * 
 * @param {Object} service - Service instance (extend từ BaseService)
 * @param {Object} options - Configuration options
 * @returns {Object} CRUD operations and state
 */
export const useCRUD = (service, options = {}) => {
  // State
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);

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
    field: options.defaultSort || 'createdAt',
    order: options.defaultOrder || 'desc',
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  // Options
  const {
    successMessage = {
      create: 'Tạo thành công',
      update: 'Cập nhật thành công',
      delete: 'Xóa thành công',
      import: 'Import thành công',
      export: 'Export thành công',
    },
    errorMessage = {
      fetch: 'Lỗi khi tải dữ liệu',
      create: 'Lỗi khi tạo',
      update: 'Lỗi khi cập nhật',
      delete: 'Lỗi khi xóa',
      import: 'Lỗi khi import',
      export: 'Lỗi khi export',
    },
    autoFetch = false,
    onSuccess,
    onError,
  } = options;

  /**
   * Build query parameters for API
   */
  const buildQueryParams = useCallback(() => {
    const params = {
      _page: pagination.current,
      _limit: pagination.pageSize,
      ...filters,
    };

    // Add sorting
    if (sorter.field) {
      params._sort = sorter.field;
      params._order = sorter.order === 'descend' ? 'desc' : 'asc';
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

        const params = { ...buildQueryParams(), ...customParams };
        const response = await service.getAll(params);

        setData(response.data || []);

        // Update pagination từ backend response
        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            current: response.pagination.page || prev.current,
            pageSize: response.pagination.limit || prev.pageSize,
            total: response.pagination.total || 0,
            totalPages: response.pagination.totalPages || 0,
            hasNext: response.pagination.hasNext || false,
            hasPrev: response.pagination.hasPrev || false,
          }));
        }

        if (onSuccess) onSuccess('fetch', response);
        return response;
      } catch (err) {
        setError(err);
        message.error(errorMessage.fetch);
        if (onError) onError('fetch', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, buildQueryParams, onSuccess, onError, errorMessage.fetch]
  );

  /**
   * Get single item by ID
   */
  const getById = useCallback(
    async (id) => {
      try {
        setLoading(true);
        const response = await service.getById(id);
        if (onSuccess) onSuccess('getById', response);
        return response.data;
      } catch (err) {
        message.error(errorMessage.fetch);
        if (onError) onError('getById', err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [service, onSuccess, onError, errorMessage.fetch]
  );

  /**
   * Create new item
   */
  const create = useCallback(
    async (values) => {
      try {
        setLoading(true);
        const response = await service.create(values);
        message.success(successMessage.create);
        await fetchAll();
        if (onSuccess) onSuccess('create', response);
        return true;
      } catch (err) {
        message.error(errorMessage.create);
        if (onError) onError('create', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, successMessage.create, errorMessage.create, onSuccess, onError]
  );

  /**
   * Update existing item
   */
  const update = useCallback(
    async (id, values) => {
      try {
        setLoading(true);
        const response = await service.update(id, values);
        message.success(successMessage.update);
        await fetchAll();
        if (onSuccess) onSuccess('update', response);
        return true;
      } catch (err) {
        message.error(errorMessage.update);
        if (onError) onError('update', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, successMessage.update, errorMessage.update, onSuccess, onError]
  );

  /**
   * Delete item
   */
  const remove = useCallback(
    async (id) => {
      try {
        setLoading(true);
        await service.delete(id);
        message.success(successMessage.delete);
        await fetchAll();
        if (onSuccess) onSuccess('delete', { id });
        return true;
      } catch (err) {
        message.error(errorMessage.delete);
        if (onError) onError('delete', err);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, successMessage.delete, errorMessage.delete, onSuccess, onError]
  );

  /**
   * Search items
   */
  const search = useCallback(
    async (query) => {
      setSearchTerm(query);
      setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1
    },
    []
  );

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  /**
   * Update filters
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1
  }, []);

  /**
   * Clear filters
   */
  const clearFilters = useCallback(() => {
    setFilters(options.initialFilters || {});
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [options.initialFilters]);

  /**
   * Update sorter
   */
  const updateSorter = useCallback((field, order) => {
    setSorter({ field, order });
    setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1
  }, []);

  /**
   * Handle Ant Design Table onChange
   */
  const handleTableChange = useCallback((newPagination, filters, sorter) => {
    // Update pagination
    setPagination((prev) => ({
      ...prev,
      current: newPagination.current,
      pageSize: newPagination.pageSize,
    }));

    // Update sorter
    if (sorter.field) {
      setSorter({
        field: sorter.field,
        order: sorter.order,
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
    async (ids) => {
      try {
        setLoading(true);
        await service.batch('delete', ids);
        message.success(`Đã xóa ${ids.length} mục`);
        setSelectedIds([]);
        await fetchAll();
        return true;
      } catch (err) {
        message.error('Lỗi khi xóa hàng loạt');
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll]
  );

  /**
   * Export data
   */
  const exportData = useCallback(
    async (format = 'xlsx') => {
      try {
        setLoading(true);
        const params = buildQueryParams();
        const blob = await service.export({ ...params, format });

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `export_${Date.now()}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);

        message.success(successMessage.export);
        return true;
      } catch (err) {
        message.error(errorMessage.export);
        return false;
      } finally {
        setLoading(false);
      }
    },
    [service, buildQueryParams, successMessage.export, errorMessage.export]
  );

  /**
   * Import data
   */
  const importData = useCallback(
    async (file) => {
      try {
        setLoading(true);
        const response = await service.import(file);
        message.success(successMessage.import);
        await fetchAll();
        return response;
      } catch (err) {
        message.error(errorMessage.import);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [service, fetchAll, successMessage.import, errorMessage.import]
  );

  /**
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch, fetchAll]);

  /**
   * Re-fetch when filters, sorter, or search changes
   */
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [filters, sorter, searchTerm, pagination.current, pagination.pageSize]);

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

    // Batch operations
    batchDelete,
    setSelectedIds,

    // Import/Export
    exportData,
    importData,

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