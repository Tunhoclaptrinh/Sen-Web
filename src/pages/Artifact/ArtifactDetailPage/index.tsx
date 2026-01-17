import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import {
  Spin,
  message,
  Row,
  Col,
  Typography,
  Empty,
  Tabs,
  Divider,
  Button,
  Image,
  Tag,
} from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
  RocketOutlined,
  EnvironmentOutlined,
  ShopOutlined,
  CameraOutlined,
  StarFilled,
  GlobalOutlined,
  SafetyCertificateFilled,
  InfoCircleOutlined,
  SkinOutlined,
  ExpandOutlined,
  HistoryOutlined,
} from "@ant-design/icons";
import { fetchArtifactById } from "@store/slices/artifactSlice";
import favoriteService from "@/services/favorite.service";
import artifactService from "@/services/artifact.service";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import { RootState, AppDispatch } from "@/store";
import ArticleCard from "@/components/common/cards/ArticleCard";
import { getImageUrl, resolveImage } from "@/utils/image.helper";
import type { Artifact } from "@/types";
import "./styles.less";

const { Paragraph, Title } = Typography;

const ArtifactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentItem: artifact,
    loading,
    error,
  } = useSelector((state: RootState) => state.artifact);
  const [isFavorite, setIsFavorite] = useState(false);
  const [relatedArtifacts, setRelatedArtifacts] = useState<Artifact[]>([]);
  const [relatedHeritage, setRelatedHeritage] = useState<any[]>([]);
  const [relatedHistory, setRelatedHistory] = useState<any[]>([]);
  const [previewVisible, setPreviewVisible] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchArtifactById(id));
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (artifact && artifact.id) {
      fetchRelated(artifact);
    }
  }, [artifact]);

  const fetchRelated = async (currentItem: Artifact) => {
    try {
      const currentId = currentItem.id;

      // 1. Fetch related artifacts (same heritage site)
      if (currentItem.heritage_site_id) {
        const res = await artifactService.getAll({
          heritage_site_id: currentItem.heritage_site_id,
          limit: 4,
        });
        if (res.data) {
          setRelatedArtifacts(
            res.data.filter((a) => a.id !== currentId).slice(0, 3),
          );
        }
      } else {
        const res = await artifactService.getAll({ limit: 4 });
        if (res.data) {
          setRelatedArtifacts(
            res.data.filter((a) => a.id !== currentId).slice(0, 3),
          );
        }
      }

      // 2. Fetch related heritage
      const relHeriIds = currentItem.related_heritage_ids || [];
      if (relHeriIds.length > 0) {
        const res = await heritageService.getAll({ ids: relHeriIds.join(",") });
        if (res.data) setRelatedHeritage(res.data);
      }

      // 3. Fetch related history
      const relHistIds = currentItem.related_history_ids || [];
      if (relHistIds.length > 0) {
        const res = await historyService.getAll({ ids: relHistIds.join(",") });
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
    try {
      if (isFavorite) {
        setIsFavorite(false);
        message.success("Đã xóa khỏi yêu thích");
      } else {
        await favoriteService.add("artifact", Number(id));
        setIsFavorite(true);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  if (loading)
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Spin size="large" />
      </div>
    );

  if (!artifact) return <Empty description="Không tìm thấy hiện vật" />;

  const rawMainImage =
    resolveImage(artifact.main_image) ||
    resolveImage(artifact.image) ||
    resolveImage(artifact.images);
  const mainImage = getImageUrl(
    rawMainImage,
    "https://via.placeholder.com/1200x600/1a1a1a/ffffff?text=No+Image",
  );

  // Aggregate all potential images
  const allRawImages = [
    ...(artifact.main_image
      ? Array.isArray(artifact.main_image)
        ? artifact.main_image
        : [artifact.main_image]
      : []),
    ...(artifact.image
      ? Array.isArray(artifact.image)
        ? artifact.image
        : [artifact.image]
      : []),
    ...(artifact.images || []),
  ];

  // Unique and resolved
  const galleryImages = Array.from(new Set(allRawImages))
    .filter((img) => typeof img === "string")
    .map((img) => getImageUrl(img));

  return (
    <div className="artifact-detail-page">
      {/* 1. Hero Section */}
      <section
        className="artifact-detail-hero"
        style={{ backgroundColor: "#1a1a1a" }}
      >
        <img
          src={mainImage}
          alt={artifact.name}
          className="artifact-hero-img"
          style={{ backgroundColor: "#1a1a1a", objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.src =
              "https://via.placeholder.com/1200x600/1a1a1a/ffffff?text=No+Image";
          }}
        />
        <div className="artifact-hero-overlay">
          <div className="artifact-hero-container">
            <Tag
              color="var(--primary-color)"
              style={{ border: "none", marginBottom: 16 }}
            >
              {artifact.artifact_type?.toUpperCase() || "ARTIFACT"}
            </Tag>
            <h1>{artifact.name}</h1>
            <div className="artifact-hero-meta">
              <span>
                <CalendarOutlined /> {artifact.year_created}
              </span>
              <span>
                <UserOutlined /> {artifact.creator || "Không rõ"}
              </span>
            </div>
          </div>

          {/* Gallery Button */}
          <div className="hero-gallery-btn-wrapper">
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

      {/* 2. Main Content with Tabs */}
      <section className="main-content">
        <div
          className="content-wrapper"
          style={{ maxWidth: 1200, margin: "0 auto", padding: "40px 24px" }}
        >
          <Tabs
            defaultActiveKey="description"
            size="large"
            items={[
              {
                key: "description",
                label: "Mô Tả",
                children: (
                  <div className="article-main-wrapper">
                    <h3 className="section-title">Câu Chuyện & Ý Nghĩa</h3>
                    <div className="description-text">
                      <Paragraph>{artifact.description}</Paragraph>
                      {artifact.historical_context && (
                        <Paragraph>
                          <strong>Ngữ Cảnh Lịch Sử:</strong>{" "}
                          {artifact.historical_context}
                        </Paragraph>
                      )}
                      {artifact.cultural_significance && (
                        <Paragraph>
                          <strong>Ý Nghĩa Văn Hóa:</strong>{" "}
                          {artifact.cultural_significance}
                        </Paragraph>
                      )}
                    </div>

                    {galleryImages.length > 0 && (
                      <>
                        <h3 className="section-title" style={{ marginTop: 32 }}>
                          Hình Ảnh Chi Tiết
                        </h3>
                        <div className="image-gallery">
                          {galleryImages.map((img, idx) => (
                            <img
                              key={idx}
                              src={img}
                              alt={`Detail ${idx}`}
                              onClick={() => setPreviewVisible(true)}
                            />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                ),
              },
              {
                key: "info",
                label: "Thông Tin",
                children: (
                  <div className="article-main-wrapper">
                    <div className="info-box-premium">
                      <Row gutter={[48, 24]}>
                        <Col xs={24} md={12}>
                          <ul className="info-list">
                            <li>
                              <div className="icon-wrapper">
                                <InfoCircleOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Tên hiện vật</span>
                                <span className="value">{artifact.name}</span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <SkinOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Loại hiện vật</span>
                                <span className="value">
                                  {artifact.artifact_type}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <HistoryOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Thời kỳ / Năm</span>
                                <span className="value">
                                  {artifact.year_created}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <StarFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">Tình trạng</span>
                                <span className="value highlight-status">
                                  {artifact.condition}
                                </span>
                              </div>
                            </li>
                          </ul>
                        </Col>
                        <Col xs={24} md={12}>
                          <ul className="info-list">
                            <li>
                              <div className="icon-wrapper">
                                <GlobalOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Chất liệu</span>
                                <span className="value">
                                  {artifact.material}
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper">
                                <ExpandOutlined />
                              </div>
                              <div className="info-text">
                                <span className="label">Kích thước</span>
                                <span className="value">
                                  {artifact.dimensions}
                                </span>
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
                                  <span className="sub">
                                    ({artifact.total_reviews || 0} reviews)
                                  </span>
                                </span>
                              </div>
                            </li>
                            <li>
                              <div className="icon-wrapper unesco-icon">
                                <SafetyCertificateFilled />
                              </div>
                              <div className="info-text">
                                <span className="label">Phân loại di sản</span>
                                <span className="value highlight-unesco">
                                  Bảo vật Quốc gia
                                </span>
                              </div>
                            </li>
                          </ul>
                        </Col>
                      </Row>

                      <Divider dashed />

                      <div className="info-footer-actions">
                        <div className="action-buttons-group">
                          <Button
                            className={`btn-favorite ${isFavorite ? "active" : ""}`}
                            icon={
                              isFavorite ? <HeartFilled /> : <HeartOutlined />
                            }
                            onClick={handleToggleFavorite}
                            size="large"
                          >
                            {isFavorite ? "Đã Thích" : "Yêu Thích"}
                          </Button>
                          <Button icon={<ShareAltOutlined />} size="large">
                            Chia Sẻ
                          </Button>
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
                    {/* 1. Related Games / Interactive (MOCK UI) */}
                    <div
                      className="discovery-block"
                      style={{ marginBottom: 48 }}
                    >
                      <Title level={3}>
                        <RocketOutlined /> Trải nghiệm Lịch sử
                      </Title>
                      <p>
                        Tham gia các màn chơi tương tác để hiểu rõ hơn về hiện
                        vật này.
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
                                Khám phá Rồng đá
                              </h4>
                              <div style={{ color: "#888", fontSize: 13 }}>
                                Giải mã bí ẩn về rồng đá thời Lê
                              </div>
                            </div>
                            <Button
                              type="primary"
                              shape="round"
                              icon={<RocketOutlined />}
                            >
                              Chơi Ngay
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
                                backgroundImage: `url(https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=200)`,
                                backgroundSize: "cover",
                              }}
                            />
                            <div className="game-info" style={{ flex: 1 }}>
                              <h4 style={{ margin: 0, fontSize: 16 }}>
                                Bảo vệ Hoàng Thành
                              </h4>
                              <div style={{ color: "#888", fontSize: 13 }}>
                                Bảo vệ di sản khỏi xâm lược
                              </div>
                            </div>
                            <Button
                              type="primary"
                              shape="round"
                              icon={<RocketOutlined />}
                            >
                              Chơi Ngay
                            </Button>
                          </div>
                        </Col>
                      </Row>
                      <Divider />
                    </div>

                    {/* 2. Related Heritage Sites & History */}
                    {(relatedHeritage.length > 0 ||
                      relatedHistory.length > 0) && (
                      <div
                        className="discovery-block"
                        style={{ marginBottom: 48 }}
                      >
                        <Title level={3}>
                          <EnvironmentOutlined /> Di sản & Lịch sử liên quan
                        </Title>
                        <Row gutter={[16, 16]}>
                          {relatedHeritage.map((item) => (
                            <Col xs={24} sm={12} md={8} key={`heri-${item.id}`}>
                              <ArticleCard data={item} type="heritage" />
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

                    {/* 3. Related Products (MOCK UI) */}
                    <div className="discovery-block">
                      <Title level={3}>
                        <ShopOutlined /> Sản phẩm Văn hóa
                      </Title>
                      <p>
                        Các sản phẩm lưu niệm và văn hóa liên quan đến hiện vật
                        này.
                      </p>
                      <Row gutter={[16, 16]}>
                        <Col xs={24} sm={12} md={6}>
                          <div
                            className="product-card"
                            style={{
                              textAlign: "center",
                              border: "1px solid #f0f0f0",
                              borderRadius: 8,
                              padding: 16,
                            }}
                          >
                            <div
                              className="prod-img"
                              style={{
                                height: 200,
                                marginBottom: 16,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#f5f5f5",
                              }}
                            >
                              <img
                                src="https://images.unsplash.com/photo-1599525281489-0824b223c285?w=400"
                                alt="Product"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <h4 style={{ marginBottom: 8, fontSize: 15 }}>
                              Mô hình Rồng đá
                            </h4>
                            <div
                              style={{
                                color: "#d4380d",
                                fontWeight: "bold",
                                fontSize: 16,
                                marginBottom: 12,
                              }}
                            >
                              350,000 đ
                            </div>
                            <Button block type="primary" ghost>
                              Xem chi tiết
                            </Button>
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div
                            className="product-card"
                            style={{
                              textAlign: "center",
                              border: "1px solid #f0f0f0",
                              borderRadius: 8,
                              padding: 16,
                            }}
                          >
                            <div
                              className="prod-img"
                              style={{
                                height: 200,
                                marginBottom: 16,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#f5f5f5",
                              }}
                            >
                              <img
                                src="https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400"
                                alt="Product"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <h4 style={{ marginBottom: 8, fontSize: 15 }}>
                              Móc khóa Rồng đá
                            </h4>
                            <div
                              style={{
                                color: "#d4380d",
                                fontWeight: "bold",
                                fontSize: 16,
                                marginBottom: 12,
                              }}
                            >
                              45,000 đ
                            </div>
                            <Button block type="primary" ghost>
                              Xem chi tiết
                            </Button>
                          </div>
                        </Col>
                        <Col xs={24} sm={12} md={6}>
                          <div
                            className="product-card"
                            style={{
                              textAlign: "center",
                              border: "1px solid #f0f0f0",
                              borderRadius: 8,
                              padding: 16,
                            }}
                          >
                            <div
                              className="prod-img"
                              style={{
                                height: 200,
                                marginBottom: 16,
                                borderRadius: 8,
                                overflow: "hidden",
                                background: "#f5f5f5",
                              }}
                            >
                              <img
                                src="https://images.unsplash.com/photo-1555169062-013468b47731?w=400"
                                alt="Product"
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
                            <h4 style={{ marginBottom: 8, fontSize: 15 }}>
                              Tranh Rồng đá
                            </h4>
                            <div
                              style={{
                                color: "#d4380d",
                                fontWeight: "bold",
                                fontSize: 16,
                                marginBottom: 12,
                              }}
                            >
                              280,000 đ
                            </div>
                            <Button block type="primary" ghost>
                              Xem chi tiết
                            </Button>
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
      </section>

      {/* 3. Related Artifacts Section */}
      <section className="related-section">
        <h2 className="related-title">Hiện Vật Liên Quan</h2>
        <Row gutter={[24, 24]}>
          {relatedArtifacts.map((item) => (
            <Col xs={24} sm={12} lg={8} key={item.id}>
              <ArticleCard data={item} type="artifact" />
            </Col>
          ))}
        </Row>
      </section>
    </div>
  );
};

export default ArtifactDetailPage;
