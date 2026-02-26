import React from "react";
import { Modal, Typography, Button, Space, Tag, Divider, Row, Col } from "antd";
import { 
    InfoCircleOutlined,
    ShoppingCartOutlined,
    TagOutlined,
    WalletOutlined,
    CalendarOutlined
} from "@ant-design/icons";
import { getImageUrl } from "@/utils/image.helper";

const { Title, Text, Paragraph } = Typography;

interface ShopDetailModalProps {
    visible: boolean;
    onClose: () => void;
    record: any | null;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
    visible,
    onClose,
    record
}) => {
    if (!record) return null;

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={[
                <Button key="close" onClick={onClose} size="large" style={{ borderRadius: 8 }}>
                    Đóng
                </Button>
            ]}
            width={700}
            destroyOnClose
            title={
                <Space>
                    <ShoppingCartOutlined style={{ color: "var(--seal-red)" }} />
                    <span>Chi tiết vật phẩm</span>
                </Space>
            }
        >
            <div style={{ padding: "12px 0" }}>
                <Row gutter={[24, 24]}>
                    <Col span={10}>
                        <div style={{ 
                            borderRadius: 12, 
                            overflow: 'hidden', 
                            border: '1px solid #f0f0f0',
                            background: '#fafafa',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 250
                        }}>
                            <img 
                                src={getImageUrl(record.image)} 
                                alt={record.name}
                                style={{ width: '100%', display: 'block', objectFit: 'contain' }}
                            />
                        </div>
                    </Col>
                    <Col span={14}>
                        <Title level={3} style={{ margin: '0 0 16px', fontFamily: 'var(--font-serif)' }}>
                            {record.name}
                        </Title>
                        
                        <Space direction="vertical" size={12} style={{ width: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary"><TagOutlined /> Loại vật phẩm:</Text>
                                <Tag color="blue">{record.type?.toUpperCase()}</Tag>
                            </div>
                            
                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary"><WalletOutlined /> Giá bán:</Text>
                                <Tag color={record.currency === "petals" ? "pink" : "gold"}>
                                    {record.price} {record.currency === "petals" ? "Cánh sen" : "Xu"}
                                </Tag>
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <Text type="secondary"><InfoCircleOutlined /> Trạng thái:</Text>
                                {record.isActive ? (
                                    <Tag color="green">ĐANG BÁN</Tag>
                                ) : (
                                    <Tag color="default">HẾT HÀNG</Tag>
                                )}
                            </div>

                            {record.createdAt && (
                                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                    <Text type="secondary"><CalendarOutlined /> Ngày tạo:</Text>
                                    <Text>{new Date(record.createdAt).toLocaleDateString('vi-VN')}</Text>
                                </div>
                            )}
                        </Space>

                        <Divider style={{ margin: '16px 0' }} />
                        
                        <div>
                            <Text strong><InfoCircleOutlined /> Mô tả:</Text>
                            <Paragraph style={{ marginTop: 8, color: '#595959' }}>
                                {record.description || "Chưa có mô tả cho vật phẩm này."}
                            </Paragraph>
                        </div>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default ShopDetailModal;
