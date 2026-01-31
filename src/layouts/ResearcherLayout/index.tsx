import React from 'react';
import { Button, FloatButton, Divider } from 'antd';
import {
    BankOutlined,
    FileImageOutlined,
    PictureOutlined,
    UserOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    BookOutlined,
    TrophyOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import UnifiedLayout from '../UnifiedLayout';
import './styles.less';
import { researcherMenu } from '@/config/menu.config';
import NotificationPopover from '@/components/common/NotificationPopover';

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

    // Quick create menu
    const quickCreateMenuItems = [
        {
            key: 'create-heritage',
            icon: <BankOutlined />,
            label: 'Tạo di sản',
            onClick: () => navigate('/researcher/heritage-sites'),
        },
        {
            key: 'create-artifact',
            icon: <FileImageOutlined />,
            label: 'Tạo hiện vật',
            onClick: () => navigate('/researcher/artifacts'),
        },
        {
            key: 'create-exhibition',
            icon: <PictureOutlined />,
            label: 'Tạo triển lãm',
            onClick: () => navigate('/researcher/exhibitions'),
        },
        {
            key: 'create-article',
            icon: <BookOutlined />,
            label: 'Viết bài mới',
            onClick: () => navigate('/researcher/history'),
        },
        {
            key: 'create-level',
            icon: <TrophyOutlined />,
            label: 'Tạo màn chơi',
            onClick: () => navigate('/researcher/levels'),
        },
    ];

    return (
        <>
            <UnifiedLayout
                menu={{ request: async () => researcherMenu }}
                user={user || undefined}
                onLogout={handleLogout}
                userMenuExtraItems={userMenuExtraItems}
                navTheme="light"
                actionsRender={() => [
                    <>
                        <Button
                            type="text"
                            icon={<ClockCircleOutlined />}
                            onClick={() => navigate('/researcher/heritage-sites')}
                        >
                            <span className="hidden md:inline">Chờ duyệt</span>
                        </Button>
                        <Button
                            type="text"
                            icon={<CheckCircleOutlined />}
                            onClick={() => navigate('/researcher/heritage-sites')}
                        >
                            <span className="hidden md:inline">Đã duyệt</span>
                        </Button>
                        
                        <Divider type="vertical" style={{ height: 24, margin: '0 8px' }} />

                        <NotificationPopover />
                    </>
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
