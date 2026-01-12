import React from "react";
import { Row, Col, Typography, Input, Button } from "antd";
import { Link } from "react-router-dom";
import "./styles.less";

import logo from "@/assets/images/logo2.png";
import lotus_1 from "@/assets/images/background/senhoacum.png";
import lotus_2 from "@/assets/images/background/lotus-2.png";
import lotus_3 from "@/assets/images/background/lotus-3.png";
import smoke_right from "@/assets/images/background/smoke-right.png";

const { Title, Text, Paragraph } = Typography;

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <div className="footer-decorations">
        <img
          src={smoke_right}
          className="smoke-decor smoke-right"
          alt="smoke decoration"
        />
        <img
          src={lotus_1}
          className="lotus-decor lotus-left"
          alt="lotus decoration"
        />
        <img
          src={lotus_2}
          className="lotus-decor lotus-center"
          alt="lotus decoration"
        />
        <img
          src={lotus_3}
          className="lotus-decor lotus-right"
          alt="lotus decoration"
        />
      </div>

      <div className="footer-content">
        <Row gutter={[48, 32]}>
          {/* Logo & Contact */}
          <Col xs={24} md={8}>
            <div className="footer-logo-section">
              <img src={logo} className="footer-logo" alt="SEN Logo" />
              <Paragraph className="footer-contact">
                Email: <span className="highlight">support@sen.com</span>
              </Paragraph>
            </div>
          </Col>

          {/* Address */}
          <Col xs={24} md={6}>
            <Title level={4} className="footer-title">
              Địa chỉ
            </Title>
            <Paragraph className="footer-text">
              Học viện Công nghệ Bưu chính Viễn thông
              <br />
              Km10, Đường Nguyễn Trãi, Q. Hà Đông, Hà Nội
            </Paragraph>
          </Col>

          {/* Navigation */}
          <Col xs={24} md={5}>
            <Title level={4} className="footer-title">
              Khám phá
            </Title>
            <nav className="footer-links">
              <Link to="/">Trang chủ</Link>
              <Link to="/heritage-sites">Di sản</Link>
              <Link to="/artifacts">Hiện vật</Link>
            </nav>
          </Col>

          {/* About */}
          <Col xs={24} md={5}>
            <Title level={4} className="footer-title">
              Về chúng tôi
            </Title>
            <Paragraph className="footer-text">
              Sen - Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ
            </Paragraph>
            <Paragraph className="footer-text team-name">
              Sen Development Team
            </Paragraph>
          </Col>
        </Row>

        <div className="footer-newsletter">
          <Input.Group compact className="newsletter-group">
            <Input
              placeholder="Nhập email của bạn..."
              className="newsletter-input"
            />
            <Button className="newsletter-button">Nhập</Button>
          </Input.Group>
        </div>

        <div className="footer-bottom">
          <Text className="copyright">
            © 2026 Sen. Kiến tạo trải nghiệm lịch sử, văn hoá bằng công nghệ.
          </Text>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
