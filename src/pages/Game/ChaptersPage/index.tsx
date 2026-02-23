import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchChapters } from '@/store/slices/gameSlice';
import { useAuth } from '@/hooks/useAuth';
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
    const { user } = useAuth(); // Import useAuth
    const { chapters, chaptersLoading, progress, progressLoading } = useAppSelector((state) => state.game);

    useEffect(() => {
        dispatch(fetchChapters());
    }, [dispatch]);

    const handleChapterClick = (chapter: Chapter) => {
        if (chapter.petalState === 'blooming' || chapter.petalState === 'full') {
            navigate(`/game/chapters/${chapter.id}/levels`);
        }
    };

    const handleUnlockChapter = async (chapterId: number) => {
        try {
            const result = await gameService.unlockChapter(chapterId);
            if (result.success) {
                Modal.success({
                    title: 'Mở khóa thành công!',
                    content: `Bạn đã mở khóa chương mới và chi tiêu ${result.data.petalsSpent} cánh sen.`,
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
        return chapter?.color || '#8b1d1d';
    };

    const getChapterImage = (chapter: Chapter) => {
        if (chapter.image) return chapter.image;

        // Return a default image if no image is set
        return "https://media.licdn.com/dms/image/v2/D5612AQE8NiooxTxA3w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1695825196046?e=1770249600&v=beta&t=Oy9UgJswkfS4zaALRlZyxKH9xh3Cga6Mb5aWMOSJBtw";
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
                                value: progress.totalPoints,
                                icon: <TrophyOutlined />,
                                valueColor: "#1890ff",
                            },
                            {
                                title: "Cánh Sen",
                                value: progress.totalSenPetals,
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
                                value: `${progress.stats?.completionRate || 0}%`,
                                icon: <CheckCircleOutlined />,
                                valueColor: "#722ed1",
                            }
                        ]}
                        colSpan={{ xs: 12, sm: 12, md: 6 }}
                        hideCard
                        rowGutter={24}
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
                            const isAdmin = user?.role === 'admin';
                            const isUnlocked = isAdmin || chapter.petalState === 'blooming' || chapter.petalState === 'full';
                            // "locked" state from backend means Hard Lock (previous chapter not finished)
                            const isHardLocked = !isAdmin && chapter.petalState === 'locked';
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
                                                    <Paragraph ellipsis={{ rows: 4 }}>
                                                        {chapter.description}
                                                    </Paragraph>
                                                </div>

                                                <div className="chapter-stats">
                                                    <div className="stat">
                                                        <Progress
                                                            percent={chapter.completionRate}
                                                            size="small"
                                                            status={chapter.completionRate === 100 ? 'success' : 'active'}
                                                        />
                                                    </div>
                                                    <div className="stat">
                                                        <Text type="secondary">Tiến độ</Text>

                                                        <Text type="secondary">
                                                            {chapter.completedLevels}/{chapter.totalLevels} màn
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
                                                            <Text>Cần {chapter.requiredPetals} cánh sen</Text>
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
        </div>
    );
};

export default ChaptersPage;
