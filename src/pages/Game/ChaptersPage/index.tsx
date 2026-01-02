import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchChapters, fetchProgress } from '@/store/slices/gameSlice';
import { Card, Row, Col, Progress, Button, Spin, Typography, Tag } from 'antd';
import { LockOutlined, CheckCircleOutlined, TrophyOutlined } from '@ant-design/icons';
import type { Chapter } from '@/types';
import "./styles.less";

const { Title, Text, Paragraph } = Typography;

const ChaptersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { chapters, chaptersLoading, progress, progressLoading } = useAppSelector((state) => state.game);

    useEffect(() => {
        dispatch(fetchChapters());
        dispatch(fetchProgress());
    }, [dispatch]);

    const handleChapterClick = (chapter: Chapter) => {
        if (chapter.is_unlocked) {
            navigate(`/game/chapters/${chapter.id}/levels`);
        }
    };

    const handleUnlockChapter = async (chapterId: number) => {
        // Will implement unlock logic
        console.log('Unlock chapter:', chapterId);
    };

    const getChapterColor = (theme: string) => {
        const colors: Record<string, string> = {
            'Văn hóa Đại Việt': '#ff69b4',
            'Thời Hoàng Kim': '#ffd700',
            'Di Sản Bất Tử': '#ffffff',
        };
        return colors[theme] || '#1890ff';
    };

    const getPetalStateIcon = (state: string) => {
        switch (state) {
            case 'full':
                return '🌸';
            case 'blooming':
                return '🌺';
            case 'closed':
            default:
                return '🌹';
        }
    };

    if (chaptersLoading || progressLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải Sen Hoa..." />
            </div>
        );
    }

    return (
        <div className="chapters-page">
            <div className="chapters-header">
                <Title level={2}>Sen Hoa - Hành Trình Khám Phá</Title>
                <Paragraph>
                    Mỗi cánh sen là một chương trong hành trình khám phá di sản Việt Nam.
                    Hoàn thành các màn chơi để mở khóa những câu chuyện mới!
                </Paragraph>

                {progress && (
                    <Card className="progress-card">
                        <Row gutter={16}>
                            <Col span={6}>
                                <div className="stat-item">
                                    <TrophyOutlined style={{ fontSize: 24, color: '#ffd700' }} />
                                    <div>
                                        <Text strong>{progress.total_points}</Text>
                                        <Text type="secondary"> Điểm</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="stat-item">
                                    <span style={{ fontSize: 24 }}>🌸</span>
                                    <div>
                                        <Text strong>{progress.total_sen_petals}</Text>
                                        <Text type="secondary"> Cánh Sen</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="stat-item">
                                    <span style={{ fontSize: 24 }}>💰</span>
                                    <div>
                                        <Text strong>{progress.coins}</Text>
                                        <Text type="secondary"> Xu</Text>
                                    </div>
                                </div>
                            </Col>
                            <Col span={6}>
                                <div className="stat-item">
                                    <CheckCircleOutlined style={{ fontSize: 24, color: '#52c41a' }} />
                                    <div>
                                        <Text strong>{progress.stats?.completion_rate || 0}%</Text>
                                        <Text type="secondary"> Hoàn thành</Text>
                                    </div>
                                </div>
                            </Col>
                        </Row>
                    </Card>
                )}
            </div>

            <Row gutter={[24, 24]} className="chapters-grid">
                {chapters.map((chapter) => (
                    <Col xs={24} sm={12} lg={8} key={chapter.id}>
                        <Card
                            hoverable={chapter.is_unlocked}
                            className={`chapter-card ${!chapter.is_unlocked ? 'locked' : ''}`}
                            onClick={() => handleChapterClick(chapter)}
                            style={{
                                borderColor: getChapterColor(chapter.theme),
                                borderWidth: 2,
                            }}
                        >
                            <div className="chapter-header">
                                <div className="chapter-icon">
                                    <span style={{ fontSize: 48 }}>
                                        {getPetalStateIcon(chapter.petal_state)}
                                    </span>
                                </div>
                                <div className="chapter-info">
                                    <Title level={4}>{chapter.name}</Title>
                                    <Tag color={getChapterColor(chapter.theme)}>
                                        {chapter.theme}
                                    </Tag>
                                </div>
                            </div>

                            <Paragraph ellipsis={{ rows: 2 }}>
                                {chapter.description}
                            </Paragraph>

                            <div className="chapter-stats">
                                <div className="stat">
                                    <Text type="secondary">Tiến độ</Text>
                                    <Progress
                                        percent={chapter.completion_rate}
                                        size="small"
                                        status={chapter.completion_rate === 100 ? 'success' : 'active'}
                                    />
                                </div>
                                <div className="stat">
                                    <Text type="secondary">
                                        {chapter.completed_levels}/{chapter.total_levels} màn
                                    </Text>
                                </div>
                            </div>

                            {!chapter.is_unlocked && (
                                <div className="locked-overlay">
                                    <LockOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                    <Text>Cần {chapter.required_petals} cánh sen</Text>
                                    {chapter.can_unlock && (
                                        <Button
                                            type="primary"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUnlockChapter(chapter.id);
                                            }}
                                            style={{ marginTop: 12 }}
                                        >
                                            Mở khóa
                                        </Button>
                                    )}
                                </div>
                            )}

                            {chapter.is_unlocked && (
                                <Button type="primary" block style={{ marginTop: 16 }}>
                                    Chơi ngay
                                </Button>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default ChaptersPage;
