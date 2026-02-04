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
    message, // Added message
    Breadcrumb
} from 'antd';
// ... icons
import { useAuth } from '@/hooks/useAuth'; // Added useAuth
import { 
    ArrowLeftOutlined, 
    CalendarOutlined, 
    UserOutlined, 
    EditOutlined,
    PictureOutlined,
    TagOutlined,
    EyeOutlined
} from '@ant-design/icons';
import exhibitionService, { Exhibition } from '@/services/exhibition.service';
import { getImageUrl } from '@/utils/image.helper';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const ExhibitionDetailPage: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [exhibition, setExhibition] = useState<Exhibition | null>(null);
    const [loading, setLoading] = useState(true);

    const { user } = useAuth(); // Import useAuth

    useEffect(() => {
        const fetchExhibition = async () => {
            if (!id) return;
            setLoading(true);
            try {
                const response = await exhibitionService.getById(Number(id));
                if (response.success && response.data) {
                    // Security Check for Researchers
                    if (user?.role === 'researcher' && response.data.createdBy !== user.id) {
                        message.error('Bạn không có quyền xem triển lãm này');
                        navigate('/researcher/exhibitions');
                        return;
                    }
                    setExhibition(response.data);
                }
            } catch (error) {
                console.error('Error fetching exhibition:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchExhibition();
    }, [id, user]);

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            published: { color: 'green', text: 'Đã xuất bản' },
            pending: { color: 'orange', text: 'Chờ duyệt' },
            rejected: { color: 'red', text: 'Từ chối' },
            draft: { color: 'default', text: 'Nháp' },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return <Tag color={config.color} style={{ fontSize: 14, padding: '4px 12px' }}>{config.text}</Tag>;
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
                <Spin size="large" tip="Đang tải..." />
            </div>
        );
    }

    if (!exhibition) {
        return (
            <Card>
                <Empty description="Không tìm thấy triển lãm" />
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <Button onClick={() => navigate(-1)}>Quay lại</Button>
                </div>
            </Card>
        );
    }

    const imageUrl = exhibition.image && (exhibition.image.startsWith('http') || exhibition.image.startsWith('blob'))
        ? exhibition.image
        : getImageUrl(exhibition.image || '');

    return (
        <div style={{ padding: '0 0 24px 0' }}>
            {/* Breadcrumb */}
            <Breadcrumb style={{ marginBottom: 16 }}>
                <Breadcrumb.Item>
                    <a onClick={() => navigate(-1)}>Triển lãm</a>
                </Breadcrumb.Item>
                <Breadcrumb.Item>{exhibition.name}</Breadcrumb.Item>
            </Breadcrumb>

            {/* Back Button */}
            <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={() => navigate(-1)}
                style={{ marginBottom: 16 }}
            >
                Quay lại danh sách
            </Button>

            {/* Hero Section */}
            <Card bordered={false} style={{ marginBottom: 24 }}>
                <Row gutter={24}>
                    {/* Image */}
                    <Col xs={24} md={10}>
                        <div 
                            style={{ 
                                borderRadius: 12, 
                                overflow: 'hidden', 
                                background: '#f5f5f5',
                                height: 300,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                        >
                            {imageUrl ? (
                                <Image
                                    src={imageUrl}
                                    alt={exhibition.name}
                                    style={{ width: '100%', height: 300, objectFit: 'cover' }}
                                    placeholder={<div style={{ background: '#f0f0f0', height: 300 }} />}
                                />
                            ) : (
                                <Empty description="Chưa có hình ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            )}
                        </div>
                    </Col>

                    {/* Info */}
                    <Col xs={24} md={14}>
                        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                            {/* Title */}
                            <Title level={2} style={{ marginBottom: 12 }}>
                                <PictureOutlined style={{ marginRight: 12, color: 'var(--primary-color)' }} />
                                {exhibition.name}
                            </Title>

                            {/* Status Tags */}
                            <Space style={{ marginBottom: 16 }}>
                                {getStatusTag(exhibition.status || 'draft')}
                                {exhibition.isActive ? (
                                    <Tag color="blue" style={{ fontSize: 14, padding: '4px 12px' }}>ĐANG MỞ</Tag>
                                ) : (
                                    <Tag style={{ fontSize: 14, padding: '4px 12px' }}>ĐÃ ĐÓNG</Tag>
                                )}
                                {exhibition.isPermanent && (
                                    <Tag color="purple" style={{ fontSize: 14, padding: '4px 12px' }}>VĨNH VIỄN</Tag>
                                )}
                            </Space>

                            {/* Key Details */}
                            <Descriptions column={1} size="small" style={{ marginBottom: 16 }}>
                                <Descriptions.Item label={<><CalendarOutlined /> Thời gian</>}>
                                    {exhibition.isPermanent ? (
                                        <Text strong style={{ color: 'var(--primary-color)' }}>Triển lãm vĩnh viễn</Text>
                                    ) : (
                                        <Text>
                                            {dayjs(exhibition.startDate).format('DD/MM/YYYY')} - {dayjs(exhibition.endDate).format('DD/MM/YYYY')}
                                        </Text>
                                    )}
                                </Descriptions.Item>
                                <Descriptions.Item label={<><UserOutlined /> Người phụ trách</>}>
                                    {exhibition.curator || 'Chưa xác định'}
                                </Descriptions.Item>
                                <Descriptions.Item label={<><TagOutlined /> Chủ đề</>}>
                                    <Tag>{exhibition.theme || 'Chưa phân loại'}</Tag>
                                </Descriptions.Item>
                                <Descriptions.Item label={<><EditOutlined /> Tác giả</>}>
                                    <Tag color="orange">{exhibition.authorName || 'Hệ thống'}</Tag>
                                </Descriptions.Item>
                                {exhibition.visitorCount !== undefined && (
                                    <Descriptions.Item label={<><EyeOutlined /> Lượt xem</>}>
                                        <Text strong>{exhibition.visitorCount.toLocaleString()}</Text>
                                    </Descriptions.Item>
                                )}
                            </Descriptions>
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Description Section */}
            {exhibition.description && (
                <Card 
                    title="Mô tả triển lãm" 
                    bordered={false}
                    style={{ marginBottom: 24 }}
                >
                    <div 
                        dangerouslySetInnerHTML={{ __html: exhibition.description }}
                        style={{ lineHeight: 1.8 }}
                    />
                </Card>
            )}

            {/* Related Artifacts */}
            {exhibition.artifactIds && exhibition.artifactIds.length > 0 && (
                <Card 
                    title={`Hiện vật trong triển lãm (${exhibition.artifactIds.length})`}
                    bordered={false}
                >
                    <Row gutter={[16, 16]}>
                        {exhibition.artifactIds.map((artifactId: number) => (
                            <Col key={artifactId} xs={12} sm={8} md={6} lg={4}>
                                <Card 
                                    hoverable
                                    size="small"
                                    style={{ textAlign: 'center' }}
                                    cover={
                                        <div style={{ 
                                            height: 120, 
                                            background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8e8 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <PictureOutlined style={{ fontSize: 32, color: '#999' }} />
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
        </div>
    );
};

export default ExhibitionDetailPage;
