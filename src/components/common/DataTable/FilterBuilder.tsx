import React from "react";
import { Select, Input, Checkbox, Dropdown, Tooltip, DatePicker } from "antd";
import dayjs from "dayjs";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Button } from "@/components/common";
import { FilterConfig } from "./types";

interface FilterBuilderProps {
  filters: FilterConfig[]; // All available filters
  activeFilters: FilterConfig[]; // Currently added filter rows
  filterValues: Record<string, any>; // Values for all filters
  operators: Record<string, string>; // Operators for all filters
  enabledFilters: Record<string, boolean>; // Checked state
  onAddFilter: (key: string) => void;
  onRemoveFilter: (key: string) => void;
  onFilterChange: (key: string, value: any) => void;
  onOperatorChange: (key: string, op: string) => void;
  onToggleFilter: (key: string) => void;
  onApply?: () => void;
  onClear?: () => void;
  onCancel?: () => void;
  applyText?: string;
  hideFooter?: boolean; // New prop to hide footer in modal
}

const FilterBuilder: React.FC<FilterBuilderProps> = ({
  filters,
  activeFilters,
  filterValues,
  operators,
  enabledFilters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
  onOperatorChange,
  onToggleFilter,
  onApply,
  onClear,
  onCancel,
  applyText = "Áp dụng bộ lọc",
  hideFooter = false
}) => {
  return (
    <div className="filter-builder-container">
      <div className="active-filters-section">
        {!hideFooter && <div className="section-title">Các điều kiện lọc đang được áp dụng:</div>}

        {activeFilters.length === 0 ? (
          <div className="empty-filter-state">
            <p style={{ color: '#8c8c8c' }}>
              Chưa có điều kiện lọc nào. Nhấn nút bên dưới để thêm.
            </p>
          </div>
        ) : (
          <div className="filter-conditions-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {activeFilters.map((filter) => {
              const label = filter.label || filter.placeholder;
              const currentOp =
                operators[filter.key] || filter.defaultOperator || "eq";
              const activeKey =
                currentOp === "eq" ? filter.key : `${filter.key}_${currentOp}`;
              const isEnabled = enabledFilters[filter.key] !== false;

              return (
                <div
                  key={filter.key}
                  className={`filter-condition-item ${
                    !isEnabled ? "disabled" : ""
                  }`}
                  style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 8, 
                      background: '#f9f9f9', 
                      padding: '8px 12px', 
                      borderRadius: 8,
                  }}
                >
                  {/* Checkbox */}
                  <Checkbox
                    checked={isEnabled}
                    onChange={() => onToggleFilter(filter.key)}
                  />

                  {/* Field Name (Static) */}
                  <div style={{ width: 180, fontWeight: 500 }}>
                     {label}
                  </div>

                  {/* Operator */}
                  {filter.operators && (
                    <Select
                      value={currentOp}
                      onChange={(val) => onOperatorChange(filter.key, val)}
                      options={[
                        { label: "Bằng", value: "eq" },
                        { label: "Lớn hơn", value: "gt" },
                        { label: "Lớn hơn hoặc bằng", value: "gte" },
                        { label: "Nhỏ hơn", value: "lt" },
                        { label: "Nhỏ hơn hoặc bằng", value: "lte" },
                        { label: "Chứa (phân biệt hoa thường)", value: "like" },
                        { label: "Chứa (không phân biệt)", value: "ilike" },
                        { label: "Khác", value: "ne" },
                        { label: "Trong", value: "in" },
                      ].filter((op) =>
                        filter.operators?.includes(op.value as any)
                      )}
                      style={{ width: 140 }}
                      size="middle"
                    />
                  )}

                  {/* Value Input */}
                  <div style={{ flex: 1 }}>
                    {(!filter.type || filter.type === "select") && (
                      <Select
                        placeholder={`Chọn giá trị...`}
                        value={filterValues[activeKey]}
                        onChange={(value) =>
                          onFilterChange(filter.key, value)
                        }
                        options={filter.options}
                        allowClear
                        mode={currentOp === "in" ? "multiple" : undefined}
                        style={{ width: "100%" }}
                        size="middle"
                      />
                    )}

                    {(filter.type === "input" ||
                      filter.type === "number") && (
                      <Input
                        placeholder={`Nhập giá trị...`}
                        value={filterValues[activeKey]}
                        onChange={(e) =>
                          onFilterChange(filter.key, e.target.value)
                        }
                        allowClear
                        style={{ width: "100%" }}
                        type={filter.type === "number" ? "number" : "text"}
                        size="middle"
                      />
                    )}

                    {filter.type === "date" && (
                        <DatePicker
                            placeholder="Chọn ngày"
                            style={{ width: "100%" }}
                            value={filterValues[activeKey] ? dayjs(filterValues[activeKey]) : null}
                            onChange={(_date, dateString) => {
                                onFilterChange(filter.key, dateString);
                            }}
                            size="middle"
                        />
                    )}
                  </div>

                  {/* Delete Button */}
                  <Tooltip title="Xóa điều kiện này">
                    <Button
                        variant="ghost" 
                        danger 
                        onClick={() => onRemoveFilter(filter.key)}
                        icon={<DeleteOutlined />}
                        buttonSize="small"
                        className="condition-delete-btn"
                    />
                  </Tooltip>
                </div>
              );
            })}
          </div>
        )}

        {/* Add Condition Button */}
        <div className="filter-actions" style={{ marginTop: 16 }}>
          <Dropdown
            menu={{
              items: filters
                .filter((f) => !activeFilters.find((af) => af.key === f.key))
                .map((f) => ({
                  key: f.key,
                  label: f.label || f.placeholder,
                  onClick: () => onAddFilter(f.key),
                })),
              style: { maxHeight: 300, overflowY: 'auto' }
            }}
            disabled={filters.length === activeFilters.length}
            trigger={['click']}
          >
            <Button variant="outline" style={{ width: "100%", borderStyle: 'dashed' }} icon={<PlusOutlined />}>
              Thêm điều kiện lọc
            </Button>
          </Dropdown>
        </div>
      </div>

      {!hideFooter && (
        <div className="filter-builder-footer" style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
            <Button variant="outline" onClick={onCancel}>
            Hủy
            </Button>
            <Button variant="outline" onClick={onClear}>
            Bỏ lọc
            </Button>
            <Button variant="primary" onClick={onApply}>
            {applyText}
            </Button>
        </div>
      )}
    </div>
  );
};

export default FilterBuilder;
