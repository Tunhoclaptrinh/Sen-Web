import { Modal, Descriptions, Rate, Space, Tag, Image, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

interface DetailModalProps {
    open: boolean;
    onCancel: () => void;
    record: any;
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
            title="Chi tiết đánh giá"
            width={700}
            footer={null}
        >
            <Descriptions bordered column={1}>
                <Descriptions.Item label="Người dùng">
                    <Space>
                        <Avatar src={record.user?.avatar} icon={<UserOutlined />} />
                        {record.user?.name || "Người dùng ẩn danh"}
                    </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Đối tượng">
                    <Tag color={record.type === 'artifact' ? 'purple' : 'blue'}>
                        {record.type?.toUpperCase()}
                    </Tag>
                    {record.target_name || `ID: ${record.heritage_site_id || record.artifact_id}`}
                </Descriptions.Item>
                <Descriptions.Item label="Đánh giá">
                    <Rate disabled defaultValue={record.rating} />
                </Descriptions.Item>
                <Descriptions.Item label="Thời gian">
                    {dayjs(record.created_at).format("DD/MM/YYYY HH:mm")}
                </Descriptions.Item>
                <Descriptions.Item label="Nội dung">
                    {record.comment}
                </Descriptions.Item>
            </Descriptions>

            {record.images && record.images.length > 0 && (
                <div style={{ marginTop: 20 }}>
                    <h4>Hình ảnh đính kèm</h4>
                    <Space wrap>
                        {record.images.map((img: string, idx: number) => (
                            <Image key={idx} width={150} src={img} alt={`review-${idx}`} />
                        ))}
                    </Space>
                </div>
            )}
        </Modal>
    );
};

export default DetailModal;
