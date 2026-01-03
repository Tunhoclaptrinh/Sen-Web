import React from 'react';
import { Button, Badge, FloatButton } from 'antd';
import {
    BankOutlined,
    FileImageOutlined,
    PictureOutlined,
    UserOutlined,
    PlusOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    BellOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import UnifiedLayout from '../UnifiedLayout';
import './styles.less';
import { researcherMenu } from '@/config/menu.config';

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
                menu={{ request: async () => researcherMenu }}
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
