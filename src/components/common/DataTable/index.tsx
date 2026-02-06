import React, {useState} from "react";
import {Table, Space, Popconfirm, Tooltip, Badge, Menu, Dropdown, Alert, Modal, Input, Card} from "antd";
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
  FileExcelOutlined,
} from "@ant-design/icons";
import {Button, toast, PermissionGuard} from "@/components/common";
import {DataTableProps, FilterConfig} from "./types";
import {useDebounce} from "@/hooks";
import "./styles.less";
import ExportModal from "./ExportModal"; // Import the modal
import FilterBuilder from "./FilterBuilder";

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
  permissionResource,
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
  rightExtra,
  rowKey = "id",
  size = "middle",
  bordered = false,
  scroll,
  emptyText = "Không có dữ liệu",
  rowSelection: customRowSelection,
  showAlert = false,
  alertMessage,
  alertType = "info",
  actionColumnProps,
  hideCard,
  deleteConfirmTitle,
  deleteConfirmDescription,
  deleteOkText,
  deleteCancelText,
  deleteTooltip,
  ...tableProps
}) => {
  const [internalSearchText, setInternalSearchText] = useState(searchValue);
  const debouncedSearchTerm = useDebounce(internalSearchText, 500);
  const [filterModalOpen, setFilterModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [operators, setOperators] = useState<Record<string, string>>({});

  // Dynamic filters state - start EMPTY, user adds as needed
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);
  const [availableFilters] = useState(filters); // Keep all available filters

  const [enabledFilters, setEnabledFilters] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    filters.forEach((f) => (initial[f.key] = true));
    return initial;
  });

  const getActiveFilterKey = (filterKey: string, op?: string) => {
    const filterConfig = filters.find((f) => f.key === filterKey);
    const defaultOp = filterConfig?.defaultOperator || "eq";
    const currentOp = op || operators[filterKey] || defaultOp;
    return currentOp === "eq" ? filterKey : `${filterKey}_${currentOp}`;
  };

  const handleOperatorChange = (filterKey: string, newOp: string) => {
    const filterConfig = filters.find((f) => f.key === filterKey);
    const defaultOp = filterConfig?.defaultOperator || "eq";
    const oldOp = operators[filterKey] || defaultOp;

    if (oldOp === newOp) return;

    setOperators((prev) => ({...prev, [filterKey]: newOp}));

    const oldKey = oldOp === "eq" ? filterKey : `${filterKey}_${oldOp}`;
    const newKey = newOp === "eq" ? filterKey : `${filterKey}_${newOp}`;
    const currentValue = filterValues[oldKey];

    if (currentValue !== undefined && currentValue !== null && currentValue !== "") {
      handleFilterChange(newKey, currentValue);
      handleFilterChange(oldKey, undefined);
    }
  };

  const handleFilterValueChange = (filterKey: string, value: any) => {
    const activeKey = getActiveFilterKey(filterKey);
    handleFilterChange(activeKey, value);
  };

  const toggleFilterEnabled = (key: string) => {
    setEnabledFilters((prev) => ({...prev, [key]: !prev[key]}));
  };

  const addFilterCondition = (filterKey: string) => {
    const filterToAdd = availableFilters.find((f) => f.key === filterKey);
    if (filterToAdd && !activeFilters.find((f) => f.key === filterKey)) {
      setActiveFilters((prev) => [...prev, filterToAdd]);
      setEnabledFilters((prev) => ({...prev, [filterKey]: true}));
    }
  };

  const removeFilterCondition = (filterKey: string) => {
    setActiveFilters((prev) => prev.filter((f) => f.key !== filterKey));
    // Also clear the filter value
    const filterConfig = filters.find((f) => f.key === filterKey);
    const defaultOp = filterConfig?.defaultOperator || "eq";
    const currentOp = operators[filterKey] || defaultOp;

    const activeKey = currentOp === "eq" ? filterKey : `${filterKey}_${currentOp}`;
    handleFilterChange(activeKey, undefined);
    // Remove from enabled filters
    setEnabledFilters((prev) => {
      const newEnabled = {...prev};
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

  const tableColumns = React.useMemo(() => {
    return columns;
  }, [columns]);

  const ColumnSearch = ({setSelectedKeys, selectedKeys, confirm, label: _label}: any) => {
    const [value, setValue] = useState(selectedKeys[0] || "");

    // Sync value if props change
    React.useEffect(() => {
      setValue(selectedKeys[0] || "");
    }, [selectedKeys]);

    // Handle input change: update local value only
    const onChange = (e: any) => {
      const val = e.target.value;
      setValue(val);

      // If cleared (empty), trigger instant refresh
      if (val === "") {
        setSelectedKeys([]);
        confirm();
      }
    };

    // Debounce Auto-Search for typing
    React.useEffect(() => {
      const timer = setTimeout(() => {
        const currentKey = selectedKeys[0] || "";
        // Only debounce if value is NOT empty (empty is handled instantly by onChange)
        if (value !== currentKey && value !== "") {
          setSelectedKeys([value]);
          confirm({closeDropdown: false});
        }
      }, 600);
      return () => clearTimeout(timer);
    }, [value, selectedKeys, confirm, setSelectedKeys]);

    const onSearch = (val: string) => {
      setValue(val);
      // Ensure we search with the current value
      const keys = val ? [val] : [];
      setSelectedKeys(keys);
      confirm();
    };

    return (
      <div
        className="filter-dropdown-container"
        style={{
          padding: 8,
          width: 250,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input.Search
          placeholder={`Tìm ${(_label || "").toLowerCase()}...`}
          value={value}
          onChange={onChange}
          onSearch={onSearch}
          enterButton /* Standard Ant Design Button */
          allowClear
          className="filter-search-input-compact"
        />
        <div style={{marginTop: 8, fontSize: 13, color: "#595959", textAlign: "right"}}>
          <a
            onClick={() => {
              confirm();
              setFilterModalOpen(true);
            }}
            style={{fontWeight: 500}}
          >
            Xem thêm bộ lọc khác
          </a>
        </div>
      </div>
    );
  };

  const getColumnSearchProps = (_dataIndex: string, label: string) => ({
    filterDropdown: (props: any) => <ColumnSearch {...props} label={label} />,
    filterIcon: (filtered: boolean) => (
      <SearchOutlined
        className={filtered ? "active-filter-icon" : ""}
        style={{color: filtered ? "var(--primary-color)" : undefined}}
      />
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
    filters.forEach((f) => (allEnabled[f.key] = true));
    setEnabledFilters(allEnabled);
    setFilterModalOpen(false);
  };

  // Resolve selectedRowKeys from direct prop or rowSelection object
  const activeSelectedRowKeys = propSelectedRowKeys || customRowSelection?.selectedRowKeys || [];

  const rowSelection = batchOperations
    ? customRowSelection || {
        selectedRowKeys: activeSelectedRowKeys,
        onChange: onSelectChange,
        selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT, Table.SELECTION_NONE],
        getCheckboxProps: (record: any) => ({
          disabled: record.disabled,
        }),
      }
    : undefined;

  // Handle columns: check if "actions" column is defined in props.columns
  const userActionColumnIndex = columns.findIndex((col) => col.key === "actions");
  const userActionColumn = userActionColumnIndex !== -1 ? columns[userActionColumnIndex] : null;

  // Dynamic Action Column Logic
  const standardActionCount = (onView ? 1 : 0) + (onEdit ? 1 : 0) + (onDelete ? 1 : 0);
  // Base width per button (32px + 8px gap) + padding (16px)
  // If customActions exists, we add extra space or default to a safe width if not specified
  const calculatedWidth = actionsWidth || Math.max(100, standardActionCount * 42 + (customActions ? 40 : 16));

  const mergedActionsColumn =
    showActions || userActionColumn
      ? {
          title: "Thao tác",
          key: "actions",
          className: "data-table-actions-column",
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
                  <PermissionGuard resource={permissionResource!} action="read" fallback={null}>
                    <Tooltip title="Xem chi tiết">
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        onClick={() => onView(record)}
                        className="action-btn-standard"
                        style={{color: "var(--primary-color)"}}
                      >
                        <EyeOutlined />
                      </Button>
                    </Tooltip>
                  </PermissionGuard>
                )}

                {onEdit && (
                  <PermissionGuard resource={permissionResource!} action="update" fallback={null}>
                    <Tooltip title="Chỉnh sửa">
                      <Button
                        variant="ghost"
                        buttonSize="small"
                        onClick={() => onEdit(record)}
                        className="action-btn-standard action-btn-edit"
                        style={{color: "var(--primary-color)"}}
                      >
                        <EditOutlined />
                      </Button>
                    </Tooltip>
                  </PermissionGuard>
                )}

                {onDelete && (
                  <PermissionGuard resource={permissionResource!} action="delete" fallback={null}>
                    <Popconfirm
                      title={deleteConfirmTitle || "Xác nhận xóa?"}
                      description={deleteConfirmDescription || "Bạn có chắc chắn muốn xóa mục này?"}
                      onConfirm={() => onDelete(record[rowKey])}
                      okText={deleteOkText || "Xóa"}
                      cancelText={deleteCancelText || "Hủy"}
                      okButtonProps={{danger: true}}
                      icon={<ExclamationCircleOutlined style={{color: "#EF4444"}} />}
                    >
                      <Tooltip title={deleteTooltip || "Xóa"}>
                        <Button
                          variant="ghost"
                          buttonSize="small"
                          className="action-btn-standard action-btn-delete"
                          style={{color: "#ff4d4f"}}
                        >
                          <DeleteOutlined />
                        </Button>
                      </Tooltip>
                    </Popconfirm>
                  </PermissionGuard>
                )}

                {customActions && customActions(record)}
              </Space>
            );
          },
        }
      : null;

  const finalColumns = [
    // If action position is left and no user defined action column
    ...(actionPosition === "left" && !userActionColumn ? [mergedActionsColumn] : []),

    ...tableColumns.map((col: any) => {
      // If this is the action column, return the merged one
      if (col.key === "actions") return mergedActionsColumn;

      const colKey = col.key || col.dataIndex;
      const controlledVal = filterValues?.[colKey];

      const isSearchable = col.searchable;
      return {
        ...col,
        align: col.align || ("center" as const),
        sorter: sortable && col.sortable !== false,
        ...(controlledVal !== undefined
          ? {
              filteredValue: Array.isArray(controlledVal) ? controlledVal : [controlledVal],
            }
          : {filteredValue: null}),

        ...(isSearchable ? getColumnSearchProps(col.dataIndex, col.title as string) : {}),
      };
    }),

    // Append at end if right and not defined in columns
    ...(actionPosition === "right" && !userActionColumn && mergedActionsColumn ? [mergedActionsColumn] : []),
  ].filter(Boolean); // Filter out nulls

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
            Modal.confirm({
              title: "Xác nhận xóa hàng loạt?",
              content: `Bạn có chắc chắn muốn xóa ${activeSelectedRowKeys.length} mục đã chọn ? `,
              okText: "Xóa",
              cancelText: "Hủy",
              okButtonProps: {danger: true},
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

  const hasActiveFilters = filters && filters.length > 0 && Object.keys(filterValues).some((key) => filterValues[key]);

  return (
    <div className={`data-table-wrapper${hideCard ? " hide-card-mode" : ""}`}>
      {/* Separate Title */}
      {title && <div className="data-table-title">{typeof title === "string" ? <h2>{title}</h2> : title}</div>}

      <Card
        styles={{body: {borderRadius: hideCard ? 0 : 12, padding: 0}}}
        hoverable={false}
        bordered={!hideCard}
        style={hideCard ? {boxShadow: "none", background: "transparent"} : undefined}
      >
        {/* Header Content inside Card for seamless look */}
        {tableProps.headerContent && <div>{tableProps.headerContent}</div>}

        {/* ... existing toolbar ... */}
        <div className="data-table-toolbar">
          {/* Left Side: Primary Actions (Add, Import, Export, Batch) */}
          <Space wrap>
            {onAdd && (
              <PermissionGuard resource={permissionResource!} action="create" fallback={null}>
                <Button variant="primary" onClick={onAdd} buttonSize="small">
                  <PlusOutlined /> Thêm Mới
                </Button>
              </PermissionGuard>
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
                      <UploadOutlined /> Import <span style={{fontSize: 10, marginLeft: 4}}>▼</span>
                    </Button>
                  </Dropdown>
                ) : (
                  <Tooltip title="Import dữ liệu">
                    <Button
                      variant="outline"
                      onClick={handleImportClick}
                      loading={tableProps.importLoading}
                      buttonSize="small"
                    >
                      <UploadOutlined /> Import
                    </Button>
                  </Tooltip>
                )}
              </>
            )}

            {exportable && onExport && (
              <>
                <Tooltip title="Export dữ liệu">
                  <Button
                    variant="outline"
                    onClick={() => {
                      // Open our new modal instead of calling direct
                      // Note: We need a state for this
                      setExportModalOpen(true);
                    }}
                    loading={tableProps.exportLoading}
                    buttonSize="small"
                  >
                    <DownloadOutlined /> Export
                  </Button>
                </Tooltip>
              </>
            )}

            {batchOperations && activeSelectedRowKeys.length > 0 && (
              <Badge count={activeSelectedRowKeys.length} className="batch-op-badge">
                {/* Logic: If only 1 action, show button directly. If > 1, show dropdown */}
                {(onBatchDelete ? 1 : 0) + (batchActions?.length || 0) === 1 ? (
                  /* Single Action Case - Text Only Style */
                  onBatchDelete ? (
                    <Button
                      variant="ghost"
                      danger
                      buttonSize="small"
                      style={{
                        border: "none",
                        boxShadow: "none",
                        background: "transparent",
                        color: "#ff4d4f",
                        fontWeight: 500,
                        padding: "4px 8px",
                      }}
                      onClick={() => {
                        Modal.confirm({
                          title: "Xác nhận xóa hàng loạt?",
                          content: `Bạn có chắc chắn muốn xóa ${activeSelectedRowKeys.length} mục đã chọn?`,
                          okText: "Xóa",
                          cancelText: "Hủy",
                          okButtonProps: {danger: true},
                          onOk: () => onBatchDelete(activeSelectedRowKeys),
                        });
                      }}
                    >
                      <DeleteOutlined /> Xóa đã chọn
                    </Button>
                  ) : (
                    <Button
                      variant="ghost"
                      danger={batchActions![0].danger}
                      buttonSize="small"
                      style={{
                        border: "none",
                        boxShadow: "none",
                        background: "transparent",
                        color: batchActions![0].danger ? "#ff4d4f" : "var(--primary-color)",
                        fontWeight: 500,
                        padding: "4px 8px",
                      }}
                      onClick={() => batchActions![0].onClick(activeSelectedRowKeys)}
                      className="batch-action-btn"
                    >
                      {batchActions![0].icon} {batchActions![0].label}
                    </Button>
                  )
                ) : (
                  /* Multiple Actions Case -> Dropdown */
                  <Dropdown overlay={batchActionsMenu} trigger={["click"]}>
                    <Button variant="outline" buttonSize="small" className="batch-action-btn">
                      Thao tác hàng loạt <span style={{fontSize: 10, marginLeft: 4}}>▼</span>
                    </Button>
                  </Dropdown>
                )}
              </Badge>
            )}

            {extra}
          </Space>

          {/* Right Side: Tools (Search, Filter, Refresh, Total) */}
          <Space wrap align="center" className="right-tools">
            {rightExtra}
            {searchable && !tableProps.hideGlobalSearch && (
              <Input
                placeholder={searchPlaceholder}
                value={internalSearchText}
                onChange={(e) => {
                  const val = e.target.value;
                  handleSearch(val);
                  // Instant clear: if empty, force immediate search (bypass debounce)
                  if (!val && onSearch) onSearch("");
                }}
                style={{width: 220, height: 32, marginBottom: 0}}
                allowClear
                prefix={<SearchOutlined style={{color: "#bfbfbf"}} />}
                size="middle"
              />
            )}

            {filters && filters.length > 0 && (
              <Badge dot={hasActiveFilters} className="filter-badge">
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
              Tổng số: <span>{(pagination && pagination.total) || 0}</span>
            </div>
          </Space>
        </div>
        {showAlert && alertMessage && (
          <Alert message={alertMessage} type={alertType} showIcon closable className="data-table-alert" />
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
          pagination={
            {
              ...pagination,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total: number) => `Tổng ${total} mục`,
              pageSizeOptions: ["10", "20", "50", "100"],
            } as any
          }
          onChange={onPaginationChange}
          scroll={scroll || {x: "max-content"}}
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
          styles={{body: {padding: 0}}}
          className="custom-filter-modal"
        >
          <FilterBuilder
            filters={availableFilters}
            activeFilters={activeFilters}
            filterValues={filterValues}
            operators={operators}
            enabledFilters={enabledFilters}
            onAddFilter={addFilterCondition}
            onRemoveFilter={removeFilterCondition}
            onFilterChange={handleFilterValueChange}
            onOperatorChange={handleOperatorChange}
            onToggleFilter={toggleFilterEnabled}
            onApply={() => setFilterModalOpen(false)}
            onClear={handleClearFilters}
            onCancel={() => setFilterModalOpen(false)}
          />
        </Modal>
      </Card>

      {/* Advanced Export Modal */}
      <ExportModal
        visible={exportModalOpen}
        onCancel={() => setExportModalOpen(false)}
        onOk={(options) => {
          if (onExport) {
            onExport(options);
            setExportModalOpen(false);
          }
        }}
        loading={tableProps.exportLoading}
        totalRecords={pagination && typeof pagination !== "boolean" ? pagination.total : 0}
        currentPageSize={pagination && typeof pagination !== "boolean" ? pagination.pageSize : 10}
        filters={filters}
        currentFilters={filterValues}
      />
    </div>
  );
};

export default DataTable;
