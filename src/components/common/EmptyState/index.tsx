import React from "react";
import { Empty, Button, EmptyProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";

interface EmptyStateProps extends EmptyProps {
  title?: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  showAction?: boolean;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description = "Không có dữ liệu",
  image,
  actionText,
  onAction,
  showAction = true,
  ...props
}) => {
  return (
    <div style={{ padding: "50px 0", textAlign: "center" }}>
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            {title && (
              <h3 style={{ marginBottom: 8, fontWeight: 600 }}>{title}</h3>
            )}
            <p style={{ color: "#8c8c8c", margin: 0 }}>{description}</p>
          </div>
        }
        {...props}
      >
        {showAction && actionText && onAction && (
          <Button type="primary" icon={<PlusOutlined />} onClick={onAction}>
            {actionText}
          </Button>
        )}
      </Empty>
    </div>
  );
};

export default EmptyState;
