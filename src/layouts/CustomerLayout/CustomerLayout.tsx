import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Button, Badge, Avatar, Drawer, Statistic, Card } from 'antd';
import {
    HomeOutlined,
    TrophyOutlined,
    BookOutlined,
    FlagOutlined,
    BankOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    MenuFoldOutlined,
    GiftOutlined,
    MessageOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import logo from '@/assets/images/logo.png';
import './CustomerLayout.css';

const { Header, Sider, Content, Footer } = Layout;

const CustomerLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { progress } = useSelector((state: RootState) => state.game);

    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [dailyRewardVisible, setDailyRewardVisible] = useState(false);
    const [aiChatVisible, setAiChatVisible] = useState(false);

    // Handle responsive
    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            if (mobile) {
                setCollapsed(true);
            }
        };

        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    // Handle logout
    const handleLogout = () => {
        dispatch(logout() as any);
        navigate('/login');
    };

    // Get active menu key
    const getActiveKey = (): string => {
        const path = location.pathname;
        if (path.startsWith('/game')) return 'game';
        if (path.startsWith('/learning')) return 'learning';
        if (path.startsWith('/quests')) return 'quests';
        if (path.startsWith('/heritage-sites')) return 'heritage';
        if (path.startsWith('/profile')) return 'profile';
        if (path.startsWith('/collections')) return 'collections';
        return 'home';
    };

    // Menu items
    const menuItems = [
        {
            key: 'home',
            icon: <HomeOutlined />,
            label: 'Trang chủ',
            onClick: () => navigate('/'),
        },
        {
            key: 'game',
            icon: <TrophyOutlined />,
            label: 'Trò chơi',
            children: [
                {
                    key: 'chapters',
                    label: 'Sen Hoa',
                    onClick: () => navigate('/game/chapters'),
                },
                {
                    key: 'museum',
                    label: 'Bảo tàng',
                    onClick: () => navigate('/game/museum'),
                },
                {
                    key: 'leaderboard',
                    label: 'Bảng xếp hạng',
                    onClick: () => navigate('/game/leaderboard'),
                },
            ],
        },
        {
            key: 'learning',
            icon: <BookOutlined />,
            label: 'Học tập',
            onClick: () => navigate('/learning'),
        },
        {
            key: 'quests',
            icon: <FlagOutlined />,
            label: 'Nhiệm vụ',
            onClick: () => navigate('/quests'),
        },
        {
            key: 'heritage',
            icon: <BankOutlined />,
            label: 'Di sản',
            onClick: () => navigate('/heritage-sites'),
        },
    ];

    // User dropdown menu
    const userMenuItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ',
            onClick: () => navigate('/profile'),
        },
        {
            key: 'collections',
            icon: <BookOutlined />,
            label: 'Bộ sưu tập',
            onClick: () => navigate('/collections'),
        },
        {
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    // Sidebar content
    const sidebarContent = (
        <Menu
            mode="inline"
            selectedKeys={[getActiveKey()]}
            defaultOpenKeys={['game']}
            items={menuItems}
            style={{ height: '100%', borderRight: 0 }}
        />
    );

    return (
        <Layout className="customer-layout" style={{ minHeight: '100vh' }}>
            {/* Desktop Sidebar */}
            {!isMobile && (
                <Sider
                    collapsible
                    collapsed={collapsed}
                    onCollapse={setCollapsed}
                    width={250}
                    theme="light"
                    className="customer-sider"
                >
                    <div className="logo-container">
                        <img src={logo} alt="Logo" className="logo" />
                        {!collapsed && <span className="logo-text">Sen Heritage</span>}
                    </div>
                    {sidebarContent}
                </Sider>
            )}

            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    title="Menu"
                    placement="left"
                    onClose={() => setDrawerVisible(false)}
                    open={drawerVisible}
                    bodyStyle={{ padding: 0 }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            <Layout>
                {/* Header */}
                <Header className="customer-header">
                    <div className="header-left">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuFoldOutlined />}
                                onClick={() => setDrawerVisible(true)}
                                className="mobile-menu-btn"
                            />
                        )}
                    </div>

                    {/* Progress Stats */}
                    <div className="progress-stats">
                        <div className="stat-item">
                            <TrophyOutlined style={{ color: '#ffd700' }} />
                            <span>{progress?.total_points || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span style={{ fontSize: 16 }}>🌸</span>
                            <span>{progress?.total_sen_petals || 0}</span>
                        </div>
                        <div className="stat-item">
                            <span style={{ fontSize: 16 }}>💰</span>
                            <span>{progress?.coins || 0}</span>
                        </div>
                    </div>

                    <div className="header-right">
                        {/* Daily Reward */}
                        <Button
                            type="text"
                            icon={<GiftOutlined />}
                            onClick={() => setDailyRewardVisible(true)}
                            className="header-btn"
                        />

                        {/* AI Chat */}
                        <Button
                            type="text"
                            icon={<MessageOutlined />}
                            onClick={() => setAiChatVisible(true)}
                            className="header-btn"
                        />

                        {/* Notifications */}
                        <Badge count={5} size="small">
                            <Button
                                type="text"
                                icon={<BellOutlined />}
                                className="header-btn"
                            />
                        </Badge>

                        {/* User Menu */}
                        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
                            <div className="user-info">
                                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                                {!isMobile && <span className="user-name">{user?.name}</span>}
                            </div>
                        </Dropdown>
                    </div>
                </Header>

                {/* Content */}
                <Content className="customer-content">
                    <Outlet />
                </Content>

                {/* Footer */}
                <Footer className="customer-footer">
                    <div>Sen Heritage ©{new Date().getFullYear()} - Khám phá di sản Việt Nam</div>
                </Footer>
            </Layout>

            {/* Daily Reward Modal */}
            <Drawer
                title="🎁 Phần thưởng hàng ngày"
                placement="right"
                onClose={() => setDailyRewardVisible(false)}
                open={dailyRewardVisible}
                width={isMobile ? '100%' : 400}
            >
                <Card>
                    <Statistic
                        title="Ngày đăng nhập liên tiếp"
                        value={7}
                        suffix="ngày"
                    />
                    <Button type="primary" block style={{ marginTop: 16 }}>
                        Nhận thưởng
                    </Button>
                </Card>
            </Drawer>

            {/* AI Chat Drawer */}
            <Drawer
                title="💬 Trợ lý AI"
                placement="right"
                onClose={() => setAiChatVisible(false)}
                open={aiChatVisible}
                width={isMobile ? '100%' : 400}
            >
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p>Chat với nhân vật lịch sử</p>
                    <p style={{ color: '#999' }}>Tính năng đang phát triển...</p>
                </div>
            </Drawer>
        </Layout>
    );
};

export default CustomerLayout;
