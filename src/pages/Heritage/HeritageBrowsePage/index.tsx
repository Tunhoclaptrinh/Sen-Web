import React, { useEffect, useState } from 'react';

import {
    Row,
    Col,
    Input,
    Select,
    Button,
    Spin,
    Empty,
    Typography,
    Pagination
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import heritageService from '@services/heritage.service';
import type { HeritageSite } from '@/types';
import ArticleCard from '@/components/common/cards/ArticleCard';
import DiscoveryCard from '@/components/common/cards/DiscoveryCard'; // Import
import './styles.less';

const { Title } = Typography;

const HeritageBrowsePage: React.FC = () => {
    const [sites, setSites] = useState<HeritageSite[]>([]);
    const [loading, setLoading] = useState(true);
    interface FilterState {
        q: string;
        region?: string;
        unesco_listed?: boolean;
    }
    const [filters, setFilters] = useState<FilterState>({
        q: '',
        region: undefined,
        unesco_listed: undefined,
    });
    // Random featured site
    const [randomFeatured, setRandomFeatured] = useState<HeritageSite | null>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    });

    useEffect(() => {
        fetchSites();
    }, [pagination.current, filters]);

    const fetchSites = async () => {
        try {
            setLoading(true);
            const response = await heritageService.getAll({
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            });
            
            const fetchedSites = response.data || [];
            setSites(fetchedSites);
            setPagination((prev) => ({
                ...prev,
                total: response.pagination?.total || 0,
            }));

            // Logic: Randomly pick one
            if (fetchedSites.length > 0) {
                 const newRandom = fetchedSites[Math.floor(Math.random() * fetchedSites.length)];
                 setRandomFeatured(newRandom);
            } else {
                setRandomFeatured(null);
            }

        } catch (error) {
            console.error('Cannot fetch heritage sites');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, q: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    return (
        <div className="heritage-browse-page">
            {/* 1. Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <Title level={1}>Hành Trình Di Sản</Title>
                    <p className="hero-subtitle">
                        Kết nối quá khứ và hiện tại, khám phá vẻ đẹp bất tận của danh lam thắng cảnh
                        và di tích lịch sử Việt Nam.
                    </p>
                </div>
            </section>

             {/* 2. Filter Section */}
             <div className="filter-container">
                <div className="unified-filter-bar">
                    {/* Search Item */}
                    <div className="filter-item search-item">
                        <SearchOutlined />
                        <Input
                            bordered={false}
                            placeholder="Tìm kiếm di sản..."
                            allowClear
                            value={filters.q}
                            onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                            onChange={(e) => {
                                // If clearing manually or typing
                                setFilters((prev) => ({ ...prev, q: e.target.value }));
                                if (!e.target.value) setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                        />
                    </div>
                    
                    <div className="filter-divider" />

                    {/* Region Select */}
                    <div className="filter-item">
                        <Select
                            bordered={false}
                            placeholder="Vùng miền"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.region}
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, region: value }))
                            }
                        >
                            <Select.Option value="North">Miền Bắc</Select.Option>
                            <Select.Option value="Central">Miền Trung</Select.Option>
                            <Select.Option value="South">Miền Nam</Select.Option>
                        </Select>
                    </div>

                    <div className="filter-divider" />

                    {/* Unesco Select */}
                    <div className="filter-item">
                        <Select
                            bordered={false}
                            placeholder="UNESCO"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.unesco_listed}
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, unesco_listed: value }))
                            }
                        >
                            <Select.Option value={true}>Có UNESCO</Select.Option>
                            <Select.Option value={false}>Không</Select.Option>
                        </Select>
                    </div>

                    {/* Reset Button */}
                    <div className="filter-action">
                        <Button
                            className="delete-filter-btn"
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
                            Xóa Lọc
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" tip="Đang tải dữ liệu..." />
                </div>
            ) : (
                <>
                     {/* 3. Discovered Section (Random/Featured Item) */}
                    {randomFeatured && (
                         <section className="discovered-section">
                            <Title level={2} className="header-title">Nổi bật</Title>
                            <DiscoveryCard data={randomFeatured} type="heritage" />
                        </section>
                    )}

                    {/* 4. Undiscovered Section (Grid) */}
                    <section className="undiscovered-section">
                         <div className="bg-drum-container">
                            <img
                                src="/images/hoatiettrongdong.png"
                                alt="drum"
                                className="bg-drum"
                            />
                        </div>
                        <div className="section-content">
                             <Title level={2} className="header-title">Khám phá</Title>

                             {sites.length === 0 ? (
                                <Empty description="Không tìm thấy di sản nào khác" />
                            ) : (
                                <Row gutter={[24, 24]}>
                                    {sites.map((site) => (
                                         <Col xs={24} sm={12} lg={8} key={site.id}>
                                            <ArticleCard
                                                data={site}
                                                type="heritage"
                                            />
                                        </Col>
                                    ))}
                                </Row>
                            )}
                            <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center', width: '100%' }}>
                                <Pagination
                                    current={pagination.current}
                                    pageSize={pagination.pageSize}
                                    total={pagination.total}
                                    showTotal={(total) => `Tổng số: ${total}`}
                                    onChange={(page) =>
                                        setPagination((prev) => ({ ...prev, current: page }))
                                    }
                                    showSizeChanger={false}
                                />
                            </div>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
};

export default HeritageBrowsePage;
