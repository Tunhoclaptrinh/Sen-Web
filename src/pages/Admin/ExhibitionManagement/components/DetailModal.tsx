import React from 'react';
import { Modal, Descriptions, Tag, Image, Divider, Typography, Row, Col, Card, Empty } from 'antd';
import { 
    CalendarOutlined, 
    UserOutlined, 
    EyeOutlined,
    PictureOutlined 
} from '@ant-design/icons';
import { Exhibition } from '@/services/exhibition.service';
import { getImageUrl } from '@/utils/image.helper';
import dayjs from 'dayjs';

const { Title, Paragraph } = Typography;

interface ExhibitionDetailModalProps {
    exhibition: Exhibition | null;
    visible: boolean;
    onClose: () => void;
    onViewFull?: (id: number) => void;
}

const ExhibitionDetailModal: React.FC<ExhibitionDetailModalProps> = ({
    exhibition,
    visible,
    onClose,
    onViewFull,
}) => {
    if (!exhibition) return null;

    const getStatusTag = (status: string) => {
        const statusConfig: Record<string, { color: string; text: string }> = {
            published: { color: 'green', text: 'Đã xuất bản' },
            pending: { color: 'orange', text: 'Chờ duyệt' },
            rejected: { color: 'red', text: 'Từ chối' },
            draft: { color: 'default', text: 'Nháp' },
        };
        const config = statusConfig[status] || statusConfig.draft;
        return <Tag color={config.color}>{config.text}</Tag>;
    };

    const imageUrl = exhibition.image && (exhibition.image.startsWith('http') || exhibition.image.startsWith('blob'))
        ? exhibition.image
        : getImageUrl(exhibition.image || '');

    return (
        <Modal
            title={
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <PictureOutlined style={{ fontSize: 20, color: 'var(--primary-color)' }} />
                    <span>Chi tiết Triển lãm</span>
                </div>
            }
            open={visible}
            onCancel={onClose}
            footer={
                onViewFull ? (
                    <div style={{ textAlign: 'center' }}>
                        <a onClick={() => onViewFull(exhibition.id)}>
                            <EyeOutlined /> Xem trang đầy đủ
                        </a>
                    </div>
                ) : null
            }
            width={800}
            centered
        >
            {/* Hero Image */}
            <div 
                style={{ 
                    borderRadius: 12, 
                    overflow: 'hidden', 
                    marginBottom: 24,
                    background: '#f5f5f5',
                    height: 250,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {imageUrl ? (
                    <Image
                        src={imageUrl}
                        alt={exhibition.name}
                        style={{ width: '100%', height: 250, objectFit: 'cover' }}
                        placeholder={<div style={{ background: '#f0f0f0', height: 250 }} />}
                    />
                ) : (
                    <Empty description="Chưa có hình ảnh" image={Empty.PRESENTED_IMAGE_SIMPLE} />
                )}
            </div>

            {/* Title and Status */}
            <div style={{ marginBottom: 16 }}>
                <Title level={4} style={{ marginBottom: 8 }}>{exhibition.name}</Title>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {getStatusTag(exhibition.status || 'draft')}
                    {exhibition.isActive ? (
                        <Tag color="blue">ĐANG MỞ</Tag>
                    ) : (
                        <Tag>ĐÃ ĐÓNG</Tag>
                    )}
                    {exhibition.isPermanent && <Tag color="purple">VĨNH VIỄN</Tag>}
                </div>
            </div>

            <Divider />

            {/* Key Info */}
            <Descriptions column={2} size="small">
                <Descriptions.Item label={<><CalendarOutlined /> Thời gian</>}>
                    {exhibition.isPermanent ? (
                        <Tag color="purple">Vĩnh viễn</Tag>
                    ) : (
                        `${dayjs(exhibition.startDate).format('DD/MM/YYYY')} - ${dayjs(exhibition.endDate).format('DD/MM/YYYY')}`
                    )}
                </Descriptions.Item>
                <Descriptions.Item label={<><UserOutlined /> Người phụ trách</>}>
                    {exhibition.curator || 'Chưa xác định'}
                </Descriptions.Item>
                <Descriptions.Item label="Chủ đề">
                    <Tag>{exhibition.theme || 'Chưa phân loại'}</Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Tác giả">
                    <Tag color="orange">{exhibition.authorName || 'Hệ thống'}</Tag>
                </Descriptions.Item>
            </Descriptions>

            {/* Description */}
            {exhibition.description && (
                <>
                    <Divider orientation="left">Mô tả</Divider>
                    <Paragraph 
                        style={{ 
                            background: '#fafafa', 
                            padding: 16, 
                            borderRadius: 8,
                            maxHeight: 200,
                            overflow: 'auto'
                        }}
                    >
                        <div dangerouslySetInnerHTML={{ __html: exhibition.description }} />
                    </Paragraph>
                </>
            )}

            {/* Related Artifacts Preview */}
            {exhibition.artifactIds && exhibition.artifactIds.length > 0 && (
                <>
                    <Divider orientation="left">Hiện vật liên quan</Divider>
                    <Row gutter={[12, 12]}>
                        {exhibition.artifactIds.slice(0, 4).map((id: number) => (
                            <Col key={id} span={6}>
                                <Card size="small" style={{ textAlign: 'center' }}>
                                    <PictureOutlined style={{ fontSize: 24, color: '#999' }} />
                                    <div style={{ fontSize: 12, marginTop: 4 }}>ID: {id}</div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                </>
            )}
        </Modal>
    );
};

export default ExhibitionDetailModal;
