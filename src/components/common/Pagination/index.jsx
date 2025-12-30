// ============================================
// src/components/common/Pagination/index.jsx
// ============================================
import React from 'react';
import { Pagination as AntPagination } from 'antd';

const Pagination = ({
  current,
  pageSize,
  total,
  onChange,
  onShowSizeChange,
  style,
  ...props
}) => {
  return (
    <div style={{ marginTop: 24, textAlign: 'right', ...style }}>
      <AntPagination
        current={current}
        pageSize={pageSize}
        total={total}
        onChange={onChange}
        onShowSizeChange={onShowSizeChange}
        showSizeChanger
        showQuickJumper
        showTotal={(total) => `Tổng ${total} mục`}
        pageSizeOptions={['10', '20', '50', '100']}
        {...props}
      />
    </div>
  );
};

export default Pagination;
