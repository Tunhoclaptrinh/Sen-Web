import React, { useState } from 'react';
import { Button, Badge, Drawer, Statistic, Card } from 'antd';
import {
    HomeOutlined,
    TrophyOutlined,
    BookOutlined,
    FlagOutlined,
    BankOutlined,
    GiftOutlined,
    MessageOutlined,
    BellOutlined,
    UserOutlined,
} from '@ant-design/icons';
import { Outlet, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '@/store/slices/authSlice';
import { RootState } from '@/store';
import UnifiedLayout from '../UnifiedLayout';
import './CustomerLayout.css';

const CustomerLayout: React.FC = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { user } = useSelector((state: RootState) => state.auth);
    const { progress } = useSelector((state: RootState) => state.game);

    const [dailyRewardVisible, setDailyRewardVisible] = useState(false);
    const [aiChatVisible, setAiChatVisible] = useState(false);

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
            key: 'collections',
            icon: <BookOutlined />,
            label: 'Bộ sưu tập',
            onClick: () => navigate('/collections'),
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
                name: 'Trò chơi',
                icon: <TrophyOutlined />,
                routes: [
                    { path: '/game/chapters', name: 'Sen Hoa' },
                    { path: '/game/museum', name: 'Bảo tàng' },
                    { path: '/game/leaderboard', name: 'Bảng xếp hạng' },
                ],
            },
            {
                path: '/learning',
                name: 'Học tập',
                icon: <BookOutlined />,
            },
            {
                path: '/quests',
                name: 'Nhiệm vụ',
                icon: <FlagOutlined />,
            },
            {
                path: '/heritage-sites',
                name: 'Di sản',
                icon: <BankOutlined />,
            },
        ],
    };

    return (
        <>
            <UnifiedLayout
                route={route}
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
                        onClick={() => setAiChatVisible(true)}
                    />,
                    <Badge count={5} size="small" key="notifications">
                        <Button
                            type="text"
                            icon={<BellOutlined />}
                        />
                    </Badge>
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

            {/* AI Chat Drawer */}
            <Drawer
                title="💬 Trợ lý AI"
                placement="right"
                onClose={() => setAiChatVisible(false)}
                open={aiChatVisible}
                width={400}
            >
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                    <p>Chat với nhân vật lịch sử</p>
                    <p style={{ color: '#999' }}>Tính năng đang phát triển...</p>
                </div>
            </Drawer>
        </>
    );
};

export default CustomerLayout;
