import React from "react";
import { Modal, Typography, Button, Space, Tag } from "antd";
import { 
  CalendarOutlined, 
  ArrowRightOutlined, 
  CompassOutlined, 
  ReadOutlined,
  TrophyOutlined,
  GlobalOutlined,
  BankOutlined,
  CheckCircleOutlined
} from "@ant-design/icons";
import { Notification } from "@/types/notification.types";
import { useNavigate } from "react-router-dom";

const { Title, Text, Paragraph } = Typography;

interface NotificationDetailModalProps {
  visible: boolean;
  onClose: () => void;
  notification: Notification | null;
}

const NotificationDetailModal: React.FC<NotificationDetailModalProps> = ({
  visible,
  onClose,
  notification,
}) => {
  const navigate = useNavigate();

  if (!notification) return null;

  const getActionConfig = (type: string, data: any) => {
    switch (type) {
      case "heritage":
        return {
          label: "Xem Di tích",
          icon: <CompassOutlined />,
          path: data?.id ? `/heritage-sites/${data.id}` : "/map",
        };
      case "artifact":
        return {
          label: "Xem Cổ vật",
          icon: <BankOutlined />,
          path: data?.id ? `/artifacts/${data.id}` : "/artifacts",
        };
      case "quest":
      case "reward":
        return {
          label: "Đến trang Nhiệm vụ",
          icon: <TrophyOutlined />,
          path: "/game/quests",
        };
      case "learning":
      case "history":
        return {
          label: "Bắt đầu học",
          icon: <ReadOutlined />,
          path: data?.id ? `/game/learning/${data.id}` : "/game/learning",
        };
      case "achievement":
        return {
          label: "Xem Thành tựu",
          icon: <CheckCircleOutlined />,
          path: "/game/dashboard", // Or wherever badges are shown
        };
      case "exhibition":
        return {
          label: "Tham quan Triển lãm",
          icon: <GlobalOutlined />,
          path: data?.id ? `/exhibitions/${data.id}` : "/exhibitions",
        };
      default:
        return null;
    }
  };

  const action = getActionConfig(notification.type, notification.data);

  const handleAction = () => {
    if (action?.path) {
      navigate(action.path);
      onClose();
    }
  };

  return (
    <Modal
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnClose
      width={600}
      wrapClassName="sen-hoa-premium"
      title={
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <Title level={4} style={{ margin: 0, color: "var(--seal-red)" }}>
            Chi tiết thông báo
          </Title>
        </div>
      }
    >
      <div style={{ padding: "8px 0" }}>
        {/* Header Section */}
        <div style={{ marginBottom: 24, borderBottom: "1px dashed rgba(197, 160, 101, 0.3)", paddingBottom: 16 }}>
          <Title level={3} style={{ marginTop: 0, fontFamily: "var(--font-serif)" }}>
            {notification.title}
          </Title>
          <Space>
            <CalendarOutlined style={{ color: "#8c8c8c" }} />
            <Text type="secondary" style={{ fontSize: 13 }}>
              {new Date(notification.createdAt).toLocaleString("vi-VN")}
            </Text>
            <Tag color={notification.isRead ? "default" : "error"}>
              {notification.isRead ? "Đã đọc" : "Mới"}
            </Tag>
          </Space>
        </div>

        {/* Content Section */}
        <div style={{ marginBottom: 32, minHeight: 120 }}>
          <Paragraph style={{ fontSize: 16, lineHeight: 1.8, color: "var(--text-color-primary)" }}>
            {notification.message}
          </Paragraph>
          
          {notification.data?.extraContent && (
             <div style={{ 
               padding: 16, 
               background: "rgba(197, 160, 101, 0.05)", 
               border: "1px solid rgba(197, 160, 101, 0.2)",
               borderRadius: 8,
               marginTop: 16
             }}>
               <Text strong style={{ color: "var(--seal-red)" }}>Ghi chú thêm:</Text>
               <Paragraph style={{ marginTop: 8, fontStyle: "italic" }}>
                 {notification.data.extraContent}
               </Paragraph>
             </div>
          )}
        </div>

        {/* Footer Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <Button onClick={onClose} size="large" style={{ borderRadius: 8 }}>
            Đóng
          </Button>
          {action && (
            <Button
              type="primary"
              size="large"
              icon={action.icon}
              onClick={handleAction}
              className="btn-premium-nhun"
              style={{
                background: "var(--seal-red)",
                borderColor: "var(--seal-border)",
                borderRadius: 8,
                padding: "0 24px",
                display: "flex",
                alignItems: "center",
                gap: 8
              }}
            >
              {action.label} <ArrowRightOutlined />
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default NotificationDetailModal;
