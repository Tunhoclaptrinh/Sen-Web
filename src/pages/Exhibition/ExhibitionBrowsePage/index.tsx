import React, { useEffect, useState } from 'react';

import {
    Row,
    Col,
    Button,
    Input,
    Select,
    Spin,
    Empty,
    Typography,
    Pagination
} from 'antd';
import {
    SearchOutlined,
    FilterOutlined,
    CalendarOutlined,
} from '@ant-design/icons';
import exhibitionService, { Exhibition } from '@/services/exhibition.service';
import ArticleCard from '@/components/common/cards/ArticleCard';
import DiscoveryCard from '@/components/common/cards/DiscoveryCard';
import './styles.less';

const { Title } = Typography;

const ExhibitionBrowsePage: React.FC = () => {
    const [exhibitions, setExhibitions] = useState<Exhibition[]>([]);
    const [loading, setLoading] = useState(true);
    interface FilterState {
        q: string;
        theme?: string;
        isPermanent?: boolean;
    }
    const [filters, setFilters] = useState<FilterState>({
        q: '',
        theme: undefined,
        isPermanent: undefined,
    });
    // Random featured exhibition
    const [randomFeatured, setRandomFeatured] = useState<Exhibition | null>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    });

    useEffect(() => {
        fetchExhibitions();
    }, [pagination.current, filters]);

    const fetchExhibitions = async () => {
        try {
            setLoading(true);
            const response = await exhibitionService.getAll({
                _page: pagination.current,
                _limit: pagination.pageSize,
                status: 'published',
                isActive: true,
                ...filters,
            });
            
            const fetchedExhibitions = response.data || [];
            setExhibitions(fetchedExhibitions);
            setPagination((prev) => ({
                ...prev,
                total: (response as any).pagination?.total || fetchedExhibitions.length,
            }));

            // Logic: Randomly pick one from the fetched list to be "Featured"
            if (fetchedExhibitions.length > 0) {
                 const newRandom = fetchedExhibitions[Math.floor(Math.random() * fetchedExhibitions.length)];
                 setRandomFeatured(newRandom);
            } else {
                setRandomFeatured(null);
            }

        } catch (error) {
            console.error('Cannot fetch exhibitions');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, q: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    return (
        <div className="exhibition-browse-page">
            {/* 1. Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <Title level={1}>Triển Lãm Ảo</Title>
                    <p className="hero-subtitle">
                        Khám phá không gian triển lãm di sản văn hóa qua công nghệ hiện đại
                    </p>
                </div>
            </section>

             {/* 2. Filter Section */}
            <div className="filter-container">
                <div className="unified-filter-bar">
                    
                    {/* Search */}
                    <div className="filter-item search-item">
                        <SearchOutlined />
                        <Input
                            bordered={false}
                            placeholder="Tìm kiếm triển lãm..."
                            allowClear
                            value={filters.q}
                            onPressEnter={(e) => handleSearch(e.currentTarget.value)}
                            onChange={(e) => {
                                setFilters((prev) => ({ ...prev, q: e.target.value }));
                                if (!e.target.value) setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                        />
                    </div>
                    
                    <div className="filter-divider" />

                    {/* Theme Select */}
                    <div className="filter-item">
                        <CalendarOutlined />
                        <Select
                            bordered={false}
                            placeholder="Chủ đề"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.theme}
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, theme: value }))
                            }
                        >
                            <Select.Option value="Gốm sứ">Gốm sứ</Select.Option>
                            <Select.Option value="Lịch sử">Lịch sử</Select.Option>
                            <Select.Option value="Văn hóa">Văn hóa</Select.Option>
                            <Select.Option value="Nghệ thuật">Nghệ thuật</Select.Option>
                        </Select>
                    </div>

                    <div className="filter-divider" />

                    {/* Permanent Select */}
                    <div className="filter-item">
                        <Select
                            bordered={false}
                            placeholder="Loại triển lãm"
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.isPermanent}
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, isPermanent: value }))
                            }
                        >
                            <Select.Option value={true}>Vĩnh viễn</Select.Option>
                            <Select.Option value={false}>Tạm thời</Select.Option>
                        </Select>
                    </div>

                    {/* Reset Btn */}
                    <div className="filter-action">
                        <Button
                            className="delete-filter-btn"
                            icon={<FilterOutlined />}
                            onClick={() => {
                                setFilters({
                                    q: '',
                                    theme: undefined,
                                    isPermanent: undefined,
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
                            <DiscoveryCard data={randomFeatured} type="exhibition" />
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
                             
                             {exhibitions.length === 0 ? (
                                <Empty description="Không tìm thấy triển lãm nào" />
                            ) : (
                                <Row gutter={[24, 24]}>
                                    {exhibitions.map((exhibition) => (
                                         <Col xs={24} sm={12} lg={8} key={exhibition.id}>
                                            <ArticleCard
                                                data={exhibition}
                                                type="exhibition"
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

export default ExhibitionBrowsePage;
