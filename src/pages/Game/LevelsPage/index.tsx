import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchLevelsByChapter, setCurrentLevel } from '@/store/slices/gameSlice';
import { Card, Row, Col, Button, Spin, Typography, Tag, Progress, Empty } from 'antd';
import { PlayCircleOutlined, LockOutlined, StarFilled, ClockCircleOutlined } from '@ant-design/icons';
import type { Level } from '@/types';
import "./styles.less";

const { Title, Text, Paragraph } = Typography;

const LevelsPage: React.FC = () => {
    const { chapterId } = useParams<{ chapterId: string }>();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { levels, levelsLoading, currentChapter } = useAppSelector((state) => state.game);

    useEffect(() => {
        if (chapterId) {
            dispatch(fetchLevelsByChapter(Number(chapterId)));
        }
    }, [dispatch, chapterId]);

    const handleStartLevel = (level: Level) => {
        if (!level.is_locked) {
            dispatch(setCurrentLevel(level));
            navigate(`/game/play/${level.id}`);
        }
    };

    const getDifficultyColor = (difficulty: string) => {
        const colors: Record<string, string> = {
            easy: 'green',
            medium: 'orange',
            hard: 'red',
        };
        return colors[difficulty] || 'blue';
    };

    const getTypeIcon = (type: string) => {
        const icons: Record<string, string> = {
            story: '📖',
            quiz: '❓',
            mixed: '🎮',
        };
        return icons[type] || '🎯';
    };

    if (levelsLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải màn chơi..." />
            </div>
        );
    }

    if (!levels || levels.length === 0) {
        return (
            <div style={{ padding: '24px' }}>
                <Button onClick={() => navigate('/game/chapters')} style={{ marginBottom: 16 }}>
                    ← Quay lại
                </Button>
                <Empty description="Chưa có màn chơi nào" />
            </div>
        );
    }

    return (
        <div className="levels-page">
            <div className="levels-header">
                <Button onClick={() => navigate('/game/chapters')} style={{ marginBottom: 16 }}>
                    ← Quay lại Sen Hoa
                </Button>

                {currentChapter && (
                    <>
                        <Title level={2}>{currentChapter.name}</Title>
                        <Paragraph>{currentChapter.description}</Paragraph>
                        <Progress
                            percent={currentChapter.completion_rate}
                            status={currentChapter.completion_rate === 100 ? 'success' : 'active'}
                            strokeColor={{
                                '0%': '#108ee9',
                                '100%': '#87d068',
                            }}
                        />
                    </>
                )}
            </div>

            <Row gutter={[16, 16]} className="levels-grid">
                {levels.map((level, index) => (
                    <Col xs={24} sm={12} md={8} lg={6} key={level.id}>
                        <Card
                            hoverable={!level.is_locked}
                            className={`level-card ${level.is_locked ? 'locked' : ''} ${level.is_completed ? 'completed' : ''}`}
                            onClick={() => handleStartLevel(level)}
                        >
                            <div className="level-number">
                                <span>{index + 1}</span>
                            </div>

                            <div className="level-icon">
                                <span style={{ fontSize: 32 }}>{getTypeIcon(level.type)}</span>
                            </div>

                            <Title level={5} ellipsis={{ rows: 1 }}>
                                {level.name}
                            </Title>

                            <Paragraph ellipsis={{ rows: 2 }} className="level-description">
                                {level.description}
                            </Paragraph>

                            <div className="level-meta">
                                <Tag color={getDifficultyColor(level.difficulty)}>
                                    {level.difficulty === 'easy' ? 'Dễ' : level.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                </Tag>
                                {level.time_limit && (
                                    <Tag icon={<ClockCircleOutlined />}>
                                        {level.time_limit}p
                                    </Tag>
                                )}
                            </div>

                            {level.is_completed && level.player_best_score !== undefined && (
                                <div className="level-score">
                                    <StarFilled style={{ color: '#ffd700' }} />
                                    <Text strong> {level.player_best_score} điểm</Text>
                                </div>
                            )}

                            {level.is_locked ? (
                                <div className="locked-overlay">
                                    <LockOutlined style={{ fontSize: 24 }} />
                                    <Text>Hoàn thành màn trước</Text>
                                </div>
                            ) : (
                                <Button
                                    type={level.is_completed ? 'default' : 'primary'}
                                    icon={<PlayCircleOutlined />}
                                    block
                                    style={{ marginTop: 12 }}
                                >
                                    {level.is_completed ? 'Chơi lại' : 'Bắt đầu'}
                                </Button>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>
        </div>
    );
};

export default LevelsPage;
