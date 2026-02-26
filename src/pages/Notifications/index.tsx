import React, {useState, useEffect} from "react";
import {
  Typography,
  List,
  Button,
  Avatar,
  message,
  Card,
  Popconfirm,
  Tooltip,
  Spin,
  Tabs,
  Badge,
  Empty,
} from "antd";
import {
  BellOutlined,
  CheckCircleOutlined,
  DeleteOutlined,
  GiftOutlined,
  TrophyOutlined,
  ReadOutlined,
  EnvironmentOutlined,
  GoldOutlined,
} from "@ant-design/icons";

import NotificationDetailModal from "@/components/common/NotificationDetailModal";
import {notificationService} from "@/services/notification.service";
import type {Notification} from "@/types/notification.types";
import {formatRelativeTime} from "@/utils/formatters";
import {ITEM_TYPES} from "@/config/constants";

const {Title, Text, Paragraph} = Typography;

import "./styles.less";

const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [activeTab, setActiveTab] = useState<"all" | "unread">("all");
  const [detailVisible, setDetailVisible] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState<Notification | null>(null);
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
      setNotifications((prev) => prev.map((n) => (n.id === item.id ? {...n, isRead: true} : n)));
      setUnreadTotal((prev) => Math.max(0, prev - 1));
      message.success("Đã đánh dấu đã đọc");
      if (activeTab === "unread") {
        // If in unread tab, maybe refresh after a small delay or remove locally
        setTimeout(() => fetchNotifications(), 1000);
      }
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
        return <GiftOutlined style={{...style, color: "#8b1d1d"}} />;
      case "achievement":
        return <TrophyOutlined style={{...style, color: "#c5a065"}} />;
      case ITEM_TYPES.HERITAGE:
        return <EnvironmentOutlined style={{...style, color: "#5d4037"}} />;
      case ITEM_TYPES.ARTIFACT:
        return <GoldOutlined style={{...style, color: "#8b1d1d"}} />;
      default:
        return <BellOutlined style={{...style, color: "#886a64"}} />;
    }
  };

  return (
    <div className="notifications-page-container sen-hoa-premium">
      {/* Heritage Header */}
      <div className="notifications-header">
        <div className="header-left">
          <div className="icon-seal">
            <BellOutlined />
          </div>
          <div className="title-group">
            <div style={{display: "flex", alignItems: "center", gap: 12}}>
              <Title level={2} style={{margin: 0}}>Thông báo</Title>
              {unreadTotal > 0 && <Badge count={unreadTotal} className="unread-badge" style={{backgroundColor: "var(--seal-red)"}} />}
            </div>
            <div className="subtitle">
              <Text>Cập nhật hoạt động của bạn</Text>
            </div>
          </div>
        </div>

        <div className="header-actions">
          <Button
            icon={<ReadOutlined />}
            onClick={handleMarkAllRead}
            disabled={unreadTotal === 0}
            className="btn-heritage-ghost btn-premium-nhun"
            style={{
              padding: "0 20px",
              height: "40px",
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            Đọc tất cả
          </Button>

          <Popconfirm
            title="Xóa tất cả thông báo?"
            onConfirm={handleDeleteAll}
            okText="Xóa hết"
            cancelText="Hủy"
            okButtonProps={{danger: true}}
          >
            <Button 
              danger 
              icon={<DeleteOutlined />} 
              disabled={notifications.length === 0} 
              className="btn-heritage-danger btn-premium-nhun" 
            />
          </Popconfirm>
        </div>
      </div>

      {/* Main Content Card */}
      <Card className="notifications-main-card">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => {
            setActiveTab(key as any);
            setPage(1);
          }}
          items={[
            {
              key: "all",
              label: "Tất cả thông báo",
            },
            {
              key: "unread",
              label: `Chưa đọc ${unreadTotal > 0 ? `(${unreadTotal})` : ""}`,
            },
          ]}
        />

        {loading ? (
          <div className="loading-wrapper">
            <Spin size="large" tip="Đang tìm kiếm tin mới..." />
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
                className={`notification-list-item ${!item.isRead ? "unread" : ""}`}
                onClick={() => {
                  setSelectedNotification(item);
                  setDetailVisible(true);
                  if (!item.isRead) handleMarkAsRead(item);
                }}
                style={{ cursor: "pointer" }}
                actions={[
                    !item.isRead && (
                      <Tooltip title="Đánh dấu đã đọc">
                        <Button
                          type="text"
                          icon={<CheckCircleOutlined style={{fontSize: 14}} />}
                          onClick={() => handleMarkAsRead(item)}
                          className="mark-read-btn btn-premium-nhun"
                          style={{
                            color: "white",
                            background: "var(--seal-red)",
                            border: "1px solid var(--seal-border)",
                            borderRadius: "4px",
                            width: "32px",
                            height: "32px",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: 0,
                          }}
                        />
                      </Tooltip>
                    ),
                    <Popconfirm title="Xóa thông báo này?" onConfirm={() => handleDelete(item.id)}>
                      <Button 
                        type="text" 
                        danger 
                        icon={<DeleteOutlined style={{fontSize: 14}} />} 
                        className="delete-btn btn-premium-nhun" 
                        style={{
                          background: "#fff1f0",
                          border: "1px solid #ffa39e",
                          borderRadius: "4px",
                          width: "32px",
                          height: "32px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          padding: 0,
                        }}
                      />
                    </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={
                    <Avatar
                      icon={getIcon(item.type)}
                      size={48}
                      className={`notification-avatar ${item.type}`}
                    />
                  }
                  title={
                    <div className="item-title-row">
                      <Text strong={!item.isRead}>{item.title}</Text>
                      <Text className="time-text">{formatRelativeTime(item.createdAt)}</Text>
                    </div>
                  }
                  description={<Paragraph className="item-message">{item.message}</Paragraph>}
                />
              </List.Item>
            )}
          />
        ) : (
          <div className="empty-wrapper">
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description={activeTab === "unread" ? "Tuyệt vời! Bạn đã đọc sạch thông báo." : "Hòm thư đang trống."}
            />
          </div>
        )}
      </Card>
      <NotificationDetailModal 
        visible={detailVisible}
        onClose={() => setDetailVisible(false)}
        notification={selectedNotification}
      />
    </div>
  );
};

export default NotificationsPage;
