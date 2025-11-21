import React from "react";
import { Typography, Button, Row, Col, Card, Statistic } from "antd";
import {
  RocketOutlined,
  BankOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";

const { Title, Paragraph } = Typography;

const Home = () => {
  return (
    <div>
      {/* Hero Section */}
      <div
        style={{
          textAlign: "center",
          padding: "60px 0",
          background: "linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)",
          borderRadius: "8px",
          marginBottom: "40px",
        }}
      >
        <Title level={1} style={{ color: "#d4a574" }}>
          Khám Phá Di Sản Văn Hóa Việt Nam
        </Title>
        <Paragraph
          style={{ fontSize: "18px", maxWidth: "700px", margin: "0 auto 30px" }}
        >
          CultureVault là nền tảng số hóa giúp bạn tìm hiểu, lưu trữ và chia sẻ
          những giá trị văn hóa lịch sử độc đáo. Kết nối quá khứ với hiện tại
          ngay hôm nay.
        </Paragraph>
        <Link to="/heritage-sites">
          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            style={{ height: "50px", padding: "0 40px" }}
          >
            Bắt đầu khám phá
          </Button>
        </Link>
      </div>

      {/* Features / Stats */}
      <Row gutter={16} style={{ textAlign: "center" }}>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Di tích được số hóa"
              value={128}
              prefix={<BankOutlined style={{ color: "#d4a574" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic
              title="Hiện vật trưng bày"
              value={3500}
              prefix={<RocketOutlined style={{ color: "#1890ff" }} />}
            />
          </Card>
        </Col>
        <Col span={8}>
          <Card bordered={false}>
            <Statistic title="Người dùng tham gia" value={950} suffix="+" />
          </Card>
        </Col>
      </Row>

      {/* Quick Links Section */}
      <div style={{ marginTop: "40px" }}>
        <Title level={3}>Danh mục nổi bật</Title>
        <Row gutter={[16, 16]}>
          {["Kiến trúc cổ", "Mỹ thuật", "Tư liệu lịch sử", "Gốm sứ"].map(
            (item, index) => (
              <Col xs={24} sm={12} md={6} key={index}>
                <Card hoverable style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "30px", marginBottom: "10px" }}>
                    🏺
                  </div>
                  <div style={{ fontWeight: "bold" }}>{item}</div>
                </Card>
              </Col>
            ),
          )}
        </Row>
      </div>
    </div>
  );
};

export default Home;
