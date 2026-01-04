import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Tabs,
    Empty,
    Spin,
    Statistic,
    Button,
    Tag,
    message,
    Tooltip,
} from 'antd';
import {
    HeartFilled,
    HomeOutlined,
    PictureOutlined,
    CalendarOutlined,
    EyeOutlined,
    DeleteOutlined,
} from '@ant-design/icons';
import favoriteService from '@services/favorite.service';
import './styles.less';

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');

    useEffect(() => {
        fetchFavorites();
    }, []);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const response = await favoriteService.getAll();
            setFavorites(response.data || []);
        } catch (error) {
            message.error('Không thể tải danh sách yêu thích');
        } finally {
            setLoading(false);
        }
    };

    const handleRemoveFavorite = async (type: string, id: number) => {
        try {
            await favoriteService.remove(type as any, id.toString());
            message.success('Đã xóa khỏi yêu thích');
            fetchFavorites();
        } catch (error) {
            message.error('Không thể xóa khỏi yêu thích');
        }
    };

    const handleNavigate = (type: string, id: number) => {
        if (type === 'heritage_site') {
            navigate(`/heritage-sites/${id}`);
        } else if (type === 'artifact') {
            navigate(`/artifacts/${id}`);
        } else if (type === 'exhibition') {
            navigate(`/exhibitions/${id}`);
        }
    };

    const getFilteredFavorites = () => {
        if (activeTab === 'all') return favorites;
        return favorites.filter((fav) => fav.type === activeTab);
    };

    const getStats = () => {
        return {
            total: favorites.length,
            heritage_sites: favorites.filter((f) => f.type === 'heritage_site').length,
            artifacts: favorites.filter((f) => f.type === 'artifact').length,
            exhibitions: favorites.filter((f) => f.type === 'exhibition').length,
        };
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'heritage_site':
                return <HomeOutlined />;
            case 'artifact':
                return <PictureOutlined />;
            case 'exhibition':
                return <CalendarOutlined />;
            default:
                return <HeartFilled />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'heritage_site':
                return 'Di Tích';
            case 'artifact':
                return 'Hiện Vật';
            case 'exhibition':
                return 'Triển Lãm';
            default:
                return type;
        }
    };

    const stats = getStats();

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '100px 0' }}>
                <Spin size="large" tip="Đang tải yêu thích..." />
            </div>
        );
    }

    return (
        <div className="favorites-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">
                        <HeartFilled /> Yêu Thích Của Tôi
                    </h1>
                    <p className="page-description">
                        Các di sản và hiện vật bạn đã yêu thích
                    </p>
                </div>
            </div>

            <div className="favorites-stats">
                <Row gutter={[16, 16]}>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-1">
                            <Statistic
                                title="Tổng Yêu Thích"
                                value={stats.total}
                                prefix={<HeartFilled />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-2">
                            <Statistic
                                title="Di Tích"
                                value={stats.heritage_sites}
                                prefix={<HomeOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-3">
                            <Statistic
                                title="Hiện Vật"
                                value={stats.artifacts}
                                prefix={<PictureOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                    <Col xs={12} sm={6}>
                        <Card className="stat-card gradient-4">
                            <Statistic
                                title="Triển Lãm"
                                value={stats.exhibitions}
                                prefix={<CalendarOutlined />}
                                valueStyle={{ color: '#fff' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>

            <Card className="favorites-content">
                <Tabs
                    activeKey={activeTab}
                    onChange={setActiveTab}
                    items={[
                        {
                            key: 'all',
                            label: `Tất cả (${stats.total})`,
                        },
                        {
                            key: 'heritage_site',
                            label: `Di Tích (${stats.heritage_sites})`,
                        },
                        {
                            key: 'artifact',
                            label: `Hiện Vật (${stats.artifacts})`,
                        },
                        {
                            key: 'exhibition',
                            label: `Triển Lãm (${stats.exhibitions})`,
                        },
                    ]}
                />

                {getFilteredFavorites().length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <h3>Chưa có mục yêu thích nào</h3>
                                <p>Khám phá và thêm các di sản yêu thích của bạn</p>
                            </div>
                        }
                    >
                        <Button
                            type="primary"
                            onClick={() => navigate('/heritage-sites')}
                        >
                            Khám Phá Ngay
                        </Button>
                    </Empty>
                ) : (
                    <Row gutter={[24, 24]} className="favorites-grid">
                        {getFilteredFavorites().map((favorite) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={favorite.id}>
                                <Card
                                    hoverable
                                    className="favorite-card"
                                    cover={
                                        <div className="favorite-cover">
                                            <img
                                                src={
                                                    favorite.item?.main_image ||
                                                    favorite.item?.images?.[0] ||
                                                    'https://via.placeholder.com/300x200'
                                                }
                                                alt={favorite.item?.name}
                                            />
                                            <div className="favorite-overlay">
                                                <Button
                                                    type="primary"
                                                    shape="circle"
                                                    icon={<EyeOutlined />}
                                                    size="large"
                                                    onClick={() =>
                                                        handleNavigate(favorite.type, favorite.reference_id)
                                                    }
                                                />
                                            </div>
                                        </div>
                                    }
                                    actions={[
                                        <Tooltip title="Xóa khỏi yêu thích">
                                            <Button
                                                type="text"
                                                danger
                                                icon={<DeleteOutlined />}
                                                onClick={() =>
                                                    handleRemoveFavorite(
                                                        favorite.type,
                                                        favorite.reference_id
                                                    )
                                                }
                                            >
                                                Xóa
                                            </Button>
                                        </Tooltip>,
                                    ]}
                                >
                                    <Card.Meta
                                        title={
                                            <div className="favorite-title">
                                                <span>{favorite.item?.name}</span>
                                            </div>
                                        }
                                        description={
                                            <div className="favorite-description">
                                                <Tag icon={getTypeIcon(favorite.type)} color="blue">
                                                    {getTypeLabel(favorite.type)}
                                                </Tag>
                                                {favorite.item?.rating && (
                                                    <div className="rating">
                                                        ⭐ {favorite.item.rating.toFixed(1)}
                                                    </div>
                                                )}
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </Card>
        </div>
    );
};

export default FavoritesPage;
