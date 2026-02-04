import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    Card, 
    Typography, 
    Tag, 
    Row, 
    Col, 
    Image, 
    Spin, 
    Button, 
    Descriptions,
    Empty,
    Space,
    Breadcrumb
} from 'antd';
import { 
    ArrowLeftOutlined, 
    CalendarOutlined, 
    UserOutlined, 
    PictureOutlined,
    TagOutlined,
    EyeOutlined,
    HomeOutlined
} from '@ant-design/icons';
import exhibitionService, { Exhibition } from '@/services/exhibition.service';
import { getImageUrl } from '@/utils/image.helper';
import dayjs from 'dayjs';
import './styles.less';

const { Title, Text, Paragraph } = Typography;

const ExhibitionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exhibition, setExhibition] = useState<Exhibition | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchExhibition = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await exhibitionService.getById(Number(id));
                if (response.success && response.data) {
                    setExhibition(response.data);
                }
            } catch (error) {
                console.error('Error fetching exhibition:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExhibition();
    }, [id]);

    if (loading) {
        return (
            <div className="exhibition-detail-page">
                <div className="loading-container">
                    <Spin size="large" tip="Đang tải..." />
                </div>
            </div>
        );
    }

    if (!exhibition) {
        return (
            <div className="exhibition-detail-page">
                <Card>
                    <Empty description="Không tìm thấy triển lãm" />
                    <div style={{ textAlign: 'center', marginTop: 16 }}>
                        <Button onClick={() => navigate('/exhibitions')}>Quay lại</Button>
                    </div>
                </Card>
            </div>
        );
    }

    const imageUrl = exhibition.image && (exhibition.image.startsWith('http') || exhibition.image.startsWith('blob'))
        ? exhibition.image
        : getImageUrl(exhibition.image || '');

    return (
        <div className="exhibition-detail-page">
            {/* Breadcrumb */}
            <Breadcrumb className="breadcrumb">
                <Breadcrumb.Item href="/">
                    <HomeOutlined /> Trang chủ
                </Breadcrumb.Item>
                <Breadcrumb.Item href="/exhibitions">
                    <PictureOutlined /> Triển lãm
                </Breadcrumb.Item>
                <Breadcrumb.Item>{exhibition.name}</Breadcrumb.Item>
            </Breadcrumb>

            {/* Hero Section */}
            <div className="hero-section">
                <div className="hero-image">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={exhibition.name}
                            style={{ width: '100%', height: 400, objectFit: 'cover' }}
                            placeholder={<div style={{ background: '#f0f0f0', height: 400 }} />}
                        />
                    ) : (
                        <div className="no-image">
                            <PictureOutlined style={{ fontSize: 48 }} />
                            <span>Chưa có hình ảnh</span>
                        </div>
                    )}
                </div>
                
                <div className="hero-overlay">
                    <div className="hero-content">
                        <Space style={{ marginBottom: 16 }}>
                            {exhibition.isPermanent && <Tag color="purple" className="big-tag">VĨNH VIỄN</Tag>}
                            {exhibition.theme && <Tag className="big-tag">{exhibition.theme}</Tag>}
                        </Space>
                        <Title level={1} className="hero-title">{exhibition.name}</Title>
                        <div className="hero-meta">
                            <span><CalendarOutlined /> {exhibition.isPermanent 
                                ? 'Triển lãm thường trực'
                                : `${dayjs(exhibition.startDate).format('DD/MM/YYYY')} - ${dayjs(exhibition.endDate).format('DD/MM/YYYY')}`
                            }</span>
                            {exhibition.curator && <span><UserOutlined /> {exhibition.curator}</span>}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="content-section">
                <Row gutter={24}>
                    <Col xs={24} md={16}>
                        {/* Description */}
                        <Card title="Giới thiệu" className="content-card">
                            {exhibition.description ? (
                                <div 
                                    className="description-content"
                                    dangerouslySetInnerHTML={{ __html: exhibition.description }}
                                />
                            ) : (
                                <Paragraph type="secondary">Chưa có mô tả</Paragraph>
                            )}
                        </Card>

                        {/* Artifacts */}
                        {exhibition.artifactIds && exhibition.artifactIds.length > 0 && (
                            <Card title={`Hiện vật trong triển lãm (${exhibition.artifactIds.length})`} className="content-card">
                                <Row gutter={[16, 16]}>
                                    {exhibition.artifactIds.map((artifactId: number) => (
                                        <Col key={artifactId} xs={12} sm={8} md={6}>
                                            <Card 
                                                hoverable
                                                size="small"
                                                onClick={() => navigate(`/artifacts/${artifactId}`)}
                                                cover={
                                                    <div className="artifact-placeholder">
                                                        <PictureOutlined />
                                                    </div>
                                                }
                                            >
                                                <Card.Meta 
                                                    title={<Text type="secondary" style={{ fontSize: 12 }}>Hiện vật #{artifactId}</Text>}
                                                />
                                            </Card>
                                        </Col>
                                    ))}
                                </Row>
                            </Card>
                        )}
                    </Col>

                    <Col xs={24} md={8}>
                        {/* Quick Info */}
                        <Card title="Thông tin" className="info-card">
                            <Descriptions column={1} size="small">
                                <Descriptions.Item label={<><CalendarOutlined /> Thời gian</>}>
                                    {exhibition.isPermanent ? (
                                        <Text strong style={{ color: 'var(--primary-color)' }}>Vĩnh viễn</Text>
                                    ) : (
                                        <Text>
                                            {dayjs(exhibition.startDate).format('DD/MM/YYYY')} - {dayjs(exhibition.endDate).format('DD/MM/YYYY')}
                                        </Text>
                                    )}
                                </Descriptions.Item>
                                {exhibition.curator && (
                                    <Descriptions.Item label={<><UserOutlined /> Phụ trách</>}>
                                        {exhibition.curator}
                                    </Descriptions.Item>
                                )}
                                {exhibition.theme && (
                                    <Descriptions.Item label={<><TagOutlined /> Chủ đề</>}>
                                        <Tag>{exhibition.theme}</Tag>
                                    </Descriptions.Item>
                                )}
                                {exhibition.visitorCount !== undefined && (
                                    <Descriptions.Item label={<><EyeOutlined /> Lượt xem</>}>
                                        <Text strong>{exhibition.visitorCount.toLocaleString()}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </Card>

                        {/* Back button */}
                        <Button 
                            icon={<ArrowLeftOutlined />} 
                            onClick={() => navigate('/exhibitions')}
                            block
                            style={{ marginTop: 16 }}
                        >
                            Quay lại danh sách
                        </Button>
                    </Col>
                </Row>
            </div>
        </div>
    );
};

export default ExhibitionDetailPage;
