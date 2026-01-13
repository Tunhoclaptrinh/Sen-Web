import { Modal, Descriptions, Tag, Image, Space, Tabs, List } from "antd";
import { Artifact } from "@/types";
import { StarOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import heritageService from "@/services/heritage.service";
import historyService from "@/services/history.service";
import ArticleCard from "@/components/common/cards/ArticleCard";

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
                        <Descriptions.Item label="Loại hình">
                            <Tag color="purple">{record.artifact_type?.toUpperCase()}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Chất liệu">{record.material || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Tình trạng">
                            <Tag color={record.condition === 'excellent' ? 'green' : 'orange'}>
                                {record.condition?.toUpperCase()}
                            </Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Trưng bày">
                            {record.is_on_display ? <Tag color="green">Đang trưng bày</Tag> : <Tag>Trong kho</Tag>}
                        </Descriptions.Item>
                        <Descriptions.Item label="Vị trí">
                            <Space>
                                <EnvironmentOutlined />
                                {record.location_in_site || "Chưa rõ"}
                            </Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Năm sáng tạo">{record.year_created || "N/A"}</Descriptions.Item>
                        <Descriptions.Item label="Đánh giá">
                            <Space><StarOutlined style={{ color: "#faad14" }} /> {record.rating || 0}</Space>
                        </Descriptions.Item>
                        <Descriptions.Item label="Mô tả ngắn" span={2}>
                            {record.short_description || "Chưa có mô tả ngắn."}
                        </Descriptions.Item>
                    </Descriptions>

                    {record.images && record.images.length > 0 && (
                        <div style={{ marginTop: 20 }}>
                            <h4>Hình ảnh</h4>
                            <Space wrap>
                                {record.images.map((img, idx) => (
                                    <Image key={idx} width={200} src={img} alt={`${record.name}-${idx}`} />
                                ))}
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
                                <ArticleCard 
                                    data={item} 
                                    type="heritage" 
                                />
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
                                <ArticleCard 
                                    data={item} 
                                    type="history" 
                                />
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
