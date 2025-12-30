import React, { useState } from 'react';
import {
  Table,
  Space,
  Button,
  Input,
  Card,
  Popconfirm,
  Tooltip,
  Tag,
  Select,
  Dropdown,
  Menu,
  Badge,
  message,
  Modal,
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  ClearOutlined,
  MoreOutlined,
} from '@ant-design/icons';

/**
 * DataTable Component
 * Tương thích 100% với BaseController backend
 *
 * Features:
 * - Full CRUD operations
 * - Server-side pagination
 * - Server-side filtering
 * - Server-side sorting
 * - Server-side searching
 * - Batch operations
 * - Import/Export
 * - Row selection
 * - Responsive design
 */
const DataTable = ({
  // Data & Loading
  data = [],
  loading = false,

  // Columns
  columns = [],

  // CRUD operations
  onAdd,
  onView,
  onEdit,
  onDelete,
  onRefresh,

  // Pagination (từ useCRUD)
  pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  onPaginationChange,

  // Search
  searchable = true,
  searchPlaceholder = 'Tìm kiếm...',
  searchValue = '',
  onSearch,

  // Filters
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,

  // Sorting
  sortable = true,
  defaultSort,

  // Actions column
  showActions = true,
  actionsWidth = 180,
  customActions,

  // Batch operations
  batchOperations = false,
  onBatchDelete,
  selectedRowKeys = [],
  onSelectChange,

  // Import/Export
  importable = false,
  exportable = false,
  onImport,
  onExport,

  // Customization
  title,
  extra,
  rowKey = 'id',
  size = 'middle',
  bordered = false,
  scroll,

  // Row selection
  rowSelection: customRowSelection,

  // Other props
  ...tableProps
}) => {
  const [internalSearchText, setInternalSearchText] = useState(searchValue);
  const [importModalVisible, setImportModalVisible] = useState(false);

  // Handle search
  const handleSearch = (value) => {
    setInternalSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  // Build row selection config
  const rowSelection = batchOperations
    ? customRowSelection || {
        selectedRowKeys,
        onChange: onSelectChange,
        selections: [
          Table.SELECTION_ALL,
          Table.SELECTION_INVERT,
          Table.SELECTION_NONE,
        ],
      }
    : undefined;

  // Auto columns with actions
  const finalColumns = [
    ...columns.map((col) => ({
      ...col,
      sorter: sortable && col.sortable !== false,
    })),
    ...(showActions
      ? [
          {
            title: 'Thao Tác',
            key: 'actions',
            width: actionsWidth,
            fixed: 'right',
            render: (_, record) => (
              <Space size="small">
                {onView && (
                  <Tooltip title="Xem chi tiết">
                    <Button
                      type="link"
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => onView(record)}
                    />
                  </Tooltip>
                )}

                {onEdit && (
                  <Tooltip title="Chỉnh sửa">
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => onEdit(record)}
                    />
                  </Tooltip>
                )}

                {onDelete && (
                  <Popconfirm
                    title="Xác nhận xóa?"
                    description="Bạn có chắc chắn muốn xóa mục này?"
                    onConfirm={() => onDelete(record[rowKey])}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Xóa">
                      <Button
                        type="link"
                        size="small"
                        danger
                        icon={<DeleteOutlined />}
                      />
                    </Tooltip>
                  </Popconfirm>
                )}

                {customActions && customActions(record)}
              </Space>
            ),
          },
        ]
      : []),
  ];

  // Batch actions menu
  const batchActionsMenu = (
    <Menu>
      {onBatchDelete && (
        <Menu.Item
          key="delete"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            if (selectedRowKeys.length === 0) {
              message.warning('Vui lòng chọn ít nhất 1 mục');
              return;
            }
            Modal.confirm({
              title: 'Xác nhận xóa hàng loạt?',
              content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mục đã chọn?`,
              okText: 'Xóa',
              okButtonProps: { danger: true },
              cancelText: 'Hủy',
              onOk: () => onBatchDelete(selectedRowKeys),
            });
          }}
        >
          Xóa đã chọn ({selectedRowKeys.length})
        </Menu.Item>
      )}
    </Menu>
  );

  return (
    <Card
      title={title}
      extra={
        <Space wrap>
          {/* Search */}
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              prefix={<SearchOutlined />}
              value={internalSearchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
              allowClear
            />
          )}

          {/* Filters */}
          {filters && filters.length > 0 && (
            <>
              {filters.map((filter) => (
                <Select
                  key={filter.key}
                  placeholder={filter.placeholder}
                  style={{ width: filter.width || 150 }}
                  value={filterValues[filter.key]}
                  onChange={(value) => handleFilterChange(filter.key, value)}
                  allowClear
                  options={filter.options}
                />
              ))}
              {onClearFilters && (
                <Tooltip title="Xóa bộ lọc">
                  <Button icon={<ClearOutlined />} onClick={onClearFilters} />
                </Tooltip>
              )}
            </>
          )}

          {/* Batch Actions */}
          {batchOperations && selectedRowKeys.length > 0 && (
            <Badge count={selectedRowKeys.length}>
              <Dropdown overlay={batchActionsMenu} trigger={['click']}>
                <Button icon={<MoreOutlined />}>Thao tác hàng loạt</Button>
              </Dropdown>
            </Badge>
          )}

          {/* Import */}
          {importable && onImport && (
            <Tooltip title="Import dữ liệu">
              <Button
                icon={<UploadOutlined />}
                onClick={() => {
                  const input = document.createElement('input');
                  input.type = 'file';
                  input.accept = '.xlsx,.xls,.csv';
                  input.onchange = (e) => {
                    const file = e.target.files[0];
                    if (file) {
                      onImport(file);
                    }
                  };
                  input.click();
                }}
              >
                Import
              </Button>
            </Tooltip>
          )}

          {/* Export */}
          {exportable && onExport && (
            <Tooltip title="Export dữ liệu">
              <Button icon={<DownloadOutlined />} onClick={onExport}>
                Export
              </Button>
            </Tooltip>
          )}

          {/* Refresh */}
          {onRefresh && (
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
          )}

          {/* Add New */}
          {onAdd && (
            <Button type="primary" icon={<PlusOutlined />} onClick={onAdd}>
              Thêm Mới
            </Button>
          )}

          {extra}
        </Space>
      }
    >
      <Table
        rowKey={rowKey}
        columns={finalColumns}
        dataSource={data}
        loading={loading}
        size={size}
        bordered={bordered}
        rowSelection={rowSelection}
        pagination={{
          ...pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `Tổng ${total} mục`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        onChange={onPaginationChange}
        scroll={scroll || { x: 'max-content' }}
        {...tableProps}
      />
    </Card>
  );
};

export default DataTable;
