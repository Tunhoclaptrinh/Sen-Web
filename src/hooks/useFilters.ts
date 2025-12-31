import { useState, useCallback } from 'react';

interface UseFiltersResult<T> {
    filters: T;
    updateFilter: (key: keyof T, value: any) => void;
    updateFilters: (newFilters: Partial<T>) => void;
    setAllFilters: (newFilters: T) => void;
    clearFilters: () => void;
    removeFilter: (key: keyof T) => void;
    hasActiveFilters: () => boolean;
    getActiveFilters: () => Partial<T>;
    activeFilterCount: () => number;
}

export const useFilters = <T extends Record<string, any>>(
    initialFilters: T = {} as T
): UseFiltersResult<T> => {
    const [filters, setFilters] = useState<T>(initialFilters);

    const updateFilter = useCallback((key: keyof T, value: any) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    }, []);

    const updateFilters = useCallback((newFilters: Partial<T>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
        }));
    }, []);

    const setAllFilters = useCallback((newFilters: T) => {
        setFilters(newFilters);
    }, []);

    const clearFilters = useCallback(() => {
        setFilters(initialFilters);
    }, [initialFilters]);

    const removeFilter = useCallback((key: keyof T) => {
        setFilters((prev) => {
            const newFilters = { ...prev };
            delete newFilters[key];
            return newFilters;
        });
    }, []);

    const hasActiveFilters = useCallback(() => {
        return JSON.stringify(filters) !== JSON.stringify(initialFilters);
    }, [filters, initialFilters]);

    const getActiveFilters = useCallback((): Partial<T> => {
        return Object.entries(filters).reduce((acc, [key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                acc[key as keyof T] = value;
            }
            return acc;
        }, {} as Partial<T>);
    }, [filters]);

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
