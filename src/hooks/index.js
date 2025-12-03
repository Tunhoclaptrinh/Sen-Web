// src/hooks/index.js
/**
 * Centralized export for all custom hooks
 */

// CRUD & Data Management
export { useCRUD } from './useCRUD';
export { useSearch } from './useSearch';
export { useFilters } from './useFilters';
export { usePagination } from './usePagination';

// Auth & User
export { useAuth } from './useAuth';
export { usePermission } from './usePermission';

// Utilities
export { useDebounce } from './useDebounce';
export { useFetch } from './useFetch';
export { useLocalStorage } from './useLocalStorage';