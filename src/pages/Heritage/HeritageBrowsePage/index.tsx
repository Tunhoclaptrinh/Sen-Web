import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Input,
    Select,
    Button,
    Spin,
    Empty,
    Tag,
    Pagination,
    Space,
    message,
    Tooltip,
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    HeartOutlined,
    HeartFilled,
    StarFilled,
    EnvironmentOutlined,
    EyeOutlined,
    GlobalOutlined,
} from '@ant-design/icons';
import heritageService from '@services/heritage.service';
import favoriteService from '@services/favorite.service';
import type { HeritageSite } from '@/types';
import './styles.less';

const HeritageBrowsePage: React.FC = () => {
    const navigate = useNavigate();
    const [sites, setSites] = useState<HeritageSite[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [filters, setFilters] = useState({
        q: '',
        region: undefined,
        unesco_listed: undefined,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 9,
        total: 0,
    });

    useEffect(() => {
        fetchSites();
        fetchFavoriteIds();
    }, [pagination.current, filters]);

    const fetchSites = async () => {
        try {
            setLoading(true);
            const response = await heritageService.getAll({
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            });
            setSites(response.data || []);
            setPagination((prev) => ({
                ...prev,
                total: response.pagination?.total || 0,
            }));
        } catch (error) {
            message.error('Không thể tải danh sách di sản');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoriteIds = async () => {
        try {
            const response = await favoriteService.getIdsByType('heritage_site');
            setFavoriteIds(new Set(response.data || []));
        } catch (error) {
            console.error('Cannot fetch favorite IDs');
        }
    };

    const handleToggleFavorite = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (favoriteIds.has(id)) {
                await favoriteService.remove('heritage_site', id.toString());
                setFavoriteIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                message.success('Đã xóa khỏi yêu thích');
            } else {
                await favoriteService.add('heritage_site', id.toString());
                setFavoriteIds((prev) => new Set(prev).add(id));
                message.success('Đã thêm vào yêu thích');
            }
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, q: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    return (
        <div className="heritage-browse-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Khám Phá Di Sản</h1>
                    <p className="page-description">
                        Hành trình tìm về cội nguồn văn hóa Việt Nam
                    </p>
                </div>
            </div>

            <Card className="filter-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={10} lg={8}>
                        <Input
                            size="large"
                            placeholder="Tìm kiếm di sản..."
                            prefix={<SearchOutlined />}
                            allowClear
                            onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                            onChange={(e) => {
                                if (!e.target.value) handleSearch('');
                            }}
                        />
                    </Col>
                    <Col xs={12} md={6} lg={4}>
                        <Select
                            size="large"
                            placeholder="Vùng miền"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, region: value }))
                            }
                        >
                            <Select.Option value="North">Miền Bắc</Select.Option>
                            <Select.Option value="Central">Miền Trung</Select.Option>
                            <Select.Option value="South">Miền Nam</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={12} md={4} lg={4}>
                        <Select
                            size="large"
                            placeholder="UNESCO"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, unesco_listed: value }))
                            }
                        >
                            <Select.Option value={true}>Có</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={4} lg={8}>
                        <Button
                            size="large"
                            icon={<FilterOutlined />}
                            onClick={() => {
                                setFilters({
                                    q: '',
                                    region: undefined,
                                    unesco_listed: undefined,
                                });
                                setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                        >
                            Xóa Bộ Lọc
                        </Button>
                    </Col>
                </Row>
            </Card>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" tip="Đang tải di sản..." />
                </div>
            ) : sites.length === 0 ? (
                <Card>
                    <Empty description="Không tìm thấy di sản nào" />
                </Card>
            ) : (
                <>
                    <Row gutter={[24, 24]} className="heritage-grid">
                        {sites.map((site) => (
                            <Col xs={24} sm={12} lg={8} key={site.id}>
                                <Card
                                    hoverable
                                    className="heritage-card"
                                    cover={
                                        <div className="heritage-cover">
                                            <img
                                                src={
                                                    site.main_image ||
                                                    (site.images && site.images[0]) ||
                                                    'https://via.placeholder.com/400x300'
                                                }
                                                alt={site.name}
                                            />
                                            <div className="heritage-overlay">
                                                <Space size="middle">
                                                    <Button
                                                        type="primary"
                                                        shape="circle"
                                                        icon={<EyeOutlined />}
                                                        size="large"
                                                        onClick={() => navigate(`/heritage-sites/${site.id}`)}
                                                    />
                                                    <Tooltip
                                                        title={
                                                            favoriteIds.has(site.id)
                                                                ? 'Bỏ yêu thích'
                                                                : 'Yêu thích'
                                                        }
                                                    >
                                                        <Button
                                                            type={
                                                                favoriteIds.has(site.id) ? 'primary' : 'default'
                                                            }
                                                            shape="circle"
                                                            icon={
                                                                favoriteIds.has(site.id) ? (
                                                                    <HeartFilled />
                                                                ) : (
                                                                    <HeartOutlined />
                                                                )
                                                            }
                                                            danger={favoriteIds.has(site.id)}
                                                            size="large"
                                                            onClick={(e) => handleToggleFavorite(site.id, e)}
                                                        />
                                                    </Tooltip>
                                                </Space>
                                            </div>
                                            {site.unesco_listed && (
                                                <Tooltip title="Di sản UNESCO">
                                                    <Tag className="unesco-tag" color="blue" icon={<GlobalOutlined />}>
                                                        UNESCO
                                                    </Tag>
                                                </Tooltip>
                                            )}
                                        </div>
                                    }
                                >
                                    <Card.Meta
                                        title={
                                            <div className="card-header">
                                                <Tooltip title={site.name}>
                                                    <div className="heritage-title">{site.name}</div>
                                                </Tooltip>
                                                <Tag color="gold">{site.region}</Tag>
                                            </div>
                                        }
                                        description={
                                            <div className="heritage-meta">
                                                <div className="description">
                                                    {site.description}
                                                </div>
                                                <div className="footer">
                                                    <div className="location">
                                                        <EnvironmentOutlined /> {site.address}
                                                    </div>
                                                    <div className="rating">
                                                        <StarFilled style={{ color: '#faad14' }} />
                                                        <span>{(site.rating || 0).toFixed(1)}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    />
                                </Card>
                            </Col>
                        ))}
                    </Row>

                    <div className="pagination-container">
                        <Pagination
                            current={pagination.current}
                            pageSize={pagination.pageSize}
                            total={pagination.total}
                            onChange={(page) =>
                                setPagination((prev) => ({ ...prev, current: page }))
                            }
                            showSizeChanger={false}
                            showTotal={(total) => `Tổng ${total} di sản`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default HeritageBrowsePage;
