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
    Dropdown,
    message,
    Tooltip,
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    HeartOutlined,
    HeartFilled,
    PlusOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import artifactService from '@services/artifact.service';
import favoriteService from '@services/favorite.service';
import collectionService from '@services/collection.service';
import type { Artifact } from '@/types';
import './styles.less';

const ArtifactBrowsePage: React.FC = () => {
    const navigate = useNavigate();
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
    const [collections, setCollections] = useState<any[]>([]);
    const [filters, setFilters] = useState({
        q: '',
        artifact_type: undefined,
        condition: undefined,
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    });

    useEffect(() => {
        fetchArtifacts();
        fetchFavoriteIds();
        fetchCollections();
    }, [pagination.current, filters]);

    const fetchArtifacts = async () => {
        try {
            setLoading(true);
            const response = await artifactService.getAll({
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            });
            setArtifacts(response.data || []);
            setPagination((prev) => ({
                ...prev,
                total: response.pagination?.total || 0,
            }));
        } catch (error) {
            message.error('Không thể tải danh sách hiện vật');
        } finally {
            setLoading(false);
        }
    };

    const fetchFavoriteIds = async () => {
        try {
            const response = await favoriteService.getIdsByType('artifact');
            setFavoriteIds(new Set(response.data || []));
        } catch (error) {
            console.error('Cannot fetch favorite IDs');
        }
    };

    const fetchCollections = async () => {
        try {
            const response = await collectionService.getAll();
            setCollections(response.data || []);
        } catch (error) {
            console.error('Cannot fetch collections');
        }
    };

    const handleToggleFavorite = async (id: number, e: React.MouseEvent) => {
        e.stopPropagation();
        try {
            if (favoriteIds.has(id)) {
                await favoriteService.remove('artifact', id.toString());
                setFavoriteIds((prev) => {
                    const newSet = new Set(prev);
                    newSet.delete(id);
                    return newSet;
                });
                message.success('Đã xóa khỏi yêu thích');
            } else {
                await favoriteService.add('artifact', id.toString());
                setFavoriteIds((prev) => new Set(prev).add(id));
                message.success('Đã thêm vào yêu thích');
            }
        } catch (error) {
            message.error('Thao tác thất bại');
        }
    };

    const handleAddToCollection = async (artifactId: number, collectionId: number) => {
        try {
            await collectionService.addArtifact(collectionId, artifactId);
            message.success('Đã thêm vào bộ sưu tập');
        } catch (error) {
            message.error('Không thể thêm vào bộ sưu tập');
        }
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, q: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    const getConditionColor = (condition: string) => {
        const colors: Record<string, string> = {
            excellent: 'green',
            good: 'blue',
            fair: 'orange',
            poor: 'red',
        };
        return colors[condition] || 'default';
    };

    const getConditionLabel = (condition: string) => {
        const labels: Record<string, string> = {
            excellent: 'Xuất sắc',
            good: 'Tốt',
            fair: 'Khá',
            poor: 'Kém',
        };
        return labels[condition] || condition;
    };

    return (
        <div className="artifact-browse-page">
            <div className="page-header">
                <div>
                    <h1 className="page-title">Khám Phá Hiện Vật</h1>
                    <p className="page-description">
                        Khám phá những hiện vật quý giá của nền văn hóa Việt Nam
                    </p>
                </div>
            </div>

            <Card className="filter-card">
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12} lg={8}>
                        <Input
                            size="large"
                            placeholder="Tìm kiếm hiện vật..."
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
                            placeholder="Loại hiện vật"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, artifact_type: value }))
                            }
                        >
                            <Select.Option value="sculpture">Điêu khắc</Select.Option>
                            <Select.Option value="painting">Hội họa</Select.Option>
                            <Select.Option value="pottery">Gốm sứ</Select.Option>
                            <Select.Option value="textile">Dệt may</Select.Option>
                            <Select.Option value="document">Tài liệu</Select.Option>
                            <Select.Option value="weapon">Vũ khí</Select.Option>
                            <Select.Option value="jewelry">Trang sức</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={12} md={6} lg={4}>
                        <Select
                            size="large"
                            placeholder="Tình trạng"
                            style={{ width: '100%' }}
                            allowClear
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, condition: value }))
                            }
                        >
                            <Select.Option value="excellent">Xuất sắc</Select.Option>
                            <Select.Option value="good">Tốt</Select.Option>
                            <Select.Option value="fair">Khá</Select.Option>
                            <Select.Option value="poor">Kém</Select.Option>
                        </Select>
                    </Col>
                    <Col xs={24} md={12} lg={8}>
                        <Button
                            size="large"
                            icon={<FilterOutlined />}
                            onClick={() => {
                                setFilters({
                                    q: '',
                                    artifact_type: undefined,
                                    condition: undefined,
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
                    <Spin size="large" tip="Đang tải hiện vật..." />
                </div>
            ) : artifacts.length === 0 ? (
                <Card>
                    <Empty description="Không tìm thấy hiện vật nào" />
                </Card>
            ) : (
                <>
                    <Row gutter={[24, 24]} className="artifact-grid">
                        {artifacts.map((artifact) => (
                            <Col xs={24} sm={12} lg={8} xl={6} key={artifact.id}>
                                <Card
                                    hoverable
                                    className="artifact-card"
                                    cover={
                                        <div className="artifact-cover">
                                            <img
                                                src={
                                                    artifact.images?.[0] ||
                                                    'https://via.placeholder.com/300x200'
                                                }
                                                alt={artifact.name}
                                            />
                                            <div className="artifact-overlay">
                                                <Space size="middle">
                                                    <Tooltip title="Xem chi tiết">
                                                        <Button
                                                            type="primary"
                                                            shape="circle"
                                                            icon={<EyeOutlined />}
                                                            size="large"
                                                            onClick={() => navigate(`/artifacts/${artifact.id}`)}
                                                        />
                                                    </Tooltip>
                                                    <Tooltip
                                                        title={
                                                            favoriteIds.has(artifact.id)
                                                                ? 'Bỏ yêu thích'
                                                                : 'Yêu thích'
                                                        }
                                                    >
                                                        <Button
                                                            type={
                                                                favoriteIds.has(artifact.id) ? 'primary' : 'default'
                                                            }
                                                            shape="circle"
                                                            icon={
                                                                favoriteIds.has(artifact.id) ? (
                                                                    <HeartFilled />
                                                                ) : (
                                                                    <HeartOutlined />
                                                                )
                                                            }
                                                            danger={favoriteIds.has(artifact.id)}
                                                            size="large"
                                                            onClick={(e) => handleToggleFavorite(artifact.id, e)}
                                                        />
                                                    </Tooltip>
                                                </Space>
                                            </div>
                                            {artifact.is_on_display && (
                                                <Tag className="display-tag" color="green">
                                                    Đang trưng bày
                                                </Tag>
                                            )}
                                        </div>
                                    }
                                    actions={
                                        collections.length > 0
                                            ? [
                                                <Dropdown
                                                    key="collection"
                                                    menu={{
                                                        items: collections.map((col) => ({
                                                            key: col.id,
                                                            label: col.name,
                                                            onClick: () =>
                                                                handleAddToCollection(artifact.id, col.id),
                                                        })),
                                                    }}
                                                >
                                                    <Button type="text" icon={<PlusOutlined />}>
                                                        Thêm vào bộ sưu tập
                                                    </Button>
                                                </Dropdown>,
                                            ]
                                            : undefined
                                    }
                                >
                                    <Card.Meta
                                        title={
                                            <Tooltip title={artifact.name}>
                                                <div className="artifact-title">{artifact.name}</div>
                                            </Tooltip>
                                        }
                                        description={
                                            <div className="artifact-meta">
                                                <div className="tags">
                                                    <Tag color={getConditionColor(artifact.condition || '')}>
                                                        {getConditionLabel(artifact.condition || '')}
                                                    </Tag>
                                                    {artifact.year_created && (
                                                        <Tag>{artifact.year_created}</Tag>
                                                    )}
                                                </div>
                                                {/* 
                                                {artifact.heritage_site && (
                                                    <div className="location">
                                                        📍 {artifact.heritage_site.name}
                                                    </div>
                                                )}
                                                */}
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
                            showTotal={(total) => `Tổng ${total} hiện vật`}
                        />
                    </div>
                </>
            )}
        </div>
    );
};

export default ArtifactBrowsePage;
