import { Modal, Descriptions, Tag, Image, Space, Tabs, List, Button } from "antd";
import { EyeOutlined, PlusOutlined, UserOutlined, CalendarOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import dayjs from "dayjs";
import heritageService from "@/services/heritage.service";
import artifactService from "@/services/artifact.service";
import ArticleCard from "@/components/common/cards/ArticleCard";

interface HistoryDetailModalProps {
    open: boolean;
    onCancel: () => void;
    record: any | null;
}

const HistoryDetailModal: React.FC<HistoryDetailModalProps> = ({
    open,
    onCancel,
    record,
}) => {
    const [relatedHeritage, setRelatedHeritage] = useState<any[]>([]);
    const [relatedArtifacts, setRelatedArtifacts] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (open && record?.id) {
                setLoading(true);
                try {
                    const heriIds = record.relatedHeritageIds || [];
                    const artIds = record.relatedArtifactIds || [];

                    const [relHeriRes, relArtRes] = await Promise.all([
                        heriIds.length > 0
                            ? heritageService.getAll({ ids: heriIds.join(',') })
                            : Promise.resolve({ success: true, data: [] }),
                        artIds.length > 0
                            ? artifactService.getAll({ ids: artIds.join(',') })
                            : Promise.resolve({ success: true, data: [] })
                    ]);

                    setRelatedHeritage(relHeriRes.data || []);
                    setRelatedArtifacts(relArtRes.data || []);
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

    const apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';
    const apiHost = apiBase.replace(/\/api$/, '');
    const mainSrc = record.image ? (record.image.startsWith('http') ? record.image : `${apiHost}${record.image}`) : "";

    const gallery = (record.gallery || []).filter(Boolean);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={record.title}
            width={1000}
            footer={null}
        >
            <Tabs defaultActiveKey="content">
                <Tabs.TabPane tab="Nội dung" key="content">
                   <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <Space size="large">
                                <Space><UserOutlined style={{color: '#8c8c8c'}} /> <strong>{record.author || "Khuyết danh"}</strong></Space>
                                <Space><CalendarOutlined style={{color: '#8c8c8c'}} /> {dayjs(record.publishDate).format('DD/MM/YYYY')}</Space>
                                <Tag color={record.isActive ? 'green' : 'red'}>{record.isActive ? 'HIỂN THỊ' : 'ĐÃ ẨN'}</Tag>
                            </Space>
                            <Space><EyeOutlined /> {record.views || 0} lượt xem</Space>
                        </div>

                        {mainSrc && (
                            <Image 
                                src={mainSrc} 
                                width="100%" 
                                style={{ maxHeight: 400, objectFit: 'cover', borderRadius: 8, marginBottom: 20 }} 
                            />
                        )}

                        <div className="article-content" dangerouslySetInnerHTML={{ __html: record.content }} style={{ fontSize: 16, lineHeight: 1.8 }} />
                   </div>
                </Tabs.TabPane>

                <Tabs.TabPane tab="Thông tin bổ sung" key="info">
                    <Descriptions bordered column={1}>
                        <Descriptions.Item label="Tiêu đề bài viết"><strong>{record.title}</strong></Descriptions.Item>
                        <Descriptions.Item label="Mô tả ngắn">{record.shortDescription}</Descriptions.Item>
                        <Descriptions.Item label="Tác giả">{record.author || "Khuyết danh"}</Descriptions.Item>
                        <Descriptions.Item label="Ngày đăng">
                            {record.publishDate ? dayjs(record.publishDate).format('DD/MM/YYYY') : 'N/A'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Ngày cập nhật">
                            {record.updatedAt ? dayjs(record.updatedAt).format('DD/MM/YYYY') : 'Chưa cập nhật'}
                        </Descriptions.Item>
                        <Descriptions.Item label="Số lượt xem">{record.views || 0}</Descriptions.Item>
                    </Descriptions>

                    {gallery.length > 0 && (
                        <div style={{ marginTop: 24 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                                <h4 style={{ margin: 0 }}>Thư viện ảnh ({gallery.length})</h4>
                                <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: 'var(--primary-color)' }} onClick={() => setPreviewVisible(true)}>
                                    Xem tất cả
                                </Button>
                            </div>
                            
                            <div style={{ display: 'none' }}>
                                <Image.PreviewGroup preview={{ visible: previewVisible, onVisibleChange: (vis) => setPreviewVisible(vis) }}>
                                    {gallery.map((img: string, idx: number) => {
                                         const src = img.startsWith('http') ? img : `${apiHost}${img}`;
                                         return <Image key={idx} src={src} />;
                                    })}
                                </Image.PreviewGroup>
                            </div>

                            <Space wrap size="middle">
                                {gallery.slice(0, 5).map((img: string, idx: number) => {
                                     const src = img.startsWith('http') ? img : `${apiHost}${img}`;
                                     return (
                                        <div key={idx} onClick={() => setPreviewVisible(true)} style={{ cursor: 'pointer' }}>
                                            <Image 
                                                width={150} height={100} src={src} preview={false}
                                                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                            />
                                        </div>
                                     );
                                })}
                                {gallery.length > 5 && (
                                     <div 
                                        style={{ 
                                            width: 150, height: 100, borderRadius: 8, background: '#f5f5f5', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', border: '1px solid #eee', flexDirection: 'column', color: '#666'
                                        }}
                                        onClick={() => setPreviewVisible(true)}
                                     >
                                         <PlusOutlined style={{ fontSize: 24, marginBottom: 4 }} />
                                         <span>+{gallery.length - 5} ảnh nữa</span>
                                     </div>
                                )}
                            </Space>
                        </div>
                    )}
                </Tabs.TabPane>

                <Tabs.TabPane tab={`Di sản liên quan (${relatedHeritage.length})`} key="heritage">
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
                        dataSource={relatedHeritage}
                        renderItem={(item) => (
                            <List.Item>
                                <ArticleCard data={item} type="heritage" />
                            </List.Item>
                        )}
                        loading={loading}
                    />
                </Tabs.TabPane>

                <Tabs.TabPane tab={`Hiện vật liên quan (${relatedArtifacts.length})`} key="artifacts">
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
                        dataSource={relatedArtifacts}
                        renderItem={(item) => (
                            <List.Item>
                                <ArticleCard data={item} type="artifact" />
                            </List.Item>
                        )}
                        loading={loading}
                    />
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};

export default HistoryDetailModal;
