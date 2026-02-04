import React, { useState } from 'react';
import { Tag, Avatar, Space, Button, message, Tabs, Popconfirm, Tooltip } from 'antd';
import { UserOutlined, ReloadOutlined, TrophyOutlined } from '@ant-design/icons';
import DataTable from '@/components/common/DataTable';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchLeaderboard } from '@/store/slices/gameSlice';
import { getImageUrl } from '@/utils/image.helper';
import StatisticsCard from '@/components/common/StatisticsCard';
import dayjs from 'dayjs';
import { gameService } from '@/services/game.service';

const LeaderboardManagement: React.FC = () => {
    const dispatch = useAppDispatch();
    const { leaderboard, leaderboardLoading } = useAppSelector((state) => state.game);
    const [timeRange, setTimeRange] = useState<'global' | 'weekly' | 'monthly'>('global');

    // Fetch data on mount and filter change
    React.useEffect(() => {
        dispatch(fetchLeaderboard({ type: timeRange, limit: 100 }));
    }, [dispatch, timeRange]);

    const handleRefresh = () => {
        dispatch(fetchLeaderboard({ type: timeRange, limit: 100 }));
    };

    // Calculate stats
    const statsData = React.useMemo(() => {
        const totalPlayers = leaderboard.length;
        const avgScore = leaderboard.reduce((acc, curr) => acc + (curr.totalPoints || 0), 0) / (totalPlayers || 1);
        const maxScore = Math.max(...leaderboard.map(d => d.totalPoints || 0), 0);

        return [
            {
                title: 'Tổng người chơi',
                value: totalPlayers,
                icon: <UserOutlined />,
                valueColor: '#3f8600'
            },
            {
                title: 'Điểm trung bình',
                value: Math.round(avgScore),
                icon: <ReloadOutlined />, 
                valueColor: '#1890ff'
            },
            {
                title: 'Điểm cao nhất',
                value: maxScore,
                icon: <TrophyOutlined />, 
                valueColor: '#cf1322'
            }
        ];
    }, [leaderboard]);

    // Reset user score action
    const handleReset = async (id: any) => {
        const record = leaderboard.find(item => item.userId === id);
        const name = record ? record.userName : 'người chơi này';
        
        try {
            const res = await gameService.resetUserScore(id);
            if (res.success) {
                message.success(`Đã reset điểm của ${name} về 0`);
                handleRefresh();
            } else {
                message.error(res.message || 'Lỗi khi reset điểm');
            }
        } catch (error) {
             message.error('Lỗi kết nối khi reset điểm');
        }
    };

    const columns = [
        {
            title: 'Hạng',
            dataIndex: 'rank',
            key: 'rank',
            width: 80,
            align: 'center',
            render: (rank: number) => {
                let color = 'default';
                if (rank === 1) color = 'gold';
                if (rank === 2) color = 'cyan'; 
                if (rank === 3) color = 'orange'; 
                return <Tag color={color}>#{rank}</Tag>;
            }
        },
        {
            title: 'Người chơi',
            key: 'user',
            width: 250,
            render: (_: any, record: any) => (
                <Space>
                    <Avatar src={getImageUrl(record.userAvatar)} icon={<UserOutlined />} />
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontWeight: 500 }}>{record.userName}</span>
                        <span style={{ fontSize: 12, color: '#888' }}>ID: {record.userId}</span>
                    </div>
                </Space>
            )
        },
        {
            title: 'Điểm số',
            dataIndex: 'totalPoints',
            key: 'totalPoints',
            width: 150,
            sorter: (a: any, b: any) => a.totalPoints - b.totalPoints,
            render: (points: number) => (
                <span style={{ fontWeight: 'bold', color: '#1890ff' }}>
                    {points?.toLocaleString()}
                </span>
            )
        },
        {
            title: 'Cánh Sen',
            dataIndex: 'senPetals',
            key: 'senPetals',
            width: 120,
            render: (val: number) => <span>🌸 {val}</span>
        },
        {
            title: 'Cấp độ',
            dataIndex: 'level',
            key: 'level',
            width: 100,
            render: (level: number) => <Tag color="purple">Lv.{level}</Tag>
        },
        {
            title: 'Ngày cập nhật',
            key: 'updatedAt',
            width: 150,
            render: () => dayjs().format('DD/MM/YYYY') // Mock data as API doesn't return this yet
        }
    ];

    const tabItems = [
        { key: 'global', label: 'Toàn thời gian' },
        { key: 'weekly', label: 'Tuần này' },
        { key: 'monthly', label: 'Tháng này' },
    ];

    return (
        <DataTable
            title="Quản lý Bảng xếp hạng"
            headerContent={
                <div style={{ marginBottom: 16 }}>
                    <StatisticsCard 
                        data={statsData} 
                        colSpan={{ span: 8 }} 
                        hideCard 
                        containerStyle={{ padding: "16px 16px 0 16px" }}
                    />
                     <div style={{ marginTop: 16, background: '#fff', padding: '0 16px', borderRadius: '8px 8px 0 0' }}>
                        <Tabs 
                            activeKey={timeRange} 
                            items={tabItems} 
                            onChange={(key) => setTimeRange(key as any)}
                            style={{ marginBottom: 0 }}
                        />
                    </div>
                </div>
            }
            loading={leaderboardLoading}
            columns={columns}
            dataSource={leaderboard}
            rowKey="userId"
            pagination={{ pageSize: 10 }} 
            searchable={false} 
            // Removed filters prop as we use Tabs now
            onRefresh={handleRefresh}
            customActions={(record) => (
                <Popconfirm
                    title="Bạn chắc chắn muốn reset điểm?"
                    description={`Điểm số của ${record.userName} sẽ về 0. Hành động này không thể hoàn tác.`}
                    onConfirm={() => handleReset(record.userId)}
                    okText="Reset"
                    cancelText="Hủy"
                    okButtonProps={{ danger: true }}
                >
                    <Tooltip title="Reset điểm về 0">
                        <Button 
                            type="text" 
                            size="small" 
                            icon={<ReloadOutlined />} 
                            danger // Keep red for caution, or remove for cleaner look
                        />
                    </Tooltip>
                </Popconfirm>
            )}
            extra={
                <Button icon={<ReloadOutlined />} onClick={handleRefresh}>
                    Làm mới
                </Button>
            }
        />
    );
};

export default LeaderboardManagement;
