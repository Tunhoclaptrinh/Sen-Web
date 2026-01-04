import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Row,
  Col,
  Card,
  Button,
  Typography,
  Space,
  Statistic,
  Tag,
} from 'antd';
import {
  ThunderboltOutlined,
  HeartOutlined,
  TrophyOutlined,
  CompassOutlined,
  BookOutlined,
  StarOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { fetchHeritageSites } from '@store/slices/heritageSlice';
import { fetchArtifacts } from '@store/slices/artifactSlice';
import { RootState, AppDispatch } from '@/store';
import Background from '@/components/Background';
import logo from '@/assets/images/logo2.png';
import './styles.less';

const { Title, Paragraph, Text } = Typography;

const Home: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { items: sites } = useSelector((state: RootState) => state.heritage);
  const { items: artifacts } = useSelector((state: RootState) => state.artifact);

  useEffect(() => {
    dispatch(fetchHeritageSites({ _limit: 6 }));
    dispatch(fetchArtifacts({ _limit: 6 }));
  }, [dispatch]);

  const features = [
    {
      icon: <CompassOutlined />,
      title: 'Khám Phá Di Sản',
      description: 'Tìm hiểu hàng ngàn di tích lịch sử và văn hóa Việt Nam',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      link: '/heritage-sites',
      image: 'https://images.unsplash.com/photo-1591018653668-48e8ccc6f163?w=400',
    },
    {
      icon: <BookOutlined />,
      title: 'Hiện Vật Lịch Sử',
      description: 'Khám phá bộ sưu tập hiện vật quý giá qua các thời kỳ',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      link: '/artifacts/browse',
      image: 'https://images.unsplash.com/photo-1513735492246-483525079686?w=400',
    },
    {
      icon: <TrophyOutlined />,
      title: 'Chơi Game Học Tập',
      description: 'Trải nghiệm game hóa với màn chơi và nhiệm vụ thú vị',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      link: '/game/chapters',
      image: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=400',
    },
    {
      icon: <HeartOutlined />,
      title: 'Bộ Sưu Tập Của Tôi',
      description: 'Tạo và quản lý bộ sưu tập các di sản yêu thích',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      link: '/profile/collections',
      image: 'https://images.unsplash.com/photo-1604537529428-15bcbeecfe4d?w=400',
    },
  ];

  return (
    <div className="home-page">
      <Background
        wrapperStyle={{
          borderRadius: 16,
          paddingBottom: 120,
          marginBottom: 40,
        }}
      >
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="logo-container">
              <img src={logo} alt="SEN Logo" className="hero-logo" />
            </div>
            <Title level={1} className="hero-title">
              Khám Phá Văn Hóa Việt Nam
            </Title>
            <Paragraph className="hero-description">
              Kiến tạo trải nghiệm lịch sử, văn hóa bằng công nghệ
            </Paragraph>
            <Space size="large" className="hero-actions">
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate('/game/chapters')}
                className="hero-btn-primary"
              >
                Bắt Đầu Khám Phá
              </Button>
              <Button
                size="large"
                icon={<CompassOutlined />}
                onClick={() => navigate('/heritage-sites')}
                className="hero-btn-secondary"
              >
                Xem Di Sản
              </Button>
            </Space>
          </div>
        </div>

        {/* Stats Section */}
        <div className="stats-section">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={8}>
              <div className="stat-card">
                <Statistic
                  title="Di Sản Văn Hóa"
                  value={sites?.length || 0}
                  suffix="+"
                  valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
                />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="stat-card">
                <Statistic
                  title="Hiện Vật Lịch Sử"
                  value={artifacts?.length || 0}
                  suffix="+"
                  valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
                />
              </div>
            </Col>
            <Col xs={24} sm={8}>
              <div className="stat-card">
                <Statistic
                  title="Người Dùng"
                  value={1250}
                  suffix="+"
                  valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
                />
              </div>
            </Col>
          </Row>
        </div>
      </Background>

      {/* Features Section */}
      <div className="features-section">
        <div className="section-header">
          <Title level={2}>Tính Năng Nổi Bật</Title>
          <Paragraph>Khám phá những tính năng đặc sắc của SEN</Paragraph>
        </div>

        <Row gutter={[24, 24]}>
          {features.map((feature, index) => (
            <Col xs={24} sm={12} lg={6} key={index}>
              <Card
                hoverable
                className="feature-card"
                onClick={() => navigate(feature.link)}
                cover={
                  <div
                    className="feature-cover"
                    style={{ background: feature.gradient }}
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="feature-image"
                    />
                    <div className="feature-overlay">
                      <div className="feature-icon">{feature.icon}</div>
                    </div>
                  </div>
                }
              >
                <Card.Meta
                  title={<Text strong>{feature.title}</Text>}
                  description={
                    <Paragraph ellipsis={{ rows: 2 }} className="feature-desc">
                      {feature.description}
                    </Paragraph>
                  }
                />
                <Button type="link" className="feature-link">
                  Khám Phá <RightOutlined />
                </Button>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Heritage Sites */}
      <div className="featured-section">
        <div className="section-header">
          <div>
            <Title level={2}>Di Sản Nổi Bật</Title>
            <Paragraph>Khám phá những di sản văn hóa độc đáo</Paragraph>
          </div>
          <Link to="/heritage-sites">
            <Button type="primary">
              Xem Tất Cả <RightOutlined />
            </Button>
          </Link>
        </div>

        <Row gutter={[24, 24]}>
          {sites?.slice(0, 3).map((site) => (
            <Col xs={24} sm={12} lg={8} key={site.id}>
              <Card
                hoverable
                className="content-card"
                cover={
                  <div className="content-cover">
                    <img
                      src={
                        (site.images && site.images.length > 0
                          ? site.images[0]
                          : site.main_image) || 'https://via.placeholder.com/400x300'
                      }
                      alt={site.name}
                    />
                    <div className="content-overlay">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate(`/heritage-sites/${site.id}`)}
                      >
                        Xem Chi Tiết
                      </Button>
                    </div>
                  </div>
                }
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Title level={4} ellipsis={{ rows: 1 }}>
                    {site.name}
                  </Title>
                  <Space>
                    <Tag color="gold">{site.region}</Tag>
                    {site.unesco_listed && <Tag color="blue">UNESCO</Tag>}
                  </Space>
                  <Paragraph ellipsis={{ rows: 2 }} className="content-desc">
                    {site.description}
                  </Paragraph>
                  <div className="content-meta">
                    <Space>
                      <StarOutlined style={{ color: '#faad14' }} />
                      <Text strong>{(site.rating || 0).toFixed(1)}</Text>
                    </Space>
                    <Text type="secondary">{site.total_reviews || 0} đánh giá</Text>
                  </div>
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* Featured Artifacts */}
      <div className="featured-section">
        <div className="section-header">
          <div>
            <Title level={2}>Hiện Vật Tiêu Biểu</Title>
            <Paragraph>Những hiện vật lịch sử quý giá</Paragraph>
          </div>
          <Link to="/artifacts/browse">
            <Button type="primary">
              Xem Tất Cả <RightOutlined />
            </Button>
          </Link>
        </div>

        <Row gutter={[24, 24]}>
          {artifacts?.slice(0, 3).map((artifact) => (
            <Col xs={24} sm={12} lg={8} key={artifact.id}>
              <Card
                hoverable
                className="content-card"
                cover={
                  <div className="content-cover">
                    <img
                      src={
                        (artifact.images && artifact.images.length > 0
                          ? artifact.images[0]
                          : null) || 'https://via.placeholder.com/400x300'
                      }
                      alt={artifact.name}
                    />
                    <div className="content-overlay">
                      <Button
                        type="primary"
                        size="large"
                        onClick={() => navigate(`/artifacts/${artifact.id}`)}
                      >
                        Xem Chi Tiết
                      </Button>
                    </div>
                  </div>
                }
              >
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Title level={4} ellipsis={{ rows: 1 }}>
                    {artifact.name}
                  </Title>
                  <Space>
                    <Tag color="cyan">{artifact.artifact_type}</Tag>
                    {artifact.is_on_display && (
                      <Tag color="green">Đang trưng bày</Tag>
                    )}
                  </Space>
                  <Paragraph ellipsis={{ rows: 2 }} className="content-desc">
                    {artifact.description}
                  </Paragraph>
                  {artifact.year_created && (
                    <Text type="secondary">Năm: {artifact.year_created}</Text>
                  )}
                </Space>
              </Card>
            </Col>
          ))}
        </Row>
      </div>

      {/* CTA Section */}
      <div className="cta-section">
        <Card className="cta-card">
          <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
            <Title level={2}>Sẵn Sàng Khám Phá?</Title>
            <Paragraph style={{ fontSize: 16 }}>
              Tham gia cùng hàng ngàn người dùng đang khám phá lịch sử văn hóa Việt Nam
            </Paragraph>
            <Space size="large">
              <Button
                type="primary"
                size="large"
                icon={<ThunderboltOutlined />}
                onClick={() => navigate('/game/chapters')}
              >
                Bắt Đầu Ngay
              </Button>
              <Button
                size="large"
                onClick={() => navigate('/auth/register')}
              >
                Đăng Ký Miễn Phí
              </Button>
            </Space>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default Home;
