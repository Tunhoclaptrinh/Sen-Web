import React, { useState } from "react";
import {
  Table,
  Space,
  Popconfirm,
  Tooltip,
  Badge,
  Menu,
  Dropdown,
  Alert,
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
  FilterOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { Button, Input, Card, Modal, Select, toast } from "@/components/common";
import { DataTableProps } from "./types";

/**
 * DataTable Component
 * Enhanced table with lotus pink theme, centered headers, and filter modal
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
  const [filterModalOpen, setFilterModalOpen] = useState(false);

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

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
    setFilterModalOpen(false);
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
      align: "center" as const,
      render: (_: any, record: any) => (
        <Space size="small">
          {onView && (
            <Tooltip title="Xem chi tiết">
              <Button
                variant="ghost"
                buttonSize="small"
                onClick={() => onView(record)}
                style={{ padding: "4px 8px" }}
              >
                <EyeOutlined />
              </Button>
            </Tooltip>
          )}

          {onEdit && (
            <Tooltip title="Chỉnh sửa">
              <Button
                variant="ghost"
                buttonSize="small"
                onClick={() => onEdit(record)}
                style={{ padding: "4px 8px" }}
              >
                <EditOutlined />
              </Button>
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
              icon={<ExclamationCircleOutlined style={{ color: "#EF4444" }} />}
            >
              <Tooltip title="Xóa">
                <Button
                  variant="danger"
                  buttonSize="small"
                  style={{ padding: "4px 8px" }}
                >
                  <DeleteOutlined />
                </Button>
              </Tooltip>
            </Popconfirm>
          )}

          {customActions && customActions(record)}
        </Space>
      ),
    }
    : null;

  // Add centered alignment to all columns
  const finalColumns = [
    ...(actionsColumn && actionPosition === "left" ? [actionsColumn] : []),
    ...columns.map((col) => ({
      ...col,
      align: col.align || ("center" as const),
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
              toast.warning("Vui lòng chọn ít nhất 1 mục");
              return;
            }
            Modal.confirm({
              title: "Xác nhận xóa hàng loạt?",
              children: `Bạn có chắc chắn muốn xóa ${selectedRowKeys.length} mục đã chọn?`,
              footer: (
                <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                  <Button variant="outline" onClick={() => { }}>
                    Hủy
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => onBatchDelete(selectedRowKeys)}
                  >
                    Xóa
                  </Button>
                </div>
              ),
            } as any);
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

  const hasActiveFilters = filters && filters.length > 0 && Object.keys(filterValues).some(key => filterValues[key]);

  return (
    <Card
      title={title}
      extra={
        <Space wrap>
          {searchable && (
            <Input
              placeholder={searchPlaceholder}
              value={internalSearchText}
              onChange={(e) => handleSearch(e.target.value)}
              style={{ width: 250 }}
            />
          )}

          {filters && filters.length > 0 && (
            <Badge dot={hasActiveFilters} color="#F43F5E">
              <Button
                variant="outline"
                onClick={() => setFilterModalOpen(true)}
              >
                <FilterOutlined /> Bộ lọc
              </Button>
            </Badge>
          )}

          {batchOperations && selectedRowKeys.length > 0 && (
            <Badge count={selectedRowKeys.length} color="#F43F5E">
              <Dropdown overlay={batchActionsMenu} trigger={["click"]}>
                <Button variant="outline">Thao tác hàng loạt</Button>
              </Dropdown>
            </Badge>
          )}

          {importable && onImport && (
            <Tooltip title="Import dữ liệu">
              <Button variant="outline" onClick={handleImportClick}>
                <UploadOutlined /> Import
              </Button>
            </Tooltip>
          )}

          {exportable && onExport && (
            <Tooltip title="Export dữ liệu">
              <Button variant="outline" onClick={onExport}>
                <DownloadOutlined /> Export
              </Button>
            </Tooltip>
          )}

          {onRefresh && (
            <Tooltip title="Làm mới">
              <Button
                variant="ghost"
                onClick={onRefresh}
                loading={loading}
              >
                <ReloadOutlined />
              </Button>
            </Tooltip>
          )}

          {onAdd && (
            <Button variant="primary" onClick={onAdd}>
              <PlusOutlined /> Thêm Mới
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

      {/* Filter Modal */}
      <Modal
        open={filterModalOpen}
        onCancel={() => setFilterModalOpen(false)}
        title="Bộ lọc"
        footer={
          <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
            <Button variant="outline" onClick={handleClearFilters}>
              Xóa bộ lọc
            </Button>
            <Button variant="primary" onClick={() => setFilterModalOpen(false)}>
              Áp dụng
            </Button>
          </div>
        }
      >
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {filters.map((filter) => (
            <Select
              key={filter.key}
              label={filter.placeholder}
              placeholder={`Chọn ${filter.placeholder}`}
              value={filterValues[filter.key]}
              onChange={(value) => handleFilterChange(filter.key, value)}
              options={filter.options}
              fullWidth
            />
          ))}
        </div>
      </Modal>
    </Card>
  );
};

export default DataTable;
