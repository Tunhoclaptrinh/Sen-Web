import React, {useEffect, useState} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {Spin, Row, Col, Typography, Empty, Button, Tag, Tabs, message} from "antd";
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
import exhibitionService, {Exhibition} from "@/services/exhibition.service";
import artifactService from "@/services/artifact.service";
import {getImageUrl, resolveImage} from "@/utils/image.helper";
import {useAuth} from "@/hooks/useAuth";
import ArticleCard from "@/components/common/cards/ArticleCard";
import AddToCollectionModal from "@/components/common/AddToCollectionModal";
import dayjs from "dayjs";
import {ITEM_TYPES} from "@/config/constants";
import ReviewSection from "@/components/common/Review/ReviewSection";
import "./styles.less";

const {Title} = Typography;

const ExhibitionDetailPage: React.FC = () => {
  const {id} = useParams<{id: string}>();
  const navigate = useNavigate();
  const {user} = useAuth();

  const [exhibition, setExhibition] = useState<Exhibition | null>(null);
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCollectionModal, setShowCollectionModal] = useState(false);

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
            message.error("Triển lãm này chưa được công khai hoặc bạn không có quyền truy cập");
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
            const artRes = await artifactService.getAll({ids: data.artifactIds.join(",")});
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
  }, [id, user]); // Added user dependency to re-run check if auth loads late

  if (loading)
    return (
      <div className="exhibition-detail-page">
        <div className="loading-container">
          <Spin size="large" />
        </div>
      </div>
    );
  if (!exhibition) return <Empty description="Không tìm thấy triển lãm" />;

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
        <div className="hero-bg" style={{backgroundImage: `url('${heroImage}')`}} />
        <div className="hero-overlay">
          <div className="hero-content">
            <Tag
              color="var(--primary-color)"
              style={{border: "none", marginBottom: 16, fontSize: 14, padding: "4px 12px"}}
            >
              VIRTUAL EXHIBITION
            </Tag>
            <h1>{exhibition.name}</h1>
            <div className="hero-meta">
              <span>
                <CalendarOutlined />{" "}
                {exhibition.isPermanent
                  ? "Vĩnh viễn"
                  : `${dayjs(exhibition.startDate).format("DD/MM/YYYY")} - ${dayjs(exhibition.endDate).format("DD/MM/YYYY")}`}
              </span>
              <span>
                <UserOutlined /> {exhibition.curator || "Bảo tàng SEN"}
              </span>
              <span>
                <EyeOutlined /> {exhibition.visitorCount || 0} lượt tham quan
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
                  label: "Giới thiệu",
                  children: (
                    <div className="article-main-wrapper">
                      <h2 className="article-main-title">{exhibition.name}</h2>
                      <div
                        className="article-body-content"
                        dangerouslySetInnerHTML={{
                          __html: exhibition.description || "<p>Chưa có mô tả chi tiết cho triển lãm này.</p>",
                        }}
                      />

                      {/* Gallery Preview Block (Mock) */}
                      <div className="discovery-block" style={{marginTop: 40, marginBottom: 0}}>
                        <div className="virtual-tour-card">
                          <h2>Trải nghiệm không gian 3D</h2>
                          <p>Khám phá triển lãm trong không gian thực tế ảo sống động.</p>
                          <Button size="large" icon={<RocketOutlined />} disabled>
                            Vào tham quan 3D (Sắp ra mắt)
                          </Button>
                        </div>
                      </div>
                    </div>
                  ),
                },
                {
                  key: "artifacts",
                  label: `Hiện vật (${artifacts.length})`,
                  children: (
                    <div className="article-main-wrapper">
                      <Title level={3} style={{fontFamily: "Aleo, serif", marginBottom: 24, fontWeight: 700}}>
                        Hiện vật trưng bày
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
                        <Empty description="Chưa có hiện vật nào được cập nhật" />
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
                <h3 className="info-section-title">Thông tin triển lãm</h3>
                <ul className="info-grid-list">
                  <li>
                    <div className="icon-wrapper">
                      <CalendarOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">Thời gian</span>
                      <span className="value">{exhibition.isPermanent ? "Thường trực" : "Có thời hạn"}</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <TagOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">Chủ đề</span>
                      <span className="value">{exhibition.theme || "Văn hóa"}</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <UserOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">Người tổ chức</span>
                      <span className="value">{exhibition.curator || "Ban quản lý"}</span>
                    </div>
                  </li>
                  <li>
                    <div className="icon-wrapper">
                      <PictureOutlined />
                    </div>
                    <div className="info-text">
                      <span className="label">Số lượng hiện vật</span>
                      <span className="value">{artifacts.length} hiện vật</span>
                    </div>
                  </li>
                </ul>
              </div>

              {/* Actions Widget */}
              <div className="action-button-group">
                <Button type="primary" size="large" className="primary-action-btn" icon={<ShareAltOutlined />}>
                  Chia sẻ sự kiện
                </Button>
                <Button
                  size="large"
                  className="secondary-action-btn"
                  icon={<FolderAddOutlined />}
                  onClick={() => setShowCollectionModal(true)}
                  style={{marginTop: 12, width: "100%"}}
                >
                  Lưu vào BST
                </Button>
                <Button
                  size="large"
                  className="secondary-action-btn"
                  icon={<ArrowLeftOutlined />}
                  onClick={() => navigate("/exhibitions")}
                >
                  Quay lại danh sách
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
