import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchLeaderboard } from '@/store/slices/gameSlice';
import { Card, Table, Avatar, Tag, Tabs, Spin, Typography } from 'antd';
import { TrophyOutlined, CrownOutlined, StarOutlined } from '@ant-design/icons';
import type { LeaderboardEntry } from '@/types';
import './LeaderboardPage.css';

const { Title, Text } = Typography;
const { TabPane } = Tabs;

const LeaderboardPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { leaderboard, leaderboardLoading } = useAppSelector((state) => state.game);
    const [activeTab, setActiveTab] = useState<'global' | 'weekly' | 'monthly'>('global');

    useEffect(() => {
        dispatch(fetchLeaderboard({ type: activeTab, limit: 50 }));
    }, [dispatch, activeTab]);

    const handleTabChange = (key: string) => {
        setActiveTab(key as 'global' | 'weekly' | 'monthly');
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <CrownOutlined style={{ fontSize: 24, color: '#ffd700' }} />;
            case 2:
                return <TrophyOutlined style={{ fontSize: 24, color: '#c0c0c0' }} />;
            case 3:
                return <TrophyOutlined style={{ fontSize: 24, color: '#cd7f32' }} />;
            default:
                return <Text strong>#{rank}</Text>;
        }
    };

    const getRankColor = (rank: number) => {
        if (rank === 1) return '#ffd700';
        if (rank === 2) return '#c0c0c0';
        if (rank === 3) return '#cd7f32';
        return undefined;
    };

    const columns = [
        {
            title: 'Hạng',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            render: (rank: number) => (
                <div className="rank-cell" style={{ color: getRankColor(rank) }}>
                    {getRankIcon(rank)}
                </div>
            ),
        },
        {
            title: 'Người chơi',
            key: 'player',
            render: (_: any, record: LeaderboardEntry) => (
                <div className="player-cell">
                    <Avatar
                        src={record.user_avatar}
                        size={40}
                        style={{ marginRight: 12 }}
                    >
                        {record.user_name.charAt(0).toUpperCase()}
                    </Avatar>
                    <div>
                        <Text strong>{record.user_name}</Text>
                        <br />
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            Level {record.level}
                        </Text>
                    </div>
                </div>
            ),
        },
        {
            title: 'Điểm',
            dataIndex: 'total_points',
            key: 'total_points',
            align: 'center' as const,
            render: (points: number) => (
                <Tag color="blue" icon={<StarOutlined />}>
                    {points.toLocaleString()}
                </Tag>
            ),
        },
        {
            title: 'Cánh Sen',
            dataIndex: 'sen_petals',
            key: 'sen_petals',
            align: 'center' as const,
            render: (petals: number) => (
                <Tag color="pink">
                    🌸 {petals}
                </Tag>
            ),
        },
        {
            title: 'Nhân vật',
            dataIndex: 'characters_count',
            key: 'characters_count',
            align: 'center' as const,
            render: (count: number) => (
                <Tag color="purple">
                    {count} nhân vật
                </Tag>
            ),
        },
    ];

    return (
        <div className="leaderboard-page">
            <div className="leaderboard-header">
                <Title level={2}>
                    <TrophyOutlined /> Bảng Xếp Hạng
                </Title>
                <Text type="secondary">
                    Cạnh tranh với người chơi khác để trở thành bậc thầy di sản!
                </Text>
            </div>

            <Card className="leaderboard-card">
                <Tabs activeKey={activeTab} onChange={handleTabChange} centered>
                    <TabPane tab="Toàn thời gian" key="global">
                        {leaderboardLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Spin size="large" tip="Đang tải bảng xếp hạng..." />
                            </div>
                        ) : (
                            <Table
                                dataSource={leaderboard}
                                columns={columns}
                                rowKey="user_id"
                                pagination={{
                                    pageSize: 20,
                                    showSizeChanger: false,
                                }}
                                rowClassName={(record) =>
                                    record.rank <= 3 ? 'top-rank-row' : ''
                                }
                            />
                        )}
                    </TabPane>
                    <TabPane tab="Tuần này" key="weekly">
                        {leaderboardLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Spin size="large" tip="Đang tải bảng xếp hạng..." />
                            </div>
                        ) : (
                            <Table
                                dataSource={leaderboard}
                                columns={columns}
                                rowKey="user_id"
                                pagination={{
                                    pageSize: 20,
                                    showSizeChanger: false,
                                }}
                                rowClassName={(record) =>
                                    record.rank <= 3 ? 'top-rank-row' : ''
                                }
                            />
                        )}
                    </TabPane>
                    <TabPane tab="Tháng này" key="monthly">
                        {leaderboardLoading ? (
                            <div style={{ textAlign: 'center', padding: '60px 0' }}>
                                <Spin size="large" tip="Đang tải bảng xếp hạng..." />
                            </div>
                        ) : (
                            <Table
                                dataSource={leaderboard}
                                columns={columns}
                                rowKey="user_id"
                                pagination={{
                                    pageSize: 20,
                                    showSizeChanger: false,
                                }}
                                rowClassName={(record) =>
                                    record.rank <= 3 ? 'top-rank-row' : ''
                                }
                            />
                        )}
                    </TabPane>
                </Tabs>
            </Card>
        </div>
    );
};

export default LeaderboardPage;
