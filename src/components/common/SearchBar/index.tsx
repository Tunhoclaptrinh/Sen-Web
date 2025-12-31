// src/components/common/SearchBar/index.tsx
import React from 'react';
import { Input, Select, Space, Button, Row, Col } from 'antd';
import {
  SearchOutlined,
  ClearOutlined,
} from '@ant-design/icons';
import { SizeType } from 'antd/es/config-provider/SizeContext';

interface FilterOption {
  key: string;
  placeholder?: string;
  value?: any;
  options?: { label: string; value: any }[];
  disabled?: boolean;
  loading?: boolean;
  colSpan?: number;
  width?: number | string;
}

interface SearchBarProps {
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

/**
 * Universal Search Bar Component
 * Reusable search bar with filters
 */
const SearchBar: React.FC<SearchBarProps> = ({
  // Search
  searchValue = '',
  onSearchChange,
  onSearch,
  placeholder = 'Tìm kiếm...',

  // Filters
  filters = [],
  onFilterChange,
  onClearFilters,

  // Customization
  size = 'large',
  showClearButton = true,

  // Layout
  responsive = true,

  ...props
}) => {
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  const handleSearch = () => {
    if (onSearch) {
      onSearch(searchValue);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
  };

  if (responsive) {
    return (
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }} {...props}>
        {/* Search Input */}
        <Col xs={24} sm={24} md={12} lg={8}>
          <Input
            placeholder={placeholder}
            prefix={<SearchOutlined />}
            value={searchValue}
            onChange={handleSearchChange}
            onPressEnter={handleKeyPress}
            size={size}
            allowClear
          />
        </Col>

        {/* Filters */}
        {filters.map((filter) => (
          <Col key={filter.key} xs={24} sm={12} md={6} lg={filter.colSpan || 4}>
            <Select
              placeholder={filter.placeholder}
              style={{ width: '100%' }}
              size={size}
              value={filter.value}
              onChange={(value) => handleFilterChange(filter.key, value)}
              allowClear
              options={filter.options}
              disabled={filter.disabled}
              loading={filter.loading}
            />
          </Col>
        ))}

        {/* Clear Filters Button */}
        {showClearButton && onClearFilters && (
          <Col xs={24} sm={12} md={6} lg={4}>
            <Button
              icon={<ClearOutlined />}
              onClick={handleClearFilters}
              size={size}
              block
            >
              Xóa Bộ Lọc
            </Button>
          </Col>
        )}
      </Row>
    );
  }

  // Non-responsive (inline) layout
  return (
    <Space
      size="middle"
      style={{ width: '100%', marginBottom: 24 }}
      wrap
      {...props}
    >
      <Input
        placeholder={placeholder}
        prefix={<SearchOutlined />}
        value={searchValue}
        onChange={handleSearchChange}
        onPressEnter={handleKeyPress}
        size={size}
        style={{ width: 250 }}
        allowClear
      />

      {filters.map((filter) => (
        <Select
          key={filter.key}
          placeholder={filter.placeholder}
          style={{ width: filter.width || 200 }}
          size={size}
          value={filter.value}
          onChange={(value) => handleFilterChange(filter.key, value)}
          allowClear
          options={filter.options}
          disabled={filter.disabled}
          loading={filter.loading}
        />
      ))}

      {showClearButton && onClearFilters && (
        <Button
          icon={<ClearOutlined />}
          onClick={handleClearFilters}
          size={size}
        >
          Xóa Bộ Lọc
        </Button>
      )}
    </Space>
  );
};

export default SearchBar;
