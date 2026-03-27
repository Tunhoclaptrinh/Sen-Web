import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation, Trans } from "react-i18next";
import { Row, Col, Typography, Button } from "antd";
import { ArrowRightOutlined } from "@ant-design/icons";
import { fetchHeritageSites } from "@store/slices/heritageSlice";
import { fetchArtifacts } from "@store/slices/artifactSlice";
import { RootState, AppDispatch } from "@/store";
import FeatureCard from "@/components/common/cards/FeatureCard";
import HomeMapSection from "@/components/Home/HomeMapSection";
import HomeLeaderboardSection from "@/components/Home/HomeLeaderboardSection";
import { ITEM_TYPES } from "@/config/constants";
import SeoHead from "@/components/common/SeoHead";
import { buildAbsoluteUrl } from "@/utils/seo.utils";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import "./styles.less";
const brandTitle = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774362654/sen_web/static/src/assets/images/logo2.png";
const headerLogo = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774362654/sen_web/static/src/assets/images/logo.png";
import Background from "@/components/Background";

const { Title, Paragraph } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const dispatch = useDispatch<AppDispatch>();
  const { items: sites } = useSelector((state: RootState) => state.heritage);
  const { items: artifacts } = useSelector((state: RootState) => state.artifact);
  const [isSeoReady, setIsSeoReady] = useState(false);

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
    let isMounted = true;

    const loadInitialData = async () => {
      await Promise.allSettled([
        dispatch(fetchHeritageSites({ _limit: 4, _sort: 'views,rating', _order: 'desc,desc' })),
        dispatch(fetchArtifacts({ _limit: 4, _sort: 'views,rating', _order: 'desc,desc' })),
      ]);

      if (isMounted) {
        setIsSeoReady(true);
      }
    };

    void loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [dispatch]);

  usePrerenderReady(isSeoReady);

  const homeJsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      name: "SEN",
      url: buildAbsoluteUrl("/"),
      logo: "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774362654/sen_web/static/src/assets/images/logo.png",
    },
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "SEN",
      url: buildAbsoluteUrl("/"),
      inLanguage: "vi-VN",
    },
  ];

  return (
    <div className="home-page">
      <SeoHead
        title="SEN - Kham pha di san van hoa Viet Nam"
        description={t("home.heroSubtitle")}
        path="/"
        image="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355946/sen_web/static/public/images/Zero_home.jpg"
        keywords={[
          "di san van hoa",
          "lich su viet nam",
          "kham pha di tich",
          "hien vat lich su",
          "sen",
        ]}
        jsonLd={homeJsonLd}
      />

      {/* 1. Hero Section */}
      <Background className="hero-section">
        <section className="hero-sections">
          <div className="hero-content">
            <div className="brand-title">
              <img src={brandTitle} alt="" />
            </div>
            <p className="hero-subtitle">{t('home.heroSubtitle')}</p>
            <Button className="cta-button" onClick={() => navigate("/game/chapters")}>
              {t('home.exploreNow')}
            </Button>
          </div>
          {/* Optional decorative bottom elements can go here if provided */}
        </section>
      </Background>

      {/* 2. Mission Section (Sứ mệnh của Sen) */}
      <section className="mission-section">
        <img src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355964/sen_web/static/public/images/hoatiettrongdong.png" alt="drum" className="bg-drum" />
        <div className="mission-bg-container">
          <img src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355964/sen_web/static/public/images/hoatiettrongdong.png" alt="" className={`mission-drum-img ${isShaking ? "shaking" : ""}`} />
        </div>
        <div className="mission-container">
          <div className="mission-image-col">
            <img
              src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355923/sen_web/static/public/images/Image.png" // Using one of the provided assets
              alt="Temple"
              className="mission-main-img"
            />
          </div>
          <div className="mission-text-col">
            <span className="sub-header">{t('home.mission.subHeader')}</span>
            <Title level={2} className="header-title">
              {t('home.mission.title')}
            </Title>
            <Paragraph className="mission-desc">
              {t('home.mission.desc1')}
            </Paragraph>
            <Paragraph className="mission-desc">
              {t('home.mission.desc2')}
            </Paragraph>
            <div className="mission-actions">
              <button className="action-btn green-btn" onClick={() => navigate("/game/chapters")}>
                {t('home.actions.explore')}
              </button>
              <button className="action-btn light-green-btn" onClick={() => navigate("/heritage-sites")}>
                {t('home.actions.heritage')}
              </button>
              <button className="action-btn light-green-btn" onClick={() => navigate("/artifacts")}>
                {t('home.actions.artifacts')}
              </button>
              <button className="action-btn light-green-btn" onClick={() => navigate("/game/learning")}>
                {t('home.actions.learn')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 Heritage Space (Map & Leaderboard) */}
      <div className="heritage-space-block">
        <div className="dot-pattern-overlay" />
        <div className="heritage-pattern-overlay" />
        <HomeMapSection />
        <HomeLeaderboardSection />
      </div>

      {/* 3. Featured Heritage Section */}
      <section className="featured-heritage-section">
        <Title level={2} className="header-title">
          {t('home.heritage.title')}
        </Title>
        <Row gutter={[24, 24]} justify="center">
          {sites?.slice(0, 4).map((site) => (
            <Col xs={24} sm={12} md={6} key={site.id}>
              <FeatureCard data={site} variant="portrait" cardType={ITEM_TYPES.HERITAGE} />
            </Col>
          ))}
        </Row>
      </section>

      {/* 4. Featured Artifacts Section */}
      <section className="featured-artifacts-section">
        <div className="section-content">
          <Title level={2} className="header-title">
            {t('home.artifacts.title')}
          </Title>
          <Paragraph className="section-subtitle">
            {t('home.artifacts.subtitle')}
          </Paragraph>

          <Row gutter={[24, 24]}>
            {artifacts?.slice(0, 4).map((artifact) => (
              <Col xs={24} sm={12} md={6} lg={6} xl={6} key={artifact.id}>
                <FeatureCard data={artifact} variant="portrait" cardType={ITEM_TYPES.ARTIFACT} />
              </Col>
            ))}
          </Row>
        </div>
        <div className="artifacts-bg-container">
          <img
            src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355964/sen_web/static/public/images/hoatiettrongdong.png"
            alt=""
            className={`artifacts-drum-img ${isShaking ? "shaking" : ""}`}
          />
        </div>
      </section>

      {/* 5. Game Integration Section */}
      <section className="game-section">
        <div style={{ maxWidth: 1400, margin: "0 auto", padding: "0 80px" }}>
          <div className="section-header" style={{ textAlign: "center", marginBottom: 60 }}>
            <Title level={2} className="header-title">
              <Trans
                i18nKey="home.gamification.title"
                components={{
                  1: <span style={{ color: "var(--primary-color)" }}>Gamification</span>
                }}
              >
                Trải nghiệm <span style={{ color: "var(--primary-color)" }}>Gamification</span>
              </Trans>
            </Title>
            <Paragraph
              style={{
                fontFamily: "var(--font-serif)",
                fontSize: 18,
                color: "var(--text-color-secondary)",
                maxWidth: 800,
                margin: "0 auto",
                fontStyle: "italic",
              }}
            >
              {t('home.gamification.subtitle')}
            </Paragraph>
          </div>

          <Row gutter={[48, 0]} align="stretch" className="game-container">
            <Col xs={24} lg={14}>
              <div className="game-image-wrapper">
                <img src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355929/sen_web/static/public/images/MapGame.jpg" alt="Game World" />
                <div className="image-overlay-glow" />
              </div>
            </Col>

            <Col xs={24} lg={10}>
              <div className="game-info-card">
                <div className="card-icon-header">
                  <img src={headerLogo} alt="Sen Logo" style={{ height: 48, marginBottom: 20 }} />
                </div>
                <h3 className="card-title">{t('home.gamification.cardTitle')}</h3>

                <div className="card-description-box">
                  <Paragraph className="card-desc">
                    {t('home.gamification.cardDesc1')}
                  </Paragraph>
                  <Paragraph className="card-desc">
                    {t('home.gamification.cardDesc2')}
                  </Paragraph>
                </div>

                <Button
                  className="experience-btn"
                  size="large"
                  icon={<ArrowRightOutlined />}
                  onClick={() => navigate("/game")}
                >
                  {t('home.gamification.startBtn')}
                </Button>
              </div>
            </Col>
          </Row>
        </div>
      </section>

      {/* 5. Bottom CTA Layout */}
      <section className="bottom-cta-section">
        <img src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355964/sen_web/static/public/images/hoatiettrongdong.png" alt="drum" className={`bg-drum-bottom ${isShaking ? "shaking" : ""}`} />
        <div className="bg-circle-images">
          {/* Using dummy images or reusing specific heritage/artifact images for the circle collage */}
          {sites?.[0] && (
            <div className="circle-img-wrapper side">
              <img src={"https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355894/sen_web/static/public/images/Ellipse_3.png"} alt="Deco" />
            </div>
          )}
          {sites?.[1] && (
            <div className="circle-img-wrapper center">
              <img src={"https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355899/sen_web/static/public/images/Ellipse_4.png"} alt="Deco Main" />
            </div>
          )}
          {sites?.[2] && (
            <div className="circle-img-wrapper side">
              <img src={"https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355906/sen_web/static/public/images/Ellipse_5.png"} alt="Deco" />
            </div>
          )}
        </div>

        <div className="cta-content">
          <Title level={2} className="header-title">
            {t('home.cta.ready')}
          </Title>
          <Paragraph className="cta-desc">{t('home.cta.desc')}</Paragraph>
          <button className="main-cta-btn" onClick={() => navigate("/auth/register")}>
            {t('home.cta.btn')}
          </button>
        </div>
      </section>
    </div>
  );
};

export default Home;
