import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchChapters, fetchProgress, unlockChapter } from '@/store/slices/gameSlice';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from 'react-i18next';
import { Card, Row, Col, Progress, Spin, Typography, Tag, Modal, message } from 'antd';
import Button from '@/components/common/Button';
import { useGameSounds } from '@/hooks/useSound';
import { LockOutlined, CheckCircleOutlined, TrophyOutlined, DollarOutlined } from '@ant-design/icons';
import type { Chapter } from '@/types';
import { StatisticsCard } from "@/components/common";
import { getImageUrl } from "@/utils/image.helper";
import { motion, AnimatePresence } from 'framer-motion';
import "./styles.less";

const { Title, Text, Paragraph } = Typography;

const ChaptersPage: React.FC = () => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { user } = useAuth(); // Import useAuth
    const { chapters, chaptersLoading, progress, progressLoading } = useAppSelector((state) => state.game);
    const { playClick } = useGameSounds();

    useEffect(() => {
        dispatch(fetchChapters());
        dispatch(fetchProgress());
    }, [dispatch]);

    const handleChapterClick = (chapter: Chapter) => {
        if (chapter.petalState === 'blooming' || chapter.petalState === 'full') {
            navigate(`/game/chapters/${chapter.id}/levels`);
        }
    };

    const handleUnlockChapter = async (chapterId: number) => {
        try {
            const result = await dispatch(unlockChapter(chapterId)).unwrap();
            if (result.success) {
                Modal.success({
                    title: t('gameChapters.modal.unlockSuccess.title'),
                    content: t('gameChapters.modal.unlockSuccess.content', { petals: result.data.petalsSpent }),
                });
            } else {
                message.error(result.message || t('gameChapters.modal.unlockError'));
            }
        } catch (error: any) {
            message.error(error.message || t('gameChapters.modal.connectionError'));
        }
    };

    const getChapterColor = (chapter: Chapter | null | undefined) => {
        return chapter?.color || '#8b1d1d';
    };

    const getChapterImage = (chapter: Chapter) => {
        if (chapter.image) return getImageUrl(chapter.image);

        // Return a default image if no image is set
        return "https://media.licdn.com/dms/image/v2/D5612AQE8NiooxTxA3w/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1695825196046?e=1770249600&v=beta&t=Oy9UgJswkfS4zaALRlZyxKH9xh3Cga6Mb5aWMOSJBtw";
    };

    if (chaptersLoading || progressLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip={t('gameChapters.loading')} />
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
                        <TrophyOutlined className="title-icon" /> {t('gameChapters.header.title')}
                    </Title>
                    <Paragraph className="subtitle">
                        {t('gameChapters.header.subtitle')}
                    </Paragraph>
                </div>
            </motion.div>

            {progress && (
                <div className="stats-container">
                    <StatisticsCard
                        data={[
                            {
                                title: t('gameChapters.stats.points'),
                                value: progress.totalPoints,
                                icon: <TrophyOutlined />,
                                valueColor: "#1890ff",
                            },
                            {
                                title: t('gameChapters.stats.petals'),
                                value: progress.totalSenPetals,
                                icon: <span style={{ fontSize: 24, lineHeight: 1 }}>🌸</span>,
                                valueColor: "#52c41a",
                            },
                            {
                                title: t('gameChapters.stats.coins'),
                                value: progress.coins,
                                icon: <DollarOutlined />,
                                valueColor: "#faad14",
                            },
                            {
                                title: t('gameChapters.stats.completion'),
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
                            // Access logic
                            const hasBypass = user?.role === 'admin';
                            const isActuallyUnlocked = chapter.petalState === 'blooming' || chapter.petalState === 'full';
                            const canAccess = hasBypass || isActuallyUnlocked;

                            // Lock states for overlay
                            const isHardLocked = chapter.petalState === 'locked';
                            const isUnlockable = chapter.petalState === 'closed' || (chapter.requiredPetals > 0 && !isActuallyUnlocked);

                            // The card is interactive if the user can access it
                            const isCardInteractive = canAccess;

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
                                        whileHover={{ y: !isCardInteractive ? 0 : -5 }}
                                        className="chapter-card-wrapper"
                                    >
                                        <Card
                                            hoverable={isCardInteractive}
                                            className={`chapter-card ${!isCardInteractive ? 'locked' : ''}`}
                                            onClick={() => {
                                                if (isCardInteractive) {
                                                    playClick();
                                                    handleChapterClick(chapter);
                                                }
                                            }}
                                            actions={isCardInteractive ? [
                                                <Button
                                                    variant="primary"
                                                    className="play-button"
                                                    fullWidth
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        navigate(`/game/chapters/${chapter.id}/levels`);
                                                    }}
                                                >
                                                    {t('gameChapters.card.playNow')}
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
                                                            {t('gameChapters.card.theme', { theme: chapter.theme || t('gameChapters.card.noTheme') })}
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
                                                        <Text type="secondary">{t('gameChapters.card.progress')}</Text>

                                                        <Text type="secondary">
                                                            {t('gameChapters.card.levelsCount', { completed: chapter.completedLevels, total: chapter.totalLevels })}
                                                        </Text>
                                                    </div>
                                                </div>
                                            </div>

                                            {!canAccess && (
                                                <div className="locked-overlay">
                                                    <LockOutlined style={{ fontSize: 32, marginBottom: 8 }} />
                                                    {isHardLocked ? (
                                                        <>
                                                            <Text>{t('gameChapters.card.locked')}</Text>
                                                            {chapter.requiredChapterId && (
                                                                <Text style={{ fontSize: 12, opacity: 0.8, display: 'block', marginTop: 4 }}>
                                                                    ({t('gameChapters.card.requires', {
                                                                        name: chapters.find(c => c.id === chapter.requiredChapterId)?.name || 'Chương trước'
                                                                    })})
                                                                </Text>
                                                            )}
                                                        </>
                                                    ) : isUnlockable ? (
                                                        <>
                                                            <Text>{t('gameChapters.card.locked')}</Text>
                                                            <Text style={{ fontSize: 14, marginBottom: 12, display: 'block' }}>
                                                                {t('gameChapters.card.needPetals', { petals: chapter.requiredPetals })}
                                                            </Text>
                                                            <Button
                                                                variant="primary"
                                                                className="unlock-button"
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleUnlockChapter(chapter.id);
                                                                }}
                                                            >
                                                                {t('gameChapters.card.unlock')}
                                                            </Button>
                                                        </>
                                                    ) : (
                                                        <Text>{t('gameChapters.card.locked')}</Text>
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
