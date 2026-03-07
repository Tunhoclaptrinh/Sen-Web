import React from "react";
import { Modal, Typography, Button as AntButton, Tag, Divider, Row, Col } from "antd";
import { useTranslation } from "react-i18next";
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
    const { t } = useTranslation();
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
                    {t('gameShop.modal.title')}
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
                                let text = t('gameShop.types.item');
                                if (["powerup", "hint", "boost"].includes(item.type)) { color = "blue"; text = t('gameShop.types.support'); }
                                else if (["decoration", "theme"].includes(item.type)) { color = "purple"; text = t('gameShop.types.decoration'); }
                                else if (["character", "character_skin", "premium_ai"].includes(item.type)) { color = "magenta"; text = t('gameShop.types.companion'); }
                                return <Tag color={color} style={{ fontWeight: 600 }}>{text}</Tag>;
                            })()}
                            {isOwned && <Tag color="green" style={{ fontWeight: 600 }}>{t('gameShop.types.owned')}</Tag>}
                        </div>

                        <Paragraph style={{ color: 'var(--text-color-primary)', fontSize: '1rem', lineHeight: '1.6', marginBottom: 20 }}>
                            {item.description || t('gameShop.modal.noDescription')}
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
                                {t('gameShop.modal.ownedLabel', { count: inventoryQuantity })}
                            </div>
                        )}

                        <div style={{ background: 'rgba(212, 165, 116, 0.1)', padding: 16, borderRadius: 12, border: '1px solid var(--gold-border)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                <Text strong style={{ fontSize: '1.1rem' }}>{t('gameShop.modal.priceLabel')}</Text>
                                <div style={{ color: 'var(--seal-red)', fontSize: '1.2rem', fontWeight: 700 }}>
                                    {item.currency === "petals" ? "🌸" : <DollarOutlined />} {item.price}
                                </div>
                            </div>

                            {item.isConsumable && !isOwned && (
                                <>
                                    <Divider style={{ margin: '12px 0' }} />
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                                        <Text strong>{t('gameShop.modal.quantityLabel')}</Text>
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
                                        <Text strong style={{ fontSize: '1.1rem' }}>{t('gameShop.modal.totalLabel')}</Text>
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
                                {isOwned ? t('gameShop.card.owned') : !canAfford ? t('gameShop.modal.insufficientBalance') : t('gameShop.modal.buyWithPrice', { cost: totalCost, currency: item.currency === "petals" ? t('gameShop.currencies.sen') : t('gameShop.currencies.coins') })}
                            </Button>
                            {!canAfford && !isOwned && (
                                <Text type="danger" style={{ display: 'block', textAlign: 'center', marginTop: 8, fontSize: '0.85rem' }}>
                                    {t('gameShop.modal.neededMore', { amount: totalCost - userBalance, currency: item.currency === "petals" ? t('gameShop.currencies.petals') : t('gameShop.currencies.coins') })}
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
