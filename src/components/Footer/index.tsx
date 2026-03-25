import React from "react";
import { Row, Col, Typography, Input, Button } from "antd";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import "./styles.less";

const logo = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774362654/sen_web/static/src/assets/images/logo2.png";
const lotus_1 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356048/sen_web/static/src/assets/images/background/senhoacum.png";
const lotus_2 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356043/sen_web/static/src/assets/images/background/lotus-2.png";
const lotus_3 = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356045/sen_web/static/src/assets/images/background/lotus-3.png";
const smoke_right = "https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774356059/sen_web/static/src/assets/images/background/smoke-right.png";

const { Title, Text, Paragraph } = Typography;

const Footer: React.FC = () => {
  const { t } = useTranslation();

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
                Email: <span className="highlight">sen.culture.contact@gmail.com</span>
              </Paragraph>
            </div>
          </Col>

          {/* Address */}
          <Col xs={24} md={6}>
            <Title level={4} className="footer-title">
              {t('common.footer.address')}
            </Title>
            <Paragraph className="footer-text">
              {t('common.footer.academy')}
              <br />
              {t('common.footer.addressDetail')}
            </Paragraph>
          </Col>

          {/* Navigation */}
          <Col xs={24} md={5}>
            <Title level={4} className="footer-title">
              {t('common.footer.explore')}
            </Title>
            <nav className="footer-links">
              <Link to="/">{t('nav.home')}</Link>
              <Link to="/heritage-sites">{t('nav.heritage')}</Link>
              <Link to="/artifacts">{t('nav.artifacts')}</Link>
            </nav>
          </Col>

          {/* About */}
          <Col xs={24} md={5}>
            <Title level={4} className="footer-title">
              {t('common.footer.aboutUs')}
            </Title>
            <Paragraph className="footer-text">
              {t('header.slogan')}
            </Paragraph>
            <Paragraph className="footer-text team-name">
              Sen Development Team
            </Paragraph>
          </Col>
        </Row>

        <div className="footer-newsletter">
          <Input.Group compact className="newsletter-group">
            <Input
              placeholder={t('common.footer.newsletterPlaceholder')}
              className="newsletter-input"
            />
            <Button className="newsletter-button">{t('common.footer.newsletterBtn')}</Button>
          </Input.Group>
        </div>

        <div className="footer-bottom">
          <Text className="copyright">
            {t('common.footer.copyright')}
          </Text>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
