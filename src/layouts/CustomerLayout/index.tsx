import React, { useState } from 'react';
import { Button, Drawer, Statistic, Card } from 'antd';
import {
    TrophyOutlined,
    GiftOutlined,
    MessageOutlined,
    UserOutlined,
    BookOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import { setOverlayOpen } from '@/store/slices/aiSlice';
import UnifiedLayout from '../UnifiedLayout';
import './styles.less';
import { customerMenu } from '@/config/menu.config';
import NotificationPopover from '@/components/common/NotificationPopover';
import AIChat from '@/components/AIChat';

const CustomerLayout: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { progress } = useSelector((state: RootState) => state.game);

    const { isOverlayOpen } = useSelector((state: RootState) => state.ai);
    const [dailyRewardVisible, setDailyRewardVisible] = useState(false);

    const handleLogout = () => {
        dispatch(logout() as any);
        navigate('/login');
    };

    const isGameModule = location.pathname.startsWith('/game');
    const filteredMenu = isGameModule 
        ? customerMenu.filter(item => item.key !== 'home' && item.key !== 'heritage')
        : customerMenu;

    const userMenuExtraItems = [
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
            type: 'divider',
        },
    ];

    return (
        <>
            <UnifiedLayout
                menu={{ request: async () => filteredMenu }}
                user={user || undefined}
                onLogout={handleLogout}
                userMenuExtraItems={userMenuExtraItems}
                navTheme="light"
                actionsRender={() => [
                    <div className="progress-stats" key="stats" style={{ display: 'flex', gap: 16, alignItems: 'center', marginRight: 16 }}>
                        <div className="stat-item" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <TrophyOutlined style={{ color: '#ffd700' }} />
                            <span>{progress?.total_points || 0}</span>
                        </div>
                        <div className="stat-item" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 16 }}>🌸</span>
                            <span>{progress?.total_sen_petals || 0}</span>
                        </div>
                        <div className="stat-item" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            <span style={{ fontSize: 16 }}>💰</span>
                            <span>{progress?.coins || 0}</span>
                        </div>
                    </div>,
                    <Button
                        key="gift"
                        type="text"
                        icon={<GiftOutlined />}
                        onClick={() => setDailyRewardVisible(true)}
                    />,
                    <Button
                        key="chat"
                        type="text"
                        icon={<MessageOutlined />}
                        onClick={() => dispatch(setOverlayOpen(true))}
                    />,
                    <NotificationPopover key="notifications" />
                ]}
            >
                <Outlet />
            </UnifiedLayout>

            {/* Daily Reward Modal */}
            <Drawer
                title="🎁 Phần thưởng hàng ngày"
                placement="right"
                onClose={() => setDailyRewardVisible(false)}
                open={dailyRewardVisible}
                width={400}
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

            {/* AI Chat Overlay */}
            <AIChat 
                open={isOverlayOpen} 
                onClose={() => dispatch(setOverlayOpen(false))} 
            />
        </>
    );
};

export default CustomerLayout;
