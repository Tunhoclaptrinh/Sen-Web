import React, {useState, useEffect} from "react";
import {
  Typography,
  List,
  Button,
  Avatar,
  message,
  Tabs,
  Spin,
  Empty,
  Badge,
  Card,
  Popconfirm,
  Tooltip,
  Tag,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  GiftOutlined,
  TrophyOutlined,
  InfoCircleOutlined,
  MessageOutlined,
  RocketOutlined,
  ReadOutlined,
  EnvironmentOutlined,
  GoldOutlined,
  HistoryOutlined,
  BookOutlined,
} from "@ant-design/icons";
import {notificationService} from "@/services/notification.service";
import type {Notification} from "@/types/notification.types";
import {formatRelativeTime} from "@/utils/formatters";
import {ITEM_TYPES} from "@/config/constants";

const {Title, Text, Paragraph} = Typography;

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState("all");
  // Global unread count from the API (total, not just current page)
  const [unreadTotal, setUnreadTotal] = useState(0);

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const filter = activeTab === "unread" ? {isRead: false} : {};
      const data = await notificationService.getNotifications(page, limit, filter);
      setNotifications(data.items);
      setTotal(data.total);
      setUnreadTotal(data.unreadCount);
    } catch (error) {
      console.error("Failed to fetch notifications", error);
      message.error("Không thể tải thông báo");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [page, activeTab]);

  const handleMarkAsRead = async (item: Notification) => {
    if (item.isRead) return;
    try {
      await notificationService.markAsRead(item.id);
      // Optimistic update
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? {...n, isRead: true} : n)));
      // If we are in 'unread' tab, we might want to keep showing it but mark as read, or remove it?
      // Standard behavior: keep it until refresh or let it fade.
      // If using server side filter, removing it might affect pagination sequence.
      // For now, let's just mark it read.
      setUnreadTotal((prev) => Math.max(0, prev - 1));
      message.success("Đã đánh dấu đã đọc");
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((prev) => prev.map((n) => ({...n, isRead: true})));
      setUnreadTotal(0);
      message.success("Đã đánh dấu tất cả là đã đọc");
      // If in unread tab, refreshing would empty the list.
      if (activeTab === "unread") {
        fetchNotifications();
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await notificationService.deleteNotification(id);
      setNotifications((prev) => prev.filter((n) => n.id !== id));
      setTotal((prev) => prev - 1);
      message.success("Đã xóa thông báo");
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const handleDeleteAll = async () => {
    try {
      await notificationService.deleteAllNotifications();
      setNotifications([]);
      setTotal(0);
      setUnreadTotal(0);
      message.success("Đã xóa tất cả thông báo");
    } catch (error) {
      message.error("Xóa thất bại");
    }
  };

  const getIcon = (type: string) => {
    const style = {fontSize: 20};
    switch (type) {
      case "reward":
        return <GiftOutlined style={{...style, color: "#ff4d4f"}} />;
      case "achievement":
        return <TrophyOutlined style={{...style, color: "#faad14"}} />;
      case "social":
        return <MessageOutlined style={{...style, color: "#52c41a"}} />;
      case "quest":
        return <RocketOutlined style={{...style, color: "#13c2c2"}} />;
      case ITEM_TYPES.HERITAGE:
        return <EnvironmentOutlined style={{...style, color: "#1890ff"}} />;
      case ITEM_TYPES.ARTIFACT:
        return <GoldOutlined style={{...style, color: "#fa8c16"}} />;
      case "history":
        return <HistoryOutlined style={{...style, color: "#722ed1"}} />;
      case "learning":
        return <BookOutlined style={{...style, color: "#eb2f96"}} />;
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
      case ITEM_TYPES.HERITAGE:
        return "#e6f7ff";
      case ITEM_TYPES.ARTIFACT:
        return "#fff7e6";
      case "history":
        return "#f9f0ff";
      case "learning":
        return "#fff0f6";
      default:
        return "#f5f5f5";
    }
  };

  return (
    <div style={{maxWidth: 1200, margin: "0 auto", paddingBottom: 60, paddingTop: 20}}>
      {/* Premium Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
          background: "rgba(255,255,255,0.8)",
          backdropFilter: "blur(10px)",
          padding: "24px 32px",
          borderRadius: 24,
          border: "1px solid rgba(255,255,255,0.3)",
          boxShadow: "0 8px 32px rgba(0,0,0,0.04)",
        }}
      >
        <div style={{display: "flex", alignItems: "center", gap: 16}}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 20,
              background: "linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 16px rgba(255, 107, 107, 0.25)",
            }}
          >
            <BellOutlined style={{fontSize: 26, color: "#fff"}} />
          </div>
          <div>
            <Title level={2} style={{margin: 0, fontSize: 24, fontWeight: 700, color: "#1a1a1a"}}>
              Thông báo
            </Title>
            <div style={{display: "flex", alignItems: "center", gap: 8}}>
              <Text type="secondary" style={{fontSize: 14}}>
                Cập nhật hoạt động của bạn
              </Text>
              {unreadTotal > 0 && (
                <Tag color="error" style={{borderRadius: 10, border: "none"}}>
                  {unreadTotal} chưa đọc
                </Tag>
              )}
            </div>
          </div>
        </div>

        <div style={{display: "flex", gap: 12}}>
          <Tooltip title="Đánh dấu tất cả là đã đọc">
            <Button
              icon={<ReadOutlined />}
              onClick={handleMarkAllRead}
              disabled={unreadTotal === 0 && activeTab === "all"} // Simple disable logic
              type="text"
              style={{background: "#f5f5f5", color: "#595959"}}
            >
              Đã đọc
            </Button>
          </Tooltip>

          <Popconfirm
            title="Xóa tất cả thông báo?"
            description="Hành động này không thể hoàn tác."
            onConfirm={handleDeleteAll}
            okText="Xóa hết"
            cancelText="Hủy"
            okButtonProps={{danger: true}}
          >
            <Tooltip title="Xóa tất cả">
              <Button
                danger
                icon={<DeleteOutlined />}
                disabled={notifications.length === 0}
                type="text"
                style={{background: "#fff1f0"}}
              />
            </Tooltip>
          </Popconfirm>
        </div>
      </div>

      {/* Content Card */}
      <Card bordered={false} style={{borderRadius: 24, overflow: "hidden", boxShadow: "0 10px 40px rgba(0,0,0,0.03)"}}>
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key);
            setPage(1); // Reset page on tab change
          }}
          items={[
            {
              key: "all",
              label: <span style={{padding: "0 8px", fontSize: 15}}>Tất cả</span>,
            },
            {
              key: "unread",
              label: (
                <span style={{padding: "0 8px", fontSize: 15}}>Chưa đọc {unreadTotal > 0 && `(${unreadTotal})`}</span>
              ),
            },
          ]}
          tabBarStyle={{padding: "0 16px"}}
        />

        {loading ? (
          <div style={{textAlign: "center", padding: "60px 0"}}>
            <Spin size="large" />
          </div>
        ) : notifications.length > 0 ? (
          <List
            itemLayout="horizontal"
            dataSource={notifications}
            pagination={{
              current: page,
              onChange: (page) => setPage(page),
              pageSize: limit,
              total: total,
              align: "center",
              showSizeChanger: false,
            }}
            renderItem={(item) => (
              <List.Item
                actions={[
                  !item.isRead && (
                    <Tooltip title="Đánh dấu đã đọc">
                      <Button
                        type="text"
                        shape="circle"
                        icon={<CheckCircleOutlined style={{color: "#1890ff"}} />}
                        onClick={() => handleMarkAsRead(item)}
                        style={{background: "#e6f7ff"}}
                      />
                    </Tooltip>
                  ),
                  <Popconfirm
                    title="Xóa thông báo này?"
                    onConfirm={() => handleDelete(item.id)}
                    okText="Xóa"
                    cancelText="Hủy"
                    okButtonProps={{danger: true}}
                  >
                    <Button type="text" danger shape="circle" icon={<DeleteOutlined />} className="delete-btn-hover" />
                  </Popconfirm>,
                ]}
                style={{
                  padding: "24px",
                  transition: "all 0.3s",
                  background: !item.isRead
                    ? "linear-gradient(to right, rgba(230, 247, 255, 0.4), rgba(255, 255, 255, 0))"
                    : "transparent",
                  borderBottom: "1px solid #f5f5f5",
                  position: "relative",
                }}
                className="notification-list-item"
              >
                {/* Active indicator strip */}
                {!item.isRead && (
                  <div
                    style={{
                      position: "absolute",
                      left: 0,
                      top: "24px",
                      bottom: "24px",
                      width: 3,
                      background: "#1890ff",
                      borderRadius: "0 4px 4px 0",
                    }}
                  />
                )}

                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getIcon(item.type)}
                      size={48}
                      style={{
                        backgroundColor: getAvatarBg(item.type),
                        border: "1px solid rgba(0,0,0,0.03)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    />
                  }
                  title={
                    <div style={{display: "flex", alignItems: "center", gap: 10, marginBottom: 4}}>
                      <Text strong={!item.isRead} style={{fontSize: 16, color: "#1f1f1f"}}>
                        {item.title}
                      </Text>
                      {!item.isRead && <Badge status="processing" color="#1890ff" />}
                      {item.isRead && <CheckCircleOutlined style={{fontSize: 12, color: "#52c41a", opacity: 0.5}} />}
                    </div>
                  }
                  description={
                    <div>
                      <Paragraph style={{margin: "4px 0 10px", color: "#595959", fontSize: 14, lineHeight: 1.6}}>
                        {item.message}
                      </Paragraph>
                      <Text type="secondary" style={{fontSize: 12}}>
                        {formatRelativeTime(item.createdAt)}
                      </Text>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        ) : (
          <div style={{padding: "60px 0"}}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={
                <div style={{color: "#8c8c8c"}}>
                  {activeTab === "unread" ? "Tuyệt vời! Bạn đã đọc hết thông báo" : "Bạn chưa có thông báo nào"}
                </div>
              }
            />
          </div>
        )}
      </Card>
      <style>
        {`
                .notification-list-item:hover {
                    background-color: #fafafa !important; 
                }
                .delete-btn-hover:hover {
                    background-color: #fff1f0 !important;
                }
                `}
      </style>
    </div>
  );
};

export default NotificationsPage;
