
import React, { useState, useEffect } from 'react';
import { Badge, Button, List, Popover, Typography, Empty, Spin, Avatar, Tabs, Tooltip, Tag } from 'antd';
import {
    BellOutlined,
    CheckCircleOutlined,
    GiftOutlined,
    TrophyOutlined,
    InfoCircleOutlined,
    MessageOutlined,
    RocketOutlined
} from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '@/services/notification.service';
import type { Notification } from '@/types/notification.types';
import { formatRelativeTime } from '@/utils/formatters';

const { Text, Title, Paragraph } = Typography;

interface Props {
    isMobile?: boolean;
}

const NotificationPopover: React.FC<Props> = ({ isMobile }) => {
    const navigate = useNavigate();
    const [visible, setVisible] = useState(false);
    const [loading, setLoading] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all');

    const fetchNotifications = async () => {
        setLoading(true);
        try {
            // If activeTab is 'unread', filter by is_read=false
            const filter = activeTab === 'unread' ? { is_read: false } : {};
            const data = await notificationService.getNotifications(1, 10, filter);
            setNotifications(data.items);
            // Always update global unread count from the response (it usually comes with the envelope)
            // Ideally backend returns total unread count regardless of filter, 
            // but relying on the "unread_count" property from service which maps to backend "unreadCount"
            setUnreadCount(data.unread_count);
        } catch (error) {
            console.error('Failed to fetch notifications', error);
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
                setUnreadCount(data.unread_count);
            } catch (e) { }
        };

        pollUnread();
        const interval = setInterval(pollUnread, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleOpenChange = (newOpen: boolean) => {
        setVisible(newOpen);
    };

    const handleMarkAsRead = async (item: Notification, e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!item.is_read) {
            await notificationService.markAsRead(item.id);
            // Optimistic update
            setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, is_read: true } : n));
            setUnreadCount(prev => Math.max(0, prev - 1));
            // If in unread tab, maybe remove it? Or just keep it as read until refresh.
            // keeping it is better UX for "oops didn't mean to click"
        } else {
            // Optional: Mark as unread? Backend doesn't support it usually.
        }
    };

    const handleMarkAllRead = async () => {
        setLoading(true);
        await notificationService.markAllAsRead();
        setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        setUnreadCount(0);
        setLoading(false);
        // If unread tab, list becomes empty?
        if (activeTab === 'unread') {
            setNotifications([]);
        }
    };

    const getIcon = (type: string) => {
        const style = { fontSize: 18 };
        switch (type) {
            case 'reward': return <GiftOutlined style={{ ...style, color: '#f5222d' }} />;
            case 'achievement': return <TrophyOutlined style={{ ...style, color: '#faad14' }} />;
            case 'social': return <MessageOutlined style={{ ...style, color: '#52c41a' }} />;
            case 'quest': return <RocketOutlined style={{ ...style, color: '#13c2c2' }} />;
            case 'system':
            default: return <InfoCircleOutlined style={{ ...style, color: '#1890ff' }} />;
        }
    };

    const getAvatarBg = (type: string) => {
        switch (type) {
            case 'reward': return '#fff1f0';
            case 'achievement': return '#fffbe6';
            case 'social': return '#f6ffed';
            case 'quest': return '#e6fffb';
            default: return '#e6f7ff';
        }
    };

    const content = (
        <div style={{
            width: isMobile ? '100%' : 400,
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}>
            {/* Header - Sticky */}
            <div style={{
                padding: '16px 20px',
                borderBottom: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: 'rgba(255,255,255,0.95)',
                backdropFilter: 'blur(10px)',
                position: 'sticky',
                top: 0,
                zIndex: 10,
                borderTopLeftRadius: 12,
                borderTopRightRadius: 12
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Title level={5} style={{ margin: 0 }}>Thông báo</Title>
                    {unreadCount > 0 && <Tag color="error" style={{ borderRadius: 10 }}>{unreadCount} mới</Tag>}
                </div>
                <Tooltip title="Đánh dấu tất cả đã đọc">
                    <Button
                        type="text"
                        size="small"
                        icon={<CheckCircleOutlined />}
                        onClick={handleMarkAllRead}
                        disabled={unreadCount === 0}
                        style={{ color: unreadCount > 0 ? '#1890ff' : '#bfbfbf' }}
                    />
                </Tooltip>
            </div>

            {/* Tabs */}
            <div style={{ padding: '0 20px', borderBottom: '1px solid #f0f0f0' }}>
                <Tabs
                    activeKey={activeTab}
                    onChange={k => setActiveTab(k as any)}
                    items={[
                        { key: 'all', label: 'Tất cả' },
                        { key: 'unread', label: 'Chưa đọc' }
                    ]}
                    style={{ marginBottom: -1 }}
                    tabBarStyle={{ margin: 0 }}
                />
            </div>

            {/* List */}
            <div style={{
                flex: 1,
                overflowY: 'auto',
                maxHeight: 450,
                minHeight: 200,
                padding: 0
            }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '40px 0' }}>
                        <Spin tip="Đang tải..." />
                    </div>
                ) : notifications.length > 0 ? (
                    <List
                        dataSource={notifications}
                        renderItem={item => (
                            <List.Item
                                className="notification-item-hover"
                                onClick={() => {
                                    handleMarkAsRead(item);
                                    // Navigate if has link?
                                    // if (item.link) navigate(item.link);
                                }}
                                style={{
                                    padding: '16px 20px',
                                    cursor: 'pointer',
                                    background: !item.is_read ? '#f0f9ff' : '#fff',
                                    borderBottom: '1px solid #f9f9f9',
                                    transition: 'all 0.2s',
                                    position: 'relative'
                                }}
                            >
                                <div style={{ display: 'flex', width: '100%', gap: 16 }}>
                                    {/* Unread Indicator Dot */}
                                    {!item.is_read && (
                                        <div style={{
                                            position: 'absolute',
                                            left: 6,
                                            top: '50%',
                                            transform: 'translateY(-50%)',
                                            width: 6,
                                            height: 6,
                                            borderRadius: '50%',
                                            background: '#1890ff'
                                        }} />
                                    )}

                                    <Avatar
                                        icon={getIcon(item.type)}
                                        style={{
                                            background: getAvatarBg(item.type),
                                            flexShrink: 0,
                                            width: 40,
                                            height: 40,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            border: '1px solid rgba(0,0,0,0.03)'
                                        }}
                                    />

                                    <div style={{ flex: 1, overflow: 'hidden' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                                            <Text strong={!item.is_read} style={{ fontSize: 14, color: '#262626' }}>{item.title}</Text>
                                            <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap', marginLeft: 8 }}>
                                                {formatRelativeTime(item.created_at)}
                                            </Text>
                                        </div>
                                        <Paragraph
                                            ellipsis={{ rows: 2 }}
                                            style={{ margin: 0, fontSize: 13, color: '#595959', lineHeight: 1.5 }}
                                        >
                                            {item.message}
                                        </Paragraph>
                                    </div>
                                </div>
                            </List.Item>
                        )}
                    />
                ) : (
                    <div style={{
                        height: 300,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#999'
                    }}>
                        <Empty
                            description={activeTab === 'all' ? "Bạn chưa có thông báo nào" : "Không có thông báo mới"}
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                        />
                    </div>
                )}
            </div>

            {/* Footer - Sticky */}
            <div style={{
                padding: '12px 20px',
                borderTop: '1px solid #f0f0f0',
                textAlign: 'center',
                background: '#fafafa',
                borderBottomLeftRadius: 12,
                borderBottomRightRadius: 12
            }}>
                <Button type="link" onClick={() => { setVisible(false); navigate('/notifications'); }} style={{ fontWeight: 500 }}>
                    Xem tất cả thông báo
                </Button>
            </div>

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
            overlayStyle={{ padding: 0 }}
            overlayInnerStyle={{ borderRadius: 12, padding: 0, boxShadow: '0 9px 28px 8px rgba(0, 0, 0, 0.05), 0 6px 16px 0 rgba(0, 0, 0, 0.08), 0 3px 6px -4px rgba(0, 0, 0, 0.12)' }}
        >
            <Badge count={unreadCount} overflowCount={99} size="small" offset={[-6, 6]}>
                <Button
                    type="text"
                    shape="circle"
                    style={{
                        width: 40, height: 40,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: visible ? '#1890ff' : '#64748b'
                    }}
                    icon={<BellOutlined style={{ fontSize: 22 }} />}
                />
            </Badge>
        </Popover>
    );
};

export default NotificationPopover;
