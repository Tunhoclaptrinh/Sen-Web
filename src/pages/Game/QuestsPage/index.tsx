import React, { useEffect, useState } from 'react';
import {
    Row,
    Col,
    Card,
    Tabs,
    Button,
    Spin,
    Empty,
    Progress,
    Tag,
    message,
    Modal,
    Typography,
    Space,
    Statistic,
} from 'antd';
import {
    TrophyOutlined,
    CalendarOutlined,
    ClockCircleOutlined,
    CheckCircleOutlined,
    GiftOutlined,
} from '@ant-design/icons';
import questService from '@services/quest.service';
import './styles.less';

const { Title, Text, Paragraph } = Typography;

const QuestsPage: React.FC = () => {
    // const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [quests, setQuests] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    const [selectedQuest, setSelectedQuest] = useState<any>(null);
    const [detailModalVisible, setDetailModalVisible] = useState(false);

    useEffect(() => {
        fetchQuests();
    }, []);

    const fetchQuests = async () => {
        try {
            setLoading(true);
            const response = await questService.getActiveQuests();
            setQuests(response || []);
        } catch (error) {
            message.error('Không thể tải danh sách nhiệm vụ');
        } finally {
            setLoading(false);
        }
    };

    const handleCompleteQuest = async (questId: number) => {
        try {
            await questService.completeQuest(questId);
            message.success('Hoàn thành nhiệm vụ!');
            fetchQuests();
        } catch (error: any) {
            message.error(error.message || 'Không thể hoàn thành nhiệm vụ');
        }
    };

    const handleViewDetail = (quest: any) => {
        setSelectedQuest(quest);
        setDetailModalVisible(true);
    };

    const getQuestsByTab = () => {
        if (activeTab === 'all') return quests;
        if (activeTab === 'daily') return quests.filter((q) => q.type === 'daily');
        if (activeTab === 'weekly') return quests.filter((q) => q.type === 'weekly');
        if (activeTab === 'achievements')
            return quests.filter((q) => q.type === 'achievement');
        return quests;
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'daily':
                return <CalendarOutlined />;
            case 'weekly':
                return <ClockCircleOutlined />;
            case 'achievement':
                return <TrophyOutlined />;
            default:
                return <CheckCircleOutlined />;
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'daily':
                return 'blue';
            case 'weekly':
                return 'purple';
            case 'achievement':
                return 'gold';
            default:
                return 'default';
        }
    };

    const getStats = () => {
        return {
            total: quests.length,
            daily: quests.filter((q) => q.type === 'daily').length,
            weekly: quests.filter((q) => q.type === 'weekly').length,
            achievements: quests.filter((q) => q.type === 'achievement').length,
        };
    };

    const stats = getStats();

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải nhiệm vụ..." />
            </div>
        );
    }

    return (
        <div className="quests-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <TrophyOutlined /> Nhiệm Vụ
                    </h1>
                    <p className="page-description">
                        Hoàn thành nhiệm vụ để nhận phần thưởng hấp dẫn
                    </p>
                </div>
            </div>

            <div className="quests-stats">
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-1">
                            <Statistic
                                title="Tất Cả"
                                value={stats.total}
                                prefix={<CheckCircleOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-2">
                            <Statistic
                                title="Hằng Ngày"
                                value={stats.daily}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-3">
                            <Statistic
                                title="Hằng Tuần"
                                value={stats.weekly}
                                prefix={<ClockCircleOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-4">
                            <Statistic
                                title="Thành Tích"
                                value={stats.achievements}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card className="quests-content">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        { key: 'all', label: `Tất Cả (${stats.total})` },
                        { key: 'daily', label: `Hằng Ngày (${stats.daily})` },
                        { key: 'weekly', label: `Hằng Tuần (${stats.weekly})` },
                        { key: 'achievements', label: `Thành Tích (${stats.achievements})` },
                    ]}
                />

                {getQuestsByTab().length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description="Không có nhiệm vụ nào"
                    />
                ) : (
                    <Row gutter={[24, 24]} className="quests-grid">
                        {getQuestsByTab().map((quest) => (
                            <Col xs={24} sm={12} lg={8} key={quest.id}>
                                <Card
                                    hoverable
                                    className="quest-card"
                                    actions={[
                                        <Button
                                            key="detail"
                                            type="link"
                                            onClick={() => handleViewDetail(quest)}
                                        >
                                            Xem Chi Tiết
                                        </Button>,
                                        quest.is_completed ? (
                                            <Tag key="completed" color="success" icon={<CheckCircleOutlined />}>
                                                Đã Hoàn Thành
                                            </Tag>
                                        ) : (
                                            <Button
                                                key="complete"
                                                type="primary"
                                                onClick={() => handleCompleteQuest(quest.id)}
                                            >
                                                Hoàn Thành
                                            </Button>
                                        ),
                                    ]}
                                >
                                    <div className="quest-header">
                                        <div className="quest-icon">
                                            {getTypeIcon(quest.type)}
                                        </div>
                                        <Tag color={getTypeColor(quest.type)}>
                                            {quest.type === 'daily'
                                                ? 'Hằng Ngày'
                                                : quest.type === 'weekly'
                                                    ? 'Hằng Tuần'
                                                    : 'Thành Tích'}
                                        </Tag>
                                    </div>

                                    <Title level={5} ellipsis={{ rows: 1 }}>
                                        {quest.title}
                                    </Title>

                                    <Paragraph ellipsis={{ rows: 2 }} className="quest-description">
                                        {quest.description}
                                    </Paragraph>

                                    {quest.progress !== undefined && (
                                        <div className="quest-progress">
                                            <Text type="secondary">
                                                Tiến độ: {quest.progress}/{quest.target || 100}
                                            </Text>
                                            <Progress
                                                percent={Math.round(
                                                    ((quest.progress || 0) / (quest.target || 100)) * 100
                                                )}
                                                status={quest.is_completed ? 'success' : 'active'}
                                                strokeColor={{
                                                    '0%': '#108ee9',
                                                    '100%': '#87d068',
                                                }}
                                            />
                                        </div>
                                    )}

                                    <div className="quest-rewards">
                                        <Space>
                                            <GiftOutlined style={{ color: '#faad14' }} />
                                            <Text strong>Phần thưởng:</Text>
                                        </Space>
                                        <div className="rewards-list">
                                            {quest.rewards?.coins && (
                                                <Tag color="gold">💰 {quest.rewards.coins} xu</Tag>
                                            )}
                                            {quest.rewards?.experience && (
                                                <Tag color="blue">⭐ {quest.rewards.experience} XP</Tag>
                                            )}
                                            {quest.rewards?.petals && (
                                                <Tag color="pink">🌸 {quest.rewards.petals} cánh hoa</Tag>
                                            )}
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>

            <Modal
                title={
                    <Space>
                        {selectedQuest && getTypeIcon(selectedQuest.type)}
                        <span>{selectedQuest?.title}</span>
                    </Space>
                }
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    !selectedQuest?.is_completed && (
                        <Button
                            key="complete"
                            type="primary"
                            onClick={() => {
                                handleCompleteQuest(selectedQuest.id);
                                setDetailModalVisible(false);
                            }}
                        >
                            Hoàn Thành
                        </Button>
                    ),
                ].filter(Boolean)}
                width={600}
            >
                {selectedQuest && (
                    <div className="quest-detail">
                        <Tag color={getTypeColor(selectedQuest.type)} style={{ marginBottom: 16 }}>
                            {selectedQuest.type === 'daily'
                                ? 'Nhiệm Vụ Hằng Ngày'
                                : selectedQuest.type === 'weekly'
                                    ? 'Nhiệm Vụ Hằng Tuần'
                                    : 'Thành Tích'}
                        </Tag>

                        <Paragraph>{selectedQuest.description}</Paragraph>

                        {selectedQuest.progress !== undefined && (
                            <div style={{ marginTop: 24 }}>
                                <Text strong>Tiến Độ:</Text>
                                <Progress
                                    percent={Math.round(
                                        ((selectedQuest.progress || 0) / (selectedQuest.target || 100)) * 100
                                    )}
                                    status={selectedQuest.is_completed ? 'success' : 'active'}
                                />
                                <Text type="secondary">
                                    {selectedQuest.progress} / {selectedQuest.target || 100}
                                </Text>
                            </div>
                        )}

                        <div style={{ marginTop: 24 }}>
                            <Text strong>Phần Thưởng:</Text>
                            <div style={{ marginTop: 12 }}>
                                {selectedQuest.rewards?.coins && (
                                    <div>💰 {selectedQuest.rewards.coins} xu</div>
                                )}
                                {selectedQuest.rewards?.experience && (
                                    <div>⭐ {selectedQuest.rewards.experience} điểm kinh nghiệm</div>
                                )}
                                {selectedQuest.rewards?.petals && (
                                    <div>🌸 {selectedQuest.rewards.petals} cánh hoa sen</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default QuestsPage;
