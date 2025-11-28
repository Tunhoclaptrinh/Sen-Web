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
import {
  HeartOutlined,
  EyeOutlined,
  TeamOutlined,
  ArrowRightOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeritageSites } from "../../store/slices/heritageSlice";
import { fetchArtifacts } from "../../store/slices/artifactSlice";
import { favoriteAPI } from "../../api";
import styles from "./Home.module.css";

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

  useEffect(() => {
    dispatch(fetchHeritageSites({ _limit: 6 }));
    dispatch(fetchArtifacts({ _limit: 6 }));
  }, [dispatch]);

  const toggleFavorite = async (type, id) => {
    try {
      const key = `${type}-${id}`;
      if (favorites[key]) {
        await favoriteAPI.remove(type, id);
        setFavorites({ ...favorites, [key]: false });
        message.success("Đã xóa khỏi yêu thích");
      } else {
        await favoriteAPI.add(type, id);
        setFavorites({ ...favorites, [key]: true });
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div className={styles.home}>
      {/* Hero Banner */}
      <div className={styles.heroBanner}>
        <div className={styles.heroContent}>
          <Title
            level={1}
            style={{ color: "white", marginBottom: 16, fontSize: 48 }}
          >
            🏛️ CultureVault
          </Title>
          <Paragraph
            style={{
              color: "rgba(255,255,255,0.95)",
              fontSize: 18,
              marginBottom: 32,
              maxWidth: 600,
            }}
          >
            Khám phá, bảo tồn và chia sẻ di sản văn hóa số của Việt Nam
          </Paragraph>
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
                  color: "white",
                  fontWeight: "bold",
                }}
              >
                Xem Hiện Vật
              </Button>
            </Link>
          </Space>
        </div>
      </div>

      {/* Stats Section */}
      <div
        style={{
          marginBottom: 64,
          marginTop: -40,
          position: "relative",
          zIndex: 10,
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card
              style={{
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title="Di Sản"
                value={sites?.length || 0}
                valueStyle={{ color: "#d4a574", fontSize: 32 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title="Hiện Vật"
                value={artifacts?.length || 0}
                valueStyle={{ color: "#d4a574", fontSize: 32 }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card
              style={{
                textAlign: "center",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
            >
              <Statistic
                title="Thành Viên"
                value={1250}
                valueStyle={{ color: "#d4a574", fontSize: 32 }}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Featured Content */}
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
                  {!sites || sites.length === 0 ? (
                    <Empty description="Chưa có dữ liệu" />
                  ) : (
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                      {sites.map((site) => (
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
                                  alt={site.name}
                                  src={
                                    site.image ||
                                    "https://via.placeholder.com/300x200"
                                  }
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
                  )}
                </Spin>
              ),
            },
            {
              key: "artifacts",
              label: "🎨 Hiện Vật",
              children: (
                <Spin spinning={artifactsLoading}>
                  {!artifacts || artifacts.length === 0 ? (
                    <Empty description="Chưa có dữ liệu" />
                  ) : (
                    <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
                      {artifacts.map((artifact) => (
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
                                  alt={artifact.name}
                                  src={
                                    artifact.image ||
                                    "https://via.placeholder.com/300x200"
                                  }
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
                  )}
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
