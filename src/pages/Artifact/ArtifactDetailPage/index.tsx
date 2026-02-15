import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {useDispatch, useSelector} from "react-redux";
import {Spin, message, Row, Col, Typography, Empty, Button, Divider, Tag, Tabs} from "antd";
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
} from "@ant-design/icons";
import {Image} from "antd";
import {fetchArtifactById} from "@store/slices/artifactSlice";
import favoriteService from "@/services/favorite.service";
import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import {RootState, AppDispatch} from "@/store";
import ArticleCard from "@/components/common/cards/ArticleCard";
import type {Artifact, HeritageSite, HistoryArticle} from "@/types";
import {ArtifactTypeLabels, ArtifactConditionLabels} from "@/types/artifact.types";
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import AddToCollectionModal from "@/components/common/AddToCollectionModal";
import {useViewTracker} from "@/hooks/useViewTracker";
import {ITEM_TYPES} from "@/config/constants";
import ReviewSection from "@/components/common/Review/ReviewSection";
import "./styles.less";

const {Title} = Typography;

const ArtifactDetailPage = () => {
  const {id} = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {currentItem: artifact, loading, error} = useSelector((state: RootState) => state.artifact);
  const {isAuthenticated} = useSelector((state: RootState) => state.auth);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedArtifacts, setRelatedArtifacts] = useState<Artifact[]>([]);
  const [relatedHeritage, setRelatedHeritage] = useState<HeritageSite[]>([]);
  const [relatedHistory, setRelatedHistory] = useState<HistoryArticle[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

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

      // 1. Fetch related artifacts (same heritage site or random)
      if (currentItem.heritageSiteId) {
        const res = await artifactService.getAll({
          heritageSiteId: currentItem.heritageSiteId,
          limit: 4,
        });
        if (res.data) {
          setRelatedArtifacts(res.data.filter((a) => a.id !== currentId).slice(0, 3));
        }
      } else {
        const res = await artifactService.getAll({limit: 4});
        if (res.data) {
          setRelatedArtifacts(res.data.filter((a) => a.id !== currentId).slice(0, 3));
        }
      }

      // 2. Fetch related heritage
      const relHeriIds = currentItem.relatedHeritageIds || [];
      if (relHeriIds.length > 0) {
        const res = await heritageService.getAll({ids: relHeriIds.join(",")});
        if (res.data) setRelatedHeritage(res.data);
      } else if (currentItem.heritageSiteId) {
        // Fallback to the parent heritage site
        const res = await heritageService.getById(currentItem.heritageSiteId);
        if (res.data) setRelatedHeritage([res.data]);
      }

      // 3. Fetch related history
      const relHistIds = currentItem.relatedHistoryIds || [];
      if (relHistIds.length > 0) {
        const res = await historyService.getAll({ids: relHistIds.join(",")});
        if (res.data) setRelatedHistory(res.data);
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

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      message.warning("Vui lòng đăng nhập để sử dụng tính năng này");
      return;
    }
    try {
      if (isFavorite) {
        setIsFavorite(false);
        message.success("Đã xóa khỏi yêu thích");
      } else {
        await favoriteService.add(ITEM_TYPES.ARTIFACT, Number(id));
        setIsFavorite(true);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        message.success("Đã sao chép liên kết vào bộ nhớ tạm!");
      })
      .catch(() => {
        message.error("Không thể sao chép liên kết");
      });
  };

  if (loading)
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );

  if (!artifact) return <Empty description="Không tìm thấy hiện vật" />;

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

  const authorName = artifact.authorName || artifact.author || artifact.creator || "Không rõ";
  const artifactTypeLabel = artifact.artifactType
    ? ArtifactTypeLabels[artifact.artifactType] || artifact.artifactType
    : "Hiện vật";
  const conditionLabel = artifact.condition ? ArtifactConditionLabels[artifact.condition] || artifact.condition : "Tốt";

  return (
    <div className="artifact-detail-page">
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
        <div className="hero-bg" style={{backgroundImage: `url('${mainImage}')`}} />
        <div className="hero-overlay">
          <div className="hero-content">
            <Tag color="var(--primary-color)" style={{border: "none", marginBottom: 16}}>
              {artifactTypeLabel.toUpperCase()}
            </Tag>
            <h1>{artifact.name}</h1>
            <div className="hero-meta">
              <span>
                <CalendarOutlined /> {artifact.yearCreated || "Không rõ niên đại"}
              </span>
              <span>
                <UserOutlined /> {authorName}
              </span>
              <span>
                <HistoryOutlined /> {artifact.views || 0} lượt xem
              </span>
            </div>
          </div>

          {/* Gallery Button */}
          <div style={{position: "absolute", bottom: 32, right: 32}}>
            <Button
              icon={<CameraOutlined />}
              size="large"
              className="gallery-btn"
              onClick={() => setPreviewVisible(true)}
            >
              Xem toàn bộ ảnh ({galleryImages.length})
            </Button>
          </div>

          {/* Hidden Preview Group */}
          <div style={{display: "none"}}>
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
              label: "Mô tả",
              children: (
                <div className="article-main-wrapper">
                  {/* Article Header Meta */}
                  <div
                    className="article-meta-header"
                    style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}
                  >
                    <div style={{display: "flex", alignItems: "center", gap: 24}}>
                      <SpaceItem icon={<CalendarOutlined />} text={String(artifact.yearCreated || "N/A")} />
                      <SpaceItem icon={<UserOutlined />} text={authorName} />
                      <SpaceItem icon={<HistoryOutlined />} text={`${artifact.views || 0} views`} />
                    </div>
                    <div className="action-row" style={{display: "flex", gap: 8}}>
                      <Button
                        type="text"
                        icon={isFavorite ? <HeartFilled style={{color: "#ff4d4f"}} /> : <HeartOutlined />}
                        onClick={handleToggleFavorite}
                      >
                        {isFavorite ? "Đã thích" : "Yêu thích"}
                      </Button>
                      <Button type="text" icon={<ShareAltOutlined />} onClick={handleShare}>
                        Chia sẻ
                      </Button>
                      <Button type="text" icon={<FolderAddOutlined />} onClick={() => setShowCollectionModal(true)}>
                        Lưu vào BST
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
                    <h3 className="content-section-title">Thông tin chi tiết</h3>
                    <div dangerouslySetInnerHTML={{__html: artifact.description || ""}} />

                    {artifact.historicalContext && (
                      <>
                        <h3 className="content-section-title">Ngữ cảnh Lịch sử</h3>
                        <div dangerouslySetInnerHTML={{__html: artifact.historicalContext}} />
                      </>
                    )}

                    {artifact.culturalSignificance && (
                      <>
                        <h3 className="content-section-title">Ý nghĩa Văn hóa</h3>
                        <div dangerouslySetInnerHTML={{__html: artifact.culturalSignificance}} />
                      </>
                    )}

                    {artifact.references && (
                      <div className="references-section">
                        <h3>Nguồn tham khảo</h3>
                        <div className="references-content" dangerouslySetInnerHTML={{__html: artifact.references}} />
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
              label: "Thông tin",
              children: (
                <div className="article-main-wrapper">
                  <div className="info-tab-content" style={{maxWidth: 900, margin: "0 auto"}}>
                    <div className="info-box-premium info-card-widget large-format">
                      <Row gutter={[48, 24]}>
                        <Col xs={24} md={12}>
                          <h3 className="info-section-title">Đặc Điểm Hiện Vật</h3>
                          <ul className="info-grid-list">
                            <li>
                              <div className="icon-wrapper">
                                <InfoCircleOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Loại hiện vật</span>
                                <span className="value">{artifactTypeLabel}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <CalendarOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Thời kỳ / Năm</span>
                                <span className="value">{artifact.yearCreated || "Không rõ"}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <GlobalOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Chất liệu</span>
                                <span className="value">{artifact.material || "Không rõ"}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <StarFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">Tình trạng</span>
                                <span className="value highlight">{conditionLabel}</span>
                              </div>
                            </li>
                          </ul>
                        </Col>
                        <Col xs={24} md={12}>
                          <h3 className="info-section-title">Chi tiết & Giá trị</h3>
                          <ul className="info-grid-list">
                            <li>
                              <div className="icon-wrapper">
                                <ExpandOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Kích thước</span>
                                <span className="value">{artifact.dimensions || "N/A"}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <UserOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Tác giả / Nguồn</span>
                                <span className="value">{authorName}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper star-icon">
                                <StarFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">Đánh giá chung</span>
                                <span className="value">
                                  {artifact.rating || 0}/5{" "}
                                  <span className="sub">({artifact.totalReviews || 0} đánh giá)</span>
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper unesco-icon">
                                <SafetyCertificateFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">Vị trí trưng bày</span>
                                <span className="value highlight-unesco">
                                  {artifact.locationInSite || artifact.currentLocation || "Tại di tích"}
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
                                <div style={{display: "flex", gap: 12}}>
                                  <div
                                    style={{fontWeight: 600, color: "#888", textTransform: "uppercase", fontSize: 11}}
                                  >
                                    Trọng lượng:
                                  </div>
                                  <div style={{fontWeight: 500}}>{artifact.weight}</div>
                                </div>
                              </Col>
                            )}
                            {artifact.origin && (
                              <Col xs={24} md={8}>
                                <div style={{display: "flex", gap: 12}}>
                                  <div
                                    style={{fontWeight: 600, color: "#888", textTransform: "uppercase", fontSize: 11}}
                                  >
                                    Nguồn gốc:
                                  </div>
                                  <div style={{fontWeight: 500}}>{artifact.origin}</div>
                                </div>
                              </Col>
                            )}
                            {artifact.acquisitionDate && (
                              <Col xs={24} md={8}>
                                <div style={{display: "flex", gap: 12}}>
                                  <div
                                    style={{fontWeight: 600, color: "#888", textTransform: "uppercase", fontSize: 11}}
                                  >
                                    Ngày tiếp nhận:
                                  </div>
                                  <div style={{fontWeight: 500}}>{artifact.acquisitionDate}</div>
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
                            * Hiện vật đang được trưng bày tại {artifact.locationInSite || "Bảo tàng / Di tích"}.
                          </span>
                          <span className="promo-text">Liên hệ Sen để biết thêm thông tin chi tiết.</span>
                        </div>
                        <div className="action-buttons">
                          <Button
                            size="large"
                            className="direction-btn"
                            icon={<EnvironmentOutlined />}
                            onClick={() => {
                              if (relatedHeritage && relatedHeritage.length > 0) {
                                navigate(`/heritage/${relatedHeritage[0].id}`);
                              }
                            }}
                          >
                            Xem điểm đến
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
                  {/* 1. Related Games */}
                  <div className="discovery-block">
                    <Title level={3}>
                      <RocketOutlined /> Trải nghiệm Hiện vật
                    </Title>
                    <p>Tương tác 3D và tham gia trò chơi liên quan đến hiện vật.</p>
                    <Row gutter={[24, 24]}>
                      <Col xs={24} md={12}>
                        <div className="game-card-mini">
                          <div
                            className="game-thumb"
                            style={{
                              backgroundImage: `url(https://images.unsplash.com/photo-1599525281489-0824b223c285?w=200)`,
                            }}
                          />
                          <div className="game-info">
                            <h4>Khám phá 3D</h4>
                            <div className="desc">Xem chi tiết mọi góc cạnh của hiện vật</div>
                          </div>
                          <Button type="primary" shape="round" icon={<RocketOutlined />}>
                            Xem
                          </Button>
                        </div>
                      </Col>
                      <Col xs={24} md={12}>
                        <div className="game-card-mini">
                          <div
                            className="game-thumb"
                            style={{
                              backgroundImage: `url(https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200)`,
                            }}
                          />
                          <div className="game-info">
                            <h4>Giải đố Lịch sử</h4>
                            <div className="desc">Thử thách kiến thức về hiện vật này</div>
                          </div>
                          <Button type="primary" shape="round" icon={<RocketOutlined />}>
                            Chơi
                          </Button>
                        </div>
                      </Col>
                    </Row>
                    <Divider />
                  </div>

                  {/* 2. Related Heritage */}
                  {(relatedHeritage.length > 0 || relatedHistory.length > 0) && (
                    <div className="discovery-block">
                      <Title level={3}>
                        <EnvironmentOutlined /> Di sản & Lịch sử liên quan
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
                  <div className="discovery-block" style={{marginBottom: 0}}>
                    <Title level={3}>
                      <ShopOutlined /> Sản phẩm Văn hóa
                    </Title>
                    <p>Quà lưu niệm độc đáo lấy cảm hứng từ hiện vật này.</p>
                    <Row gutter={[24, 24]} style={{display: "flex"}}>
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
            Hiện vật liên quan
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
const SpaceItem = ({icon, text}: {icon: React.ReactNode; text: string}) => (
  <span className="meta-space-item">
    {icon} <span style={{marginLeft: 6}}>{text}</span>
  </span>
);

export default ArtifactDetailPage;
