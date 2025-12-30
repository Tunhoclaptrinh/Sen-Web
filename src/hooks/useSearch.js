// src/hooks/useSearch.js
import { useState, useCallback, useEffect } from 'react';
import { useDebounce } from './useDebounce';

/**
 * Search Hook with debouncing
 * 
 * @param {Object} service - Service instance
 * @param {number} debounceMs - Debounce delay in milliseconds
 * @param {Object} options - Configuration options
 * @returns {Object} Search state and functions
 */
export const useSearch = (service, debounceMs = 500, options = {}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const {
    minLength = 2,
    autoSearch = true,
    onSuccess,
    onError,
  } = options;

  const debouncedSearchTerm = useDebounce(searchTerm, debounceMs);

  /**
   * Execute search
   */
  const search = useCallback(
    async (term = searchTerm, params = {}) => {
      // Validate search term
      if (!term || term.length < minLength) {
        setResults([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const response = await service.search(term, params);
        setResults(response.data || []);

        if (onSuccess) onSuccess(response);
        return response;
      } catch (err) {
        console.error('Search error:', err);
        setError(err);
        setResults([]);
        if (onError) onError(err);
      } finally {
        setLoading(false);
      }
    },
    [service, searchTerm, minLength, onSuccess, onError]
  );

  /**
   * Clear search
   */
  const clearSearch = useCallback(() => {
    setSearchTerm('');
    setResults([]);
    setError(null);
  }, []);

  /**
   * Auto-search when debounced term changes
   */
  useEffect(() => {
    if (autoSearch && debouncedSearchTerm) {
      search(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm, autoSearch]);

  return {
    searchTerm,
    setSearchTerm,
    results,
    loading,
    error,
    search,
    clearSearch,
  };
};

export default useSearch;