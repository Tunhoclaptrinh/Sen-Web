import React from "react";
import { Empty, Button } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import "./styles.less";
import { EmptyStateProps } from "./types";

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
    <div className="empty-state">
      <Empty
        image={image || Empty.PRESENTED_IMAGE_SIMPLE}
        description={
          <div>
            {title && (
              <h3 className="empty-state__title">{title}</h3>
            )}
            <p className="empty-state__description">{description}</p>
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
