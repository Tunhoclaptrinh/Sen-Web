import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Spin, message, Row, Col, Typography, Empty, Button, Divider, Tag, Tabs, Dropdown } from "antd";
import { useTranslation } from "react-i18next";
import {
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  CalendarOutlined,
  StarFilled,
  UserOutlined,
  ShareAltOutlined,
  RocketOutlined,
  ShopOutlined,
  HistoryOutlined,
  FolderAddOutlined,
  CameraOutlined,
  InfoCircleOutlined,
  ExpandOutlined,
  SafetyCertificateFilled,
  GlobalOutlined,
  ArrowLeftOutlined,
  ArrowRightOutlined,
  MoreOutlined,
  CompassOutlined,
  GoogleOutlined,
} from "@ant-design/icons";
import { Image } from "antd";
import { fetchArtifactById } from "@store/slices/artifactSlice";
import favoriteService from "@/services/favorite.service";
import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import gameService from "@/services/game.service";
import { RootState, AppDispatch } from "@/store";
import ArticleCard from "@/components/common/cards/ArticleCard";
import type { Artifact, HeritageSite, HistoryArticle } from "@/types";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import AddToCollectionModal from "@/components/common/AddToCollectionModal";
import SeoHead from "@/components/common/SeoHead";
import { useViewTracker } from "@/hooks/useViewTracker";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import { ITEM_TYPES } from "@/config/constants";
import ReviewSection from "@/components/common/Review/ReviewSection";
import EmbeddedGameZone from "@/components/Game/EmbeddedGameZone";
import { trackViewProduct } from "@/utils/analytics";
import { buildAbsoluteUrl, toMetaDescription } from "@/utils/seo.utils";
import { injectContextualLinks } from "@/utils/seo.linker";
import env from "@/config/env.config";
import "./styles.less";

const { Title } = Typography;

type DiscoveryLevel = {
  id: number;
  name?: string;
  description?: string;
  thumbnail?: string;
  backgroundImage?: string;
  image?: string;
};

const ArtifactDetailPage = () => {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { currentItem: artifact, loading, error } = useSelector((state: RootState) => state.artifact);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedArtifacts, setRelatedArtifacts] = useState<Artifact[]>([]);
  const [relatedHeritage, setRelatedHeritage] = useState<HeritageSite[]>([]);
  const [relatedHistory, setRelatedHistory] = useState<HistoryArticle[]>([]);
  const [discoveryLevels, setDiscoveryLevels] = useState<DiscoveryLevel[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [showGame, setShowGame] = useState(false);
  const [selectedLevelId, setSelectedLevelId] = useState<number | null>(null);
  const trackedProductIdRef = useRef<string | null>(null);

  // Track view
  useViewTracker(ITEM_TYPES.ARTIFACT, id);

  useEffect(() => {
    if (id) {
      dispatch(fetchArtifactById(id));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (artifact && artifact.id) {
      fetchRelated(artifact);
      if (isAuthenticated) {
        checkFavoriteStatus(artifact.id);
      }
    }
  }, [artifact, isAuthenticated]);

  useEffect(() => {
    if (!artifact?.id) return;

    const normalizedId = String(artifact.id);
    if (trackedProductIdRef.current === normalizedId) return;

    trackedProductIdRef.current = normalizedId;
    trackViewProduct({
      itemId: normalizedId,
      itemName: artifact.name,
      itemType: "artifact",
      sourceScreen: "ArtifactDetailPage",
    });
  }, [artifact?.id, artifact?.name]);

  const checkFavoriteStatus = async (artifactId: number) => {
    try {
      const res = await favoriteService.check(ITEM_TYPES.ARTIFACT, artifactId);
      if (res.success && res.data) {
        setIsFavorite(res.data.isFavorited);
      }
    } catch (error) {
      console.error("Failed to check favorite status", error);
    }
  };

  const fetchRelated = async (currentItem: Artifact) => {
    try {
      const currentId = currentItem.id;

      // 1. Fetch related artifacts (prioritize explicit links)
      const relArtIds = currentItem.relatedArtifactIds || [];
      let relatedArtifactsData: Artifact[] = [];

      if (relArtIds.length > 0) {
        const resRel = await artifactService.getAll({
          ids: relArtIds.join(","),
        });
        if (resRel.data) relatedArtifactsData = resRel.data;
      }

      // If we don't have enough, fallback to same heritage site
      if (relatedArtifactsData.length < 3 && currentItem.heritageSiteId) {
        const resSiteArt = await artifactService.getAll({
          heritageSiteId: currentItem.heritageSiteId,
          limit: 6,
        });
        if (resSiteArt.data) {
          const existingIds = new Set(relatedArtifactsData.map(a => a.id));
          resSiteArt.data.forEach(a => {
            if (a.id !== currentId && !existingIds.has(a.id) && relatedArtifactsData.length < 3) {
              relatedArtifactsData.push(a);
            }
          });
        }
      }

      // If still not enough, fill with random ones
      if (relatedArtifactsData.length < 3) {
        const resAll = await artifactService.getAll({ limit: 6 });
        if (resAll.data) {
          const existingIds = new Set(relatedArtifactsData.map(a => a.id));
          resAll.data.forEach(a => {
            if (a.id !== currentId && !existingIds.has(a.id) && relatedArtifactsData.length < 3) {
              relatedArtifactsData.push(a);
            }
          });
        }
      }
      setRelatedArtifacts(relatedArtifactsData);

      // 2. Fetch related heritage (prioritize explicit + fill up to 3)
      const relHeriIds = currentItem.relatedHeritageIds || [];
      const relatedHeritageData: HeritageSite[] = [];

      if (relHeriIds.length > 0) {
        const res = await heritageService.getByIds(relHeriIds);
        if (res.data) relatedHeritageData.push(...res.data);
      }

      if (relatedHeritageData.length < 3) {
        // Fallback: try parent site, then random
        if (currentItem.heritageSiteId) {
          const isCurrentInRel = relatedHeritageData.some(h => h.id === currentItem.heritageSiteId);
          if (!isCurrentInRel) {
            const res = await heritageService.getById(currentItem.heritageSiteId);
            if (res.data) relatedHeritageData.push(res.data);
          }
        }

        if (relatedHeritageData.length < 3) {
          const resAll = await heritageService.getAll({ limit: 6 });
          if (resAll.data) {
            const existingIds = new Set(relatedHeritageData.map(h => h.id));
            resAll.data.forEach(h => {
              if (!existingIds.has(h.id) && relatedHeritageData.length < 3) {
                relatedHeritageData.push(h);
              }
            });
          }
        }
      }
      setRelatedHeritage(relatedHeritageData);

      // 3. Fetch related history (prioritize explicit + fill up to 3)
      const relHistIds = currentItem.relatedHistoryIds || [];
      const relatedHistoryData: HistoryArticle[] = [];
      if (relHistIds.length > 0) {
        const res = await historyService.getByIds(relHistIds);
        if (res.data) relatedHistoryData.push(...res.data);
      }

      if (relatedHistoryData.length < 3) {
        const resAll = await historyService.getAll({ limit: 6 });
        if (resAll.data) {
          const existingIds = new Set(relatedHistoryData.map(h => h.id));
          resAll.data.forEach(h => {
            if (!existingIds.has(h.id) && relatedHistoryData.length < 3) {
              relatedHistoryData.push(h);
            }
          });
        }
      }
      setRelatedHistory(relatedHistoryData);

      // 4. Fetch Related Levels (Game) - Prefer auto-populated data
      if (currentItem.relatedLevels && currentItem.relatedLevels.length > 0) {
        setDiscoveryLevels(currentItem.relatedLevels);
      } else {
        try {
          const resLevels = await gameService.getAll({
            relatedArtifactIds: currentId,
            limit: 4,
          });
          if (resLevels.success && resLevels.data) setDiscoveryLevels(resLevels.data);
        } catch (err) {
          console.error("Failed to query related levels", err);
        }
      }
    } catch (e) {
      console.error("Failed to fetch related data", e);
    }
  };

  useEffect(() => {
    if (error) {
      message.error(error);
      navigate("/artifacts");
    }
  }, [error, navigate]);

  usePrerenderReady(!loading);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning(t('artifact.detail.messages.unauthorizedFavorite'));
      return;
    }
    try {
      if (isFavorite) {
        setIsFavorite(false);
        message.success(t('artifact.detail.messages.favoriteRemoved'));
      } else {
        await favoriteService.add(ITEM_TYPES.ARTIFACT, Number(id));
        setIsFavorite(true);
        message.success(t('artifact.detail.messages.favoriteSuccess'));
      }
    } catch (error) {
      message.error(t('artifact.detail.messages.actionFailed'));
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success(t('artifact.detail.messages.shareSuccess'));
      })
      .catch(() => {
        message.error(t('artifact.detail.messages.shareError'));
      });
  };

  const handleStartGame = (levelId?: number) => {
    if (levelId) {
      setSelectedLevelId(levelId);
    } else {
      const demoId = artifact && artifact.id ? (Number(artifact.id) % 2 === 0 ? 1 : 2) : 1;
      setSelectedLevelId(demoId);
    }
    setShowGame(true);
  };

  if (loading)
    return (
      <>
        <SeoHead
          title={t("artifact.browse.heroTitle")}
          description={t("artifact.browse.heroSubtitle")}
          path={id ? `/artifacts/${id}` : "/artifacts"}
          image="/images/Zero_home.png"
        />
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </>
    );

  if (!artifact)
    return (
      <>
        <SeoHead
          title={t("artifact.browse.heroTitle")}
          description={t("artifact.browse.heroSubtitle")}
          path="/artifacts"
          image="/images/Zero_home.png"
        />
        <Empty description={t('artifact.detail.messages.unknownArtifact')} />
      </>
    );

  // Image helpers
  const rawMainImage =
    resolveImage(artifact.mainImage) || resolveImage(artifact.image) || resolveImage(artifact.images);
  const mainImage = getImageUrl(rawMainImage, "https://via.placeholder.com/1200x600/1a1a1a/ffffff?text=No+Image");

  const galleryImages = Array.from(
    new Set([
      ...(artifact.mainImage ? (Array.isArray(artifact.mainImage) ? artifact.mainImage : [artifact.mainImage]) : []),
      ...(artifact.image ? (Array.isArray(artifact.image) ? artifact.image : [artifact.image]) : []),
      ...(artifact.images || []),
    ]),
  )
    .filter((img): img is string => !!img)
    .map((img) => getImageUrl(img));

  const authorName = artifact.authorName || artifact.author || artifact.creator || t('artifact.detail.meta.unknownAuthor');
  const artifactTypeLabel = artifact.artifactType
    ? t(`common.artifactTypes.${artifact.artifactType}`) || artifact.artifactType
    : t('artifact.detail.messages.unknownLocation');
  const conditionLabel = artifact.condition ? t(`common.artifactConditions.${artifact.condition.toLowerCase()}`) || artifact.condition : t('artifact.detail.messages.noInfo');
  const detailPath = id ? `/artifacts/${id}` : "/artifacts";
  const seoDescription = toMetaDescription(
    artifact.shortDescription || artifact.description || `${artifact.name} - thong tin hien vat van hoa`
  );

  // Prepare dictionary for SEO Linker - Filter out items with missing names
  const linkableItems = [
    ...relatedHeritage.filter(h => h && h.name).map(h => ({ id: h.id, name: h.name, type: 'heritage' as const })),
    ...relatedArtifacts.filter(a => a && a.name).map(a => ({ id: a.id, name: a.name, type: 'artifact' as const }))
  ];

  const enhancedDescription = injectContextualLinks(artifact.description || "", linkableItems, artifact.id);

  const artifactJsonLd = {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: artifact.name,
    description: seoDescription,
    url: buildAbsoluteUrl(detailPath),
    image: [mainImage],
    material: artifact.material,
    creator: {
      "@type": "Person",
      name: authorName,
    },
    author: {
      "@type": "Person",
      name: authorName,
    },
    dateCreated: artifact.yearCreated,
    contentLocation: {
      "@type": "Place",
      name: artifact.locationInSite || artifact.currentLocation || "",
    },
  };

  return (
    <div className="artifact-detail-page">
      <SeoHead
        title={artifact.name}
        description={seoDescription}
        path={detailPath}
        image={mainImage}
        preloadImage={env.SEO_PRELOAD_HERO ? mainImage : undefined}
        type="article"
        useBrandedOg={env.SEO_BRANDED_OG}
        keywords={["hien vat", "co vat", "lich su", artifact.name]}
        jsonLd={artifactJsonLd}
      />

      {/* 0. Nav Back */}
      <div className="nav-back-wrapper">
        <Button
          type="default"
          shape="circle"
          icon={<ArrowLeftOutlined />}
          size="large"
          onClick={() => navigate("/artifacts")}
          className="nav-back-btn"
        />
      </div>

      {/* 1. HERO SECTION */}
      <section className="detail-hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${mainImage}')` }} />
        <div className="hero-overlay">
          <div className="hero-content">
            <Tag color="var(--primary-color)" style={{ border: "none", marginBottom: 16 }}>
              {artifactTypeLabel.toUpperCase()}
            </Tag>
            <h1>{artifact.name}</h1>
            <div className="hero-meta">
              <span>
                <CalendarOutlined /> {artifact.yearCreated || t('artifact.detail.meta.unknownDate')}
              </span>
              <span>
                <UserOutlined /> {authorName}
              </span>
              <span>
                <HistoryOutlined /> {t('artifact.detail.meta.views', { count: artifact.views || 0 })}
              </span>
            </div>
          </div>

          {/* Gallery Button */}
          <div style={{ position: "absolute", bottom: 32, right: 32 }}>
            <Button
              icon={<CameraOutlined />}
              size="large"
              className="gallery-btn"
              onClick={() => setPreviewVisible(true)}
            >
              {t('artifact.detail.viewGallery', { count: galleryImages.length })}
            </Button>
          </div>

          {/* Hidden Preview Group */}
          <div style={{ display: "none" }}>
            <Image.PreviewGroup
              preview={{
                visible: previewVisible,
                onVisibleChange: (vis) => setPreviewVisible(vis),
              }}
            >
              {galleryImages.map((img, idx) => (
                <Image key={idx} src={img} />
              ))}
            </Image.PreviewGroup>
          </div>
        </div>
      </section>

      <div className="content-container">
        <Tabs
          defaultActiveKey="description"
          className="heritage-tabs"
          centered
          items={[
            {
              key: "description",
              label: t('artifact.detail.tabs.description'),
              children: (
                <div className="article-main-wrapper">
                  {/* Article Header Meta */}
                  <div
                    className="article-meta-header"
                    style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
                      <SpaceItem icon={<CalendarOutlined />} text={String(artifact.yearCreated || "N/A")} />
                      <SpaceItem icon={<UserOutlined />} text={authorName} />
                      <SpaceItem icon={<HistoryOutlined />} text={`${artifact.views || 0} views`} />
                    </div>
                    <div className="action-row" style={{ display: "flex", gap: 8 }}>
                      <Button
                        type="text"
                        icon={isFavorite ? <HeartFilled style={{ color: "#ff4d4f" }} /> : <HeartOutlined />}
                        onClick={handleToggleFavorite}
                      >
                        {isFavorite ? t('common.actions.favorited') : t('common.actions.favorite')}
                      </Button>
                      <Button type="text" icon={<ShareAltOutlined />} onClick={handleShare}>
                        {t('common.actions.share')}
                      </Button>
                      <Button type="text" icon={<FolderAddOutlined />} onClick={() => setShowCollectionModal(true)}>
                        {t('common.actions.saveToCollection')}
                      </Button>
                    </div>

                    <AddToCollectionModal
                      visible={showCollectionModal}
                      onCancel={() => setShowCollectionModal(false)}
                      item={{
                        id: artifact.id,
                        type: ITEM_TYPES.ARTIFACT,
                        name: artifact.name,
                      }}
                    />
                  </div>

                  <h2 className="article-main-title">{artifact.name}</h2>
                  <div className="article-body-content">
                    <h3 className="content-section-title">{t('artifact.detail.sections.details')}</h3>
                    <div dangerouslySetInnerHTML={{ __html: enhancedDescription || "" }} />

                    {artifact.historicalContext && (
                      <>
                        <h3 className="content-section-title">{t('artifact.detail.sections.history')}</h3>
                        <div dangerouslySetInnerHTML={{ __html: artifact.historicalContext }} />
                      </>
                    )}

                    {artifact.culturalSignificance && (
                      <>
                        <h3 className="content-section-title">{t('artifact.detail.sections.significance')}</h3>
                        <div dangerouslySetInnerHTML={{ __html: artifact.culturalSignificance }} />
                      </>
                    )}

                    {artifact.references && (
                      <div className="references-section">
                        <h3>{t('artifact.detail.sections.references')}</h3>
                        <div className="references-content" dangerouslySetInnerHTML={{ __html: artifact.references }} />
                      </div>
                    )}
                  </div>

                  <div className="article-footer-info">
                    <Divider />
                  </div>
                </div>
              ),
            },
            {
              key: "info",
              label: t('artifact.detail.tabs.info'),
              children: (
                <div className="article-main-wrapper">
                  <div className="info-tab-content" style={{ maxWidth: 900, margin: "0 auto" }}>
                    <div className="info-box-premium info-card-widget large-format">
                      <Row gutter={[48, 24]}>
                        <Col xs={24} md={12}>
                          <h3 className="info-section-title">{t('artifact.detail.sections.features')}</h3>
                          <ul className="info-grid-list">
                            <li>
                              <div className="icon-wrapper">
                                <InfoCircleOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.type')}</span>
                                <span className="value">{artifactTypeLabel || t('artifact.detail.messages.noInfo')}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <CalendarOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.period')}</span>
                                <span className="value">{artifact.yearCreated || t('artifact.detail.messages.noInfo')}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <GlobalOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.material')}</span>
                                <span className="value">{artifact.material || t('artifact.detail.messages.noInfo')}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <StarFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.condition')}</span>
                                <span className="value highlight">{conditionLabel || t('artifact.detail.messages.noInfo')}</span>
                              </div>
                            </li>
                          </ul>
                        </Col>
                        <Col xs={24} md={12}>
                          <h3 className="info-section-title">{t('artifact.detail.sections.values')}</h3>
                          <ul className="info-grid-list">
                            <li>
                              <div className="icon-wrapper">
                                <ExpandOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.dimensions')}</span>
                                <span className="value">{artifact.dimensions || t('artifact.detail.messages.noInfo')}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <UserOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.author')}</span>
                                <span className="value">{authorName || t('artifact.detail.messages.noInfo')}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper star-icon">
                                <StarFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.rating')}</span>
                                <span className="value">
                                  {artifact.rating ? `${artifact.rating}/5` : t('artifact.detail.messages.noReview')}{" "}
                                  <span className="sub">({artifact.totalReviews || 0} {t('common.details').toLowerCase()})</span>
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper unesco-icon">
                                <SafetyCertificateFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">{t('artifact.detail.labels.location')}</span>
                                <span className="value highlight-unesco">
                                  {artifact.locationInSite || artifact.currentLocation || t('artifact.detail.messages.noInfo')}
                                </span>
                              </div>
                            </li>
                          </ul>
                        </Col>
                      </Row>

                      {(artifact.weight || artifact.origin || artifact.acquisitionDate) && (
                        <>
                          <Divider dashed />
                          <Row gutter={[48, 24]}>
                            {artifact.weight && (
                              <Col xs={24} md={8}>
                                <div style={{ display: "flex", gap: 12 }}>
                                  <div
                                    style={{ fontWeight: 600, color: "#888", textTransform: "uppercase", fontSize: 11 }}
                                  >
                                    {t('artifact.detail.labels.weight')}
                                  </div>
                                  <div style={{ fontWeight: 500 }}>{artifact.weight}</div>
                                </div>
                              </Col>
                            )}
                            {artifact.origin && (
                              <Col xs={24} md={8}>
                                <div style={{ display: "flex", gap: 12 }}>
                                  <div
                                    style={{ fontWeight: 600, color: "#888", textTransform: "uppercase", fontSize: 11 }}
                                  >
                                    {t('artifact.detail.labels.origin')}
                                  </div>
                                  <div style={{ fontWeight: 500 }}>{artifact.origin}</div>
                                </div>
                              </Col>
                            )}
                            {artifact.acquisitionDate && (
                              <Col xs={24} md={8}>
                                <div style={{ display: "flex", gap: 12 }}>
                                  <div
                                    style={{ fontWeight: 600, color: "#888", textTransform: "uppercase", fontSize: 11 }}
                                  >
                                    {t('artifact.detail.labels.acquisitionDate')}
                                  </div>
                                  <div style={{ fontWeight: 500 }}>{artifact.acquisitionDate}</div>
                                </div>
                              </Col>
                            )}
                          </Row>
                        </>
                      )}

                      <Divider dashed />

                      <div className="info-footer-actions">
                        <div className="booking-note">
                          <span>
                            {t('artifact.detail.messages.displayLocation', { location: artifact.locationInSite || t('artifact.detail.messages.unknownLocation') })}
                          </span>
                          <span className="promo-text">{t('artifact.detail.messages.promoText')}</span>
                        </div>
                        <div className="action-buttons">
                          <Dropdown
                            trigger={['click']}
                            menu={{
                              items: [
                                {
                                  key: 'sen-map',
                                  label: 'Bản đồ SEN (Xem hiện vật & Tầm bảo)',
                                  icon: <RocketOutlined />,
                                  onClick: () => {
                                    // Artifacts might have locations, or inherit from heritage
                                    const lat = artifact.latitude;
                                    const lng = artifact.longitude;
                                    const site = relatedHeritage.find(h => h.id === artifact.heritageSiteId);

                                    const finalLat = lat || site?.latitude;
                                    const finalLng = lng || site?.longitude;

                                    navigate(`/map?id=${artifact.id}&type=${ITEM_TYPES.ARTIFACT}&lat=${finalLat}&lng=${finalLng}&action=hunt`);
                                  }
                                },
                                {
                                  key: 'heritage-link',
                                  label: 'Xem điểm di sản (Heritage Site)',
                                  icon: <EnvironmentOutlined />,
                                  onClick: () => {
                                    if (relatedHeritage && relatedHeritage.length > 0) {
                                      navigate(`/heritage-sites/${relatedHeritage[0].id}`);
                                    }
                                  }
                                },
                                {
                                  key: 'google-maps',
                                  label: 'Google Maps (Tên & Địa chỉ)',
                                  icon: <GoogleOutlined />,
                                  onClick: () => {
                                    const site = relatedHeritage.find(h => h.id === artifact.heritageSiteId);
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(artifact.name + " " + (site?.name || ""))}`, "_blank");
                                  }
                                },
                                {
                                  key: 'google-maps-coord',
                                  label: 'Google Maps (Tọa độ chính xác)',
                                  icon: <CompassOutlined />,
                                  onClick: () => {
                                    const lat = artifact.latitude;
                                    const lng = artifact.longitude;
                                    const site = relatedHeritage.find(h => h.id === artifact.heritageSiteId);

                                    const finalLat = lat || site?.latitude;
                                    const finalLng = lng || site?.longitude;
                                    window.open(`https://www.google.com/maps/search/?api=1&query=${finalLat},${finalLng}`, "_blank");
                                  }
                                }
                              ]
                            }}
                          >
                            <Button
                              size="large"
                              className="direction-btn"
                              icon={<EnvironmentOutlined />}
                            >
                              Chỉ đường <MoreOutlined />
                            </Button>
                          </Dropdown>
                          <Button
                            type="primary"
                            size="large"
                            className="booking-btn-large"
                            onClick={() => {
                              const site = relatedHeritage.find(h => h.id === artifact.heritageSiteId);
                              const bookingUrl = artifact.bookingLink || site?.bookingLink || site?.website || `https://www.google.com/search?q=đặt+vé+tham+quan+${encodeURIComponent(site?.name || artifact.name)}`;
                              window.open(bookingUrl, "_blank");
                            }}
                          >
                            {artifact.bookingLink ? t('artifact.detail.actions.viewArtifact') : t('artifact.detail.actions.bookNow')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "discovery",
              label: t('artifact.detail.tabs.discovery'),
              children: (
                <div className="article-main-wrapper">
                  {/* 1. Related Games */}
                  <div className="discovery-block">
                    <Title level={3}>
                      <RocketOutlined /> {t('artifact.detail.sections.interactive')}
                    </Title>
                    <p>{t('artifact.detail.discovery.subtitle')}</p>
                    {showGame && selectedLevelId ? (
                      <EmbeddedGameZone
                        levelId={selectedLevelId}
                        onClose={() => setShowGame(false)}
                        onNavigateToFullGame={() => navigate("/game/chapters")}
                      />
                    ) : (
                      <Row gutter={[24, 24]}>
                        {discoveryLevels && discoveryLevels.length > 0 ? (
                          discoveryLevels.map((level) => (
                            <Col xs={24} md={12} key={level.id}>
                              <div className="game-card-mini">
                                <div
                                  className="game-thumb"
                                  style={{
                                    backgroundImage: `url(${level.thumbnail || level.backgroundImage || level.image})`,
                                  }}
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
                                  {t('artifact.detail.discovery.playNow') || t('heritage.detail.playNow')}
                                </Button>
                              </div>
                            </Col>
                          ))
                        ) : (
                          <Col span={24}>
                            <div className="game-cta-banner">
                              <RocketOutlined className="cta-icon" />
                              <div className="cta-content">
                                <h4>{t('artifact.detail.messages.gameBanner.title')}</h4>
                                <p>{t('artifact.detail.messages.gameBanner.subtitle')}</p>
                              </div>
                              <Button
                                type="primary"
                                size="large"
                                shape="round"
                                icon={<ArrowRightOutlined />}
                                onClick={() => navigate("/game/chapters")}
                              >
                                {t('artifact.detail.discovery.viewProduct') || t('common.actions.explore')}
                              </Button>
                            </div>
                          </Col>
                        )}
                      </Row>
                    )}
                    <Divider />
                  </div>

                  {/* 2. Related Heritage */}
                  {(relatedHeritage.length > 0 || relatedHistory.length > 0) && (
                    <div className="discovery-block">
                      <Title level={3}>
                        <EnvironmentOutlined /> {t('artifact.detail.sections.related')}
                      </Title>
                      <Row gutter={[24, 24]}>
                        {relatedHeritage.map((item) => (
                          <Col xs={24} sm={12} md={8} key={`heri-${item.id}`}>
                            <ArticleCard data={item} type={ITEM_TYPES.HERITAGE} />
                          </Col>
                        ))}
                        {relatedHistory.map((item) => (
                          <Col xs={24} sm={12} md={8} key={`hist-${item.id}`}>
                            <ArticleCard data={item} type="history" />
                          </Col>
                        ))}
                      </Row>
                      <Divider />
                    </div>
                  )}

                  {/* 3. Products */}
                  <div className="discovery-block" style={{ marginBottom: 0 }}>
                    <Title level={3}>
                      <ShopOutlined /> {t('artifact.detail.sections.products')}
                    </Title>
                    <p>{t('artifact.detail.discovery.productSubtitle')}</p>
                    <Row gutter={[24, 24]} style={{ display: "flex" }}>
                      <Col xs={24} sm={12} md={6}>
                        <div className="product-card">
                          <div className="prod-img">
                            <img
                              src="https://images.unsplash.com/photo-1599525281489-0824b223c285?w=400"
                              alt="Product"
                            />
                          </div>
                          <h4>Mô hình thu nhỏ bảo vật cao cấp</h4>
                          <div className="price">350,000 đ</div>
                          <Button>Xem chi tiết</Button>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div className="product-card">
                          <div className="prod-img">
                            <img
                              src="https://images.unsplash.com/photo-1618354691373-d851c5c3a991?w=400"
                              alt="Product"
                            />
                          </div>
                          <h4>Móc khóa kỷ niệm di sản tinh xảo</h4>
                          <div className="price">45,000 đ</div>
                          <Button>Xem chi tiết</Button>
                        </div>
                      </Col>
                    </Row>
                  </div>
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
            type="artifact"
            referenceId={Number(id)}
            rating={artifact.rating}
            totalReviews={artifact.totalReviews}
            onSuccess={() => id && dispatch(fetchArtifactById(id))}
          />
        </div>
      </div>

      {/* RELATED ARTIFACTS (Bottom) */}
      <div className="related-bottom-section">
        <div className="content-container">
          <Divider />
          <Title level={3} className="section-title">
            {t('artifact.detail.sections.related')}
          </Title>
          <Row gutter={[24, 24]}>
            {relatedArtifacts.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <ArticleCard data={item} type={ITEM_TYPES.ARTIFACT} />
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
  <span className="meta-space-item">
    {icon} <span style={{ marginLeft: 6 }}>{text}</span>
  </span>
);

export default ArtifactDetailPage;
