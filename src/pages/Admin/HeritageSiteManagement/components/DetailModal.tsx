import { Modal, Descriptions, Tabs, Tag, Image, Space, List, Card } from "antd";
import { HeritageSite } from "@/types";
import { ClockCircleOutlined, EnvironmentOutlined, StarOutlined } from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import { useEffect, useState } from "react";

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
            <Tabs defaultActiveKey="info">
                <Tabs.TabPane tab="Thông tin chung" key="info">
                    <Descriptions bordered column={2}>
                        <Descriptions.Item label="Tên gọi">{record.name}</Descriptions.Item>
                        <Descriptions.Item label="Loại hình">
                            <Tag color="blue">{record.type}</Tag>
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
                        <Descriptions.Item label="Mô tả" span={2}>
                            {record.description}
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
                <Tabs.TabPane tab={`Hiện vật (${artifacts.length})`} key="artifacts">
                    <List
                        grid={{ gutter: 16, column: 4 }}
                        dataSource={artifacts}
                        renderItem={(item) => (
                            <List.Item>
                                <Card title={item.name} size="small">
                                    {item.description}
                                </Card>
                            </List.Item>
                        )}
                        loading={loading}
                    />
                </Tabs.TabPane>
                <Tabs.TabPane tab="Dòng thời gian" key="timeline">
                    <List
                        itemLayout="horizontal"
                        dataSource={timeline}
                        renderItem={(item) => (
                            <List.Item>
                                <List.Item.Meta
                                    avatar={<ClockCircleOutlined />}
                                    title={`${item.year}: ${item.title}`}
                                    description={item.description}
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
