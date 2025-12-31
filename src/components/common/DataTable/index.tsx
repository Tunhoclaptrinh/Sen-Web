import React, { useState } from "react";
import {
  Table,
  Space,
  Button,
  Input,
  Card,
  Popconfirm,
  Tooltip,
  Badge,
  Menu,
  Dropdown,
  message,
  Modal,
  Alert,
  Select,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  ClearOutlined,
  MoreOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";

interface DataTableProps {
  data?: any[];
  loading?: boolean;
  columns?: any[];
  onAdd?: () => void;
  onView?: (record: any) => void;
  onEdit?: (record: any) => void;
  onDelete?: (id: any) => void;
  onRefresh?: () => void;
  pagination?: {
    current: number;
    pageSize: number;
    total: number;
  };
  onPaginationChange?: (pagination: any, filters: any, sorter: any) => void;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearch?: (value: string) => void;
  filters?: any[];
  filterValues?: any;
  onFilterChange?: (key: string, value: any) => void;
  onClearFilters?: () => void;
  sortable?: boolean;
  defaultSort?: any;
  showActions?: boolean;
  actionsWidth?: number;
  customActions?: (record: any) => React.ReactNode;
  actionPosition?: "left" | "right";
  batchOperations?: boolean;
  onBatchDelete?: (keys: any[]) => void;
  selectedRowKeys?: any[];
  onSelectChange?: (keys: any[]) => void;
  batchActions?: any[];
  importable?: boolean;
  exportable?: boolean;
  onImport?: (file: File) => void;
  onExport?: () => void;
  title?: React.ReactNode;
  extra?: React.ReactNode;
  rowKey?: string;
  size?: "small" | "middle" | "large";
  bordered?: boolean;
  scroll?: any;
  emptyText?: string;
  rowSelection?: any;
  showAlert?: boolean;
  alertMessage?: string;
  alertType?: "success" | "info" | "warning" | "error";
  [key: string]: any;
}

/**
 * DataTable Component
 */
const DataTable: React.FC<DataTableProps> = ({
  data = [],
  loading = false,
  columns = [],
  onAdd,
  onView,
  onEdit,
  onDelete,
  onRefresh,
  pagination = {
    current: 1,
    pageSize: 10,
    total: 0,
  },
  onPaginationChange,
  searchable = true,
  searchPlaceholder = "Tìm kiếm...",
  searchValue = "",
  onSearch,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  sortable = true,
  defaultSort,
  showActions = true,
  actionsWidth = 180,
  customActions,
  actionPosition = "right",
  batchOperations = false,
  onBatchDelete,
  selectedRowKeys = [],
  onSelectChange,
  batchActions,
  importable = false,
  exportable = false,
  onImport,
  onExport,
  title,
  extra,
  rowKey = "id",
  size = "middle",
  bordered = false,
  scroll,
  emptyText = "Không có dữ liệu",
  rowSelection: customRowSelection,
  showAlert = false,
  alertMessage,
  alertType = "info",
  ...tableProps
}) => {
  const [internalSearchText, setInternalSearchText] = useState(searchValue);

  const handleSearch = (value: string) => {
    setInternalSearchText(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const handleFilterChange = (key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  const rowSelection = batchOperations
    ? customRowSelection || {
      selectedRowKeys,
      onChange: onSelectChange,
      selections: [
        Table.SELECTION_ALL,
        Table.SELECTION_INVERT,
        Table.SELECTION_NONE,
      ],
      getCheckboxProps: (record: any) => ({
        disabled: record.disabled,
      }),
    }
    : undefined;

  const actionsColumn = showActions
    ? {
      title: "Thao Tác",
      key: "actions",
      width: actionsWidth,
      fixed: actionPosition,
      render: (_: any, record: any) => (
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
              icon={<ExclamationCircleOutlined style={{ color: "red" }} />}
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
    }
    : null;

  const finalColumns = [
    ...(actionsColumn && actionPosition === "left" ? [actionsColumn] : []),
    ...columns.map((col) => ({
      ...col,
      sorter: sortable && col.sortable !== false,
    })),
    ...(actionsColumn && actionPosition === "right" ? [actionsColumn] : []),
  ];

  const batchActionsMenu = (
    <Menu>
      {onBatchDelete && (
        <Menu.Item
          key="delete"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            if (selectedRowKeys.length === 0) {
              message.warning("Vui lòng chọn ít nhất 1 mục");
              return;
            }
            Modal.confirm({
              title: "Xác nhận xóa hàng loạt?",
              icon: <ExclamationCircleOutlined />,
              content: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mục đã chọn?`,
              okText: "Xóa",
              okButtonProps: { danger: true },
              cancelText: "Hủy",
              onOk: () => onBatchDelete(selectedRowKeys),
            });
          }}
        >
          Xóa đã chọn ({selectedRowKeys.length})
        </Menu.Item>
      )}
      {batchActions &&
        batchActions.map((action) => (
          <Menu.Item
            key={action.key}
            icon={action.icon}
            onClick={() => action.onClick(selectedRowKeys)}
            danger={action.danger}
          >
            {action.label}
          </Menu.Item>
        ))}
    </Menu>
  );

  const handleImportClick = () => {
    if (!onImport) return;

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".xlsx,.xls,.csv";
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        onImport(file);
      }
    };
    input.click();
  };

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

          {batchOperations && selectedRowKeys.length > 0 && (
            <Badge count={selectedRowKeys.length}>
              <Dropdown overlay={batchActionsMenu} trigger={["click"]}>
                <Button icon={<MoreOutlined />}>Thao tác hàng loạt</Button>
              </Dropdown>
            </Badge>
          )}

          {importable && onImport && (
            <Tooltip title="Import dữ liệu">
              <Button icon={<UploadOutlined />} onClick={handleImportClick}>
                Import
              </Button>
            </Tooltip>
          )}

          {exportable && onExport && (
            <Tooltip title="Export dữ liệu">
              <Button icon={<DownloadOutlined />} onClick={onExport}>
                Export
              </Button>
            </Tooltip>
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
      {showAlert && alertMessage && (
        <Alert
          message={alertMessage}
          type={alertType}
          showIcon
          closable
          style={{ marginBottom: 16 }}
        />
      )}

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
          showTotal: (total: number) => `Tổng ${total} mục`,
          pageSizeOptions: ["10", "20", "50", "100"],
        } as any}
        onChange={onPaginationChange}
        scroll={scroll || { x: "max-content" }}
        locale={{
          emptyText: emptyText,
        }}
        {...tableProps}
      />
    </Card>
  );
};

export default DataTable;
