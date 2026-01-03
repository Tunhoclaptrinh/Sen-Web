import { Modal, Descriptions, Tag, Image, Space } from "antd";
import { Artifact } from "@/types";
import { StarOutlined, EnvironmentOutlined } from "@ant-design/icons";

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
    if (!record) return null;

    return (
        <Modal
            open={open}
            onCancel={onCancel}
            title={record.name}
            width={800}
            footer={null}
        >
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
        </Modal>
    );
};

export default DetailModal;
