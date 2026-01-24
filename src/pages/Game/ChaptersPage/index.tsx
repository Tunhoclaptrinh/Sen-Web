import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchChapters } from '@/store/slices/gameSlice';
import { Card, Row, Col, Progress, Button, Spin, Typography, Tag, Modal, message } from 'antd';
import { LockOutlined, CheckCircleOutlined, TrophyOutlined, DollarOutlined } from '@ant-design/icons';
import gameService from '@/services/game.service';
import type { Chapter } from '@/types';
import { StatisticsCard } from "@/components/common";
import { motion, AnimatePresence } from 'framer-motion';
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
    }, [dispatch]);

    const handleChapterClick = (chapter: Chapter) => {
        if (chapter.petal_state === 'blooming' || chapter.petal_state === 'full') {
            navigate(`/game/chapters/${chapter.id}/levels`);
        }
    };

    const handleShowDetail = (chapter: Chapter, e: React.MouseEvent) => {
        e.stopPropagation();
        setSelectedChapter(chapter);
        setModalVisible(true);
    };

    const handleUnlockChapter = async (chapterId: number) => {
        try {
            const result = await gameService.unlockChapter(chapterId);
            if (result.success) {
                Modal.success({
                    title: 'Mở khóa thành công!',
                    content: `Bạn đã mở khóa chương mới và chi tiêu ${result.data.petals_spent} cánh sen.`,
                    onOk: () => {
                        dispatch(fetchChapters());
                    }
                });
            } else {
                message.error(result.message || 'Không thể mở khóa chương này');
            }
        } catch (error: any) {
            message.error(error.message || 'Lỗi kết nối');
        }
    };

    const getChapterColor = (chapter: Chapter | null | undefined) => {
        const colors: Record<string, string> = {
            'Văn hóa Đại Việt': '#ff69b4',
            'Thời Hoàng Kim': '#ffd700',
            'Di sản Bất tử': '#ffffff',
        };
        return chapter?.color || colors[chapter?.theme || ''] || '#1890ff';
    };

    const getChapterImage = (chapter: Chapter) => {
        if (chapter.image) return chapter.image;

        switch (chapter.layer_index) {
            case 1:
                return "https://media.licdn.com/dms/image/v2/D5612AQE8NiooxTxA3w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1695825196046?e=1770249600&v=beta&t=Oy9UgJswkfS4zaALRlZyxKH9xh3Cga6Mb5aWMOSJBtw";
            case 2:
                return "https://images.unsplash.com/photo-1555169062-013468b47731?w=600"; 
            case 3:
                return "https://images.unsplash.com/photo-1599525281489-0824b223c285?w=600";
        }
    };

    const getPetalStateIcon = (state: string) => {
        switch (state) {
            case 'full':
                return '🌸';
            case 'blooming':
                return '🌺';
            case 'closed':
                return '🌹';
            case 'locked':
                return '🔒';
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
            <motion.div 
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="chapters-header"
            >
                <div className="header-content">
                    <Title level={1} className="main-title">
                        <TrophyOutlined className="title-icon" /> Sen Hoa - Hành trình khám phá
                    </Title>
                    <Paragraph className="subtitle">
                        Mỗi cánh sen là một chương trong hành trình khám phá di sản Việt Nam.
                        Hoàn thành các màn chơi để mở khóa những câu chuyện mới!
                    </Paragraph>
                </div>
            </motion.div>

            {progress && (
                <div className="stats-container">
                    <StatisticsCard
                        data={[
                            {
                                title: "Điểm",
                                value: progress.total_points,
                                icon: <TrophyOutlined />,
                                valueColor: "#1890ff",
                            },
                            {
                                title: "Cánh Sen",
                                value: progress.total_sen_petals,
                                icon: <span style={{ fontSize: 24, lineHeight: 1 }}>🌸</span>,
                                valueColor: "#52c41a",
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
                                valueColor: "#722ed1",
                            }
                        ]}
                        colSpan={{ xs: 12, sm: 12, md: 6 }}
                        hideCard
                        rowGutter={24}
                        cardStyle={{ borderRadius: 20, backdropFilter: 'blur(8px)', background: 'rgba(255, 255, 255, 0.7)', border: '1px solid rgba(255, 255, 255, 0.3)' }}
                    />
                </div>
            )}

            <AnimatePresence>
                <motion.div
                    variants={{
                        hidden: { opacity: 0 },
                        visible: {
                            opacity: 1,
                            transition: {
                                staggerChildren: 0.1
                            }
                        }
                    }}
                    initial="hidden"
                    animate="visible"
                    className="chapters-content"
                >
                    <Row gutter={[24, 24]} className="chapters-grid">
                        {chapters.map((chapter) => {
                            // Derived logic from petal_state
                            const isUnlocked = chapter.petal_state === 'blooming' || chapter.petal_state === 'full';
                            // "locked" state from backend means Hard Lock (previous chapter not finished)
                            const isHardLocked = chapter.petal_state === 'locked';
                            return (
                                <Col xs={24} sm={12} lg={8} key={chapter.id}>
                                    <motion.div
                                        variants={{
                                            hidden: { y: 20, opacity: 0 },
                                            visible: {
                                                y: 0,
                                                opacity: 1
                                            }
                                        }}
                                        style={{ height: '100%', width: '100%', position: 'relative' }}
                                        whileHover={{ y: !isUnlocked ? 0 : -5 }}
                                        className="chapter-card-wrapper"
                                    >
                                        <Card
                                            hoverable={isUnlocked}
                                            className={`chapter-card ${!isUnlocked ? 'locked' : ''}`}
                                            onClick={() => handleChapterClick(chapter)}
                                            actions={isUnlocked ? [
                                                <Button
                                                    type="primary"
                                                    className="play-button"
                                                    block
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/game/chapters/${chapter.id}/levels`);
                                                    }}
                                                >
                                                    Chơi ngay
                                                </Button>
                                            ] : []}
                                            cover={
                                                <div className="chapter-cover">
                                                    <div className="chapter-image-wrapper">
                                                        <img 
                                                            src={getChapterImage(chapter)} 
                                                            alt="" 
                                                            className="chapter-img-backdrop" 
                                                        />
                                                        <img 
                                                            src={getChapterImage(chapter)} 
                                                            alt={chapter.name} 
                                                            className="chapter-img-main" 
                                                        />
                                                    </div>
                                                    <div className="chapter-theme-tag">
                                                        <Tag color={getChapterColor(chapter)}>
                                                            Chủ đề: {chapter.theme || "Không có"}
                                                        </Tag>
                                                    </div>
                                                </div>
                                            }
                                        >

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

                                            {!isUnlocked && (
                                                <div className="locked-overlay">
                                                    <LockOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                                    {isHardLocked ? (
                                                        <>
                                                            <Text>Chưa mở khóa</Text>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Text>Cần {chapter.required_petals} cánh sen</Text>
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
                                                        </>
                                                    )}
                                                </div>
                                            )}
                                        </Card>
                                    </motion.div>
                                </Col>
                            );
                        })}
                    </Row>
                </motion.div>
            </AnimatePresence>

            <Modal
                title={
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <span style={{ fontSize: 32 }}>
                            {selectedChapter && getPetalStateIcon(selectedChapter.petal_state)}
                        </span>
                        <span className="modal-title">{selectedChapter?.name}</span>
                    </div>
                }
                open={modalVisible}
                onCancel={() => setModalVisible(false)}
                className="premium-chapter-modal"
                footer={[
                    <Button key="close" onClick={() => setModalVisible(false)} className="detail-btn">
                        Đóng
                    </Button>,
                    (selectedChapter?.petal_state === 'blooming' || selectedChapter?.petal_state === 'full') && (
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
                centered
            >
                {selectedChapter && (
                    <div className="chapter-modal-content">
                        <Tag 
                            color={getChapterColor(selectedChapter)}
                            style={{ marginBottom: 16, borderRadius: 8, fontWeight: 700 }}
                        >
                            {selectedChapter.theme}
                        </Tag>
                        <Paragraph className="modal-desc">
                            {selectedChapter.description}
                        </Paragraph>
                        <div className="modal-section">
                            <Text strong>Tiến độ: </Text>
                            <Progress 
                                percent={selectedChapter.completion_rate} 
                                status={selectedChapter.completion_rate === 100 ? 'success' : 'active'}
                                strokeColor={{
                                    '0%': '#8b1d1d',
                                    '100%': '#ff4d4f',
                                }}
                            />
                            <Text type="secondary">
                                {selectedChapter.completed_levels}/{selectedChapter.total_levels} màn đã hoàn thành
                            </Text>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default ChaptersPage;
