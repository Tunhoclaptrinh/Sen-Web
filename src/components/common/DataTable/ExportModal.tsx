import React, { useState, useEffect } from "react";
import { Modal, Radio, InputNumber, Space, Typography, Divider } from "antd";
import { DownloadOutlined, FilterOutlined } from "@ant-design/icons";
import { Button } from "@/components/common";
import { FilterConfig } from "./types";
import FilterBuilder from "./FilterBuilder";

interface ExportModalProps {
  visible: boolean;
  onCancel: () => void;
  onOk: (options: ExportOptions) => void;
  loading?: boolean;
  totalRecords?: number;
  currentPageSize?: number;
  filters?: FilterConfig[];
  currentFilters?: Record<string, any>; // Initial filter values from table
}

export interface ExportOptions {
  scope: "page" | "all" | "custom";
  limit?: number;
  format: "xlsx" | "csv";
  filters?: Record<string, any>; // Ad-hoc filters
}

const ExportModal: React.FC<ExportModalProps> = ({
  visible,
  onCancel,
  onOk,
  loading = false,
  totalRecords = 0,
  currentPageSize = 10,
  filters = [],
  currentFilters = {}
}) => {
  const [scope, setScope] = useState<"page" | "all" | "custom">("page");
  const [limit, setLimit] = useState<number>(100);
  const [format, setFormat] = useState<"xlsx" | "csv">("xlsx");
  const [showFilters, setShowFilters] = useState(false);

  // Local Filter State
  const [localFilterValues, setLocalFilterValues] = useState<Record<string, any>>({});
  const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);
  const [operators, setOperators] = useState<Record<string, string>>({});
  const [enabledFilters, setEnabledFilters] = useState<Record<string, boolean>>({});

  // Initialize local filters with current table filters when modal opens
  useEffect(() => {
    if (visible) {
        setLocalFilterValues({ ...currentFilters });
        // Infer active filters from values
        const active: FilterConfig[] = [];
        filters.forEach(f => {
            // Check if any key starting with f.key exists in values
             if (Object.keys(currentFilters).some(k => k.startsWith(f.key))) {
                active.push(f);
                setEnabledFilters(prev => ({ ...prev, [f.key]: true }));
             }
        });
        setActiveFilters(active);
    }
  }, [visible, currentFilters, filters]);


  const handleOk = () => {
    onOk({
      scope,
      limit: scope === "custom" ? limit : undefined,
      format,
      filters: localFilterValues
    });
  };

  /* Helper to get the correct filter key based on operator */
  const getActiveFilterKey = (filterKey: string, op?: string) => {
    // Find filter config to get default operator
    const filterConfig = filters.find(f => f.key === filterKey);
    const defaultOp = filterConfig?.defaultOperator || 'eq';
    const currentOp = op || operators[filterKey] || defaultOp;
    return currentOp === "eq" ? filterKey : `${filterKey}_${currentOp}`;
  };

  const handleOperatorChange = (filterKey: string, newOp: string) => {
      const filterConfig = filters.find(f => f.key === filterKey);
      const defaultOp = filterConfig?.defaultOperator || 'eq';
      const oldOp = operators[filterKey] || defaultOp;
      
      if (oldOp === newOp) return;
  
      setOperators((prev) => ({ ...prev, [filterKey]: newOp }));
  
      const oldKey = getActiveFilterKey(filterKey, oldOp);
      const newKey = getActiveFilterKey(filterKey, newOp);
      const currentValue = localFilterValues[oldKey];
  
      if (currentValue !== undefined && currentValue !== null && currentValue !== "") {
         setLocalFilterValues(prev => {
             const next = { ...prev };
             next[newKey] = currentValue;
             delete next[oldKey];
             return next;
         })
      }
    };

    const handleFilterValueChange = (filterKey: string, value: any) => {
      const activeKey = getActiveFilterKey(filterKey);
      setLocalFilterValues(prev => ({ ...prev, [activeKey]: value }))
    };

    const addFilterCondition = (filterKey: string) => {
      const filterToAdd = filters.find((f) => f.key === filterKey);
      if (filterToAdd && !activeFilters.find((f) => f.key === filterKey)) {
        setActiveFilters((prev) => [...prev, filterToAdd]);
        setEnabledFilters((prev) => ({ ...prev, [filterKey]: true }));
      }
    };
  
    const removeFilterCondition = (filterKey: string) => {
      setActiveFilters((prev) => prev.filter((f) => f.key !== filterKey));
       
       const activeKey = getActiveFilterKey(filterKey);

       setLocalFilterValues((prev) => {
          const next = { ...prev };
          delete next[activeKey];
          return next;
       });
      setEnabledFilters((prev) => {
        const newEnabled = { ...prev };
        delete newEnabled[filterKey];
        return newEnabled;
      });
    };
     const toggleFilterEnabled = (key: string) => {
          setEnabledFilters((prev) => ({ ...prev, [key]: !prev[key] }));
    };

  return (
    <Modal
      title='Tùy chọn xuất dữ liệu'
      open={visible}
      onCancel={onCancel}
      footer={null} // Custom footer
      width={800}
      className="export-modal"
    >
      <div style={{ padding: '20px 0' }}>
        <Space direction="vertical" style={{ width: "100%" }} size="large">
          
          {/* Main Options Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
              {/* Scope Section */}
              <div>
                 <Divider><Typography.Text strong style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
                      Phạm vi dữ liệu:
                  </Typography.Text></Divider>
                  <div style={{ 
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 12,
                  }}>
                      <Radio.Group
                        value={scope}
                        onChange={(e) => setScope(e.target.value)}
                        style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                      >
                          <Radio value="page">Trang hiện tại <span style={{ color: '#8c8c8c' }}>({currentPageSize} dòng)</span></Radio>
                          <Radio value="all">Tất cả kết quả <span style={{ color: '#8c8c8c' }}>({totalRecords} dòng)</span></Radio>
                          <div style={{ display: 'flex', alignItems: 'center' }}>
                            <Radio value="custom">Tùy chỉnh:</Radio>
                            {scope === "custom" && (
                                <InputNumber
                                  min={1}
                                  max={10000}
                                  value={limit}
                                  onChange={(val) => setLimit(val || 100)}
                                  addonAfter="dòng"
                                  size="small"
                                  style={{ width: 120, marginLeft: 8 }}
                                />
                            )}
                          </div>
                      </Radio.Group>
                  </div>
              </div>

              {/* Format Section */}
              <div>
                   <Divider><Typography.Text strong style={{ display: 'block', marginBottom: 12, fontSize: 14 }}>
                       Định dạng tập tin:
                   </Typography.Text></Divider>
                   <div style={{ 
                       display: 'flex',
                       flexDirection: 'column',
                       gap: 12
                   }}>
                       <Radio.Group 
                            value={format} 
                            onChange={(e) => setFormat(e.target.value)}
                            style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
                       >
                           <Radio value="xlsx">Microsoft Excel (.xlsx)</Radio>
                           <Radio value="csv">Comma Separated (.csv)</Radio>
                       </Radio.Group>
                   </div>
              </div>
          </div>

          {/* Advanced Filter Section */}
          {filters.length > 0 && (
            <div style={{paddingTop: 20 }}>
                <div 
                    style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        cursor: 'pointer', 
                        marginBottom: showFilters ? 16 : 0,
                        userSelect: 'none'
                    }}
                    onClick={() => setShowFilters(!showFilters)}
                >
                    <FilterOutlined style={{ marginRight: 8, color: showFilters ? 'var(--primary-color)' : 'inherit' }} />
                    <span style={{ fontWeight: 500, color: showFilters ? 'var(--primary-color)' : 'inherit' }}>
                        Bộ lọc nâng cao
                    </span>
                    <span style={{ marginLeft: 'auto', fontSize: 12, color: '#8c8c8c' }}>
                        {showFilters ? 'Ẩn bộ lọc' : 'Mở rộng'}
                    </span>
                </div>
                
                {showFilters && (
                     <div style={{ 
                         background: '#fafafa', 
                         borderRadius: 8, 
                     }}>
                        <FilterBuilder 
                            filters={filters}
                            activeFilters={activeFilters}
                            filterValues={localFilterValues}
                            operators={operators}
                            enabledFilters={enabledFilters}
                            onAddFilter={addFilterCondition}
                            onRemoveFilter={removeFilterCondition}
                            onFilterChange={handleFilterValueChange}
                            onOperatorChange={handleOperatorChange}
                            onToggleFilter={toggleFilterEnabled}
                            onCancel={() => setShowFilters(false)}
                            hideFooter={true} 
                        />
                     </div>
                )}
            </div>
          )}
        </Space>
      </div>

      {/* Custom Centered Footer */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginTop: 10 }}>
          <Button variant="outline" onClick={onCancel} style={{ minWidth: 100 }}>
              Hủy bỏ
          </Button>
          <Button 
            variant="primary" 
            onClick={handleOk} 
            loading={loading}
            icon={<DownloadOutlined />}
            style={{ minWidth: 140 }}
          >
            Xuất dữ liệu
          </Button>
      </div>
    </Modal>
  );
};

export default ExportModal;
