import React from "react";
import { Modal, Typography, Button as AntButton, Tag, Divider, Row, Col } from "antd";
import Button from "@/components/common/Button";
import {
    ShoppingCartOutlined,
    MinusOutlined,
    PlusOutlined,
    DollarOutlined
} from "@ant-design/icons";
import { ShopItem } from "@/types/game.types";
import { getImageUrl } from "@/utils/image.helper";

const { Title, Text, Paragraph } = Typography;

interface ShopDetailModalProps {
    visible: boolean;
    onClose: () => void;
    item: ShopItem | null;
    quantity: number;
    onQuantityChange: (delta: number) => void;
    onConfirmPurchase: () => void;
    purchaseLoading: boolean;
    isOwned: boolean;
    inventoryQuantity?: number;
    userBalance: number;
}

const ShopDetailModal: React.FC<ShopDetailModalProps> = ({
    visible,
    onClose,
    item,
    quantity,
    onQuantityChange,
    onConfirmPurchase,
    purchaseLoading,
    isOwned,
    inventoryQuantity,
    userBalance
}) => {
    if (!item) return null;

    const totalCost = item.price * quantity;
    const canAfford = userBalance >= totalCost;
    const itemImage = item.image ? getImageUrl(item.image) : null;

    return (
        <Modal
            open={visible}
            onCancel={onClose}
            footer={null}
            width={700}
            centered
            destroyOnClose
            className="premium-shop-modal"
            title={
                <div style={{ fontFamily: 'var(--font-serif)', color: 'var(--seal-red)', fontSize: '1.2rem' }}>
                    <ShoppingCartOutlined style={{ marginRight: 8 }} />
                    Chi tiết vật phẩm
                </div>
            }
        >
            <div style={{ padding: "12px 0" }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} md={10}>
                        <div style={{
                            borderRadius: 12,
                            overflow: 'hidden',
                            border: '2px solid var(--gold-border)',
                            background: 'var(--paper-bg)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            minHeight: 250,
                            boxShadow: '4px 4px 0 rgba(0,0,0,0.05)'
                        }}>
                            {itemImage ? (
                                <img
                                    src={itemImage}
                                    alt={item.name}
                                    style={{ width: '100%', maxHeight: 250, objectFit: 'contain', padding: 16 }}
                                />
                            ) : (
                                <div style={{ fontSize: '4rem', opacity: 0.2 }}>📦</div>
                            )}
                        </div>
                    </Col>
                    <Col xs={24} md={14}>
                        <Title level={3} style={{ margin: '0 0 8px', fontFamily: 'var(--font-serif)', color: 'var(--seal-red)' }}>
                            {item.name}
                        </Title>

                        <div style={{ marginBottom: 16 }}>
                            {(() => {
                                let color = "gold";
                                let text = "VẬT PHẨM";
                                if (["powerup", "hint", "boost"].includes(item.type)) { color = "blue"; text = "HỖ TRỢ"; }
                                else if (["decoration", "theme"].includes(item.type)) { color = "purple"; text = "TRANG TRÍ"; }
                                else if (["character", "character_skin", "premium_ai"].includes(item.type)) { color = "magenta"; text = "ĐỒNG HÀNH"; }
                                return <Tag color={color} style={{ fontWeight: 600 }}>{text}</Tag>;
                            })()}
                            {isOwned && <Tag color="green" style={{ fontWeight: 600 }}>ĐÃ SỞ HỮU</Tag>}
                        </div>

                        <Paragraph style={{ color: 'var(--text-color-primary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: 20 }}>
                            {item.description || "Chưa có mô tả chi tiết cho vật phẩm này."}
                        </Paragraph>

                        {inventoryQuantity !== undefined && item.isConsumable && (
                            <div style={{
                                marginBottom: 16,
                                padding: '8px 12px',
                                background: 'rgba(139, 29, 29, 0.05)',
                                border: '1px solid rgba(139, 29, 29, 0.1)',
                                borderRadius: 8,
                                color: 'var(--seal-red)',
                                fontWeight: 600,
                                fontFamily: 'var(--font-serif)'
                            }}>
                                Bạn đang sở hữu: {inventoryQuantity}
                            </div>
                        )}

                        <div style={{ background: 'rgba(212, 165, 116, 0.1)', padding: 16, borderRadius: 12, border: '1px solid var(--gold-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong style={{ fontSize: '1.1rem' }}>Giá bán:</Text>
                                <div style={{ color: 'var(--seal-red)', fontSize: '1.2rem', fontWeight: 700 }}>
                                    {item.currency === "petals" ? "🌸" : <DollarOutlined />} {item.price}
                                </div>
                            </div>

                            {item.isConsumable && !isOwned && (
                                <>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <Text strong>Số lượng mua:</Text>
                                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                            <AntButton
                                                shape="circle"
                                                icon={<MinusOutlined />}
                                                size="small"
                                                onClick={() => onQuantityChange(-1)}
                                                disabled={quantity <= 1}
                                            />
                                            <span style={{ fontSize: 18, fontWeight: "bold", minWidth: 30, textAlign: 'center' }}>{quantity}</span>
                                            <AntButton
                                                shape="circle"
                                                icon={<PlusOutlined />}
                                                size="small"
                                                onClick={() => onQuantityChange(1)}
                                            />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed var(--gold-border)', paddingTop: 12 }}>
                                        <Text strong style={{ fontSize: '1.1rem' }}>Tổng cộng:</Text>
                                        <div style={{ color: 'var(--seal-red)', fontSize: '1.4rem', fontWeight: 800 }}>
                                            {item.currency === "petals" ? "🌸" : <DollarOutlined />} {totalCost}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div style={{ marginTop: 24 }}>
                            <Button
                                variant="gold"
                                fullWidth
                                buttonSize="large"
                                onClick={onConfirmPurchase}
                                loading={purchaseLoading}
                                disabled={isOwned || !canAfford}
                                style={{
                                    height: 50,
                                    fontSize: '1.1rem',
                                    fontWeight: 700,
                                    borderRadius: 10,
                                    boxShadow: '0 4px 0 #a68654'
                                }}
                            >
                                {isOwned ? "Đã sở hữu" : !canAfford ? "Không đủ số dư" : `Mua ngay (${totalCost} ${item.currency === "petals" ? "Sen" : "Xu"})`}
                            </Button>
                            {!canAfford && !isOwned && (
                                <Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: '0.85rem' }}>
                                    Bạn còn thiếu {totalCost - userBalance} {item.currency === "petals" ? "Cánh Sen" : "Xu"}
                                </Text>
                            )}
                        </div>
                    </Col>
                </Row>
            </div>
        </Modal>
    );
};

export default ShopDetailModal;
