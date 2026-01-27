import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/hooks/useRedux';
import { fetchMuseum } from '@/store/slices/gameSlice';
import { fetchShopData } from '@/store/slices/shopSlice';
import { Row, Col, Button, Spin, Typography, Empty, Tabs, Tag, Card } from 'antd';
import { TrophyOutlined, RiseOutlined, GoldOutlined } from '@ant-design/icons';
import { getImageUrl } from '@/utils/image.helper';
import { StatisticsCard } from '@/components/common';
import "./styles.less";

const { Title } = Typography;

const MuseumPage: React.FC = () => {
    const dispatch = useAppDispatch();
    const { museum, museumLoading } = useAppSelector((state) => state.game);
    const { inventory, items: shopItems, loading: shopLoading } = useAppSelector((state) => state.shop);
    const [activeTab, setActiveTab] = useState('inventory');

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

    const renderInventoryTab = () => (
        <Row gutter={[24, 24]}>
            {enrichedInventory.length === 0 ? (
                <Col span={24}>
                    <Empty description="Túi đồ trống" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" href="/game/shop">Đến Cửa Hàng</Button>
                    </Empty>
                </Col>
            ) : enrichedInventory.map((item, idx) => {
                const itemImage = item.image ? getImageUrl(item.image) : '/images/placeholder.png';
                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                        <Card
                            hoverable
                            className="museum-card"
                            cover={
                                <div className="card-cover">
                                    <div 
                                        className="blur-background"
                                        style={{ backgroundImage: `url(${itemImage})` }}
                                    />
                                    <img 
                                        src={itemImage} 
                                        alt={item.name} 
                                        className="item-image"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/placeholder.png';
                                            e.currentTarget.parentElement?.querySelector('.blur-background')?.setAttribute('style', 'display: none');
                                        }} 
                                    />
                                    <div className="item-quantity-tag">x{item.quantity}</div>
                                </div>
                            }
                        >
                            <div className="item-info">
                                <div className="item-name">{item.name}</div>
                                <div className="item-desc" title={item.description}>{item.description || 'Vật phẩm sưu tầm'}</div>
                                <div className="action-btn-wrapper">
                                    <Button 
                                        size="middle" 
                                        className="action-btn" 
                                        disabled={!item.is_consumable}
                                    >
                                        {item.is_consumable ? 'Sử dụng' : 'Trang trí'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );

    const renderArtifactsTab = () => (
        <Row gutter={[24, 24]}>
            {!museum?.artifacts || museum.artifacts.length === 0 ? (
                <Col span={24}>
                    <Empty description="Chưa có hiện vật nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" href="/game/chapters">Chơi game để tìm kiếm</Button>
                    </Empty>
                </Col>
            ) : museum.artifacts.map((artifact) => {
                const artifactImage = artifact.image ? getImageUrl(artifact.image) : '/images/placeholder.png';
                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={artifact.artifact_id}>
                        <Card
                            hoverable
                            className="museum-card"
                            cover={
                                <div className="card-cover">
                                    <div 
                                        className="blur-background"
                                        style={{ backgroundImage: `url(${artifactImage})` }}
                                    />
                                    <img 
                                        src={artifactImage} 
                                        alt={artifact.name} 
                                        className="item-image"
                                        onError={(e) => {
                                            e.currentTarget.src = '/images/placeholder.png';
                                            e.currentTarget.parentElement?.querySelector('.blur-background')?.setAttribute('style', 'display: none');
                                        }} 
                                    />
                                    <div className="item-type-tag">
                                        <Tag color="gold">Hiện vật</Tag>
                                    </div>
                                </div>
                            }
                        >
                            <div className="item-info">
                                <div className="item-name">{artifact.name}</div>
                                <div className="item-desc">Thu thập ngày {new Date(artifact.acquired_at).toLocaleDateString()}</div>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );

    const renderCharactersTab = () => (
        <Row gutter={[24, 24]}>
             {!museum?.characters || museum.characters.length === 0 ? (
                <Col span={24}>
                    <Empty description="Chưa có nhân vật nào" image={Empty.PRESENTED_IMAGE_SIMPLE}>
                        <Button type="primary" href="/game/shop">Chiêu mộ ngay</Button>
                    </Empty>
                </Col>
            ) : museum.characters.map((charName, idx) => {
                const charImage = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${charName}`;
                return (
                    <Col xs={24} sm={12} md={8} lg={6} key={idx}>
                         <Card
                            hoverable
                            className="museum-card"
                            cover={
                                <div className="card-cover">
                                    <div 
                                        className="blur-background"
                                        style={{ backgroundImage: `url(${charImage})` }}
                                    />
                                    <img 
                                        src={charImage} 
                                        alt={charName} 
                                        className="item-image"
                                    />
                                    <div className="item-type-tag">
                                        <Tag color="magenta">Đồng hành</Tag>
                                    </div>
                                </div>
                            }
                        >
                            <div className="item-info">
                                <div className="item-name">{charName}</div>
                                <div className="item-desc">Nhân vật đồng hành cùng bạn</div>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );

    const renderAllTab = () => (
        <div className="all-tab-content">
            {/* Inventory Section */}
            {enrichedInventory.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    {renderInventoryTab()}
                </div>
            )}

            {/* Artifacts Section */}
            {museum?.artifacts && museum.artifacts.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    {renderArtifactsTab()}
                </div>
            )}

            {/* Characters Section */}
            {museum?.characters && museum.characters.length > 0 && (
                <div style={{ marginBottom: 32 }}>
                    {renderCharactersTab()}
                </div>
            )}

            {/* Empty State if everything is empty */}
            {enrichedInventory.length === 0 && (!museum?.artifacts || museum.artifacts.length === 0) && (!museum?.characters || museum.characters.length === 0) && (
                <Empty description="Bảo tàng trống trơn" />
            )}
        </div>
    );

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
                            title: 'Thu nhập theo giờ',
                            value: `${museum?.income_per_hour || 0}/h`,
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
                        { label: <span>Hiện vật</span>, key: 'artifacts' },
                        { label: <span>Nhân vật</span>, key: 'characters' },
                    ]}
                />
            </div>

            <div className="museum-content">
                {activeTab === 'all' && renderAllTab()}
                {activeTab === 'inventory' && renderInventoryTab()}
                {activeTab === 'artifacts' && renderArtifactsTab()}
                {activeTab === 'characters' && renderCharactersTab()}
            </div>
        </div>
    );
};

export default MuseumPage;
