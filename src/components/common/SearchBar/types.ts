import { SizeType } from 'antd/es/config-provider/SizeContext';

export interface FilterOption {
    key: string;
    placeholder?: string;
    value?: any;
    options?: { label: string; value: any }[];
    disabled?: boolean;
    loading?: boolean;
    colSpan?: number;
    width?: number | string;
}

export interface SearchBarProps {
    searchValue?: string;
    onSearchChange?: (value: string) => void;
    onSearch?: (value: string) => void;
    placeholder?: string;
    filters?: FilterOption[];
    onFilterChange?: (key: string, value: any) => void;
    onClearFilters?: () => void;
    size?: SizeType;
    showClearButton?: boolean;
    responsive?: boolean;
    [key: string]: any;
}
