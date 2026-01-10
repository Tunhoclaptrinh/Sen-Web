import React, { useEffect, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { Row, Col, Card, Button, Typography, Space } from "antd";
import {
  EnvironmentOutlined,
  RightOutlined,
  CalendarOutlined,
  UserOutlined,
  CommentOutlined,
} from "@ant-design/icons";
import { fetchHeritageSites } from "@store/slices/heritageSlice";
import { fetchArtifacts } from "@store/slices/artifactSlice";
import { RootState, AppDispatch } from "@/store";
import { getImageUrl } from "@/utils/image.helper";
import FeatureCard from "@/components/common/cards/FeatureCard";
import "./styles.less";
import brandTitle from "../../assets/images/logo2.png";

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: sites } = useSelector((state: RootState) => state.heritage);
  const { items: artifacts } = useSelector(
    (state: RootState) => state.artifact,
  );

  // State for background animation
  const [isShaking, setIsShaking] = useState(false);
  const shakeTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleInteraction = () => {
      setIsShaking(true);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
      shakeTimer.current = setTimeout(() => {
        setIsShaking(false);
      }, 3000);
    };

    window.addEventListener("scroll", handleInteraction);
    window.addEventListener("mousemove", handleInteraction);

    return () => {
      window.removeEventListener("scroll", handleInteraction);
      window.removeEventListener("mousemove", handleInteraction);
      if (shakeTimer.current) clearTimeout(shakeTimer.current);
    };
  }, []);

  useEffect(() => {
    dispatch(fetchHeritageSites({ _limit: 4 }));
    dispatch(fetchArtifacts({ _limit: 4 }));
  }, [dispatch]);

  return (
    <div className="home-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="brand-title">
            <img src={brandTitle} alt="" />
          </div>
          <p className="hero-subtitle">
            Kiến tạo trải nghiệm lịch sử, văn hóa bằng công nghệ
          </p>
          <Button
            className="cta-button"
            onClick={() => navigate("/game/chapters")}
          >
            Khám phá ngay
          </Button>
        </div>
        {/* Optional decorative bottom elements can go here if provided */}
      </section>

      {/* 2. Mission Section (Sứ mệnh của Sen) */}
      <section className="mission-section">
        <img
          src="/images/hoatiettrongdong.png"
          alt="drum"
          className="bg-drum"
        />
        <div className="mission-bg-container">
          <img
            src="/images/hoatiettrongdong.png"
            alt=""
            className={`mission-drum-img ${isShaking ? "shaking" : ""}`}
          />
        </div>
        <div className="mission-container">
          <div className="mission-image-col">
            <img
              src="/images/Image.png" // Using one of the provided assets
              alt="Temple"
              className="mission-main-img"
            />
          </div>
          <div className="mission-text-col">
            <span className="sub-header">Sứ mệnh của Sen</span>
            <Title level={2} className="header-title">
              Khám phá lịch sử - văn hóa
            </Title>
            <Paragraph className="mission-desc">
              Qua lịch sử Việt Nam đầy hào hùng được người kể những câu chuyện
              chưa quen tương tác, sinh động và dễ tiếp cận. Bằng việc kết hợp
              kiến thức lịch sử chính thống với lối chơi hấp dẫn, website mong
              muốn khơi dậy niềm hứng thú khám phá quá khứ.
              <br />
              <br />
              Sen không chỉ gìn giữ bảo tồn và lan tỏa di sản dân tộc mà còn
              nuôi dưỡng tinh thần yêu nước, ý thức gìn giữ bản sắc dân tộc
              trong thời đại số.
            </Paragraph>
            <div className="mission-actions">
              <button
                className="action-btn green-btn"
                onClick={() => navigate("/game/chapters")}
              >
                Khám phá
              </button>
              <button
                className="action-btn light-green-btn"
                onClick={() => navigate("/heritage-sites")}
              >
                Di sản văn hóa
              </button>
              <button
                className="action-btn light-green-btn"
                onClick={() => navigate("/artifacts/browse")}
              >
                Hiện vật
              </button>
              <button
                className="action-btn light-green-btn"
                onClick={() => navigate("/learn")}
              >
                Học tập
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Featured Heritage Section */}
      <section className="featured-heritage-section">
        <Title level={2} className="header-title">
          Di sản & địa điểm nổi bật
        </Title>
        <Row gutter={[24, 24]} justify="center">
          {sites?.slice(0, 4).map((site) => (
            <Col xs={24} sm={12} md={6} key={site.id}>
              <FeatureCard data={site} variant="portrait" cardType="heritage" />
            </Col>
          ))}
        </Row>
      </section>

      {/* 4. Featured Artifacts Section */}
      <section className="featured-artifacts-section">
        <div className="section-content">
          <Title level={2} className="header-title">
            Hiện vật tiêu biểu
          </Title>
          <Paragraph className="section-subtitle">
            Tìm và khám phá những bộ sưu tập hiện vật lịch sử, mỹ thuật giá trị
            của các bảo tàng trên thế giới
          </Paragraph>

          <Row gutter={[24, 24]}>
            {artifacts?.slice(0, 4).map((artifact) => (
              <Col xs={24} sm={12} md={6} lg={6} xl={6} key={artifact.id}>
                <FeatureCard
                  data={artifact}
                  variant="portrait"
                  cardType="artifact"
                />
              </Col>
            ))}
          </Row>
        </div>
         <div className="artifacts-bg-container" >
          <img
            src="/images/hoatiettrongdong.png"
            alt=""
            className={`artifacts-drum-img ${isShaking ? "shaking" : ""}`}
          />
        </div>
      </section>

      {/* 5. Game Integration Section */}
      <section className="game-section">
        <Title level={2} className="header-title">
          Trải nghiệm Gamification
        </Title>
        <div className="game-container">
          <div className="game-image-wrapper">
            <img src="/images/Game.png" alt="Game World" />
          </div>

          <div className="game-info-card">
            <div className="card-meta">
              <span className="meta-item">
                <CalendarOutlined /> Aug 1, 2025
              </span>
              <span className="meta-item">
                <UserOutlined /> Admin
              </span>
              <span className="meta-item">
                <CommentOutlined /> No comments
              </span>
            </div>
            <h3 className="card-title">
              Trải nghiệm và học tập lịch sử - văn hóa thông qua trò chơi
            </h3>
            <Paragraph className="card-desc">
              Chào mừng người chơi bước vào một hành trình khám phá mới. Trong
              trò chơi này, bạn sẽ hóa thân thành người lữ hành thời gian, lần
              theo những dấu tích lịch sử và văn hóa để giải mã các câu chuyện,
              nhân vật và sự kiện đã từng in dấu trong quá khứ.
            </Paragraph>
            <Paragraph className="card-desc">
              Bên cạnh đó việc tích hợp các bài tập và câu hỏi trắc nghiệm được
              thiết kế phù hợp với nội dung, giúp người chơi củng cố kiến thức,
              tăng khả năng ghi nhớ và hiểu sâu hơn những giá trị lịch sử - văn
              hóa đã trải nghiệm.
            </Paragraph>

            <button
              className="experience-btn"
              onClick={() => navigate("/game")}
            >
              Trải nghiệm
            </button>
          </div>
        </div>
      </section>

      {/* 5. Bottom CTA Layout */}
      <section className="bottom-cta-section">
        <img
          src="/images/hoatiettrongdong.png"
          alt="drum"
          className={`bg-drum-bottom ${isShaking ? "shaking" : ""}`}
        />
        <div className="bg-circle-images">
          {/* Using dummy images or reusing specific heritage/artifact images for the circle collage */}
          {sites?.[0] && (
            <div className="circle-img-wrapper side">
              <img
                src={getImageUrl(sites[0].image || sites[0].main_image)}
                alt="Deco"
              />
            </div>
          )}
          {sites?.[1] && (
            <div className="circle-img-wrapper center">
              <img
                src={getImageUrl(sites[1].image || sites[1].main_image)}
                alt="Deco Main"
              />
            </div>
          )}
          {sites?.[2] && (
            <div className="circle-img-wrapper side">
              <img
                src={getImageUrl(sites[2].image || sites[2].main_image)}
                alt="Deco"
              />
            </div>
          )}
        </div>

        <div className="cta-content">
          <Title level={2} className="header-title">
            Sẵn sàng khám phá?
          </Title>
          <Paragraph>
            Tham gia tìm hiểu văn hóa lịch sử Việt Nam và nhận quà ngay
          </Paragraph>
          <button
            className="main-cta-btn"
            onClick={() => navigate("/auth/register")}
          >
            Khám phá ngay
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
