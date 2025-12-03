// ============================================
// src/components/common/EmptyState/index.jsx
// ============================================
import React from 'react';
import { Empty, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const EmptyState = ({
  description = 'Không có dữ liệu',
  image,
  actionText,
  onAction,
}) => {
  return (
    <div style={{ padding: '50px 0', textAlign: 'center' }}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={description}
      >
        {actionText && onAction && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
