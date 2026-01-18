import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchChapters, fetchProgress } from '@/store/slices/gameSlice';
import { Card, Row, Col, Progress, Button, Spin, Typography, Tag, Modal } from 'antd';
import { LockOutlined, CheckCircleOutlined, TrophyOutlined, DollarOutlined } from '@ant-design/icons';
import type { Chapter } from '@/types';
import { StatisticsCard } from "@/components/common";
import "./styles.less";

const { Title, Text, Paragraph } = Typography;

const ChaptersPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { chapters, chaptersLoading, progress, progressLoading } = useAppSelector((state) => state.game);
    const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
    const [modalVisible, setModalVisible] = useState(false);

    useEffect(() => {
        dispatch(fetchChapters());
        dispatch(fetchProgress());
    }, [dispatch]);

    const handleChapterClick = (chapter: Chapter) => {
        if (chapter.is_unlocked) {
            navigate(`/game/chapters/${chapter.id}/levels`);
        }
    };

    const handleShowDetail = (chapter: Chapter, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedChapter(chapter);
        setModalVisible(true);
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

    const getChapterImage = (chapter: Chapter) => {
        if (chapter.image) return chapter.image;
        
        // Default images mapping based on chapter ID or theme
        // Using Unsplash placeholders matching the themes for now
        switch (chapter.id) {
            case 1:
                return "https://media.licdn.com/dms/image/v2/D5612AQE8NiooxTxA3w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1695825196046?e=1770249600&v=beta&t=Oy9UgJswkfS4zaALRlZyxKH9xh3Cga6Mb5aWMOSJBtw"; // Historical/Battle
            case 2:
                // Hue / Imperial timeline
                return "https://images.unsplash.com/photo-1555169062-013468b47731?w=600"; 
            case 3:
                // Golden age
                return "https://images.unsplash.com/photo-1599525281489-0824b223c285?w=600";
            default:
                return "https://images.unsplash.com/photo-1555921015-5532091f6026?w=600";
        }
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
                <Title level={2} className="page-title">Sen Hoa - Hành trình khám phá</Title>
                <Paragraph>
                    Mỗi cánh sen là một chương trong hành trình khám phá di sản Việt Nam.
                    Hoàn thành các màn chơi để mở khóa những câu chuyện mới!
                </Paragraph>

                {progress && (
                    <StatisticsCard
                        data={[
                            {
                                title: "Điểm",
                                value: progress.total_points,
                                icon: <TrophyOutlined />,
                                valueColor: "#ffd700",
                            },
                            {
                                title: "Cánh Sen",
                                value: progress.total_sen_petals,
                                icon: <span style={{ fontSize: 24, lineHeight: 1 }}>🌸</span>,
                                valueColor: "#ff4d4f", // Fallback color if emoji doesn't render or for text
                            },
                            {
                                title: "Xu",
                                value: progress.coins,
                                icon: <DollarOutlined />,
                                valueColor: "#faad14",
                            },
                            {
                                title: "Hoàn thành",
                                value: `${progress.stats?.completion_rate || 0}%`,
                                icon: <CheckCircleOutlined />,
                                valueColor: "#52c41a",
                            }
                        ]}
                        colSpan={{ xs: 12, sm: 6, md: 6, lg: 6 }}
                        statShadow={true}
                        hideCard
                        autoBackground={{ enabled: true, lightenAmount: 0.1, alphaAmount: 0.15 }}
                        cardStyle={{ alignItems: 'center', textAlign: 'left' }}
                    />
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
                            <div className="chapter-cover">
                                <img src={getChapterImage(chapter)} alt={chapter.name} />
                                <div className="chapter-theme-tag">
                                    <Tag color={getChapterColor(chapter.theme)}>
                                        Chủ đề: {chapter.theme || "Không có"}
                                    </Tag>
                                </div>
                            </div>

                            <div className="chapter-body">
                                <div className="chapter-header-info">
                                    <Title level={4}>{chapter.name}</Title>
                                </div>

                            <div className="chapter-description-wrapper">
                                <Paragraph ellipsis={{ rows: 3 }}>
                                    {chapter.description}
                                </Paragraph>
                                {chapter.description && chapter.description.length > 80 && (
                                    <span 
                                        className="chapter-read-more"
                                        onClick={(e) => handleShowDetail(chapter, e)}
                                    >
                                        Xem thêm
                                    </span>
                                )}
                            </div>

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
                                <div style={{ padding: '0 16px 16px 16px', marginTop: 'auto' }}>
                                    <Button
                                        type="primary"
                                        className="play-button"
                                        block
                                        onClick={() => navigate(`/game/chapters/${chapter.id}/levels`)}
                                    >
                                        Chơi ngay
                                    </Button>
                                </div>
                            )}
                        </Card>
                    </Col>
                ))}
            </Row>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 32 }}>
                            {selectedChapter && getPetalStateIcon(selectedChapter.petal_state)}
                        </span>
                        <span>{selectedChapter?.name}</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedChapter?.is_unlocked && (
                        <Button 
                            key="play" 
                            type="primary"
                            className="play-button"
                            onClick={() => {
                                if (selectedChapter) {
                                    navigate(`/game/chapters/${selectedChapter.id}/levels`);
                                }
                            }}
                        >
                            Chơi ngay
                        </Button>
                    ),
                ]}
                width={600}
            >
                {selectedChapter && (
                    <>
                        <Tag 
                            color={getChapterColor(selectedChapter.theme)}
                            style={{ marginBottom: 16 }}
                        >
                            {selectedChapter.theme}
                        </Tag>
                        <Paragraph style={{ fontSize: 15, lineHeight: 1.8, color: '#2c3e50' }}>
                            {selectedChapter.description}
                        </Paragraph>
                        <div style={{ marginTop: 24 }}>
                            <Text strong>Tiến độ: </Text>
                            <Progress 
                                percent={selectedChapter.completion_rate} 
                                status={selectedChapter.completion_rate === 100 ? 'success' : 'active'}
                            />
                            <Text type="secondary">
                                {selectedChapter.completed_levels}/{selectedChapter.total_levels} màn đã hoàn thành
                            </Text>
                        </div>
                    </>
                )}
            </Modal>
        </div>
    );
};

export default ChaptersPage;
