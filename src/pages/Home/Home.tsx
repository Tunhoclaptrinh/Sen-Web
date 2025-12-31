import {
  Button,
  Row,
  Col,
  Card,
  Typography,
  Space,
  Statistic,
  Spin,
  Tabs,
  Empty,
  Tag,
} from "antd";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeritageSites } from "../../store/slices/heritageSlice";
import { fetchArtifacts } from "../../store/slices/artifactSlice";
import styles from "./Home.module.css";
import logo from "@/assets/images/logo2.png";
import Background from "@/components/Background";
import { RootState } from "@/store";
import { AppDispatch } from "@/store";

const { Title, Paragraph, Text } = Typography;

const Home = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { items: sites, loading: sitesLoading } = useSelector(
    (state: RootState) => state.heritage,
  );
  const { items: artifacts, loading: artifactsLoading } = useSelector(
    (state: RootState) => state.artifact,
  );

  const [activeTab, setActiveTab] = useState("heritage");

  useEffect(() => {
    dispatch(fetchHeritageSites({ _limit: 6 }));
    dispatch(fetchArtifacts({ _limit: 6 }));
  }, [dispatch]);

  return (
    <div className={styles.home}>
      <Background
        wrapperStyle={{
          borderRadius: 16,
          paddingBottom: 140, // tạo không gian cho Stats lọt vào
          marginBottom: 40,
        }}
      >
        {/* ---------------- HERO ---------------- */}
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

        {/* ---------------- STATS ---------------- */}
        <div
          style={{
            marginTop: -60, // kéo lên chui vào background
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

      {/* ---------------- FEATURED CONTENT ---------------- */}
      <div style={{ marginBottom: 80 }}>
        <Title level={2} style={{ fontSize: 32, marginBottom: 8 }}>
          📍 Di Sản & Hiện Vật Nổi Bật
        </Title>

        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
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
                            <div
                              style={{
                                height: 200,
                                overflow: "hidden",
                                background: "#f0f0f0",
                              }}
                            >
                              <img
                                src={
                                  (site.images && site.images.length > 0
                                    ? site.images[0]
                                    : site.main_image) ||
                                  "https://via.placeholder.com/300x200"
                                }
                                alt={site.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
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
                            <div
                              style={{
                                height: 200,
                                overflow: "hidden",
                                background: "#f0f0f0",
                              }}
                            >
                              <img
                                src={
                                  (artifact.images && artifact.images.length > 0
                                    ? artifact.images[0]
                                    : null) ||
                                  "https://via.placeholder.com/300x200"
                                }
                                alt={artifact.name}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover",
                                }}
                              />
                            </div>
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
  );
};

export default Home;
