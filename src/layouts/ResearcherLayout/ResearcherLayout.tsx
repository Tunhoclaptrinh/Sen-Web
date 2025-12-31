import React, { useState, useEffect } from 'react';
import { Layout, Menu, Dropdown, Button, Badge, Avatar, FloatButton } from 'antd';
import {
    HomeOutlined,
    BankOutlined,
    FileImageOutlined,
    PictureOutlined,
    UserOutlined,
    LogoutOutlined,
    BellOutlined,
    MenuFoldOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    BarChartOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import logo from '@/assets/images/logo.png';
import './ResearcherLayout.css';

const { Header, Sider, Content, Footer } = Layout;

const ResearcherLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const [collapsed, setCollapsed] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

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
        if (path.startsWith('/researcher/heritage')) return 'heritage';
        if (path.startsWith('/researcher/artifacts')) return 'artifacts';
        if (path.startsWith('/researcher/exhibitions')) return 'exhibitions';
        if (path.startsWith('/researcher/analytics')) return 'analytics';
        if (path.startsWith('/profile')) return 'profile';
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
            key: 'heritage',
            icon: <BankOutlined />,
            label: 'Di sản',
            children: [
                {
                    key: 'my-heritage',
                    label: 'Bài viết của tôi',
                    onClick: () => navigate('/researcher/heritage/my-submissions'),
                },
                {
                    key: 'create-heritage',
                    icon: <PlusOutlined />,
                    label: 'Tạo mới',
                    onClick: () => navigate('/researcher/heritage/create'),
                },
                {
                    key: 'pending-heritage',
                    icon: <ClockCircleOutlined />,
                    label: 'Chờ duyệt',
                    onClick: () => navigate('/researcher/heritage/pending'),
                },
            ],
        },
        {
            key: 'artifacts',
            icon: <FileImageOutlined />,
            label: 'Hiện vật',
            children: [
                {
                    key: 'my-artifacts',
                    label: 'Hiện vật của tôi',
                    onClick: () => navigate('/researcher/artifacts/my-artifacts'),
                },
                {
                    key: 'create-artifact',
                    icon: <PlusOutlined />,
                    label: 'Tạo mới',
                    onClick: () => navigate('/researcher/artifacts/create'),
                },
                {
                    key: 'pending-artifacts',
                    icon: <ClockCircleOutlined />,
                    label: 'Chờ duyệt',
                    onClick: () => navigate('/researcher/artifacts/pending'),
                },
            ],
        },
        {
            key: 'exhibitions',
            icon: <PictureOutlined />,
            label: 'Triển lãm',
            children: [
                {
                    key: 'my-exhibitions',
                    label: 'Triển lãm của tôi',
                    onClick: () => navigate('/researcher/exhibitions/my-exhibitions'),
                },
                {
                    key: 'create-exhibition',
                    icon: <PlusOutlined />,
                    label: 'Tạo triển lãm',
                    onClick: () => navigate('/researcher/exhibitions/create'),
                },
            ],
        },
        {
            key: 'analytics',
            icon: <BarChartOutlined />,
            label: 'Thống kê',
            onClick: () => navigate('/researcher/analytics'),
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
            type: 'divider' as const,
        },
        {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Đăng xuất',
            onClick: handleLogout,
        },
    ];

    // Quick create menu
    const quickCreateMenuItems = [
        {
            key: 'create-heritage',
            icon: <BankOutlined />,
            label: 'Tạo di sản',
            onClick: () => navigate('/researcher/heritage/create'),
        },
        {
            key: 'create-artifact',
            icon: <FileImageOutlined />,
            label: 'Tạo hiện vật',
            onClick: () => navigate('/researcher/artifacts/create'),
        },
        {
            key: 'create-exhibition',
            icon: <PictureOutlined />,
            label: 'Tạo triển lãm',
            onClick: () => navigate('/researcher/exhibitions/create'),
        },
    ];

    return (
        <Layout className="researcher-layout" style={{ minHeight: '100vh' }}>
            {/* Sidebar */}
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={setCollapsed}
                width={250}
                theme="light"
                className="researcher-sider"
                breakpoint="lg"
                collapsedWidth={isMobile ? 0 : 80}
            >
                <div className="logo-container">
                    <img src={logo} alt="Logo" className="logo" />
                    {!collapsed && <span className="logo-text">Sen Research</span>}
                </div>
                <Menu
                    mode="inline"
                    selectedKeys={[getActiveKey()]}
                    defaultOpenKeys={['heritage', 'artifacts', 'exhibitions']}
                    items={menuItems}
                    style={{ height: '100%', borderRight: 0 }}
                />
            </Sider>

            <Layout>
                {/* Header */}
                <Header className="researcher-header">
                    <div className="header-left">
                        {isMobile && (
                            <Button
                                type="text"
                                icon={<MenuFoldOutlined />}
                                onClick={() => setCollapsed(!collapsed)}
                                className="mobile-menu-btn"
                            />
                        )}
                    </div>

                    {/* Status Indicators */}
                    <div className="status-indicators">
                        <Badge count={3} size="small">
                            <Button
                                type="text"
                                icon={<ClockCircleOutlined />}
                                onClick={() => navigate('/researcher/heritage/pending')}
                            >
                                {!isMobile && 'Chờ duyệt'}
                            </Button>
                        </Badge>
                        <Badge count={5} dot color="green">
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined />}
                                onClick={() => navigate('/researcher/heritage/approved')}
                            >
                                {!isMobile && 'Đã duyệt'}
                            </Button>
                        </Badge>
                    </div>

                    <div className="header-right">
                        {/* Notifications */}
                        <Badge count={2} size="small">
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
                <Content className="researcher-content">
                    <Outlet />
                </Content>

                {/* Footer */}
                <Footer className="researcher-footer">
                    <div>Sen Research ©{new Date().getFullYear()} - Đóng góp nội dung di sản</div>
                </Footer>
            </Layout>

            {/* Quick Create FAB */}
            <FloatButton.Group
                trigger="click"
                type="primary"
                icon={<PlusOutlined />}
                tooltip="Tạo nội dung mới"
            >
                {quickCreateMenuItems.map((item) => (
                    <FloatButton
                        key={item.key}
                        icon={item.icon}
                        tooltip={item.label}
                        onClick={item.onClick}
                    />
                ))}
            </FloatButton.Group>
        </Layout>
    );
};

export default ResearcherLayout;
