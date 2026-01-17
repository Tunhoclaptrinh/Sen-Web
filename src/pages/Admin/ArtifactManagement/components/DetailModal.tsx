import { Modal, Descriptions, Tag, Image, Space, Tabs, List, Typography, Button } from "antd";
import { Artifact, ArtifactTypeLabels, ArtifactCondition, ArtifactConditionLabels } from "@/types";
import { StarOutlined, EnvironmentOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import ArticleCard from "@/components/common/cards/ArticleCard";
import { getImageUrl, resolveImage } from "@/utils/image.helper";

interface DetailModalProps {
    open: boolean;
    onCancel: () => void;
    record: Artifact | null;
}

const DetailModal: React.FC<DetailModalProps> = ({
    open,
    onCancel,
    record,
}) => {
    const [relatedHeritage, setRelatedHeritage] = useState<any[]>([]);
    const [relatedHistory, setRelatedHistory] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (open && record?.id) {
                setLoading(true);
                try {
                    const heriIds = record.related_heritage_ids || [];
                    const historyIds = record.related_history_ids || [];

                    const [relHeriRes, relHistoryRes] = await Promise.all([
                        heriIds.length > 0
                            ? heritageService.getAll({ ids: heriIds.join(',') })
                            : Promise.resolve({ success: true, data: [] }),
                        historyIds.length > 0
                            ? historyService.getAll({ ids: historyIds.join(',') })
                            : Promise.resolve({ success: true, data: [] })
                    ]);

                    setRelatedHeritage(relHeriRes.data || []);
                    setRelatedHistory(relHistoryRes.data || []);
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

    const mainImg = resolveImage(record.image) || resolveImage(record.images && record.images[0]);
    const mainSrc = getImageUrl(mainImg);

    const galleryRaw = [
        ...(record.gallery || []),
        ...(record.images || [])
    ];
    
    // Flatten if needed (though usually likely strings), and unique
    const gallery = Array.from(new Set(galleryRaw.flat())).filter(Boolean);

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={record.name}
            width={1000}
            footer={null}
        >
            <Tabs defaultActiveKey="info">
                <Tabs.TabPane tab="Thông tin chung" key="info">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tên gọi">{record.name}</Descriptions.Item>
                        <Descriptions.Item label="Hình ảnh">
                             {mainSrc ? (
                                <Image 
                                    width={100}
                                    src={mainSrc}
                                    style={{ borderRadius: 4, objectFit: 'cover' }}
                                />
                             ) : <span style={{color: '#999', fontStyle: 'italic'}}>Chưa có ảnh</span>}
                        </Descriptions.Item>

                        <Descriptions.Item label="Loại hình">
                            <Tag color="purple">{ArtifactTypeLabels[record.artifact_type]?.toUpperCase() || record.artifact_type?.toUpperCase()}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chất liệu">{record.material || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Tình trạng">
                            {(() => {
                                const cond = record.condition as ArtifactCondition;
                                let color = "default";
                                const condLower = (cond || "").toLowerCase();
                                
                                if (condLower === ArtifactCondition.EXCELLENT) color = "green";
                                else if (condLower === ArtifactCondition.GOOD) color = "blue";
                                else if (condLower === ArtifactCondition.FAIR) color = "orange";
                                else if (condLower === ArtifactCondition.POOR) color = "red";
                                
                                return <Tag color={color}>{ArtifactConditionLabels[cond].toUpperCase() || ArtifactConditionLabels[condLower as ArtifactCondition].toUpperCase() || cond.toUpperCase()}</Tag>;
                            })()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Trưng bày">
                            {record.is_on_display ? <Tag color="green">ĐANG TRƯNG BÀY</Tag> : <Tag color="red">TRONG KHO</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí" span={record.year_created ? 1 : 2}>
                            <Space>
                                <EnvironmentOutlined />
                                {record.location_in_site || "Chưa rõ"}
                            </Space>
                        </Descriptions.Item>
                        {record.year_created && <Descriptions.Item label="Năm sáng tạo">{record.year_created}</Descriptions.Item>}
                        <Descriptions.Item label="Đánh giá">
                            <Space><StarOutlined style={{ color: "#faad14" }} /> {record.rating || 0}</Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả ngắn" span={2}>
                            <Typography.Paragraph className="card-desc" ellipsis={{ rows: 3 }}>
                                {record.short_description || "Chưa có mô tả ngắn."}
                            </Typography.Paragraph>
                        </Descriptions.Item>
                    </Descriptions>

                    {gallery.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                                <h4 style={{ margin: 0 }}>Thư viện ảnh</h4>
                                <Button size="small" type="text" icon={<EyeOutlined />} style={{ color: 'var(--primary-color)' }} onClick={() => setPreviewVisible(true)}>
                                    Xem tất cả
                                </Button>
                            </div>
                            
                            <div style={{ display: 'none' }}>
                                <Image.PreviewGroup preview={{ visible: previewVisible, onVisibleChange: (vis) => setPreviewVisible(vis) }}>
                                    {gallery.map((img: any, idx) => {
                                         const src = getImageUrl(img);
                                         return <Image key={idx} src={src} />;
                                    })}
                                </Image.PreviewGroup>
                            </div>

                            <Space wrap size="middle">
                                {gallery.slice(0, 5).map((img : any, idx) => {
                                     const src = getImageUrl(img);
                                     return (
                                        <div key={idx} onClick={() => setPreviewVisible(true)} style={{ cursor: 'pointer' }}>
                                            <Image 
                                                width={120} height={120} src={src} preview={false}
                                                style={{ objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }}
                                            />
                                        </div>
                                     );
                                })}
                                {gallery.length > 5 && (
                                     <div 
                                        style={{ 
                                            width: 120, height: 120, borderRadius: 8, background: '#f5f5f5', 
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            cursor: 'pointer', border: '1px solid #eee', flexDirection: 'column', color: '#666'
                                        }}
                                        onClick={() => setPreviewVisible(true)}
                                     >
                                         <PlusOutlined style={{ fontSize: 24, marginBottom: 4 }} />
                                         <span>Xem thêm</span>
                                     </div>
                                )}
                            </Space>
                        </div>
                    )}
                </Tabs.TabPane>
                
                <Tabs.TabPane tab="Mô tả chi tiết" key="desc">
                    <div dangerouslySetInnerHTML={{ __html: record.description || "Chưa có mô tả chi tiết." }} />
                </Tabs.TabPane>

                <Tabs.TabPane tab="Bối cảnh & Ý nghĩa" key="context">
                    <h4>Bối cảnh lịch sử</h4>
                    <div dangerouslySetInnerHTML={{ __html: record.historical_context || "Chưa có dữ liệu." }} style={{ marginBottom: 20 }} />
                    <h4>Ý nghĩa văn hóa</h4>
                    <div dangerouslySetInnerHTML={{ __html: record.cultural_significance || "Chưa có dữ liệu." }} />
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

                <Tabs.TabPane tab={`Lịch sử liên quan (${relatedHistory.length})`} key="history">
                    <List
                        grid={{ gutter: 16, xs: 1, sm: 2, md: 2, lg: 2 }}
                        dataSource={relatedHistory}
                        renderItem={(item) => (
                            <List.Item>
                                <ArticleCard data={item} type="history" />
                            </List.Item>
                        )}
                        loading={loading}
                    />
                </Tabs.TabPane>
            </Tabs>
        </Modal>
    );
};

export default DetailModal;
