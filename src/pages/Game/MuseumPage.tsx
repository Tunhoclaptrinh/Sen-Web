import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMuseum } from '@/store/slices/gameSlice';
import { Card, Row, Col, Button, Spin, Typography, Empty, Statistic } from 'antd';
import { TrophyOutlined, RiseOutlined, GoldOutlined } from '@ant-design/icons';
import './MuseumPage.css';

const { Title, Text, Paragraph } = Typography;

const MuseumPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { museum, museumLoading } = useAppSelector((state) => state.game);

    useEffect(() => {
        dispatch(fetchMuseum());
    }, [dispatch]);

    const handleUpgradeMuseum = () => {
        console.log('Upgrade museum');
        // Will implement upgrade logic
    };

    const handleCollectIncome = () => {
        console.log('Collect income');
        // Will implement collect logic
    };

    if (museumLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải bảo tàng..." />
            </div>
        );
    }

    if (!museum || !museum.is_open) {
        return (
            <div className="museum-page">
                <div style={{ textAlign: 'center', padding: '60px 20px' }}>
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <Title level={3}>Bảo Tàng Chưa Mở</Title>
                                <Paragraph>
                                    Hoàn thành các màn chơi để mở khóa bảo tàng cá nhân của bạn!
                                </Paragraph>
                            </div>
                        }
                    >
                        <Button type="primary" href="/game/chapters">
                            Bắt đầu chơi
                        </Button>
                    </Empty>
                </div>
            </div>
        );
    }

    return (
        <div className="museum-page">
            <div className="museum-header">
                <Title level={2}>🏛️ Bảo Tàng Cá Nhân</Title>
                <Paragraph>
                    Bộ sưu tập di sản của bạn. Nâng cấp bảo tàng để tăng thu nhập thụ động!
                </Paragraph>

                <Row gutter={16} className="museum-stats">
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Cấp độ bảo tàng"
                                value={museum.level}
                                prefix={<TrophyOutlined />}
                                valueStyle={{ color: '#3f8600' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Thu nhập/giờ"
                                value={museum.income_per_hour}
                                prefix={<RiseOutlined />}
                                suffix="xu"
                                valueStyle={{ color: '#cf1322' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={24} sm={8}>
                        <Card>
                            <Statistic
                                title="Tổng thu nhập"
                                value={museum.total_income}
                                prefix={<GoldOutlined />}
                                suffix="xu"
                                valueStyle={{ color: '#faad14' }}
                            />
                            <Button
                                type="primary"
                                block
                                style={{ marginTop: 16 }}
                                onClick={handleCollectIncome}
                            >
                                Thu hoạch
                            </Button>
                        </Card>
                    </Col>
                </Row>

                <Card className="upgrade-card" style={{ marginTop: 24 }}>
                    <Row align="middle" gutter={16}>
                        <Col flex="auto">
                            <Title level={4}>Nâng cấp bảo tàng</Title>
                            <Text>Tăng thu nhập thụ động và mở khóa thêm vị trí trưng bày</Text>
                        </Col>
                        <Col>
                            <Button type="primary" size="large" onClick={handleUpgradeMuseum}>
                                Nâng cấp (1000 xu)
                            </Button>
                        </Col>
                    </Row>
                </Card>
            </div>

            <div className="artifacts-section">
                <Title level={3}>Bộ Sưu Tập ({museum.artifacts.length} hiện vật)</Title>

                {museum.artifacts.length === 0 ? (
                    <Empty description="Chưa có hiện vật nào">
                        <Button type="primary" href="/game/chapters">
                            Chơi để thu thập
                        </Button>
                    </Empty>
                ) : (
                    <Row gutter={[16, 16]}>
                        {museum.artifacts.map((artifact) => (
                            <Col xs={12} sm={8} md={6} lg={4} key={artifact.artifact_id}>
                                <Card
                                    hoverable
                                    cover={
                                        <div className="artifact-image">
                                            <img
                                                alt={artifact.name}
                                                src={artifact.image || '/placeholder-artifact.png'}
                                                style={{ width: '100%', height: 150, objectFit: 'cover' }}
                                            />
                                        </div>
                                    }
                                >
                                    <Card.Meta
                                        title={<Text ellipsis>{artifact.name}</Text>}
                                        description={
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                {new Date(artifact.acquired_at).toLocaleDateString('vi-VN')}
                                            </Text>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default MuseumPage;
