// src/components/common/DataTable/index.jsx
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
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
} from '@ant-design/icons';

/**
 * Universal DataTable Component
 * Reusable table with CRUD operations, search, and pagination
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

  // Pagination
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

  // Actions column
  showActions = true,
  actionsWidth = 150,
  customActions,

  // Customization
  title,
  extra,
  rowKey = 'id',
  size = 'middle',
  bordered = false,

  // Row selection
  rowSelection,

  // Other props
  ...tableProps
}) => {
  const [internalSearchText, setInternalSearchText] = useState(searchValue);

  // Handle search
  const handleSearch = (value) => {
    setInternalSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Auto columns with actions
  const finalColumns = [
    ...columns,
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
                    onConfirm={() => onDelete(record.id || record._id)}
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

  return (
    <Card
      title={title}
      extra={
        <Space wrap>
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

          {onRefresh && (
            <Tooltip title="Làm mới">
              <Button
                icon={<ReloadOutlined />}
                onClick={onRefresh}
                loading={loading}
              />
            </Tooltip>
          )}

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
        scroll={{ x: 'max-content' }}
        {...tableProps}
      />
    </Card>
  );
};

export default DataTable;
