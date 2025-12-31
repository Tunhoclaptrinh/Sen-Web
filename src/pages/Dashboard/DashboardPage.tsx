// ============================================
// src/pages/Dashboard/DashboardPage.tsx
// ============================================
import React, { useEffect, useState } from "react";
import { Row, Col, Card, Statistic, Typography, Space, Button } from "antd";
import {
  BankOutlined,
  ShoppingOutlined,
  HeartOutlined,
  StarOutlined,
  EyeOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import heritageService from "../../services/heritage.service";
import artifactService from "../../services/artifact.service";

const { Title, Text, Paragraph } = Typography;

const DashboardPage = () => {
  const [stats, setStats] = useState({
    heritageCount: 0,
    artifactCount: 0,
    favoriteCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);

      // Fetch heritage sites count
      const heritageResponse = await heritageService.getAll({ _limit: 1 });
      const heritageCount = heritageResponse.metadata?.total || 0;

      // Fetch artifacts count
      const artifactResponse = await artifactService.getAll({ _limit: 1 });
      const artifactCount = artifactResponse.metadata?.total || 0;

      setStats({
        heritageCount,
        artifactCount,
        favoriteCount: 0, // Will implement later
      });
    } catch (error) {
      console.error("Failed to load stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: "Di Sản Văn Hóa",
      value: stats.heritageCount,
      icon: <BankOutlined />,
      color: "#1890ff",
      path: "/heritage",
    },
    {
      title: "Hiện Vật",
      value: stats.artifactCount,
      icon: <ShoppingOutlined />,
      color: "#52c41a",
      path: "/artifacts",
    },
    {
      title: "Yêu Thích",
      value: stats.favoriteCount,
      icon: <HeartOutlined />,
      color: "#f5222d",
      path: "/favorites",
    },
    {
      title: "Đánh Giá",
      value: 0,
      icon: <StarOutlined />,
      color: "#faad14",
      path: "/reviews",
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      {/* Welcome Section */}
      <Card style={{ marginBottom: 24 }}>
        <Space direction="vertical" size="small">
          <Title level={2} style={{ margin: 0 }}>
            Xin chào, {user?.name}! 👋
          </Title>
          <Paragraph type="secondary" style={{ margin: 0, fontSize: 16 }}>
            Chào mừng bạn đến với hệ thống quản lý di sản văn hóa SEN
          </Paragraph>
        </Space>
      </Card>

      {/* Statistics Cards */}
      <Row gutter={[24, 24]} style={{ marginBottom: 24 }}>
        {statCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card
              hoverable
              loading={loading}
              onClick={() => navigate(card.path)}
              style={{ cursor: "pointer" }}
            >
              <Statistic
                title={card.title}
                value={card.value}
                prefix={
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 8,
                      background: `${card.color}20`,
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      marginRight: 12,
                    }}
                  >
                    {React.cloneElement(card.icon, {
                      style: { fontSize: 24, color: card.color },
                    })}
                  </div>
                }
                valueStyle={{ fontSize: 28, fontWeight: 600 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      {/* Quick Actions */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <Card
            title="Khám Phá Di Sản"
            extra={
              <Button type="link" onClick={() => navigate("/heritage")}>
                Xem Tất Cả
              </Button>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <BankOutlined style={{ fontSize: 48, color: "#1890ff" }} />
                <Paragraph style={{ marginTop: 16 }}>
                  Khám phá các di sản văn hóa quý báu của Việt Nam
                </Paragraph>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => navigate("/heritage")}
                >
                  Khám Phá Ngay
                </Button>
              </div>
            </Space>
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title="Hiện Vật Lịch Sử"
            extra={
              <Button type="link" onClick={() => navigate("/artifacts")}>
                Xem Tất Cả
              </Button>
            }
          >
            <Space direction="vertical" size="middle" style={{ width: "100%" }}>
              <div style={{ padding: "24px 0", textAlign: "center" }}>
                <ShoppingOutlined style={{ fontSize: 48, color: "#52c41a" }} />
                <Paragraph style={{ marginTop: 16 }}>
                  Tìm hiểu về các hiện vật lịch sử độc đáo
                </Paragraph>
                <Button
                  type="primary"
                  icon={<EyeOutlined />}
                  onClick={() => navigate("/artifacts")}
                >
                  Xem Hiện Vật
                </Button>
              </div>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* System Info */}
      <Card style={{ marginTop: 24 }} title="Thông Tin Hệ Thống">
        <Row gutter={[16, 16]}>
          <Col span={8}>
            <Text strong>Phiên Bản:</Text>
            <br />
            <Text>v2.0.0</Text>
          </Col>
          <Col span={8}>
            <Text strong>API Status:</Text>
            <br />
            <Text type="success">● Connected</Text>
          </Col>
          <Col span={8}>
            <Text strong>Người Dùng:</Text>
            <br />
            <Text>{user?.email}</Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default DashboardPage;
