import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Spin, message, Row, Col, Typography, Empty } from "antd";
import {
  CalendarOutlined,
  UserOutlined,
  HeartOutlined,
  HeartFilled,
  ShareAltOutlined,
} from "@ant-design/icons";
import { fetchArtifactById } from "@store/slices/artifactSlice";
import favoriteService from "@/services/favorite.service";
import artifactService from "@/services/artifact.service";
import { RootState, AppDispatch } from "@/store";
import ArticleCard from "@/components/common/cards/ArticleCard";
import type { Artifact } from "@/types";
import "./styles.less";

const { Paragraph } = Typography;

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

  useEffect(() => {
    if (id) {
      dispatch(fetchArtifactById(id));
      // Fetch related (using getAll for simplified demo, in real app use proper related endpoint)
      fetchRelated(id);
      window.scrollTo(0, 0);
    }
  }, [dispatch, id]);

   const fetchRelated = async (currentId: string) => {
        try {
            const res = await artifactService.getAll({ limit: 3 });
            if (res.data) {
                // Filter out current if logic allows, or just show top 3
                setRelatedArtifacts(res.data.filter(a => a.id !== currentId).slice(0, 3));
            }
        } catch (e) {
            console.error("Failed to fetch related");
        }
   }

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
        await favoriteService.add('artifact', Number(id));
        setIsFavorite(true);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  if (loading) return <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center'}}><Spin size="large"/></div>;

  if (!artifact) return <Empty description="Không tìm thấy hiện vật" />;

  const mainImage = artifact.main_image || artifact.image || (artifact.images && artifact.images[0]) || 'https://via.placeholder.com/1200x600';

  return (
    <div className="artifact-detail-page">
      {/* 1. Hero Section */}
      <section className="detail-hero">
        <img src={mainImage} alt={artifact.name} className="hero-bg" />
        <div className="hero-overlay">
            <div className="container">
                <h1>{artifact.name}</h1>
                <div className="hero-meta">
                    <span><CalendarOutlined /> {artifact.year_created}</span>
                    <span><UserOutlined /> {(artifact as any).dynasty}</span>
                </div>
            </div>
        </div>
      </section>

      {/* 2. Main Content */}
      <section className="main-content">
          <div className="content-wrapper">
              <div className="left-col">
                  <h3 className="section-title">Câu Chuyện & Ý Nghĩa</h3>
                  <div className="description-text">
                        <Paragraph>{artifact.description}</Paragraph>
                        <Paragraph><strong>Ngữ Cảnh Lịch Sử:</strong> {artifact.historical_context}</Paragraph>
                        <Paragraph><strong>Ý Nghĩa Văn Hóa:</strong> {artifact.cultural_significance}</Paragraph>
                  </div>

                  {artifact.images && artifact.images.length > 0 && (
                      <>
                        <h3 className="section-title">Hình Ảnh Chi Tiết</h3>
                        <div className="image-gallery">
                            {artifact.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Detail ${idx}`} />
                            ))}
                        </div>
                      </>
                  )}
              </div>

              <div className="right-col">
                  <div className="info-box">
                      <div className="info-row">
                          <span className="label">Loại hiện vật</span>
                          <span className="value">{artifact.artifact_type}</span>
                      </div>
                      <div className="info-row">
                          <span className="label">Tình trạng</span>
                          <span className="value">{artifact.condition}</span>
                      </div>
                      <div className="info-row">
                          <span className="label">Chất liệu</span>
                          <span className="value">{artifact.material}</span>
                      </div>
                       <div className="info-row">
                          <span className="label">Kích thước</span>
                          <span className="value">{artifact.dimensions}</span>
                      </div>
                      <div className="info-row">
                           <span className="label">Đánh giá</span>
                           <span className="value">{artifact.rating}/5 ({artifact.total_reviews} reviews)</span>
                      </div>

                      <div className="action-buttons">
                          <button className="btn-fav" onClick={handleToggleFavorite}>
                              {isFavorite ? <><HeartFilled /> Đã Thích</> : <><HeartOutlined /> Yêu Thích</>}
                          </button>
                          <button className="btn-share">
                              <ShareAltOutlined /> Chia Sẻ
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      </section>

      {/* 3. Related Section */}
      <section className="related-section">
          <h2 className="related-title">Hiện Vật Liên Quan</h2>
          <Row gutter={[24, 24]}>
              {relatedArtifacts.map(item => (
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
