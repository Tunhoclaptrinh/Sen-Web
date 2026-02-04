import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Spin,
  message,
  Row,
  Col,
  Typography,
  Empty,
  Button,
  Divider,
  Tag,
  Tabs,
  Timeline,
} from "antd";
import {
  EnvironmentOutlined,
  HeartOutlined,
  HeartFilled,
  CalendarOutlined,
  StarFilled,
  UserOutlined,
  CommentOutlined,
  ShareAltOutlined,
  ClockCircleOutlined,
  DollarOutlined,
  BankOutlined,
  GlobalOutlined,
  SafetyCertificateFilled,
  CameraOutlined,
  RocketOutlined,
  ShopOutlined,
  ReadOutlined,
  HistoryOutlined,
  FolderAddOutlined,
} from "@ant-design/icons";
import { Image } from "antd";
import dayjs from "dayjs";
import { fetchHeritageSiteById } from "@store/slices/heritageSlice";
import favoriteService from "@/services/favorite.service";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import historyService from "@/services/history.service";
import { RootState, AppDispatch } from "@/store";
import ArticleCard from "@/components/common/cards/ArticleCard";
import type { HeritageSite, TimelineEvent, Artifact, HistoryArticle } from "@/types";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import AddToCollectionModal from "@/components/common/AddToCollectionModal";
import { useViewTracker } from "@/hooks/useViewTracker";
import "./styles.less";

const { Title } = Typography;

const HeritageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentItem: site,
    loading,
    error,
  } = useSelector((state: RootState) => state.heritage);
  const { isAuthenticated } = useSelector((state: RootState) => state.auth); // Get auth state
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedSites, setRelatedSites] = useState<HeritageSite[]>([]);
  const [siteArtifacts, setSiteArtifacts] = useState<Artifact[]>([]);
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>([]);
  const [relatedHistoryArr, setRelatedHistoryArr] = useState<HistoryArticle[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

  // Track view
  useViewTracker('heritage', id);

  useEffect(() => {
    if (id) {
      dispatch(fetchHeritageSiteById(id));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (site && site.id) {
      fetchRelatedData(site);
      if (isAuthenticated) {
        checkFavoriteStatus(site.id);
      }
    }
  }, [site, isAuthenticated]);

  const checkFavoriteStatus = async (siteId: number) => {
    try {
      const res = await favoriteService.check("heritageSite", siteId);
      if (res.success && res.data) {
        setIsFavorite(res.data.isFavorited);
      }
    } catch (error) {
      console.error("Failed to check favorite status", error);
    }
  };

  const fetchRelatedData = async (currentItem: HeritageSite) => {
    try {
      const currentId = currentItem.id.toString();

      // 1. Fetch nearby/related sites
      const resRelated = await heritageService.getAll({ limit: 4 });
      if (resRelated.data) {
        setRelatedSites(
          resRelated.data.filter((s) => s.id !== Number(currentId)).slice(0, 3),
        );
      }

      // 2. Fetch artifacts (from backlink AND relatedArtifactIds)
      const resBackArtifacts = await heritageService.getArtifacts(currentId);
      const relArtIds = currentItem.relatedArtifactIds || [];

      const allArtifacts = resBackArtifacts.data || [];
      if (relArtIds.length > 0) {
        const resRelArt = await artifactService.getAll({
          ids: relArtIds.join(","),
        });
        if (resRelArt.data) {
          const existingIds = new Set(allArtifacts.map((a) => a.id));
          resRelArt.data.forEach((a) => {
            if (!existingIds.has(a.id)) allArtifacts.push(a);
          });
        }
      }
      setSiteArtifacts(allArtifacts);

      // 3. Fetch History (from related_history_ids)
      const relHistIds = currentItem.relatedHistoryIds || [];
      if (relHistIds.length > 0) {
        const resHist = await historyService.getAll({
          ids: relHistIds.join(","),
        });
        if (resHist.data) setRelatedHistoryArr(resHist.data);
      }

      // 4. Fetch Timeline
      const resTimeline = await heritageService.getTimeline(currentId);
      if (resTimeline.success && resTimeline.data)
        setTimelineEvents(resTimeline.data);
    } catch (e) {
      console.error("Failed to fetch related data", e);
    }
  };

  useEffect(() => {
    if (error) {
      message.error(error);
      navigate("/heritage-sites");
    }
  }, [error, navigate]);

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
        message.warning("Vui lòng đăng nhập để sử dụng tính năng này");
        return;
    }
    if (!id) return;
    try {
      if (isFavorite) {
        await favoriteService.remove("heritageSite", Number(id));
        setIsFavorite(false);
        message.success("Đã xóa khỏi yêu thích");
      } else {
        await favoriteService.add("heritageSite", Number(id));
        setIsFavorite(true);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
        message.success("Đã sao chép liên kết vào bộ nhớ tạm!");
    }).catch(() => {
        message.error("Không thể sao chép liên kết");
    });
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  if (!site) return <Empty description="Không tìm thấy di sản" />;


  const relatedHistory =
    relatedHistoryArr.length > 0
      ? relatedHistoryArr
      : site.relatedHistory || [];



  // Use helper to resolve main image
  const rawImage =
    resolveImage(site.mainImage) ||
    resolveImage(site.image) ||
    resolveImage(site.images);
  const mainImage = getImageUrl(
    rawImage,
    "https://images.unsplash.com/photo-1599525281489-0824b223c285?w=1200",
  );
  const publishDate =
    site.publishDate || site.createdAt || new Date().toISOString();
  const authorName = site.authorName || site.author || "Hệ thống";

  return (
    <div className="heritage-blog-page">
      {/* 1. RESTORED HERO SECTION */}
      <section className="detail-hero">
        <div
          className="hero-bg"
          style={{ backgroundImage: `url('${mainImage}')` }}
        />
        <div className="hero-overlay">
          <div className="hero-content">
            <Tag
              color="var(--primary-color)"
              style={{ border: "none", marginBottom: 16 }}
            >
              {site.type?.toUpperCase().replace("_", " ") || "HERITAGE"}
            </Tag>
            <h1>{site.name}</h1>
            <div className="hero-meta">
              <span>
                <EnvironmentOutlined /> {site.address || site.region}
              </span>
              {site.unescoListed && (
                <span className="unesco-badge">
                  <StarFilled style={{ color: "#FFD700" }} /> UNESCO World
                  Heritage
                </span>
              )}
              <span>
                <HistoryOutlined /> {site.views || 0} lượt xem
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
              Xem toàn bộ ảnh
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
              {Array.from(
                new Set([
                  ...(site.mainImage ? [resolveImage(site.mainImage)] : []),
                  ...(site.image ? [resolveImage(site.image)] : []),
                  ...(site.gallery || []),
                  ...(site.images || []),
                ]),
              )
                .filter((item): item is string => !!item)
                .map((img, idx) => {
                  const src = getImageUrl(img);
                  return <Image key={idx} src={src} />;
                })}
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
              label: "Mô tả",
              children: (
                <div className="article-main-wrapper">
                  {/* Article Header Meta */}
                  <div className="article-meta-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                      <SpaceItem
                        icon={<CalendarOutlined />}
                        text={dayjs(publishDate).format("MMM D, YYYY")}
                      />
                      <SpaceItem icon={<UserOutlined />} text={authorName} />
                      <SpaceItem
                        icon={<CommentOutlined />}
                        text={`${site.commentCount || 0} comments`}
                      />
                      <SpaceItem
                        icon={<HistoryOutlined />}
                        text={`${site.views || 0} views`}
                      />
                    </div>
                    <div className="action-row" style={{ display: 'flex', gap: 8 }}>
                       <Button
                        type="text"
                        icon={
                          isFavorite ? (
                            <HeartFilled style={{ color: "#ff4d4f" }} />
                          ) : (
                            <HeartOutlined />
                          )
                        }
                        onClick={handleToggleFavorite}
                      >
                        {isFavorite ? "Đã thích" : "Yêu thích"}
                      </Button>
                      <Button
                        type="text"
                        icon={<ShareAltOutlined />}
                        onClick={handleShare}
                      >
                        Chia sẻ
                      </Button>
                      <Button
                        type="text"
                        icon={<FolderAddOutlined />}
                        onClick={() => setShowCollectionModal(true)}
                      >
                        Lưu vào BST
                      </Button>
                    </div>

                    <AddToCollectionModal
                        visible={showCollectionModal}
                        onCancel={() => setShowCollectionModal(false)}
                        item={{
                            id: site.id,
                            type: 'heritage',
                            name: site.name
                        }}
                    />
                  </div>

                  {/* Main Title */}
                  <h2 className="article-main-title">{site.name}</h2>
                  <div
                    className="article-body-content"
                    dangerouslySetInnerHTML={{ __html: site.description || "" }}
                  />

                  {site.references && (
                    <div className="references-section">
                        <h3>Nguồn tham khảo</h3>
                        <div className="references-content" dangerouslySetInnerHTML={{ __html: site.references }} />
                    </div>
                  )}

                  {/* Footer Stats/Divider only - Actions removed */}
                   <div className="article-footer-info">
                    <Divider />
                  </div>
                </div>
              ),
            },
            {
              key: "info",
              label: "Thông tin",
              children: (
                <div className="article-main-wrapper">
                  <div
                    className="info-tab-content"
                    style={{ maxWidth: 900, margin: "0 auto" }}
                  >
                    <div className="info-card-widget large-format">
                      <Row gutter={[48, 24]}>
                        <Col xs={24} md={12}>
                          <h3 className="info-section-title">
                            Chi tiết Tham quan
                          </h3>
                          <ul className="info-grid-list">
                            <li>
                              <div className="icon-wrapper">
                                <ClockCircleOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Giờ mở cửa</span>
                                <span className="value">
                                  {site.visitHours || "8:00 - 17:00"}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <DollarOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Giá vé tham quan</span>
                                <span className="value highlight">
                                  {site.entranceFee
                                    ? `${site.entranceFee.toLocaleString()} VNĐ`
                                    : "Miễn phí"}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <CalendarOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Năm thành lập</span>
                                <span className="value">
                                  {site.yearEstablished || "Không rõ"}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <BankOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">
                                  Niên đại / Thời kỳ
                                </span>
                                <span className="value">
                                  {site.culturalPeriod || "Đang cập nhật"}
                                </span>
                              </div>
                            </li>
                          </ul>
                        </Col>
                        <Col xs={24} md={12}>
                          <h3 className="info-section-title">
                            Địa Điểm & Xếp Hạng
                          </h3>
                          <ul className="info-grid-list">
                            <li>
                              <div className="icon-wrapper">
                                <EnvironmentOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Địa chỉ</span>
                                <span className="value">
                                  {site.address || site.region}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper star-icon">
                                <StarFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">Đánh giá du khách</span>
                                <span className="value">
                                  {site.rating || 0}/5{" "}
                                  <span className="sub">
                                    ({site.totalReviews || 0} đánh giá)
                                  </span>
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <GlobalOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Vùng miền</span>
                                <span className="value">{site.region}</span>
                              </div>
                            </li>
                            {site.unescoListed && (
                              <li>
                                <div className="icon-wrapper unesco-icon">
                                  <SafetyCertificateFilled />
                                </div>
                                <div className="info-text">
                                  <span className="label">Danh hiệu</span>
                                  <span className="value highlight-unesco">
                                    Di sản văn hóa UNESCO
                                  </span>
                                </div>
                              </li>
                            )}
                          </ul>
                        </Col>
                      </Row>

                      <Divider dashed />

                      <div className="info-footer-actions">
                        <div className="booking-note">
                          <span>
                            * Vé có thể được mua trực tiếp tại quầy hoặc đặt
                            trước online để tránh xếp hàng.
                          </span>
                          <span className="promo-text">
                            Đặt vé với SEN để nhận ưu đãi đặc biệt!
                          </span>
                        </div>
                        <div className="action-buttons">
                          <Button
                            size="large"
                            className="direction-btn"
                            icon={<EnvironmentOutlined />}
                          >
                            Chỉ đường
                          </Button>
                          <Button
                            type="primary"
                            size="large"
                            className="booking-btn-large"
                          >
                            Đặt vé ngay
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
              label: "Khám phá",
              children: (
                <div className="article-main-wrapper">
                  {/* 1. Related Games / Interactive (Mock UI) */}
                  <div className="discovery-block" style={{ marginBottom: 48 }}>
                    <Title level={3}>
                      <RocketOutlined /> Trải nghiệm Di sản
                    </Title>
                    <p style={{ marginBottom: 24 }}>
                      Tham gia các màn chơi tương tác để hiểu rõ hơn về di sản
                      này.
                    </p>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} md={12}>
                        <div
                          className="game-card-mini"
                          style={{
                            border: "1px solid #eee",
                            borderRadius: 12,
                            padding: 16,
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="game-thumb"
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 8,
                              background: "#eee",
                              backgroundImage: `url(https://images.unsplash.com/photo-1599525281489-0824b223c285?w=200)`,
                              backgroundSize: "cover",
                            }}
                          />
                          <div className="game-info" style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: 16 }}>
                              Khám phá Hoàng Thành
                            </h4>
                            <div style={{ color: "#888", fontSize: 13 }}>
                              Giải mã các bí mật khảo cổ dưới lòng đất Thăng
                              Long.
                            </div>
                          </div>
                          <Button
                            type="primary"
                            shape="round"
                            icon={<RocketOutlined />}
                          >
                            Chơi ngay
                          </Button>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div
                          className="game-card-mini"
                          style={{
                            border: "1px solid #eee",
                            borderRadius: 12,
                            padding: 16,
                            display: "flex",
                            gap: 16,
                            alignItems: "center",
                          }}
                        >
                          <div
                            className="game-thumb"
                            style={{
                              width: 80,
                              height: 80,
                              borderRadius: 8,
                              background: "#eee",
                              backgroundImage: `url(https://images.unsplash.com/photo-1555921015-5532091f6026?w=200)`,
                              backgroundSize: "cover",
                            }}
                          />
                          <div className="game-info" style={{ flex: 1 }}>
                            <h4 style={{ margin: 0, fontSize: 16 }}>
                              Bảo vệ Thăng Long
                            </h4>
                            <div style={{ color: "#888", fontSize: 13 }}>
                              Tham gia chiến dịch bảo vệ kinh thành.
                            </div>
                          </div>
                          <Button
                            type="primary"
                            shape="round"
                            icon={<RocketOutlined />}
                          >
                            Chơi ngay
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    <Divider />
                  </div>

                  {/* 2. Related Artifacts (Distinct Section) */}
                  {siteArtifacts.length > 0 && (
                    <div
                      className="discovery-block"
                      style={{ marginBottom: 48 }}
                    >
                      <Title level={3}>
                        <ReadOutlined /> Hiện vật Tiêu biểu
                      </Title>
                      <p style={{ marginBottom: 24 }}>
                        Những bảo vật quý giá gắn liền với di tích này.
                      </p>
                      <Row gutter={[16, 16]}>
                        {siteArtifacts.map((artifact: Artifact) => (
                          <Col xs={24} sm={12} md={8} key={`a-${artifact.id}`}>
                            <ArticleCard data={artifact} type="artifact" />
                          </Col>
                        ))}
                      </Row>
                      <Divider />
                    </div>
                  )}

                  {/* 3. Related History (Distinct Section) */}
                  {relatedHistory.length > 0 && (
                    <div
                      className="discovery-block"
                      style={{ marginBottom: 48 }}
                    >
                      <Title level={3}>
                        <HistoryOutlined /> Câu chuyện Lịch sử
                      </Title>
                      <p style={{ marginBottom: 24 }}>
                        Các sự kiện và câu chuyện lịch sử liên quan.
                      </p>
                      <Row gutter={[16, 16]}>
                        {relatedHistory.map((item: HistoryArticle) => (
                          <Col xs={24} sm={12} md={8} key={`h-${item.id}`}>
                            <ArticleCard data={item} type="history" />
                          </Col>
                        ))}
                      </Row>
                      <Divider />
                    </div>
                  )}

                  {/* 4. Related Products (Mock UI) */}
                  <div className="discovery-block">
                    <Title level={3}>
                      <ShopOutlined /> Sản phẩm Văn hóa
                    </Title>
                    <Row gutter={[16, 16]}>
                      <Col xs={24} sm={12} md={6}>
                        <div
                          className="product-card"
                          style={{ textAlign: "center" }}
                        >
                          <div
                            className="prod-img"
                            style={{
                              height: 200,
                              marginBottom: 16,
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src="https://images.unsplash.com/photo-1599525281489-0824b223c285?w=400"
                              alt="Mô hình"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <h4 style={{ marginBottom: 8 }}>
                            Mô hình Hoàng Thành
                          </h4>
                          <div
                            style={{
                              color: "#d4380d",
                              fontWeight: "bold",
                              marginBottom: 12,
                            }}
                          >
                            450,000 đ
                          </div>
                          <Button block>Xem chi tiết</Button>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div
                          className="product-card"
                          style={{ textAlign: "center" }}
                        >
                          <div
                            className="prod-img"
                            style={{
                              height: 200,
                              marginBottom: 16,
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src="https://salt.tikicdn.com/cache/w1200/ts/product/23/67/68/73919242d992953284346028887e3871.jpg"
                              alt="Sách"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <h4 style={{ marginBottom: 8 }}>
                            Sách: Lịch sử Thăng Long
                          </h4>
                          <div
                            style={{
                              color: "#d4380d",
                              fontWeight: "bold",
                              marginBottom: 12,
                            }}
                          >
                            220,000 đ
                          </div>
                          <Button block>Xem chi tiết</Button>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div
                          className="product-card"
                          style={{ textAlign: "center" }}
                        >
                          <div
                            className="prod-img"
                            style={{
                              height: 200,
                              marginBottom: 16,
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src="https://images.unsplash.com/photo-1555921015-5532091f6026?w=400"
                              alt="Tranh"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <h4 style={{ marginBottom: 8 }}>
                            Tranh in Điện Kính Thiên
                          </h4>
                          <div
                            style={{
                              color: "#d4380d",
                              fontWeight: "bold",
                              marginBottom: 12,
                            }}
                          >
                            180,000 đ
                          </div>
                          <Button block>Xem chi tiết</Button>
                        </div>
                      </Col>
                      <Col xs={24} sm={12} md={6}>
                        <div
                          className="product-card"
                          style={{ textAlign: "center" }}
                        >
                          <div
                            className="prod-img"
                            style={{
                              height: 200,
                              marginBottom: 16,
                              borderRadius: 8,
                              overflow: "hidden",
                            }}
                          >
                            <img
                              src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
                              alt="Móc khóa"
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                            />
                          </div>
                          <h4 style={{ marginBottom: 8 }}>Móc khóa Rồng đá</h4>
                          <div
                            style={{
                              color: "#d4380d",
                              fontWeight: "bold",
                              marginBottom: 12,
                            }}
                          >
                            45,000 đ
                          </div>
                          <Button block>Xem chi tiết</Button>
                        </div>
                      </Col>
                    </Row>
                  </div>

                  {/* Empty State */}

                </div>
              ),
            },
            {
              key: "timeline",
              label: "Dòng thời gian",
              children: (
                <div className="article-main-wrapper">
                  <Title
                    level={3}
                    style={{ fontFamily: "Aleo, serif", marginBottom: 24 }}
                  >
                    Sự Kiện Lịch Sử
                  </Title>
                  {timelineEvents.length > 0 ? (
                    <Timeline mode="alternate">
                      {timelineEvents.map((event) => (
                        <Timeline.Item key={event.id} label={event.year}>
                          <strong style={{ fontSize: 16 }}>
                            {event.title}
                          </strong>
                          <p style={{ color: "#666" }}>{event.description}</p>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  ) : (
                    <Empty description="Chưa có dữ liệu dòng thời gian" />
                  )}
                </div>
              ),
            },
          ]}
        />
      </div>

      {/* RELATED SECTION (Bottom) */}
      <div className="related-bottom-section">
        <div className="content-container">
          <Divider />
          <Title level={3} className="section-title">
            Có thể bạn quan tâm
          </Title>
          <Row gutter={[24, 24]}>
            {relatedSites.map((item) => (
              <Col xs={24} sm={12} md={8} key={item.id}>
                <ArticleCard data={item} type="heritage" />
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

export default HeritageDetailPage;
