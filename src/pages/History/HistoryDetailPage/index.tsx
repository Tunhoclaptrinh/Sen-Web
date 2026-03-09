import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, message, Row, Col, Typography, Empty, Button, Divider, Tag, Tabs, Timeline } from "antd";
import { useTranslation } from "react-i18next";
import {
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  CalendarOutlined,
  UserOutlined,
  ShareAltOutlined,
  ReadOutlined,
  RocketOutlined,
  ShopOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  EyeOutlined,
  FolderAddOutlined,
  GlobalOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import historyService from "@/services/history.service"; // Adapt service
import favoriteService from "@/services/favorite.service";
import ArticleCard from "@/components/common/cards/ArticleCard";
import AddToCollectionModal from "@/components/common/AddToCollectionModal";
import gameService from "@/services/game.service";
import { useViewTracker } from "@/hooks/useViewTracker";
import { normalizeVietnamese } from "@/utils/helpers";
import { HistoryArticle, HeritageSite, Artifact, TimelineEvent } from "@/types";
import { ITEM_TYPES } from "@/config/constants";
import ReviewSection from "@/components/common/Review/ReviewSection";
import EmbeddedGameZone from "@/components/Game/EmbeddedGameZone";
import { trackViewProduct } from "@/utils/analytics";
import "./styles.less";

const { Title } = Typography;

const HistoryDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [article, setArticle] = useState<HistoryArticle | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const trackedProductIdRef = useRef<string | null>(null);

  // Track view
  useViewTracker("history", id);

  // Data states
  const [relatedHeritage, setRelatedHeritage] = useState<HeritageSite[]>([]);
  const [relatedArtifacts, setRelatedArtifacts] = useState<Artifact[]>([]);
  const [relatedLevels, setRelatedLevels] = useState<any[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<any[]>([]);

  // Fallback for general related history
  const [relatedHistory, setRelatedHistory] = useState<HistoryArticle[]>([]);

  useEffect(() => {
    if (id) {
      fetchData(id);
      checkFavoriteStatus(id);
      window.scrollTo(0, 0);
    }
  }, [id]);

  useEffect(() => {
    if (!article?.id) return;

    const normalizedId = String(article.id);
    if (trackedProductIdRef.current === normalizedId) return;

    trackedProductIdRef.current = normalizedId;
    trackViewProduct({
      itemId: normalizedId,
      itemName: article.title,
      itemType: "history_article",
      sourceScreen: "HistoryDetailPage",
    });
  }, [article?.id, article?.title]);

  const fetchData = async (currentId: string) => {
    try {
      setLoading(true);
      const res = await historyService.getById(currentId);
      if (res && res.data) {
        const data = res.data;
        setArticle(data);
        setRelatedHeritage(data.relatedHeritage || []);
        setRelatedArtifacts(data.relatedArtifacts || []);
        setRelatedProducts(data.relatedProducts || []);

        // Fetch Related Levels (Game) - Prefer auto-populated data
        if (data.relatedLevels && data.relatedLevels.length > 0) {
          setRelatedLevels(data.relatedLevels);
        } else {
          try {
            const resLevels = await gameService.getAll({
              relatedHistoryIds: currentId,
              limit: 4,
            });
            if (resLevels.success && resLevels.data) setRelatedLevels(resLevels.data);
          } catch (err) {
            console.error("Failed to query related levels", err);
          }
        }

        // Fetch related history (prioritize explicit links + fill up to 3)
        const relHistIds = data.relatedHistoryIds || [];
        const relatedHistoryData: HistoryArticle[] = [];

        if (relHistIds.length > 0) {
          const resRelIds = await historyService.getByIds(relHistIds);
          if (resRelIds.data) relatedHistoryData.push(...resRelIds.data);
        }

        if (relatedHistoryData.length < 3) {
          const resRelated = await historyService.getRelated(currentId, 6);
          if (resRelated.data) {
            const existingIds = new Set(relatedHistoryData.map(h => h.id));
            resRelated.data.forEach(h => {
              if (h.id !== Number(currentId) && !existingIds.has(h.id) && relatedHistoryData.length < 3) {
                relatedHistoryData.push(h);
              }
            });
          }
        }
        setRelatedHistory(relatedHistoryData);
      } else {
        message.error(t('history.detail.messages.notFound'));
      }
    } catch (error) {
      console.error(error);
      message.error(t('history.detail.messages.loadError'));
    } finally {
      setLoading(false);
    }
  };

  const checkFavoriteStatus = async (currentId: string) => {
    try {
      const res = await favoriteService.check("article", currentId);
      if (res.data) {
        setIsFavorite(res.data.isFavorited);
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
    }
  };

  const handleToggleFavorite = async () => {
    try {
      if (!id) return;
      const res = await favoriteService.toggle("article", id);
      if (res.success && res.data) {
        setIsFavorite(res.data.isFavorited);
        message.success(res.message);
      }
    } catch (error) {
      message.error(t('history.detail.messages.favoriteError'));
    }
  };

  const handleStartGame = (levelId?: number) => {
    if (levelId) {
      setSelectedLevelId(levelId);
    } else {
      const demoId = article && article.id ? (Number(article.id) % 2 === 0 ? 1 : 2) : 1;
      setSelectedLevelId(demoId);
    }
    setShowGame(true);
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  if (!article) return <Empty description={t('history.detail.messages.notFound')} />;

  const mainImage = article.image || "https://images.unsplash.com/photo-1555921015-5532091f6026?w=1200";
  const publishDate = article.publishDate || article.createdAt;
  const authorName = normalizeVietnamese(article.authorName || article.author || t('common.noInfo'));
  const normalizedTitle = normalizeVietnamese(article.title);
  const normalizedShortDescription = normalizeVietnamese(article.shortDescription || "");
  const normalizedContent = normalizeVietnamese(article.content || "");

  return (
    <div className="heritage-blog-page history-detail-page">
      {/* 0. Nav Back (Added on top of Hero) */}
      <div className="nav-back-wrapper">
        <Button
          type="default"
          shape="circle"
          icon={<ArrowLeftOutlined />}
          size="large"
          onClick={() => navigate("/history")}
          className="nav-back-btn"
        />
      </div>

      {/* 1. HERO SECTION (Identical to Heritage) */}
      <section className="detail-hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${mainImage}')` }} />
        <div className="hero-overlay">
          <div className="hero-content">
            <Tag color="var(--primary-color)" style={{ border: "none", marginBottom: 16 }}>
              {t('history.detail.hero.tag')}
            </Tag>
            <h1>{normalizedTitle}</h1>
            <div className="hero-meta">
              <span>
                <CalendarOutlined /> {dayjs(publishDate).format("DD/MM/YYYY")}
              </span>
              <span>
                <UserOutlined /> {authorName}
              </span>
              <span>
                <EyeOutlined /> {t('history.detail.hero.views', { count: article.views || 0 })}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="content-container">
        <Tabs
          defaultActiveKey="content"
          className="heritage-tabs" // Reuse heritage-tabs class for consistent styling
          centered
          items={[
            {
              key: "content",
              label: t('history.detail.tabs.content'),
              children: (
                <div className="article-main-wrapper">
                  <div className="article-meta-header">
                    <SpaceItem icon={<ReadOutlined />} text="Bài viết chi tiết" />
                  </div>

                  <h2 className="article-main-title">{normalizedTitle}</h2>

                  {/* Abstract/Short Description */}
                  {normalizedShortDescription && <blockquote>{normalizedShortDescription}</blockquote>}
                  <div className="article-body-content" dangerouslySetInnerHTML={{ __html: normalizedContent || `<p>${t('history.detail.content.noContent')}</p>` }} />

                  {article.references && (
                    <div className="references-section">
                      <h3>{t('history.detail.content.references')}</h3>
                      <div className="references-content" dangerouslySetInnerHTML={{ __html: article.references }} />
                    </div>
                  )}

                  <div className="article-footer-info">
                    <Divider />
                    <div className="action-row">
                      <Button
                        type="text"
                        size="large"
                        icon={isFavorite ? <HeartFilled style={{ color: "#ff4d4f" }} /> : <HeartOutlined />}
                        onClick={handleToggleFavorite}
                      >
                        {isFavorite ? t('history.detail.content.actions.saved') : t('history.detail.content.actions.save')}
                      </Button>
                      <Button type="text" size="large" icon={<ShareAltOutlined />}>
                        {t('history.detail.content.actions.share')}
                      </Button>
                      <Button
                        type="text"
                        size="large"
                        icon={<FolderAddOutlined />}
                        onClick={() => setShowCollectionModal(true)}
                      >
                        {t('history.detail.content.actions.saveToCollection')}
                      </Button>
                    </div>
                  </div>

                  <AddToCollectionModal
                    visible={showCollectionModal}
                    onCancel={() => setShowCollectionModal(false)}
                    item={{
                      id: article.id,
                      type: "article",
                      name: normalizedTitle,
                    }}
                  />
                </div>
              ),
            },
            {
              key: "timeline",
              label: t('history.detail.tabs.timeline'),
              children: (
                <div className="article-main-wrapper">
                  <Title level={3} style={{ fontFamily: "Aleo, serif", marginBottom: 32, textAlign: "center" }}>
                    {t('history.detail.timeline.title')}
                  </Title>
                  {article.timelineEvents && article.timelineEvents.length > 0 ? (
                    <div style={{ maxWidth: 800, margin: "0 auto" }}>
                      <Timeline mode="alternate">
                        {article.timelineEvents.map((event: TimelineEvent, index: number) => (
                          <Timeline.Item key={index} label={event.year} color={index % 2 === 0 ? "red" : "blue"}>
                            <strong style={{ fontSize: 18, color: "#d4380d" }}>{event.title}</strong>
                            <p style={{ marginTop: 8, color: "#666" }}>{event.description}</p>
                          </Timeline.Item>
                        ))}
                      </Timeline>
                    </div>
                  ) : (
                    <Empty description={t('history.detail.timeline.empty')} />
                  )}
                </div>
              ),
            },
            {
              key: "discovery",
              label: t('history.detail.tabs.discovery'),
              children: (
                <div className="article-main-wrapper">
                  {/* 0. 3D Virtual Tour (Mock) */}
                  <div className="discovery-block">
                    <Title level={3}>
                      <GlobalOutlined /> {t('history.detail.discovery.virtualTour.title')}
                    </Title>
                    <div className="virtual-tour-card">
                      <div style={{ position: "relative", zIndex: 1 }}>
                        <h2>{t('history.detail.discovery.virtualTour.cardTitle')}</h2>
                        <p>{t('history.detail.discovery.virtualTour.subtitle')}</p>
                        <Button
                          size="large"
                          onClick={() => message.info("Tính năng Tham quan 3D đang được phát triển!")}
                        >
                          {t('history.detail.discovery.virtualTour.button')} <RocketOutlined style={{ marginLeft: 8 }} />
                        </Button>
                        <div style={{ marginTop: 16 }}>
                          <Tag color="gold" style={{ borderRadius: 4, fontWeight: 600 }}>
                            {t('history.detail.discovery.virtualTour.comingSoon')}
                          </Tag>
                        </div>
                      </div>
                    </div>
                    <Divider />
                  </div>

                  {/* 1. Related Games */}
                  <div className="discovery-block">
                    <Title level={3}>
                      <RocketOutlined /> {t('history.detail.discovery.game.title')}
                    </Title>
                    <p>{t('history.detail.discovery.game.subtitle')}</p>
                    {showGame && selectedLevelId ? (
                      <EmbeddedGameZone
                        levelId={selectedLevelId}
                        onClose={() => setShowGame(false)}
                        onNavigateToFullGame={() => navigate("/game/chapters")}
                      />
                    ) : (
                      <Row gutter={[24, 24]}>
                        {relatedLevels.length > 0 ? (
                          relatedLevels.map((level: any) => (
                            <Col xs={24} md={12} key={level.id}>
                              <div className="game-card-mini">
                                <div
                                  className="game-thumb"
                                  style={{ backgroundImage: `url(${level.thumbnail || level.backgroundImage || level.image})` }}
                                />
                                <div className="game-info">
                                  <h4>{level.name}</h4>
                                  <div className="desc">{level.description}</div>
                                </div>
                                <Button
                                  type="primary"
                                  shape="round"
                                  icon={<RocketOutlined />}
                                  onClick={() => handleStartGame(level.id)}
                                >
                                  {t('history.detail.discovery.game.playNow')}
                                </Button>
                              </div>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <div className="game-cta-banner">
                              <RocketOutlined className="cta-icon" />
                              <div className="cta-content">
                                <h4>{t('history.detail.discovery.game.ctaTitle')}</h4>
                                <p>{t('history.detail.discovery.game.ctaSubtitle')}</p>
                              </div>
                              <Button
                                type="primary"
                                size="large"
                                shape="round"
                                icon={<ArrowRightOutlined />}
                                onClick={() => navigate("/game/chapters")}
                              >
                                {t('history.detail.discovery.game.ctaButton')}
                              </Button>
                            </div>
                          </Col>
                        )}
                      </Row>
                    )}
                    <Divider />
                  </div>

                  {/* 2. Related Heritage & Artifacts */}
                  {(relatedHeritage.length > 0 || relatedArtifacts.length > 0) && (
                    <div className="discovery-block">
                      <Title level={3}>
                        <EnvironmentOutlined /> {t('history.detail.discovery.related.title')}
                      </Title>
                      <Row gutter={[24, 24]}>
                        {relatedHeritage.map((h: any) => (
                          <Col xs={24} sm={12} md={8} key={`h-${h.id}`}>
                            <ArticleCard data={h} type={ITEM_TYPES.HERITAGE} />
                          </Col>
                        ))}
                        {relatedArtifacts.map((a: any) => (
                          <Col xs={24} sm={12} md={8} key={`a-${a.id}`}>
                            <ArticleCard data={a} type={ITEM_TYPES.ARTIFACT} />
                          </Col>
                        ))}
                      </Row>
                      <Divider />
                    </div>
                  )}

                  {/* 3. Related Products */}
                  {relatedProducts.length > 0 && (
                    <div className="discovery-block" style={{ marginBottom: 0 }}>
                      <Title level={3}>
                        <ShopOutlined /> {t('history.detail.discovery.products.title')}
                      </Title>
                      <p>{t('history.detail.discovery.products.subtitle')}</p>
                      <Row gutter={[24, 24]}>
                        {relatedProducts.map((p: any) => (
                          <Col xs={24} sm={12} md={6} key={p.id}>
                            <div className="product-card">
                              <div className="prod-img">
                                <img src={p.image} alt={p.name} />
                              </div>
                              <h4>{normalizeVietnamese(p.name)}</h4>
                              <div className="price">{p.price?.toLocaleString()} đ</div>
                              <Button>{t('history.detail.discovery.products.viewDetails')}</Button>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    </div>
                  )}

                  {/* Empty State if absolutely nothing */}
                  {!relatedLevels.length &&
                    !relatedHeritage.length &&
                    !relatedArtifacts.length &&
                    !relatedProducts.length && <Empty description={t('history.detail.discovery.empty')} />}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* REVIEWS SECTION */}
      <div className="reviews-bottom-section">
        <div className="content-container">
          <ReviewSection
            type="history_article"
            referenceId={Number(id)}
            rating={article.rating}
            totalReviews={article.totalReviews}
            onSuccess={() => id && fetchData(id)}
          />
        </div>
      </div>

      {/* RELATED HISTORY BOTTOM */}
      <div className="related-bottom-section">
        <div className="content-container">
          <Divider />
          <Title level={3} className="section-title">
            {t('history.detail.relatedBottom.title')}
          </Title>
          <Row gutter={[24, 24]}>
            {relatedHistory.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <ArticleCard data={{ ...item, name: item.title }} type="history" />
              </Col>
            ))}
          </Row>
        </div>
      </div>
    </div>
  );
};

// Helper Components
const SpaceItem = ({ icon, text }: { icon: React.ReactNode; text: string }) => (
  <span className="meta-space-item" style={{ marginRight: 24, fontSize: 14, color: "#888" }}>
    {icon} <span style={{ marginLeft: 6 }}>{text}</span>
  </span>
);

export default HistoryDetailPage;
