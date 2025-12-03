// src/hooks/useCRUD.js
import { useState, useCallback, useEffect } from 'react';
import { message } from 'antd';

/**
 * Universal CRUD Hook
 * Tái sử dụng cho mọi entity (Heritage, Artifact, User, v.v.)
 * 
 * @param {Object} service - Service instance (heritageService, artifactService, etc.)
 * @param {Object} options - Configuration options
 * @returns {Object} CRUD operations and state
 */
export const useCRUD = (service, options = {}) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: options.pageSize || 10,
    total: 0,
  });

  const {
    successMessage = {
      create: 'Tạo thành công',
      update: 'Cập nhật thành công',
      delete: 'Xóa thành công',
    },
    errorMessage = {
      fetch: 'Lỗi khi tải dữ liệu',
      create: 'Lỗi khi tạo',
      update: 'Lỗi khi cập nhật',
      delete: 'Lỗi khi xóa',
    },
    autoFetch = false,
    onSuccess,
    onError,
  } = options;

  /**
   * Fetch all items
   */
  const fetchAll = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        setError(null);

        const response = await service.getAll({
          _page: pagination.current,
          _limit: pagination.pageSize,
          ...params,
        });

        setData(response.data || []);

        if (response.pagination) {
          setPagination((prev) => ({
            ...prev,
            total: response.pagination.total || 0,
            current: response.pagination.page || prev.current,
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
    [service, pagination.current, pagination.pageSize, onSuccess, onError]
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
    [service, fetchAll, onSuccess, onError]
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
    [service, fetchAll, onSuccess, onError]
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
    [service, fetchAll, onSuccess, onError]
  );

  /**
   * Refresh data
   */
  const refresh = useCallback(() => {
    return fetchAll();
  }, [fetchAll]);

  /**
   * Handle pagination change (for Ant Design Table)
   */
  const handleTableChange = useCallback((newPagination, filters, sorter) => {
    setPagination({
      current: newPagination.current,
      pageSize: newPagination.pageSize,
      total: newPagination.total,
    });
  }, []);

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
   * Auto-fetch on mount if enabled
   */
  useEffect(() => {
    if (autoFetch) {
      fetchAll();
    }
  }, [autoFetch]);

  return {
    // Data
    data,
    loading,
    error,
    pagination,

    // Actions
    fetchAll,
    create,
    update,
    remove,
    refresh,

    // Pagination helpers
    handleTableChange,
    resetPagination,

    // State setters
    setData,
    setLoading,
    setError,
    setPagination,
  };
};

export default useCRUD;