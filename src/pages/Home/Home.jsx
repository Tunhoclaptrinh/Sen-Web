// src/pages/Home/Home.jsx
import {
  Button,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Statistic,
  Spin,
  message,
  Tabs,
  Empty,
  Tag,
} from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeritageSites } from "../../store/slices/heritageSlice";
import { fetchArtifacts } from "../../store/slices/artifactSlice";
import { favoriteAPI } from "../../api";
import styles from "./Home.module.css";
import logo from "@/assets/images/logo2.png";
import Background from "@/components/Background";

// Import Pixi
import { Stage } from "@pixi/react";
import SenCharacter from "@/components/SenCharacter";

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const dispatch = useDispatch();
  const { items: sites, loading: sitesLoading } = useSelector(
    (state) => state.heritage,
  );
  const { items: artifacts, loading: artifactsLoading } = useSelector(
    (state) => state.artifact,
  );

  const [favorites, setFavorites] = useState({});
  const [activeTab, setActiveTab] = useState("heritage");

  // State lưu kích thước màn hình để vẽ Stage full screen
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  // Vị trí mặc định của nhân vật (Góc dưới bên phải)
  const [charPosition, setCharPosition] = useState({
    x: window.innerWidth - 240,
    y: window.innerHeight - 360,
  });

  useEffect(() => {
    dispatch(fetchHeritageSites({ _limit: 6 }));
    dispatch(fetchArtifacts({ _limit: 6 }));

    const handleResize = () => {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
      // Cập nhật vị trí nhân vật khi resize (giữ ở góc phải)
      setCharPosition({
        x: window.innerWidth - 200,
        y: window.innerHeight - 200,
      });
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [dispatch]);

  // ... (giữ nguyên logic toggleFavorite)

  return (
    <div className={styles.home} style={{ position: "relative" }}>
      {/* --- LỚP PIXIJS CHARACTER (Overlay) --- */}
      <div
        style={{
          position: "fixed", // Cố định để luôn thấy nhân vật khi cuộn trang
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 50, // Nằm trên Background (z-index: 0) nhưng cẩn thận che nút bấm
          pointerEvents: "none", // QUAN TRỌNG: Cho phép click xuyên qua vùng trống của canvas vào nút bấm bên dưới
        }}
      >
        <Stage
          width={windowSize.width}
          height={windowSize.height}
          options={{ backgroundAlpha: 0 }} // Nền trong suốt
          style={{ width: "100%", height: "100%" }}
        >
          {/* Nhân vật cần nhận sự kiện chuột, Pixi sẽ tự xử lý dù div cha là pointer-events: none */}
          <SenCharacter
            x={charPosition.x}
            y={charPosition.y}
            scale={0.3} // Scale nhỏ lại vì assets gốc khá to (dựa trên offset ~1500px)
          />
        </Stage>
      </div>

      {/* --- NỘI DUNG CHÍNH --- */}
      <div style={{ position: "relative", zIndex: 10 }}>
        <Background
          wrapperStyle={{
            borderRadius: 16,
            paddingBottom: 140,
            marginBottom: 40,
          }}
        >
          {/* ... (Phần code HeroBanner và Stats giữ nguyên như cũ) ... */}
          <div className={styles.heroBanner}>
            <div className={styles.heroContent}>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{
                    width: 360,
                    height: 180,
                    objectFit: "contain",
                    filter: "drop-shadow(0px 4px 6px rgba(0,0,0,0.3))",
                  }}
                />
                <Paragraph
                  style={{
                    color: "#d4a574",
                    fontWeight: 500,
                    marginBottom: 0,
                    marginTop: 12,
                    fontSize: 24,
                  }}
                >
                  Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ
                </Paragraph>
              </div>

              <Space size="large">
                <Link to="/heritage-sites">
                  <Button
                    type="primary"
                    size="large"
                    style={{
                      background: "white",
                      color: "#d4a574",
                      border: "none",
                      fontWeight: "bold",
                    }}
                  >
                    Khám Phá Di Sản
                  </Button>
                </Link>
                <Link to="/artifacts">
                  <Button
                    size="large"
                    style={{
                      borderColor: "white",
                      color: "#d4a574",
                      fontWeight: "bold",
                    }}
                  >
                    Xem Hiện Vật
                  </Button>
                </Link>
              </Space>
            </div>
          </div>

          <div
            style={{
              marginTop: -60,
              marginBottom: 60,
              width: "100%",
              borderRadius: 16,
              padding: "24px 16px",
              background: "rgba(255,255,255,0.08)",
              backdropFilter: "blur(6px)",
              border: "1px solid rgba(255,255,255,0.15)",
              position: "relative",
              zIndex: 20,
            }}
          >
            <Row gutter={[24, 24]}>
              {[
                { label: "Di Sản", value: sites?.length || 0 },
                { label: "Hiện Vật", value: artifacts?.length || 0 },
                { label: "Thành Viên", value: 1250 },
              ].map((item, index) => (
                <Col key={index} xs={24} sm={8}>
                  <div style={{ textAlign: "center" }}>
                    <Statistic
                      title={item.label}
                      value={item.value}
                      valueStyle={{ color: "#d4a574", fontSize: 32 }}
                    />
                  </div>
                </Col>
              ))}
            </Row>
          </div>
        </Background>

        {/* ... (Phần Featured Content - Tabs Di sản & Hiện vật giữ nguyên) ... */}
        <div style={{ marginBottom: 80 }}>
          {/* Code phần Tabs, Card list giữ nguyên như file gốc của bạn */}
          <Title level={2} style={{ fontSize: 32, marginBottom: 8 }}>
            📍 Di Sản & Hiện Vật Nổi Bật
          </Title>
          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={[
              // ... copy nội dung items từ file cũ vào đây
              {
                key: "heritage",
                label: "🏛️ Di Sản",
                children: (
                  <Spin spinning={sitesLoading}>
                    {(!sites || sites.length === 0) && (
                      <Empty description="Chưa có dữ liệu" />
                    )}
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                      {sites?.map((site) => (
                        <Col key={site.id} xs={24} sm={12} md={8}>
                          <Card
                            hoverable
                            style={{ height: "100%" }}
                            cover={
                              <img
                                src={
                                  site.image ||
                                  "https://via.placeholder.com/300x200"
                                }
                                alt={site.name}
                                style={{ height: 200, objectFit: "cover" }}
                              />
                            }
                          >
                            <Title level={4}>{site.name}</Title>
                            <Tag color="gold">{site.region}</Tag>
                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ marginTop: 12 }}
                            >
                              {site.description}
                            </Paragraph>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 12,
                              }}
                            >
                              <Text strong>
                                ⭐ {(site.rating || 0).toFixed(1)}
                              </Text>
                              <Link to={`/heritage-sites/${site.id}`}>
                                <Button type="link" size="small">
                                  Chi Tiết →
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Spin>
                ),
              },
              {
                key: "artifacts",
                label: "🎨 Hiện Vật",
                children: (
                  <Spin spinning={artifactsLoading}>
                    {(!artifacts || artifacts.length === 0) && (
                      <Empty description="Chưa có dữ liệu" />
                    )}
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                      {artifacts?.map((artifact) => (
                        <Col key={artifact.id} xs={24} sm={12} md={8}>
                          <Card
                            hoverable
                            style={{ height: "100%" }}
                            cover={
                              <img
                                src={
                                  artifact.image ||
                                  "https://via.placeholder.com/300x200"
                                }
                                alt={artifact.name}
                                style={{ height: 200, objectFit: "cover" }}
                              />
                            }
                          >
                            <Title level={4}>{artifact.name}</Title>
                            <Tag color="cyan">{artifact.artifact_type}</Tag>
                            <Paragraph
                              ellipsis={{ rows: 2 }}
                              style={{ marginTop: 12 }}
                            >
                              {artifact.description}
                            </Paragraph>
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                marginTop: 12,
                              }}
                            >
                              <Text strong>
                                ⭐ {(artifact.rating || 0).toFixed(1)}
                              </Text>
                              <Link to={`/artifacts/${artifact.id}`}>
                                <Button type="link" size="small">
                                  Chi Tiết →
                                </Button>
                              </Link>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </Spin>
                ),
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
