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
} from "antd";
import { HeartOutlined, EyeOutlined, TeamOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeritageSites } from "@store/slices/heritageSlice";
import styles from "./Home.module.css";

const { Title, Paragraph } = Typography;

const Home = () => {
  const dispatch = useDispatch();
  const {
    items: sites,
    loading,
    error,
  } = useSelector((state) => state.heritage);

  useEffect(() => {
    dispatch(fetchHeritageSites({ _limit: 6 }));
  }, [dispatch]);

  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  return (
    <div className={styles.home}>
      {/* Hero Section */}
      <div
        style={{
          background: "linear-gradient(135deg, #d4a574 0%, #8b6f47 100%)",
          color: "white",
          padding: "60px 24px",
          textAlign: "center",
          borderRadius: 12,
          marginBottom: 32,
        }}
      >
        <Title level={2} style={{ color: "white", marginBottom: 16 }}>
          🏛️ Chào mừng đến CultureVault
        </Title>
        <Paragraph style={{ color: "rgba(255,255,255,0.9)", fontSize: 16 }}>
          Khám phá, bảo tồn và chia sẻ di sản văn hóa số của Việt Nam
        </Paragraph>
        <Space>
          <Link to="/heritage-sites">
            <Button
              type="primary"
              size="large"
              style={{ background: "white", color: "#d4a574" }}
            >
              Khám Phá Di Sản
            </Button>
          </Link>
          <Link to="/artifacts">
            <Button
              type="default"
              size="large"
              style={{ borderColor: "white", color: "white" }}
            >
              Xem Hiện Vật
            </Button>
          </Link>
        </Space>
      </div>

      {/* Stats Section */}
      <div style={{ marginBottom: 48 }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: "center" }}>
              <Statistic
                title="Di Sản Nổi Bật"
                value={sites.length}
                prefix={<EyeOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: "center" }}>
              <Statistic
                title="Hiện Vật"
                value={1250}
                prefix={<HeartOutlined />}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card style={{ textAlign: "center" }}>
              <Statistic
                title="Thành Viên"
                value={5400}
                prefix={<TeamOutlined />}
              />
            </Card>
          </Col>
        </Row>
      </div>

      {/* Featured Heritage Sites */}
      <div>
        <Title level={3} style={{ marginBottom: 24 }}>
          📍 Di Sản Nổi Bật
        </Title>
        <Spin spinning={loading}>
          <Row gutter={[24, 24]}>
            {sites.map((site) => (
              <Col key={site.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  style={{ height: "100%" }}
                  cover={
                    <img
                      alt={site.name}
                      src={site.image}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                >
                  <Title level={5}>{site.name}</Title>
                  <Paragraph ellipsis={{ rows: 2 }}>
                    {site.description}
                  </Paragraph>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>⭐ {site.rating || "N/A"}</span>
                    <Link to={`/heritage-sites/${site.id}`}>
                      <Button type="link">Chi Tiết →</Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Spin>
      </div>
    </div>
  );
};

export default Home;
