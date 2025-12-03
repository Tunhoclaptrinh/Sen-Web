// src/hooks/usePagination.js
import { useState, useCallback, useMemo } from 'react';

/**
 * Pagination Hook
 * Quản lý state và operations cho pagination
 * 
 * @param {number} initialPage - Initial page number (default: 1)
 * @param {number} initialPageSize - Initial page size (default: 10)
 * @returns {Object} Pagination state and functions
 */
export const usePagination = (initialPage = 1, initialPageSize = 10) => {
  const [page, setPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(0);

  /**
   * Go to specific page
   */
  const goToPage = useCallback((newPage) => {
    setPage(newPage);
  }, []);

  /**
   * Change page size
   */
  const changePageSize = useCallback((newPageSize) => {
    setPageSize(newPageSize);
    setPage(1); // Reset to first page when changing page size
  }, []);

  /**
   * Go to next page
   */
  const nextPage = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  /**
   * Go to previous page
   */
  const prevPage = useCallback(() => {
    setPage((prev) => Math.max(1, prev - 1));
  }, []);

  /**
   * Go to first page
   */
  const firstPage = useCallback(() => {
    setPage(1);
  }, []);

  /**
   * Go to last page
   */
  const lastPage = useCallback(() => {
    const totalPages = Math.ceil(total / pageSize);
    setPage(totalPages);
  }, [total, pageSize]);

  /**
   * Reset pagination to initial state
   */
  const reset = useCallback(() => {
    setPage(initialPage);
    setPageSize(initialPageSize);
    setTotal(0);
  }, [initialPage, initialPageSize]);

  /**
   * Calculate total pages
   */
  const totalPages = useMemo(() => {
    return Math.ceil(total / pageSize);
  }, [total, pageSize]);

  /**
   * Check if has next page
   */
  const hasNext = useMemo(() => {
    return page < totalPages;
  }, [page, totalPages]);

  /**
   * Check if has previous page
   */
  const hasPrev = useMemo(() => {
    return page > 1;
  }, [page]);

  /**
   * Get current page range (e.g., "1-10 of 100")
   */
  const pageRange = useMemo(() => {
    const start = (page - 1) * pageSize + 1;
    const end = Math.min(page * pageSize, total);
    return { start, end, total };
  }, [page, pageSize, total]);

  /**
   * Format for Ant Design Table pagination
   */
  const antdPagination = useMemo(() => {
    return {
      current: page,
      pageSize: pageSize,
      total: total,
      showSizeChanger: true,
      showQuickJumper: true,
      showTotal: (total) => `Tổng ${total} mục`,
      pageSizeOptions: ['10', '20', '50', '100'],
    };
  }, [page, pageSize, total]);

  /**
   * Handle Ant Design Table onChange
   */
  const handleTableChange = useCallback((pagination) => {
    setPage(pagination.current);
    setPageSize(pagination.pageSize);
  }, []);

  return {
    // Current state
    page,
    pageSize,
    total,
    totalPages,
    hasNext,
    hasPrev,
    pageRange,

    // Setters
    setPage,
    setPageSize,
    setTotal,

    // Actions
    goToPage,
    changePageSize,
    nextPage,
    prevPage,
    firstPage,
    lastPage,
    reset,

    // Ant Design helpers
    antdPagination,
    handleTableChange,
  };
};

export default usePagination;