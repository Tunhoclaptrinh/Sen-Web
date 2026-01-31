import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMuseum } from '@/store/slices/gameSlice';
import { fetchShopData } from '@/store/slices/shopSlice';
import { Row, Col, Button, Spin, Typography, Empty, Tabs, Tag, Card, Modal } from 'antd';
import { TrophyOutlined, RiseOutlined, GoldOutlined } from '@ant-design/icons';
import { getImageUrl } from '@/utils/image.helper';
import { StatisticsCard } from '@/components/common';
import "./styles.less";

const { Title } = Typography;

const MuseumPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { museum, museumLoading } = useAppSelector((state) => state.game);
    const { inventory, items: shopItems, loading: shopLoading } = useAppSelector((state) => state.shop);
    const [activeTab, setActiveTab] = useState('all');

    // Modal state
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        dispatch(fetchMuseum());
        dispatch(fetchShopData());
    }, [dispatch]);

    const handleCollectIncome = () => {
        console.log('Collect income');
    };

    // Enrich inventory items with shop data
    const enrichedInventory = inventory.map(invItem => {
        const itemDetail = shopItems.find(s => s.id === invItem.item_id);
        return { ...invItem, ...itemDetail };
    });

    // Combine all items into a unified list
    const allItems = [
        ...enrichedInventory.map(item => ({
            type: 'inventory',
            id: `inv-${item.item_id}`,
            name: item.name,
            description: item.description,
            image: item.image,
            original: item,
            quantity: item.quantity
        })),
        ...(museum?.artifacts || []).map(art => ({
            type: 'artifact',
            id: `art-${art.artifact_id}`,
            name: art.name,
            description: `Thu thập ngày ${new Date(art.acquired_at).toLocaleDateString()}`,
            image: art.image,
            original: art,
            quantity: 1
        })),
        ...(museum?.characters || []).map((charName, idx) => ({
            type: 'character',
            id: `char-${idx}`,
            name: charName,
            description: 'Nhân vật đồng hành cùng bạn',
            image: null, 
            original: charName,
            quantity: 1
        }))
    ];

    const filteredItems = activeTab === 'all' 
        ? allItems 
        : allItems.filter(i => i.type === activeTab);

    const handleItemClick = (item: any) => {
        setSelectedItem(item);
        setDetailModalVisible(true);
    };

    const renderMuseumItem = (item: any) => {
        // Resolve image URL based on type
        let itemImage: string | null = null;
        if (item.type === 'character') {
             itemImage = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${item.name}`;
        } else {
             itemImage = item.image ? getImageUrl(item.image) : null;
        }

        return (
            <Col xs={24} sm={12} md={8} lg={6} key={item.id}>
                <Card
                    hoverable
                    className="museum-card"
                    onClick={() => handleItemClick(item)}
                    cover={
                        <div className="card-cover">
                            {itemImage ? (
                                <>
                                    <div 
                                        className="blur-background"
                                        style={{ backgroundImage: `url(${itemImage})` }}
                                    />
                                    <img 
                                        src={itemImage} 
                                        alt={item.name} 
                                        className="item-image"
                                        onError={(e) => {
                                            e.currentTarget.style.display = 'none';
                                            e.currentTarget.parentElement?.querySelector('.fallback-icon')?.classList.remove('hidden');
                                            e.currentTarget.parentElement?.querySelector('.blur-background')?.setAttribute('style', 'display: none');
                                        }} 
                                    />
                                </>
                            ) : (
                                <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999', background: '#f5f5f5'}}>
                                    No image
                                </div>
                            )}
                            {/* Tags - Always show Type Tag at top right */}
                            <div className="item-type-tag">
                                {(() => {
                                    let color = 'gold';
                                    let text = 'Vật phẩm';
                                    
                                    if (item.type === 'artifact') {
                                        color = 'gold';
                                        text = 'HIỆN VẬT';
                                    } else if (item.type === 'character') {
                                        color = 'magenta';
                                        text = 'ĐỒNG HÀNH';
                                    } else if (item.type === 'inventory') {
                                        // Map shop types
                                        const shopType = item.original?.type;
                                        if (['powerup', 'hint', 'boost'].includes(shopType)) {
                                            color = 'blue';
                                            text = 'HỖ TRỢ';
                                        } else if (['decoration', 'theme'].includes(shopType)) {
                                            color = 'purple';
                                            text = 'TRANG TRÍ';
                                        } else {
                                            color = 'cyan';
                                            text = 'SƯU TẦM';
                                        }
                                    }

                                    return <Tag color={color}>{text}</Tag>;
                                })()}
                            </div>
                        </div>
                    }
                >
                    <div className="item-info">
                        <div className="item-name">{item.name}</div>
                        <div className="item-desc" title={item.description}>
                            {item.description || 'Vật phẩm sưu tầm'}
                        </div>

                        {/* Quantity Badge in Body - Strictly matching Shop style */}
                        {(item.quantity > 0 && item.type === 'inventory' && item.original?.is_consumable) && (
                            <div className="owned-quantity" style={{ 
                                fontSize: '0.8rem', 
                                color: '#8b1d1d', // @seal-red
                                background: 'rgba(139, 29, 29, 0.08)',
                                border: '1px solid rgba(139, 29, 29, 0.2)',
                                padding: '2px 8px',
                                borderRadius: '12px',
                                display: 'inline-block',
                                fontWeight: 700,
                                marginBottom: 0, // Tight spacing
                                marginTop: 'auto', // Push to bottom if flex
                                fontFamily: '"Merriweather", serif',
                                width: 'fit-content'
                            }}>
                                Đang có: {item.quantity}
                            </div>
                        )}
                    </div>
                </Card>
            </Col>
        );
    };

    if (museumLoading || shopLoading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải dữ liệu..." />
            </div>
        );
    }

    if (!museum || !museum.is_open) {
         // Fallback layout if museum closed but user has inventory? 
         // For now keep logic simple: must finish Ch1 to open Museum features or similar logic.
         // Or just show Inventory separately? 
         // User requested "Merge", so let's show Inventory even if Museum closed, 
         // but the code below assumes Museum object exists.
         // Use optional chaining carefully.
    }

    return (
        <div className="museum-page">
            <div className="page-header">
                <Title level={1} className="main-title">
                    <TrophyOutlined className="title-icon" /> Bảo Tàng
                </Title>
                <div className="subtitle">Lưu giữ báu vật - Thu thập tinh hoa</div>
            </div>

            <div className="stats-container">
                <StatisticsCard
                    data={[
                        {
                            title: 'Cấp độ',
                            value: museum?.level || 1,
                            valueColor: '#1890ff',
                            icon: <TrophyOutlined />
                        },
                        {
                            title: 'Thu nhập trong 1 giờ',
                            value: `${museum?.income_per_hour || 0}`,
                            valueColor: '#52c41a',
                            icon: <RiseOutlined />
                        },
                        {
                            title: 'Chờ thu',
                            value: (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span>{museum?.pending_income || 0}</span>
                                    {museum?.pending_income && museum.pending_income > 0 ? (
                                        <Button 
                                            type="primary" 
                                            size="small" 
                                            onClick={handleCollectIncome}
                                            className="collect-btn"
                                            style={{ fontSize: '0.8rem', height: 24, padding: '0 8px' }}
                                        >
                                            Thu hoạch
                                        </Button>
                                    ) : null}
                                </div>
                            ),
                            valueColor: '#faad14',
                            icon: <GoldOutlined />
                        }
                    ]}
                    hideCard
                    colSpan={{ xs: 24, sm: 8, md: 8 }}
                />
            </div>

            <div className="tabs-container">
                <Tabs 
                    activeKey={activeTab} 
                    onChange={setActiveTab}
                    centered
                    className="museum-tabs"
                    items={[
                        { label: <span>Tất cả</span>, key: 'all' },
                        { label: <span>Túi đồ</span>, key: 'inventory' },
                        { label: <span>Hiện vật</span>, key: 'artifact' },
                        { label: <span>Nhân vật</span>, key: 'character' },
                    ]}
                />
            </div>

            <div className="museum-content">
                {filteredItems.length > 0 ? (
                    <Row gutter={[24, 24]}>
                        {filteredItems.map(renderMuseumItem)}
                    </Row>
                ) : (
                    <Empty description="Trống trơn" />
                )}
            </div>

             <Modal
                title={<Title level={4} style={{ margin: 0 }}>{selectedItem?.name}</Title>}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={[
                    <Button key="close" onClick={() => setDetailModalVisible(false)}>
                        Đóng
                    </Button>,
                    selectedItem?.type === 'inventory' && selectedItem?.original.is_consumable && (
                        <Button key="use" type="primary">
                            Sử dụng
                        </Button>
                    )
                ]}
                centered
            >
                {selectedItem && (
                    <div style={{ textAlign: 'center' }}>
                         <div style={{ marginBottom: 16, height: 150, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9f9f9', borderRadius: 8 }}>
                            {(() => {
                                let img = null;
                                if (selectedItem.type === 'character') {
                                    img = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${selectedItem.name}`;
                                } else {
                                    img = selectedItem.image ? getImageUrl(selectedItem.image) : null;
                                }
                                
                                if (img) return <img src={img} alt={selectedItem.name} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />;
                                return <div style={{ color: '#999' }}>No image</div>;
                            })()}
                         </div>
                         <div style={{ textAlign: 'left' }}>
                            <p><strong>Mô tả:</strong> {selectedItem.description || 'Không có mô tả'}</p>
                            {selectedItem.quantity && <p><strong>Số lượng:</strong> {selectedItem.quantity}</p>}
                         </div>
                    </div>
                )}
            </Modal>
        </div>
    );
};

export default MuseumPage;
