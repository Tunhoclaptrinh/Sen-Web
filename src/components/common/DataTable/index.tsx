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
  Modal as AntModal,
  Checkbox,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  ReloadOutlined,
  EyeOutlined,
  DownloadOutlined,
  UploadOutlined,
  FilterOutlined,
  ExclamationCircleOutlined,
  SearchOutlined,
  FileExcelOutlined
} from "@ant-design/icons";
import { Button, Input, Card, Modal, Select, toast } from "@/components/common";
import { DataTableProps, FilterConfig } from "./types";
import { useDebounce } from "@/hooks";
import "./styles.less";

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
  actionsWidth, // Removed default here to calculate dynamically
  customActions,
  actionPosition = "right",
  batchOperations = false,
  onBatchDelete,
  selectedRowKeys: propSelectedRowKeys,
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
  actionColumnProps, // New Prop
  ...tableProps
}) => {

  const [internalSearchText, setInternalSearchText] = useState(searchValue);
  const debouncedSearchTerm = useDebounce(internalSearchText, 500);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [operators, setOperators] = useState<Record<string, string>>({});

  // Dynamic filters state - start EMPTY, user adds as needed
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);
  const [availableFilters] = useState(filters); // Keep all available filters

  const [enabledFilters, setEnabledFilters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    filters.forEach(f => initial[f.key] = true);
    return initial;
  });

  const getActiveFilterKey = (filterKey: string, op?: string) => {
    const currentOp = op || operators[filterKey] || 'eq';
    return currentOp === 'eq' ? filterKey : `${filterKey}_${currentOp} `;
  };

  const handleOperatorChange = (filterKey: string, newOp: string) => {
    const oldOp = operators[filterKey] || 'eq';
    if (oldOp === newOp) return;

    setOperators(prev => ({ ...prev, [filterKey]: newOp }));

    const oldKey = oldOp === 'eq' ? filterKey : `${filterKey}_${oldOp} `;
    const newKey = newOp === 'eq' ? filterKey : `${filterKey}_${newOp} `;
    const currentValue = filterValues[oldKey];

    if (currentValue !== undefined && currentValue !== null && currentValue !== '') {
      handleFilterChange(newKey, currentValue);
      handleFilterChange(oldKey, undefined);
    }
  };

  const handleFilterValueChange = (filterKey: string, value: any) => {
    const activeKey = getActiveFilterKey(filterKey);
    handleFilterChange(activeKey, value);
  };

  const toggleFilterEnabled = (key: string) => {
    setEnabledFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const addFilterCondition = (filterKey: string) => {
    const filterToAdd = availableFilters.find(f => f.key === filterKey);
    if (filterToAdd && !activeFilters.find(f => f.key === filterKey)) {
      setActiveFilters(prev => [...prev, filterToAdd]);
      setEnabledFilters(prev => ({ ...prev, [filterKey]: true }));
    }
  };

  const removeFilterCondition = (filterKey: string) => {
    setActiveFilters(prev => prev.filter(f => f.key !== filterKey));
    // Also clear the filter value
    const currentOp = operators[filterKey] || 'eq';
    const activeKey = currentOp === 'eq' ? filterKey : `${filterKey}_${currentOp}`;
    handleFilterChange(activeKey, undefined);
    // Remove from enabled filters
    setEnabledFilters(prev => {
      const newEnabled = { ...prev };
      delete newEnabled[filterKey];
      return newEnabled;
    });
  };

  // Effect to trigger search when debounced value changes
  React.useEffect(() => {
    if (onSearch && debouncedSearchTerm !== searchValue) {
      onSearch(debouncedSearchTerm);
    }
  }, [debouncedSearchTerm]);

  const handleSearch = (value: string) => {
    setInternalSearchText(value);
  };

  const handleFilterChange = (key: string, value: any) => {
    if (onFilterChange) {
      onFilterChange(key, value);
    }
  };

  const getColumnSearchProps = (_dataIndex: string, label: string) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }: any) => (
      <div className="filter-dropdown-container" onKeyDown={(e) => e.stopPropagation()}>
        <Input
          placeholder={`Tìm kiếm ${label} `}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => confirm()}
          className="filter-search-input"
          containerStyle={{ marginBottom: 8 }} // Maintain the intended 8px margin here
          fullWidth={false}
        />
        <Space>
          <Button
            variant="primary" // Fixed: type -> variant
            onClick={() => confirm()}
            icon={<SearchOutlined />}
            buttonSize="small" // Fixed: size -> buttonSize
            className="filter-action-button"
          >
            Tìm
          </Button>
          <Button
            onClick={() => {
              clearFilters && clearFilters();
              confirm();
            }}
            buttonSize="small" // Fixed: size -> buttonSize
            className="filter-action-button"
          >
            Xóa
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered: boolean) => (
      <SearchOutlined style={{ color: filtered ? '#1677ff' : undefined }} />
    ),
    onFilter: (_value: any, _record: any) => {
      // Return true to disable client-side filtering and rely on server-side
      return true;
    },
  });

  const handleClearFilters = () => {
    if (onClearFilters) {
      onClearFilters();
    }
    // Re-enable all filters when clearing
    const allEnabled: Record<string, boolean> = {};
    filters.forEach(f => allEnabled[f.key] = true);
    setEnabledFilters(allEnabled);
    setFilterModalOpen(false);
  };

  // Resolve selectedRowKeys from direct prop or rowSelection object
  const activeSelectedRowKeys = propSelectedRowKeys || customRowSelection?.selectedRowKeys || [];

  const rowSelection = batchOperations
    ? customRowSelection || {
      selectedRowKeys: activeSelectedRowKeys,
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

  // Handle columns: check if "actions" column is defined in props.columns
  const userActionColumnIndex = columns.findIndex(col => col.key === 'actions');
  const userActionColumn = userActionColumnIndex !== -1 ? columns[userActionColumnIndex] : null;

  // Dynamic Action Column Logic
  const standardActionCount = (onView ? 1 : 0) + (onEdit ? 1 : 0) + (onDelete ? 1 : 0);
  // Base width per button (32px + 8px gap) + padding (16px)
  // If customActions exists, we add extra space or default to a safe width if not specified
  const calculatedWidth = actionsWidth || (
      (standardActionCount * 40) + (customActions ? 40 : 16)
  );

  const mergedActionsColumn = (showActions || userActionColumn)
    ? {
      title: "Thao Tác",
      key: "actions",
      width: calculatedWidth,
      fixed: actionPosition,
      align: "center" as const,
      // Merge user properties if defined
      ...userActionColumn,
      ...actionColumnProps, // Keep this for backward compat or explicit override
      render: (_: any, record: any) => {
        if (userActionColumn && userActionColumn.render) {
          return userActionColumn.render(_, record);
        }

        return (
          <Space size={4} className="action-buttons-container">
            {onView && (
              <Tooltip title="Xem chi tiết">
                <Button
                  variant="ghost"
                  buttonSize="small"
                  onClick={() => onView(record)}
                  className="action-btn-standard"
                  style={{ color: "var(--primary-color)" }}
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
                  className="action-btn-standard action-btn-edit"
                  style={{ color: "var(--primary-color)" }}
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
                    variant="ghost"
                    buttonSize="small"
                    className="action-btn-standard action-btn-delete"
                    style={{ color: "#ff4d4f" }}
                  >
                    <DeleteOutlined />
                  </Button>
                </Tooltip>
              </Popconfirm>
            )}

            {customActions && customActions(record)}
          </Space>
        );
      },
    }
    : null;

  const finalColumns = [
    // If action position is left and no user defined action column (or user position was not specified, handled by splicing?)
    // Actually, if user defined it in columns, let's keep its position!
    ...(actionPosition === "left" && !userActionColumn ? [mergedActionsColumn] : []),

    ...columns.map((col) => {
      // If this is the action column, return the merged one
      if (col.key === 'actions') return mergedActionsColumn;

      const isSearchable = col.searchable;
      return {
        ...col,
        align: col.align || ("center" as const),
        sorter: sortable && col.sortable !== false,
        ...(isSearchable ? getColumnSearchProps(col.dataIndex, col.title as string) : {}),
      };
    }),

    // Append at end if right and not defined in columns
    ...(actionPosition === "right" && !userActionColumn && mergedActionsColumn ? [mergedActionsColumn] : []),
  ];

  const batchActionsMenu = (
    <Menu>
      {onBatchDelete && (
        <Menu.Item
          key="delete"
          danger
          icon={<DeleteOutlined />}
          onClick={() => {
            if (activeSelectedRowKeys.length === 0) {
              toast.warning("Vui lòng chọn ít nhất 1 mục");
              return;
            }
            AntModal.confirm({
              title: "Xác nhận xóa hàng loạt?",
              content: `Bạn có chắc chắn muốn xóa ${activeSelectedRowKeys.length} mục đã chọn ? `,
              okText: "Xóa",
              cancelText: "Hủy",
              okButtonProps: { danger: true },
              onOk: () => onBatchDelete(activeSelectedRowKeys),
            });
          }}
        >
          Xóa đã chọn ({activeSelectedRowKeys.length})
        </Menu.Item>
      )}
      {batchActions &&
        batchActions.map((action) => (
          <Menu.Item
            key={action.key}
            icon={action.icon}
            onClick={() => action.onClick(activeSelectedRowKeys)}
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
    <div className="data-table-wrapper">
      {/* Separate Title */}
      {title && (
        <div className="data-table-title">
          {typeof title === 'string' ? <h2>{title}</h2> : title}
        </div>
      )}

      <Card
        bordered={false}
        bodyStyle={{ padding: 0 }} // Remove default padding for custom layout
      >
        {/* Header Content inside Card for seamless look */}
        {tableProps.headerContent && (
          <div>
            {tableProps.headerContent}
          </div>
        )}

        {/* ... existing toolbar ... */}
        <div className="data-table-toolbar">

          {/* Left Side: Primary Actions (Add, Import, Export, Batch) */}
          <Space wrap>
            {onAdd && (
              <Button variant="primary" onClick={onAdd} buttonSize="small">
                <PlusOutlined /> Thêm Mới
              </Button>
            )}

            {importable && onImport && (
              <>
                {tableProps.onDownloadTemplate ? (
                  <Dropdown
                    trigger={["click"]}
                    disabled={tableProps.importLoading}
                    overlay={
                      <Menu>
                        <Menu.Item key="upload" icon={<UploadOutlined />} onClick={handleImportClick}>
                          Tải lên file dữ liệu
                        </Menu.Item>
                        <Menu.Item key="template" icon={<FileExcelOutlined />} onClick={tableProps.onDownloadTemplate}>
                          Tải mẫu nhập liệu
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <Button variant="outline" loading={tableProps.importLoading} buttonSize="small">
                      <UploadOutlined /> Import <span style={{ fontSize: 10, marginLeft: 4 }}>▼</span>
                    </Button>
                  </Dropdown>
                ) : (
                  <Tooltip title="Import dữ liệu">
                    <Button variant="outline" onClick={handleImportClick} loading={tableProps.importLoading} buttonSize="small">
                      <UploadOutlined /> Import
                    </Button>
                  </Tooltip>
                )}
              </>
            )}

            {exportable && onExport && (
              <Tooltip title="Export dữ liệu">
                <Button variant="outline" onClick={onExport} loading={tableProps.exportLoading} buttonSize="small">
                  <DownloadOutlined /> Export
                </Button>
              </Tooltip>
            )}

            {batchOperations && activeSelectedRowKeys.length > 0 && (
              <Badge count={activeSelectedRowKeys.length} color="#F43F5E">
                <Dropdown overlay={batchActionsMenu} trigger={["click"]}>
                  <Button variant="outline" buttonSize="small">Thao tác hàng loạt</Button>
                </Dropdown>
              </Badge>
            )}

            {extra}
          </Space>

          {/* Right Side: Tools (Search, Filter, Refresh, Total) */}
          <Space wrap align="center" className="right-tools">
            {searchable && !tableProps.hideGlobalSearch && (
              <Input
                placeholder={searchPlaceholder}
                value={internalSearchText}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ width: 220, height: 32 }}
                allowClear
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                containerStyle={{ marginBottom: 0, height: 32 }}
                fullWidth={false}
                inputSize="middle"
              />
            )}

            {filters && filters.length > 0 && (
              <Badge dot={hasActiveFilters} color="#F43F5E">
                <Button
                  variant="outline"
                  onClick={() => setFilterModalOpen(true)}
                  icon={<FilterOutlined />}
                  buttonSize="small"
                >
                  Bộ lọc
                </Button>
              </Badge>
            )}

            {onRefresh && (
              <Tooltip title="Làm mới">
                <Button
                  variant="outline" // Changed from ghost to outline for consistency as requested
                  onClick={onRefresh}
                  loading={loading}
                  icon={<ReloadOutlined />}
                  buttonSize="small"
                >
                  Làm mới
                </Button>
              </Tooltip>
            )}

            {/* Total Count Display */}
            <div className="total-count-badge">
              Tổng số: <span>{pagination.total || 0}</span>
            </div>
          </Space>
        </div>
        {showAlert && alertMessage && (
          <Alert
            message={alertMessage}
            type={alertType}
            showIcon
            closable
            className="data-table-alert"
          />
        )}

        <Table
          className="main-table"
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

        {/* Filter Modal - Custom Filter Builder */}
        <Modal
          open={filterModalOpen}
          onCancel={() => setFilterModalOpen(false)}
          title="Bộ lọc tùy chỉnh"
          width={700}
          footer={null}
          bodyStyle={{ padding: 0 }}
          className="custom-filter-modal"
        >
          <div className="filter-builder-container">
            <div className="active-filters-section">
              <div className="section-title">Các điều kiện lọc đang được áp dụng:</div>

              {activeFilters.length === 0 ? (
                <div className="empty-filter-state">
                  <p>Chưa có điều kiện lọc nào. Nhấn "+ Thêm điều kiện lọc" để bắt đầu.</p>
                </div>
              ) : (
                <div className="filter-conditions-list">
                  {activeFilters.map((filter, index) => {
                    const label = filter.label || filter.placeholder;
                    const currentOp = operators[filter.key] || filter.defaultOperator || 'eq';
                    const activeKey = currentOp === 'eq' ? filter.key : `${filter.key}_${currentOp} `;
                    const hasValue = filterValues[activeKey] !== undefined &&
                      filterValues[activeKey] !== null &&
                      filterValues[activeKey] !== '';
                    const isEnabled = enabledFilters[filter.key] !== false;

                    return (
                      <div key={filter.key} className={`filter-condition-item ${!isEnabled ? 'disabled' : ''}`}>
                        {index > 0 && <div className="condition-connector">VÀ</div>}

                        <div className="condition-row">
                          {/* Checkbox */}
                          <div className="condition-checkbox">
                            <Checkbox
                              checked={isEnabled}
                              onChange={() => toggleFilterEnabled(filter.key)}
                            />
                          </div>

                          {/* Field Selector */}
                          <div className="condition-field">
                            <Select
                              value={filter.key}
                              disabled
                              options={[{ label: label, value: filter.key }]}
                              style={{ width: '100%' }}
                            />
                          </div>

                          {filter.operators && (
                            <div className="condition-operator">
                              <Select
                                value={currentOp}
                                onChange={(val) => handleOperatorChange(filter.key, val)}
                                options={[
                                  { label: 'Bằng', value: 'eq' },
                                  { label: 'Lớn hơn', value: 'gt' },
                                  { label: 'Lớn hơn hoặc bằng', value: 'gte' },
                                  { label: 'Nhỏ hơn', value: 'lt' },
                                  { label: 'Nhỏ hơn hoặc bằng', value: 'lte' },
                                  { label: 'Chứa', value: 'like' },
                                  { label: 'Khác', value: 'ne' },
                                  { label: 'Trong', value: 'in' },
                                ].filter(op => filter.operators?.includes(op.value as any))}
                                style={{ width: '100%' }}
                              />
                            </div>
                          )}

                          <div className="condition-value">
                            {(!filter.type || filter.type === 'select') && (
                              <Select
                                placeholder={filter.placeholder || `Chọn ${label?.toLowerCase()} `}
                                value={filterValues[activeKey]}
                                onChange={(value) => handleFilterValueChange(filter.key, value)}
                                options={filter.options}
                                allowClear
                                mode={currentOp === 'in' ? 'multiple' : undefined}
                                style={{ width: '100%' }}
                              />
                            )}

                            {(filter.type === 'input' || filter.type === 'number') && (
                              <Input
                                placeholder={filter.placeholder || `Nhập ${label?.toLowerCase()} `}
                                value={filterValues[activeKey]}
                                onChange={(e) => handleFilterValueChange(filter.key, e.target.value)}
                                allowClear
                                style={{ width: '100%' }}
                                type={filter.type === 'number' ? 'number' : 'text'}
                                containerStyle={{ marginBottom: 0 }}
                              />
                            )}
                          </div>
                          {/* Delete Button */}
                          <button
                            className="condition-delete"
                            onClick={() => removeFilterCondition(filter.key)}
                            title="Xóa điều kiện"
                          >
                            ×
                          </button>
                        </div>

                        {hasValue && (
                          <div className="condition-preview">
                            {label} {currentOp === 'like' ? 'chứa' : currentOp === 'in' ? 'trong' : '='} <strong>{
                              Array.isArray(filterValues[activeKey])
                                ? filterValues[activeKey].join(', ')
                                : filterValues[activeKey]
                            }</strong>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Add Condition Button */}
              <div className="filter-actions">
                <Dropdown
                  menu={{
                    items: availableFilters
                      .filter(f => !activeFilters.find(af => af.key === f.key))
                      .map(f => ({
                        key: f.key,
                        label: f.label || f.placeholder,
                        onClick: () => addFilterCondition(f.key)
                      })),
                  }}
                  disabled={availableFilters.length === activeFilters.length}
                >
                  <Button variant="outline" style={{ width: '100%' }}>
                    + Thêm điều kiện lọc
                  </Button>
                </Dropdown>
              </div>
            </div>

            <div className="filter-builder-footer">
              <Button variant="outline" onClick={() => setFilterModalOpen(false)}>
                Hủy
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Bỏ lọc
              </Button>
              <Button variant="primary" onClick={() => setFilterModalOpen(false)}>
                Áp dụng bộ lọc
              </Button>
            </div>
          </div>
        </Modal>
      </Card>
    </div >
  );
};

export default DataTable;
