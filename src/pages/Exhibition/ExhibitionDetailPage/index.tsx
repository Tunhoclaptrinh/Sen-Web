import React, { useEffect, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Row, Col, Typography, Empty, Button, Tag, Tabs, message } from "antd";
import { useTranslation } from "react-i18next";
import {
  ArrowLeftOutlined,
  CalendarOutlined,
  UserOutlined,
  PictureOutlined,
  TagOutlined,
  EyeOutlined,
  ShareAltOutlined,
  RocketOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import exhibitionService, { Exhibition } from "@/services/exhibition.service";
import artifactService from "@/services/artifact.service";
import type { Artifact } from "@/types";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import { useAuth } from "@/hooks/useAuth";
import ArticleCard from "@/components/common/cards/ArticleCard";
import AddToCollectionModal from "@/components/common/AddToCollectionModal";
import dayjs from "dayjs";
import { ITEM_TYPES } from "@/config/constants";
import ReviewSection from "@/components/common/Review/ReviewSection";
import { trackViewProduct } from "@/utils/analytics";
import "./styles.less";

const { Title } = Typography;

const ExhibitionDetailPage: React.FC = () => {
  const { t } = useTranslation();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const trackedProductIdRef = useRef<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      setLoading(true);
      try {
        // 1. Fetch Exhibition
        const res = await exhibitionService.getById(Number(id));
        if (res.success && res.data) {
          const data = res.data;

          // Security / Visibility Check
          const isAdmin = user?.role === "admin";
          const isOwner = user && data.createdBy === user.id;
          const isPublished = data.status === "published";
          const isActive = data.isActive;
          const now = dayjs();
          const inDateRange =
            data.startDate && data.endDate && now.isAfter(data.startDate) && now.isBefore(data.endDate);

          // Allow access if: Admin OR Owner OR (Published OR Active OR In Date Range)
          const canView = isAdmin || isOwner || isPublished || isActive || inDateRange;

          if (!canView) {
            message.error(t('exhibition.detail.messages.accessDenied'));
            if (user?.role === "researcher") {
              navigate("/researcher/exhibitions");
            } else {
              navigate("/exhibitions");
            }
            return;
          }
          setExhibition(data);

          // 2. Fetch Related Artifacts
          if (data.artifactIds && data.artifactIds.length > 0) {
            const artRes = await artifactService.getAll({ ids: data.artifactIds.join(",") });
            if (artRes.success && artRes.data) {
              setArtifacts(artRes.data); // Assuming getAll returns { data: [...] } or array
            }
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
    window.scrollTo(0, 0);
  }, [id, user, navigate, t]); // Added user dependency to re-run check if auth loads late

  useEffect(() => {
    if (!exhibition?.id) return;

    const normalizedId = String(exhibition.id);
    if (trackedProductIdRef.current === normalizedId) return;

    trackedProductIdRef.current = normalizedId;
    trackViewProduct({
      itemId: normalizedId,
      itemName: exhibition.name,
      itemType: "exhibition",
      sourceScreen: "ExhibitionDetailPage",
    });
  }, [exhibition?.id, exhibition?.name]);

  if (loading)
    return (
      <div className="exhibition-detail-page">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  if (!exhibition) return <Empty description={t('exhibition.detail.messages.notFound')} />;

  const rawImage = resolveImage(exhibition.image);
  const heroImage = getImageUrl(rawImage, "/images/Zero_home.png"); // Fallback to generic if empty

  return (
    <div className="exhibition-detail-page">
      {/* 0. Nav Back */}
      <div className="nav-back-wrapper">
        <Button
          type="default"
          shape="circle"
          icon={<ArrowLeftOutlined />}
          size="large"
          onClick={() => navigate("/exhibitions")}
          className="nav-back-btn"
        />
      </div>

      {/* HERO SECTION */}
      <section className="detail-hero">
        <div className="hero-bg" style={{ backgroundImage: `url('${heroImage}')` }} />
        <div className="hero-overlay">
          <div className="hero-content">
            <Tag
              color="var(--primary-color)"
              style={{ border: "none", marginBottom: 16, fontSize: 14, padding: "4px 12px" }}
            >
              VIRTUAL EXHIBITION
            </Tag>
            <h1>{exhibition.name}</h1>
            <div className="hero-meta">
              <span>
                <CalendarOutlined />{" "}
                {exhibition.isPermanent
                  ? t('exhibition.detail.hero.permanent')
                  : `${dayjs(exhibition.startDate).format("DD/MM/YYYY")} - ${dayjs(exhibition.endDate).format("DD/MM/YYYY")}`}
              </span>
              <span>
                <UserOutlined /> {exhibition.curator || t('exhibition.detail.sidebar.organizer.default')}
              </span>
              <span>
                <EyeOutlined /> {t('exhibition.detail.hero.visitors', { count: exhibition.visitorCount || 0 })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* CONTENT CONTAINER */}
      <div className="content-container">
        <Row gutter={[48, 24]}>
          <Col xs={24} lg={16}>
            <Tabs
              defaultActiveKey="desc"
              className="exhibition-tabs"
              items={[
                {
                  key: "desc",
                  label: t('exhibition.detail.tabs.introduction'),
                  children: (
                    <div className="article-main-wrapper">
                      <h2 className="article-main-title">{exhibition.name}</h2>
                      <div
                        className="article-body-content"
                        dangerouslySetInnerHTML={{
                          __html: exhibition.description || `<p>${t('exhibition.detail.content.noDescription')}</p>`,
                        }}
                      />

                      {/* Gallery Preview Block (Mock) */}
                      <div className="discovery-block" style={{ marginTop: 40, marginBottom: 0 }}>
                        <div className="virtual-tour-card">
                          <h2>{t('exhibition.detail.content.virtualTour.title')}</h2>
                          <p>{t('exhibition.detail.content.virtualTour.subtitle')}</p>
                          <Button size="large" icon={<RocketOutlined />} disabled>
                            {t('exhibition.detail.content.virtualTour.button')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "artifacts",
                  label: t('exhibition.detail.tabs.artifacts', { count: artifacts.length }),
                  children: (
                    <div className="article-main-wrapper">
                      <Title level={3} style={{ fontFamily: "Aleo, serif", marginBottom: 24, fontWeight: 700 }}>
                        {t('exhibition.detail.content.artifactsTitle')}
                      </Title>
                      {artifacts.length > 0 ? (
                        <Row gutter={[24, 24]}>
                          {artifacts.map((art) => (
                            <Col xs={24} sm={12} key={art.id}>
                              <ArticleCard data={art} type={ITEM_TYPES.ARTIFACT} />
                            </Col>
                          ))}
                        </Row>
                      ) : (
                        <Empty description={t('exhibition.detail.content.noArtifacts')} />
                      )}
                    </div>
                  ),
                },
              ]}
            />
          </Col>

          <Col xs={24} lg={8}>
            <div className="sidebar-wrapper">
              {/* Info Widget */}
              <div className="info-card-widget">
                <h3 className="info-section-title">{t('exhibition.detail.sidebar.title')}</h3>
                <ul className="info-grid-list">
                  <li>
                    <div className="icon-wrapper">
                      <CalendarOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">{t('exhibition.detail.sidebar.time.label')}</span>
                      <span className="value">
                        {exhibition.isPermanent
                          ? t('exhibition.detail.sidebar.time.permanent')
                          : t('exhibition.detail.sidebar.time.temporary')}
                      </span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <TagOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">{t('exhibition.detail.sidebar.theme.label')}</span>
                      <span className="value">{exhibition.theme || t('exhibition.detail.sidebar.theme.default')}</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <UserOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">{t('exhibition.detail.sidebar.organizer.label')}</span>
                      <span className="value">{exhibition.curator || t('exhibition.detail.sidebar.organizer.default')}</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <PictureOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">{t('exhibition.detail.sidebar.artifactCount.label')}</span>
                      <span className="value">{t('exhibition.detail.sidebar.artifactCount.value', { count: artifacts.length })}</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Actions Widget */}
              <div className="action-button-group">
                <Button type="primary" size="large" className="primary-action-btn" icon={<ShareAltOutlined />}>
                  {t('exhibition.detail.actions.share')}
                </Button>
                <Button
                  size="large"
                  className="secondary-action-btn"
                  icon={<FolderAddOutlined />}
                  onClick={() => setShowCollectionModal(true)}
                  style={{ marginTop: 12, width: "100%" }}
                >
                  {t('exhibition.detail.actions.saveToCollection')}
                </Button>
                <Button
                  size="large"
                  className="secondary-action-btn"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/exhibitions")}
                >
                  {t('exhibition.detail.navigation.back')}
                </Button>
              </div>
            </div>
          </Col>
        </Row>
      </div>

      <AddToCollectionModal
        visible={showCollectionModal}
        onCancel={() => setShowCollectionModal(false)}
        item={{
          id: exhibition.id,
          type: "exhibition",
          name: exhibition.name,
        }}
      />

      {/* REVIEWS SECTION */}
      <div className="reviews-bottom-section">
        <div className="content-container">
          <ReviewSection
            type="exhibition"
            referenceId={Number(id)}
            rating={exhibition.rating}
            totalReviews={exhibition.totalReviews}
            onSuccess={() =>
              id && exhibitionService.getById(Number(id)).then((res) => res.data && setExhibition(res.data))
            }
          />
        </div>
      </div>
    </div>
  );
};

export default ExhibitionDetailPage;
