
import React, { useState, useEffect } from 'react';
import { Table, Tag, Space, Card, Statistic, Row, Col, Spin, Empty, Typography, Avatar } from 'antd';
import {
    ScanOutlined,
    EnvironmentOutlined,
    HistoryOutlined,
    DollarOutlined,
    GiftOutlined,
    CalendarOutlined,
    CheckCircleOutlined
} from '@ant-design/icons';
import { gameService } from '@/services/game.service';
import dayjs from 'dayjs';
import { getImageUrl } from '@/utils/image.helper';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

const ScanHistoryTab: React.FC = () => {
    const { t } = useTranslation('translation', { keyPrefix: 'profile' });
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<any>(null);

    const fetchData = async () => {
        setLoading(true);
        try {
            const res = await gameService.getScanHistory();
            setData(res);
        } catch (error) {
            console.error("Failed to fetch scan history", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (loading) {
        return <div style={{ textAlign: 'center', padding: '100px 0' }}><Spin size="large" tip={t("scanHistory.loading")} /></div>;
    }

    if (!data || !data.history || data.history.length === 0) {
        return (
            <div style={{ padding: '40px 0' }}>
                <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description={
                        <div>
                            <Text type="secondary">{t("scanHistory.emptyDesc1")}</Text>
                            <br />
                            <Text type="secondary" style={{ fontSize: '12px' }}>{t("scanHistory.emptyDesc2")}</Text>
                        </div>
                    }
                />
            </div>
        );
    }

    const { stats, history } = data;

    const columns = [
        {
            title: t("scanHistory.colEvent"),
            key: 'event',
            render: (_: any, record: any) => (
                <Space size="middle">
                    <Avatar
                        src={getImageUrl(record.objectImage)}
                        shape="square"
                        size={64}
                        icon={record.type === 'checkin' ? <EnvironmentOutlined /> : <ScanOutlined />}
                    />
                    <div>
                        <Text strong style={{ fontSize: 16 }}>{record.objectName}</Text>
                        <br />
                        <Space>
                            {record.type === 'checkin' ? (
                                <Tag color="blue" icon={<EnvironmentOutlined />}>{t("scanHistory.tagCheckin")}</Tag>
                            ) : (
                                <Tag color="gold" icon={<ScanOutlined />}>{t("scanHistory.tagTreasureHunt")}</Tag>
                            )}
                            <Text type="secondary" style={{ fontSize: '12px' }}>
                                <CalendarOutlined /> {dayjs(record.scannedAt).format('HH:mm, DD/MM/YYYY')}
                            </Text>
                        </Space>
                    </div>
                </Space>
            )
        },
        {
            title: t("scanHistory.colCode"),
            dataIndex: 'scanCode',
            key: 'scanCode',
            responsive: ['md' as any],
            render: (code: string) => <Text code>{code}</Text>
        },
        {
            title: t("scanHistory.colRewards"),
            key: 'rewards',
            render: (_: any, record: any) => (
                <Space direction="vertical" size={2}>
                    {record.rewards && record.rewards.length > 0 ? (
                        record.rewards.map((reward: any, idx: number) => (
                            <Tag key={idx} color={reward.currency === 'coins' ? 'orange' : 'magenta'} style={{ borderRadius: 12 }}>
                                {reward.currency === 'coins' ? '🪙' : '🌸'} +{reward.amount} {reward.currency === 'coins' ? t("scanHistory.rewardCoins") : t("scanHistory.rewardPetals")}
                            </Tag>
                        ))
                    ) : (
                        <Text type="secondary" style={{ fontSize: '12px' }}>{t("scanHistory.noRewards")}</Text>
                    )}
                </Space>
            )
        },
        {
            title: t("scanHistory.colStatus"),
            key: 'status',
            render: () => (
                <Tag color="success" icon={<CheckCircleOutlined />}>{t("scanHistory.statusSuccess")}</Tag>
            )
        }
    ];

    return (
        <div className="collection-history-tab" style={{ padding: '12px 0' }}>
            {/* Stats Summary */}
            <Title level={4} style={{ marginBottom: 24 }}><HistoryOutlined /> {t("scanHistory.statsTitle")}</Title>
            <Row gutter={[16, 16]} style={{ marginBottom: 40 }}>
                <Col xs={12} sm={8} lg={4}>
                    <Card bordered={false} className="stat-card premium-card-minimal">
                        <Statistic
                            title={t("scanHistory.statCheckins")}
                            value={stats.totalCheckins}
                            prefix={<EnvironmentOutlined style={{ color: '#1890ff' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card bordered={false} className="stat-card premium-card-minimal">
                        <Statistic
                            title={t("scanHistory.statArtifacts")}
                            value={stats.totalArtifacts}
                            prefix={<ScanOutlined style={{ color: '#faad14' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={4}>
                    <Card bordered={false} className="stat-card premium-card-minimal">
                        <Statistic
                            title={t("scanHistory.statSites")}
                            value={stats.uniqueSites}
                            prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={6}>
                    <Card bordered={false} className="stat-card premium-card-minimal">
                        <Statistic
                            title={t("scanHistory.statCoins")}
                            value={stats.totalCoinsEarned}
                            prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
                            suffix={t("scanHistory.rewardCoins")}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={8} lg={6}>
                    <Card bordered={false} className="stat-card premium-card-minimal">
                        <Statistic
                            title={t("scanHistory.statPetals")}
                            value={stats.totalPetalsEarned}
                            prefix={<GiftOutlined style={{ color: '#eb2f96' }} />}
                            suffix={t("scanHistory.rewardPetals")}
                        />
                    </Card>
                </Col>
            </Row>

            {/* History Table */}
            <Title level={4} style={{ marginBottom: 20 }}><CalendarOutlined /> {t("scanHistory.logTitle")}</Title>
            <Card bordered={false} className="history-table-card premium-card-minimal" style={{ borderRadius: 16, overflow: 'hidden' }}>
                <Table
                    dataSource={history}
                    columns={columns}
                    rowKey="id"
                    pagination={{ pageSize: 10, showSizeChanger: false }}
                />
            </Card>

            <style>{`
                .premium-card-minimal {
                    background: #fff;
                    border-radius: 12px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.05);
                    transition: all 0.3s ease;
                }
                .premium-card-minimal:hover {
                    transform: translateY(-4px);
                    box-shadow: 0 8px 24px rgba(0,0,0,0.08);
                }
                .ant-statistic-title {
                    font-size: 13px;
                    color: #8c8c8c;
                    margin-bottom: 8px;
                }
                .ant-statistic-content {
                    font-weight: 600;
                    color: #262626;
                }
                .ant-table-thead > tr > th {
                    background: #fafafa;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
};

export default ScanHistoryTab;
