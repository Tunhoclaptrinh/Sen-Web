import React, {useState, useEffect} from "react";
import {Button, List, Popover, Typography, Empty, Spin, Avatar, Tabs, Tooltip, Badge} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  RocketOutlined,
  BookOutlined,
  HistoryOutlined,
  GoldOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import NotificationDetailModal from "@/components/common/NotificationDetailModal";
import {notificationService} from "@/services/notification.service";
import type {Notification} from "@/types/notification.types";
import {formatRelativeTime} from "@/utils/formatters";
import {ITEM_TYPES} from "@/config/constants";

const {Text, Title, Paragraph} = Typography;

interface Props {
  isMobile?: boolean;
}

const NotificationPopover: React.FC<Props> = ({isMobile}) => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      // If activeTab is 'unread', filter by is_read=false
      const filter = activeTab === "unread" ? {isRead: false} : {};
      const data = await notificationService.getNotifications(1, 10, filter);
      setNotifications(data.items);
      // Always update global unread count from the response (it usually comes with the envelope)
      // Ideally backend returns total unread count regardless of filter,
      // but relying on the "unread_count" property from service which maps to backend "unreadCount"
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchNotifications();
    }
  }, [visible, activeTab]);

  // Poll for unread count only (optimization)
  useEffect(() => {
    const pollUnread = async () => {
      try {
        const data = await notificationService.getNotifications(1, 1);
        setUnreadCount(data.unreadCount);
      } catch (e) {}
    };

    pollUnread();
    const interval = setInterval(pollUnread, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleOpenChange = (newOpen: boolean) => {
    setVisible(newOpen);
  };

  const handleMarkAsRead = async (item: Notification, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setSelectedNotification(item);
    setDetailVisible(true);
    
    if (!item.isRead) {
      try {
        await notificationService.markAsRead(item.id);
        // Optimistic update
        setNotifications((prev) => prev.map((n) => (n.id === item.id ? {...n, isRead: true} : n)));
        setUnreadCount((prev) => Math.max(0, prev - 1));
      } catch (error) {
        console.error("Failed to mark notification as read:", error);
      }
    }
  };

  const handleMarkAllRead = async () => {
    setLoading(true);
    await notificationService.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({...n, isRead: true})));
    setUnreadCount(0);
    setLoading(false);
    // If unread tab, list becomes empty?
    if (activeTab === "unread") {
      setNotifications([]);
    }
  };

  const getIcon = (type: string) => {
    const style = {fontSize: 18};
    switch (type) {
      case "reward":
        return <GiftOutlined style={{...style, color: "#f5222d"}} />;
      case "achievement":
        return <TrophyOutlined style={{...style, color: "#faad14"}} />;
      case "social":
        return <MessageOutlined style={{...style, color: "#52c41a"}} />;
      case "quest":
        return <RocketOutlined style={{...style, color: "#13c2c2"}} />;
      case "learning":
        return <BookOutlined style={{...style, color: "#eb2f96"}} />;
      case "history":
        return <HistoryOutlined style={{...style, color: "#722ed1"}} />;
      case ITEM_TYPES.ARTIFACT:
        return <GoldOutlined style={{...style, color: "#fa8c16"}} />;
      case ITEM_TYPES.HERITAGE:
        return <EnvironmentOutlined style={{...style, color: "#1890ff"}} />;
      case "review":
        return <CheckCircleOutlined style={{...style, color: "#52c41a"}} />;
      case "system":
      default:
        return <InfoCircleOutlined style={{...style, color: "#1890ff"}} />;
    }
  };

  const getAvatarBg = (type: string) => {
    switch (type) {
      case "reward":
        return "#fff1f0";
      case "achievement":
        return "#fffbe6";
      case "social":
        return "#f6ffed";
      case "quest":
        return "#e6fffb";
      case "learning":
        return "#fff0f6";
      case "history":
        return "#f9f0ff";
      case ITEM_TYPES.ARTIFACT:
        return "#fff7e6";
      case ITEM_TYPES.HERITAGE:
        return "#e6f7ff";
      case "review":
        return "#f6ffed";
      default:
        return "#e6f7ff";
    }
  };

  const content = (
    <div
      className="sen-hoa-premium"
      style={{
        width: isMobile ? "100%" : 400,
        display: "flex",
        flexDirection: "column",
        background: "transparent",
      }}
    >
      {/* Header - Sticky */}
      <div
        style={{
          padding: "16px 20px",
          borderBottom: "1px dashed rgba(197, 160, 101, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          background: "transparent",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 8}}>
          <Title level={5} style={{margin: 0, fontFamily: "var(--font-serif)", color: "var(--seal-red)"}}>
            Thông báo
          </Title>
          {unreadCount > 0 && <Badge count={unreadCount} size="small" />}
        </div>
        <Tooltip title="Đánh dấu tất cả đã đọc">
          <Button
            type="text"
            size="small"
            icon={<CheckCircleOutlined style={{fontSize: 14}} />}
            onClick={(e) => {
              e.stopPropagation();
              handleMarkAllRead();
            }}
            disabled={unreadCount === 0}
            className="btn-premium-nhun"
            style={{
              color: unreadCount > 0 ? "white" : "#bfbfbf",
              background: unreadCount > 0 ? "var(--seal-red)" : "#f5f5f5",
              border: unreadCount > 0 ? "1px solid var(--seal-border)" : "1px solid #d9d9d9",
              borderRadius: "4px",
              width: "28px",
              height: "28px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 0,
              margin: "4px 0", // Space for vertical nhún
            }}
          />
        </Tooltip>
      </div>

      {/* Tabs */}
      <div style={{padding: "0 20px", borderBottom: "1px solid #f0f0f0"}}>
        <Tabs
          activeKey={activeTab}
          onChange={(k) => setActiveTab(k as any)}
          items={[
            {key: "all", label: "Tất cả"},
            {key: "unread", label: "Chưa đọc"},
          ]}
          style={{marginBottom: -1}}
          tabBarStyle={{margin: 0}}
        />
      </div>

      {/* List */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          maxHeight: 450,
          minHeight: 200,
          padding: 0,
        }}
      >
        {loading ? (
          <div style={{textAlign: "center", padding: "40px 0"}}>
            <Spin tip="Đang tải..." />
          </div>
        ) : notifications.length > 0 ? (
          <List
            dataSource={notifications}
            renderItem={(item) => (
              <List.Item
                className={`notification-list-item ${!item.isRead ? "unread" : ""}`}
                onClick={() => {
                  handleMarkAsRead(item);
                }}
                style={{
                  padding: "16px 20px",
                  cursor: "pointer",
                  transition: "all 0.2s",
                  position: "relative",
                  borderBottom: "1px solid rgba(197, 160, 101, 0.1)",
                }}
              >
                <div style={{display: "flex", width: "100%", gap: 16}}>
                  {/* Unread Indicator Dot */}
                  {!item.isRead && (
                    <div
                      style={{
                        position: "absolute",
                        left: 10,
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: 10,
                        height: 10,
                        borderRadius: "50%",
                        background: "var(--seal-red)",
                        border: "2px solid #fff",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        zIndex: 2,
                      }}
                    />
                  )}

                  <Avatar
                    icon={getIcon(item.type)}
                    style={{
                      background: getAvatarBg(item.type),
                      flexShrink: 0,
                      width: 40,
                      height: 40,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      border: "1px solid rgba(0,0,0,0.03)",
                    }}
                  />

                  <div style={{flex: 1, overflow: "hidden"}}>
                    <div style={{display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2}}>
                      <Text strong={!item.isRead} style={{fontSize: 15, color: "var(--text-color-primary)", fontFamily: "var(--font-serif)"}}>
                        {item.title}
                      </Text>
                      <Text type="secondary" style={{fontSize: 11, whiteSpace: "nowrap", marginLeft: 8, opacity: 0.7}}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </div>
                    <Paragraph
                      ellipsis={{rows: 2}}
                      style={{margin: 0, fontSize: 13, color: "#595959", lineHeight: 1.5}}
                    >
                      {item.message}
                    </Paragraph>
                  </div>

                  {/* Actions for individual item */}
                  {!item.isRead && (
                    <div style={{display: "flex", alignItems: "center", marginLeft: 8, height: "100%"}}>
                      <Tooltip title="Đánh dấu đã đọc">
                        <Button
                          type="text"
                          size="small"
                          icon={<CheckCircleOutlined style={{fontSize: 12}} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(item);
                          }}
                          className="btn-premium-nhun"
                          style={{
                            color: "white",
                            background: "var(--seal-red)",
                            border: "1px solid var(--seal-border)",
                            borderRadius: "4px",
                            width: "24px",
                            height: "24px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                          }}
                        />
                      </Tooltip>
                    </div>
                  )}
                </div>
              </List.Item>
            )}
          />
        ) : (
          <div
            style={{
              height: 300,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              color: "#999",
            }}
          >
            <Empty
              description={activeTab === "all" ? "Bạn chưa có thông báo nào" : "Không có thông báo mới"}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          </div>
        )}
      </div>

      {/* Footer - Optimized */}
      <div
        style={{
          padding: "8px 16px",
          borderTop: "1px dashed rgba(197, 160, 101, 0.2)",
          textAlign: "center",
          background: "transparent",
        }}
      >
        <Button
          type="link"
          onClick={() => {
            navigate("/notifications");
            setVisible?.(false);
          }}
          className="btn-premium-nhun"
          style={{fontFamily: "var(--font-serif)", color: "var(--seal-red)"}}
        >
          Xem tất cả thông báo
        </Button>
      </div>

      <NotificationDetailModal
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        notification={selectedNotification}
      />
      <style>
        {`
                .notification-item-hover:hover {
                    background-color: #fafafa !important;
                }
                `}
      </style>
    </div>
  );

  return (
    <Popover
      content={content}
      trigger="click"
      open={visible}
      onOpenChange={handleOpenChange}
      placement="bottomRight"
      arrow={false}
    >
      <Badge count={unreadCount} offset={[-2, 2]} size="small">
        <Button
          type="text"
          icon={<BellOutlined style={{fontSize: 20}} />}
          className={`header-action-btn ${visible ? "active" : ""}`}
        />
      </Badge>
    </Popover>
  );
};

export default NotificationPopover;
