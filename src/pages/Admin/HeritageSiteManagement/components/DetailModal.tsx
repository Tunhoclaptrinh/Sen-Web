import { Modal, Descriptions, Tabs, Tag, Image, Space, List, Timeline, Typography, Button } from "antd";
import { HeritageSite, HeritageTypeLabels, HeritageType } from "@/types/heritage.types";
import { EnvironmentOutlined, StarOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import { useEffect, useState } from "react";
import ArticleCard from "@/components/common/cards/ArticleCard";

interface DetailModalProps {
    open: boolean;
    onCancel: () => void;
    record: HeritageSite | null;
}

const DetailModal: React.FC<DetailModalProps> = ({
    open,
    onCancel,
    record,
}) => {
    const [timeline, setTimeline] = useState<any[]>([]);
    const [artifacts, setArtifacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (open && record?.id) {
                setLoading(true);
                try {
                    const [timelineRes, artifactsRes] = await Promise.all([
                        heritageService.getTimeline(record.id),
                        heritageService.getArtifacts(record.id)
                    ]);
                    setTimeline(timelineRes.data || []);
                    setArtifacts(artifactsRes.data || []);
                } catch (error) {
                    console.error("Failed to load details", error);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchData();
    }, [open, record]);

    if (!record) return null;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={record.name}
            width={1000}
            footer={null}
        >
            <Tabs defaultActiveKey="info" className="heritage-detail-modal-tabs">
                <Tabs.TabPane tab="Thông tin chung" key="info">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tên gọi">{record.name}</Descriptions.Item>
                        <Descriptions.Item label="Hình ảnh">
                             {record.image || record.main_image || (record.images && record.images[0]) ? (
                                <Image 
                                    width={100}
                                    src={(record.image || record.main_image || (record.images && record.images[0]) || "").startsWith('http') 
                                        ? (record.image || record.main_image || (record.images && record.images[0]) || "") 
                                        : `${(import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api').replace(/\/api$/, '')}${record.image || record.main_image || (record.images && record.images[0])}`}
                                    style={{ borderRadius: 4, objectFit: 'cover' }}
                                />
                             ) : <span style={{color: '#999', fontStyle: 'italic'}}>Chưa có ảnh</span>}
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại hình">
                            <Tag color="blue">{HeritageTypeLabels[record.type as HeritageType] || record.type}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Khu vực">{record.region}</Descriptions.Item>
                        <Descriptions.Item label="UNESCO">
                            {record.unesco_listed ? <Tag color="green">Có</Tag> : "Không"}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí" span={2}>
                            <Space>
                                <EnvironmentOutlined />
                                {record.address || "Chưa cập nhật"}
                                {record.latitude && record.longitude && ` (${record.latitude}, ${record.longitude})`}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm thành lập">{record.year_established || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                            <Space><StarOutlined style={{ color: "#faad14" }} /> {record.rating || 0}</Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả ngắn" span={2}>
                            <Typography.Paragraph className="card-desc" ellipsis={{ rows: 3 }}>
                                {record.short_description || record.shortDescription || "Chưa có mô tả ngắn."}
                            </Typography.Paragraph>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả chi tiết" span={2}>
                            {record.description && record.description.length > 300 ? (
                                <>
                                    <div dangerouslySetInnerHTML={{ __html: record.description.substring(0, 300) + '...' }} />
                                    <a 
                                        href={`/heritage-sites/${record.id}`} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        style={{ color: 'var(--primary-color)', fontWeight: 500 }}
                                    >
                                        Xem thêm
                                    </a>
                                </>
                            ) : (
                                <div dangerouslySetInnerHTML={{ __html: record.description || "Chưa có mô tả chi tiết." }} />
                            )}
                        </Descriptions.Item>
                    </Descriptions>

                    {(record.gallery && record.gallery.length > 0) || (record.images && record.images.length > 0) ? (
                        <div style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <h4 style={{ margin: 0 }}>Thư viện ảnh</h4>
                                <Button 
                                    size="small" 
                                    type="text" 
                                    icon={<EyeOutlined />} 
                                    style={{ color: 'var(--primary-color)' }}
                                    onClick={() => setPreviewVisible(true)}
                                >
                                    Xem tất cả
                                </Button>
                            </div>
                            
                            <div style={{ display: 'none' }}>
                                <Image.PreviewGroup
                                    preview={{
                                        visible: previewVisible,
                                        onVisibleChange: (vis) => setPreviewVisible(vis),
                                    }}
                                >
                                    {(record.gallery || record.images || []).map((img, idx) => {
                                         const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
                                         const apiHost = apiBase.replace(/\/api$/, '');
                                         const src = img.startsWith('http') ? img : `${apiHost}${img}`;
                                         return <Image key={idx} src={src} />;
                                    })}
                                </Image.PreviewGroup>
                            </div>

                            <Space wrap size="middle">
                                {(record.gallery || record.images || []).slice(0, 5).map((img, idx) => {
                                     const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
                                     const apiHost = apiBase.replace(/\/api$/, '');
                                     const src = img.startsWith('http') ? img : `${apiHost}${img}`;
                                     return (
                                        <div key={idx} onClick={() => setPreviewVisible(true)} style={{ cursor: 'pointer' }}>
                                            <Image 
                                                width={120} 
                                                height={120}
                                                src={src} 
                                                alt={`${record.name}-${idx}`} 
                                                preview={false}
                                                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                            />
                                        </div>
                                     );
                                })}
                                {(record.gallery || record.images || []).length > 5 && (
                                     <div 
                                        style={{ 
                                            width: 120, 
                                            height: 120, 
                                            borderRadius: 8, 
                                            background: '#f5f5f5', 
                                            display: 'flex', 
                                            alignItems: 'center', 
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            border: '1px solid #eee',
                                            flexDirection: 'column',
                                            color: '#666'
                                        }}
                                        onClick={() => setPreviewVisible(true)}
                                     >
                                         <PlusOutlined style={{ fontSize: 24, marginBottom: 4 }} />
                                         <span>Xem thêm</span>
                                     </div>
                                )}
                            </Space>
                        </div>
                    ) : null}
                </Tabs.TabPane>
                <Tabs.TabPane tab={`Hiện vật (${artifacts.length})`} key="artifacts">
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 3, xxl: 3 }}
                        dataSource={artifacts}
                        pagination={{
                            pageSize: 6,
                            size: "small",
                            hideOnSinglePage: true
                        }}
                        renderItem={(item) => (
                            <List.Item>
                                <ArticleCard 
                                    data={item} 
                                    type="artifact" 
                                    variant="portrait"
                                />
                            </List.Item>
                        )}
                        loading={loading}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Dòng thời gian" key="timeline">
                    <div style={{ padding: '20px 0' }}>
                        <Timeline mode="alternate">
                            {timeline.map((item, index) => (
                                <Timeline.Item key={index} label={item.year}>
                                    <strong>{item.title}</strong>
                                    <p style={{ color: '#666', marginTop: 4 }}>{item.description}</p>
                                </Timeline.Item>
                            ))}
                        </Timeline>
                        {timeline.length === 0 && !loading && (
                            <div style={{ textAlign: "center", fontStyle: "italic", color: "#999" }}>
                                Chưa có dữ liệu dòng thời gian
                            </div>
                        )}
                    </div>
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};

export default DetailModal;
