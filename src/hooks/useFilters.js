// src/hooks/useFilters.js
import { useState, useCallback } from 'react';

/**
 * Filters Hook
 * Quản lý state và operations cho filters
 * 
 * @param {Object} initialFilters - Initial filter values
 * @returns {Object} Filter state and functions
 */
export const useFilters = (initialFilters = {}) => {
  const [filters, setFilters] = useState(initialFilters);

  /**
   * Update single filter
   */
  const updateFilter = useCallback((key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  /**
   * Update multiple filters at once
   */
  const updateFilters = useCallback((newFilters) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
    }));
  }, []);

  /**
   * Replace all filters
   */
  const setAllFilters = useCallback((newFilters) => {
    setFilters(newFilters);
  }, []);

  /**
   * Clear all filters (reset to initial)
   */
  const clearFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  /**
   * Remove specific filter
   */
  const removeFilter = useCallback((key) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  /**
   * Check if filters are active (not equal to initial)
   */
  const hasActiveFilters = useCallback(() => {
    return JSON.stringify(filters) !== JSON.stringify(initialFilters);
  }, [filters, initialFilters]);

  /**
   * Get active filters (filters with values)
   */
  const getActiveFilters = useCallback(() => {
    return Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        acc[key] = value;
      }
      return acc;
    }, {});
  }, [filters]);

  /**
   * Count active filters
   */
  const activeFilterCount = useCallback(() => {
    return Object.keys(getActiveFilters()).length;
  }, [getActiveFilters]);

  return {
    filters,
    updateFilter,
    updateFilters,
    setAllFilters,
    clearFilters,
    removeFilter,
    hasActiveFilters,
    getActiveFilters,
    activeFilterCount,
  };
};

export default useFilters;