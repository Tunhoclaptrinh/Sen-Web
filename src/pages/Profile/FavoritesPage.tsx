import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Row,
    Col,
    Card,
    Tabs,
    Empty,
    Button,
    message,
    Tooltip,
    Tag,
    Spin,
    Pagination,
    Select,
    Space,
    Modal,
    Badge
} from 'antd';
import {
    HeartFilled,
    HomeOutlined,
    PictureOutlined,
    CalendarOutlined,
    DeleteOutlined,
    EyeOutlined,
    ReadOutlined,
    FilterOutlined,
    ReloadOutlined
} from '@ant-design/icons';
import favoriteService from '@/services/favorite.service';
import StatisticsCard from '@/components/common/StatisticsCard';
import ArticleCard from '@/components/common/cards/ArticleCard';
import FilterBuilder from '@/components/common/DataTable/FilterBuilder';
import { FilterConfig } from '@/components/common/DataTable/types';
import './styles.less';

const { Option } = Select;

const FavoritesPage: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<any[]>([]);
    const [activeTab, setActiveTab] = useState('all');
    
    // Pagination & Sort state
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(12);
    const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
    
    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        heritageSites: 0,
        artifacts: 0,
        exhibitions: 0,
        articles: 0
    });

    // Filter Modal State
    const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
    
    // FilterBuilder State
    const [activeFilters, setActiveFilters] = useState<FilterConfig[]>([]);
    const [filterValues, setFilterValues] = useState<Record<string, any>>({});
    const [filterOperators, setFilterOperators] = useState<Record<string, string>>({});
    const [enabledFilters, setEnabledFilters] = useState<Record<string, boolean>>({});
    const [appliedFilterCount, setAppliedFilterCount] = useState(0);

    const filterOptions: FilterConfig[] = [
        { 
            key: 'created_at_gte', // Direct key for "From Date"
            label: 'Đã thích từ ngày', 
            type: 'date', 
            defaultOperator: 'gte',
            operators: ['gte'] // Hidden operator, fixed to gte
        },
        { 
            key: 'created_at_lte', // Direct key for "To Date"
            label: 'Đến ngày', 
            type: 'date', 
            defaultOperator: 'lte',
            operators: ['lte'] // Hidden operator, fixed to lte
        },
        { 
            key: 'type', 
            label: 'Loại nội dung', 
            type: 'select', 
            operators: ['eq', 'ne'],
            options: [
                { label: 'Di Tích', value: 'heritage_site' },
                { label: 'Hiện Vật', value: 'artifact' },
                { label: 'Bài Viết', value: 'article' },
                { label: 'Triển Lãm', value: 'exhibition' }
            ]
        }
    ];

    useEffect(() => {
        fetchStats();
    }, []);

    useEffect(() => {
        fetchFavorites();
    }, [activeTab, page, pageSize, sortOrder, appliedFilterCount]); // Trigger when filters apply

    const fetchStats = async () => {
        try {
            const res = await favoriteService.getStats();
            if (res.success && res.data) {
                setStats({
                    total: res.data.total,
                    heritageSites: res.data.byType.heritageSite || 0,
                    artifacts: res.data.byType.artifact || 0,
                    exhibitions: res.data.byType.exhibition || 0,
                    articles: res.data.byType.article || 0
                });
            }
        } catch (error) {
            console.error("Failed to fetch stats", error);
        }
    };

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            const params: any = {
                page,
                limit: pageSize,
                sort: 'createdAt',
                order: sortOrder
            };
            
            // Base Filter from Tab (sent as flat param)
            if (activeTab !== 'all') {
                params.type = activeTab;
            }

            // Apply Advanced Filters (sent as flat params)
            if (appliedFilterCount > 0) {
                 activeFilters.forEach(f => {
                    if (enabledFilters[f.key] !== false) {
                        const op = filterOperators[f.key] || f.defaultOperator || 'eq';
                        // Calculate where FilterBuilder stored the value
                        const filterBuilderKey = op === 'eq' ? f.key : `${f.key}_${op}`; 
                        const val = filterValues[filterBuilderKey];

                        if (val !== undefined && val !== null && val !== '') {
                            // If user explicitly filters by Type in modal, OVERRIDE tab
                            if (f.key === 'type' && op === 'eq') {
                                params.type = val;
                            } else {
                                // For date fields defined as created_at_gte (with op='eq' in config for simplicity)
                                // If I configure key="created_at_gte", op="eq", val is at filterOValues["created_at_gte"]
                                // Then I just pass it as params["created_at_gte"] = val. Match!
                                params[f.key] = val;
                            }
                        }
                    }
                });
            }

            const response = await favoriteService.getAll(params);
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
            fetchFavorites(); // Reload list
            fetchStats(); // Reload stats
        } catch (error) {
            message.error('Không thể xóa khỏi yêu thích');
        }
    };

    const handleNavigate = (type: string, id: number) => {
        if (type === 'heritageSite') {
            navigate(`/heritage-sites/${id}`);
        } else if (type === 'artifact') {
            navigate(`/artifacts/${id}`);
        } else if (type === 'exhibition') {
            navigate(`/exhibitions/${id}`);
        } else if (type === 'article') {
             navigate(`/history/${id}`);
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'heritageSite': return <HomeOutlined />;
            case 'artifact': return <PictureOutlined />;
            case 'exhibition': return <CalendarOutlined />;
            case 'article': return <ReadOutlined />;
            default: return <HeartFilled />;
        }
    };

    const getTypeLabel = (type: string) => {
        switch (type) {
            case 'heritage_site': return 'Di Tích';
            case 'artifact': return 'Hiện Vật';
            case 'exhibition': return 'Triển Lãm';
            case 'article': return 'Bài Viết';
            default: return type;
        }
    };

    // Filter Builder Handlers
    const handleAddFilter = (key: string) => {
        const config = filterOptions.find(f => f.key === key);
        if (config && !activeFilters.find(f => f.key === key)) {
            setActiveFilters([...activeFilters, config]);
            setEnabledFilters({ ...enabledFilters, [key]: true });
        }
    };

    const handleRemoveFilterRow = (key: string) => {
        setActiveFilters(activeFilters.filter(f => f.key !== key));
        const newValues = { ...filterValues };
        delete newValues[key];
        setFilterValues(newValues);
    };

    const handleApplyFilter = () => {
        setAppliedFilterCount(activeFilters.filter(f => enabledFilters[f.key] !== false).length);
        setIsFilterModalVisible(false);
        setPage(1); // Reset page
    };

    const handleClearFilter = () => {
        setActiveFilters([]);
        setFilterValues({});
        setFilterOperators({});
        setEnabledFilters({});
        setAppliedFilterCount(0);
        setIsFilterModalVisible(false);
        setPage(1);
    };
    
    // Corrected filter options with 'eq' operator to map directly to backend suffix keys
    const correctedFilterOptions: FilterConfig[] = [
        { 
            key: 'created_at_gte', 
            label: 'Từ ngày', 
            type: 'date', 
            operators: ['eq'], // Use eq so FilterBuilder saves to 'created_at_gte', matching backend param
            defaultOperator: 'eq'
        },
        { 
            key: 'created_at_lte', 
            label: 'Đến ngày', 
            type: 'date', 
            operators: ['eq'], 
            defaultOperator: 'eq'
        },
        { 
            key: 'type', 
            label: 'Loại nội dung', 
            type: 'select', 
            operators: ['eq', 'ne'],
            options: [
                { label: 'Di Tích', value: 'heritage_site' },
                { label: 'Hiện Vật', value: 'artifact' },
                { label: 'Bài Viết', value: 'article' },
                { label: 'Triển Lãm', value: 'exhibition' }
            ]
        }
    ];

    return (
        <div className="favorites-page">
            <div className="page-header">
                <div>
                     {/* User removed title, keeping description only as per previous edit */}
                    <p className="page-description">
                        Quản lý các nội dung bạn đã lưu
                    </p>
                </div>
            </div>

            <div className="favorites-stats" style={{ marginBottom: 24 }}>
                <StatisticsCard
                    title="Thống Kê Tổng Quan"
                    loading={loading && favorites.length === 0}
                    colSpan={{ xs: 12, sm: 8, md: 8, lg: 4, xl: 4 }}
                    data={[
                        {
                            title: "Tổng Yêu Thích",
                            value: stats.total,
                            icon: <HeartFilled />,
                            valueColor: "#cf1322",
                             // User removed suffix
                            colSpan: { xs: 24, sm: 16, md: 16, lg: 8, xl: 8 }
                        },
                        {
                            title: "Di Tích",
                            value: stats.heritageSites,
                            icon: <HomeOutlined />,
                            valueColor: "#d48806",
                        },
                        {
                            title: "Hiện Vật",
                            value: stats.artifacts,
                            icon: <PictureOutlined />,
                            valueColor: "#1890ff",
                        },
                        {
                            title: "Bài Viết",
                            value: stats.articles,
                            icon: <ReadOutlined />,
                            valueColor: "#722ed1",
                        },
                        {
                            title: "Triển Lãm",
                            value: stats.exhibitions,
                            icon: <CalendarOutlined />,
                            valueColor: "#52c41a",
                        }
                    ]}
                />
            </div>

            <Card className="favorites-content">
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                    <Tabs
                        activeKey={activeTab}
                        onChange={(key) => {
                            setActiveTab(key);
                            setPage(1);
                        }}
                        style={{ marginBottom: 0, flex: 1 }}
                        items={[
                            { key: 'all', label: `Tất cả (${stats.total})` },
                            { key: 'heritage_site', label: `Di Tích (${stats.heritageSites})` },
                            { key: 'artifact', label: `Hiện Vật (${stats.artifacts})` },
                            { key: 'article', label: `Bài Viết (${stats.articles})` },
                            { key: 'exhibition', label: `Triển Lãm (${stats.exhibitions})` },
                        ]}
                    />
                    
                    <Space>
                        <Button 
                            icon={<FilterOutlined />} 
                            onClick={() => setIsFilterModalVisible(true)}
                        >
                            Bộ lọc
                            {appliedFilterCount > 0 && <Badge count={appliedFilterCount} style={{ marginLeft: 8, backgroundColor: '#52c41a' }} />}
                        </Button>

                        <span style={{ color: '#888', marginLeft: 8 }}>Sắp xếp:</span>
                        <Select 
                            defaultValue="desc" 
                            value={sortOrder}
                            style={{ width: 140 }} 
                            onChange={(val) => setSortOrder(val as 'asc' | 'desc')}
                        >
                            <Option value="desc">Mới nhất</Option>
                            <Option value="asc">Cũ nhất</Option>
                        </Select>
                        
                        <Button icon={<ReloadOutlined />} onClick={fetchFavorites} />
                    </Space>
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '60px 0' }}><Spin size="large" /></div>
                ) : favorites.length === 0 ? (
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <h3>Không tìm thấy kết quả</h3>
                                <p>Thử thay đổi bộ lọc hoặc thêm mục yêu thích mới</p>
                            </div>
                        }
                    >
                         {activeTab === 'all' && appliedFilterCount === 0 && (
                             <Button type="primary" onClick={() => navigate('/')}>
                                 Khám Phá Ngay
                             </Button>
                         )}
                         {appliedFilterCount > 0 && (
                             <Button onClick={handleClearFilter}>
                                 Xóa bộ lọc
                             </Button>
                         )}
                    </Empty>
                ) : (
                    <>
                        <Row gutter={[24, 24]} className="favorites-grid">
                            {favorites.map((favorite) => {
                                if (favorite.type === 'exhibition') {
                                    return (
                                        <Col xs={24} sm={12} lg={8} xl={6} key={favorite.id}>
                                            <Card
                                                hoverable
                                                className="favorite-card"
                                                cover={
                                                    <div className="favorite-cover">
                                                        <img
                                                            src={
                                                                favorite.item?.mainImage ||
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
                                                                onClick={() => handleNavigate(favorite.type, favorite.referenceId)}
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
                                                            onClick={() => handleRemoveFavorite(favorite.type, favorite.referenceId)}
                                                        >
                                                            Xóa
                                                        </Button>
                                                    </Tooltip>,
                                                ]}
                                            >
                                                <Card.Meta
                                                    title={<div className="favorite-title"><span>{favorite.item?.name}</span></div>}
                                                    description={
                                                        <div className="favorite-description">
                                                            <Tag icon={getTypeIcon(favorite.type)} color="purple">{getTypeLabel(favorite.type)}</Tag>
                                                        </div>
                                                    }
                                                />
                                            </Card>
                                        </Col>
                                    );
                                }

                                let cardType: 'heritage' | 'artifact' | 'history' = 'history';
                                if (favorite.type === 'heritage_site') cardType = 'heritage';
                                else if (favorite.type === 'artifact') cardType = 'artifact';
                                
                                return (
                                    <Col xs={24} sm={12} lg={8} xl={6} key={favorite.id}>
                                        <ArticleCard 
                                            data={favorite.item} // Pass the enriched item data
                                            type={cardType}
                                            variant="default"
                                            secondaryAction={
                                                <Tooltip title="Bỏ thích">
                                                    <Button 
                                                        type="text" 
                                                        danger 
                                                        shape="circle"
                                                        icon={<DeleteOutlined />} 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRemoveFavorite(favorite.type, favorite.referenceId);
                                                        }}
                                                    />
                                                </Tooltip>
                                            }
                                            // Removed actions prop to let default 'Khám phá' button render
                                        />
                                    </Col>
                                );
                            })}
                        </Row>
                        
                        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
                            <Pagination
                                current={page}
                                pageSize={pageSize}
                                total={activeTab === 'all' ? stats.total : stats[activeTab === 'heritage_site' ? 'heritage_sites' : activeTab === 'artifact' ? 'artifacts' : activeTab === 'exhibition' ? 'exhibitions' : 'articles']}
                                onChange={(p, ps) => {
                                    setPage(p);
                                    if (ps !== pageSize) setPageSize(ps);
                                    window.scrollTo({ top: 0, behavior: 'smooth' });
                                }}
                                showSizeChanger
                                showTotal={(total, range) => `${range[0]}-${range[1]} của ${total} mục`}
                            />
                        </div>
                    </>
                )}
            </Card>

            <Modal
                title="Bộ lọc nâng cao"
                open={isFilterModalVisible}
                onCancel={() => setIsFilterModalVisible(false)}
                footer={null}
                width={700}
            >
                <FilterBuilder 
                    filters={correctedFilterOptions}
                    activeFilters={activeFilters}
                    filterValues={filterValues}
                    operators={filterOperators}
                    enabledFilters={enabledFilters}
                    onAddFilter={handleAddFilter}
                    onRemoveFilter={handleRemoveFilterRow}
                    onFilterChange={(key, val) => setFilterValues({ ...filterValues, [key]: val })}
                    onOperatorChange={(key, op) => setFilterOperators({ ...filterOperators, [key]: op })}
                    onToggleFilter={(key) => setEnabledFilters({ ...enabledFilters, [key]: !enabledFilters[key] })}
                    onApply={handleApplyFilter}
                    onClear={handleClearFilter}
                    onCancel={() => setIsFilterModalVisible(false)}
                />
            </Modal>
        </div>
    );
};

export default FavoritesPage;
