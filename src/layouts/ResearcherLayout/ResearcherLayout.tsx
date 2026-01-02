import React from 'react';
import { Button, Badge, FloatButton } from 'antd';
import {
    HomeOutlined,
    BankOutlined,
    FileImageOutlined,
    PictureOutlined,
    UserOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    BarChartOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import UnifiedLayout from '../UnifiedLayout';
import './ResearcherLayout.css';

const ResearcherLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);

    const handleLogout = () => {
        dispatch(logout() as any);
        navigate('/login');
    };

    const userMenuExtraItems = [
        {
            key: 'profile',
            icon: <UserOutlined />,
            label: 'Hồ sơ',
            onClick: () => navigate('/profile'),
        },
        {
            type: 'divider',
        },
    ];

    const route = {
        routes: [
            {
                path: '/',
                name: 'Trang chủ',
                icon: <HomeOutlined />,
            },
            {
                name: 'Di sản',
                icon: <BankOutlined />,
                routes: [
                    { path: '/researcher/heritage/my-submissions', name: 'Bài viết của tôi' },
                    { path: '/researcher/heritage/create', name: 'Tạo mới', icon: <PlusOutlined /> },
                    { path: '/researcher/heritage/pending', name: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
                ],
            },
            {
                name: 'Hiện vật',
                icon: <FileImageOutlined />,
                routes: [
                    { path: '/researcher/artifacts/my-artifacts', name: 'Hiện vật của tôi' },
                    { path: '/researcher/artifacts/create', name: 'Tạo mới', icon: <PlusOutlined /> },
                    { path: '/researcher/artifacts/pending', name: 'Chờ duyệt', icon: <ClockCircleOutlined /> },
                ],
            },
            {
                name: 'Triển lãm',
                icon: <PictureOutlined />,
                routes: [
                    { path: '/researcher/exhibitions/my-exhibitions', name: 'Triển lãm của tôi' },
                    { path: '/researcher/exhibitions/create', name: 'Tạo triển lãm', icon: <PlusOutlined /> },
                ],
            },
            {
                path: '/researcher/analytics',
                name: 'Thống kê',
                icon: <BarChartOutlined />,
            },
        ],
    };

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
        <>
            <UnifiedLayout
                route={route}
                user={user || undefined}
                onLogout={handleLogout}
                userMenuExtraItems={userMenuExtraItems}
                navTheme="light"
                actionsRender={() => [
                    <div key="status" className="status-indicators" style={{ display: 'flex', gap: 16, alignItems: 'center', marginRight: 16 }}>
                        <Badge count={3} size="small">
                            <Button
                                type="text"
                                icon={<ClockCircleOutlined />}
                                onClick={() => navigate('/researcher/heritage/pending')}
                            >
                                <span className="hidden md:inline">Chờ duyệt</span>
                            </Button>
                        </Badge>
                        <Badge count={5} dot color="green">
                            <Button
                                type="text"
                                icon={<CheckCircleOutlined />}
                                onClick={() => navigate('/researcher/heritage/approved')}
                            >
                                <span className="hidden md:inline">Đã duyệt</span>
                            </Button>
                        </Badge>
                    </div>,
                    <Badge count={2} size="small" key="notifications">
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                        />
                    </Badge>
                ]}
            >
                <Outlet />
            </UnifiedLayout>

            {/* Quick Create FAB */}
            <FloatButton.Group
                trigger="click"
                type="primary"
                icon={<PlusOutlined />}
                tooltip="Tạo nội dung mới"
                style={{ right: 24, bottom: 24 }}
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
        </>
    );
};

export default ResearcherLayout;
