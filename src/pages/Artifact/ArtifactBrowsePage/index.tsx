import React, { useEffect, useState } from 'react';

import {
    Row,
    Col,
    Button,
    Input,
    Spin,
    Empty,
    Typography,
    Pagination,
    Select,
    DatePicker
} from 'antd';
import dayjs from 'dayjs';
import {
    SearchOutlined,
    CalendarOutlined,
    UserOutlined,
    FilterOutlined,
} from '@ant-design/icons';
import artifactService from '@services/artifact.service';
import type { Artifact } from '@/types';
import ArticleCard from '@/components/common/cards/ArticleCard';
import DiscoveryCard from '@/components/common/cards/DiscoveryCard'; // Import
import './styles.less';

const { Title } = Typography;

const ArtifactBrowsePage: React.FC = () => {
    const [artifacts, setArtifacts] = useState<Artifact[]>([]);
    const [loading, setLoading] = useState(true);
    interface FilterState {
        q: string;
        yearCreated?: string;
        dynasty?: string;
    }
    const [filters, setFilters] = useState<FilterState>({
        q: '',
        yearCreated: undefined,
        dynasty: undefined,
    });
    // Random artifact state
    const [randomFeatured, setRandomFeatured] = useState<Artifact | null>(null);

    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 12,
        total: 0,
    });

    useEffect(() => {
        fetchArtifacts();
    }, [pagination.current, filters]);

    const fetchArtifacts = async () => {
        try {
            setLoading(true);
            const response = await artifactService.getAll({
                page: pagination.current,
                limit: pagination.pageSize,
                ...filters,
            });
            
            const fetchedArtifacts = response.data || [];
            setArtifacts(fetchedArtifacts);
            setPagination((prev) => ({
                ...prev,
                total: response.pagination?.total || 0,
            }));

            // Logic: Randomly pick one from the fetched list to be "Discovered" 
            // Only set if we don't have one or if filters changed drastically (optional)
            // For now, let's pick a random one from the current page to display at top
            if (fetchedArtifacts.length > 0) {
                 const newRandom = fetchedArtifacts[Math.floor(Math.random() * fetchedArtifacts.length)];
                 setRandomFeatured(newRandom);
            } else {
                setRandomFeatured(null);
            }

        } catch (error) {
            console.error('Cannot fetch artifacts');
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (value: string) => {
        setFilters((prev) => ({ ...prev, q: value }));
        setPagination((prev) => ({ ...prev, current: 1 }));
    };

    return (
        <div className="artifact-browse-page">
            {/* 1. Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1 className="hero-title">Kho tàng Hiện Vật</h1>
                    <p className="hero-subtitle">
                        Lưu giữ những giá trị văn hóa, lịch sử qua từng hiện vật cổ xưa
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
                            placeholder="Tìm kiếm hiện vật..."
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

                    {/* Year Created */}
                    <div className="filter-item">
                        <CalendarOutlined />
                        <DatePicker 
                            picker="year" 
                            placeholder="Năm tạo tác"
                            suffixIcon={null} /* Remove default calendar icon */
                            allowClear
                            style={{ width: '100%' }}
                            value={filters.yearCreated ? dayjs(filters.yearCreated, 'YYYY') : null}
                            onChange={(date, dateString) => 
                                setFilters((prev) => ({ 
                                    ...prev, 
                                    yearCreated: dateString as string 
                                }))
                            }
                        />
                    </div>

                    <div className="filter-divider" />

                    {/* Dynasty */}
                    <div className="filter-item">
                        <UserOutlined />
                        <Select
                            placeholder="Triều đại"
                            allowClear
                            showSearch
                            style={{ width: '100%' }}
                            value={filters.dynasty}
                            onChange={(value) => setFilters((prev) => ({ ...prev, dynasty: value }))}
                            options={[
                                { value: 'Văn hóa Đông Sơn', label: 'Văn hóa Đông Sơn' },
                                { value: 'Văn hóa Sa Huỳnh', label: 'Văn hóa Sa Huỳnh' },
                                { value: 'Văn hóa Óc Eo', label: 'Văn hóa Óc Eo' },
                                { value: 'Nhà Ngô', label: 'Nhà Ngô' },
                                { value: 'Nhà Đinh', label: 'Nhà Đinh' },
                                { value: 'Nhà Tiền Lê', label: 'Nhà Tiền Lê' },
                                { value: 'Nhà Lý', label: 'Nhà Lý' },
                                { value: 'Nhà Trần', label: 'Nhà Trần' },
                                { value: 'Nhà Hồ', label: 'Nhà Hồ' },
                                { value: 'Nhà Hậu Lê', label: 'Nhà Hậu Lê' },
                                { value: 'Nhà Mạc', label: 'Nhà Mạc' },
                                { value: 'Nhà Tây Sơn', label: 'Nhà Tây Sơn' },
                                { value: 'Nhà Nguyễn', label: 'Nhà Nguyễn' },
                                { value: 'Thời Pháp thuộc', label: 'Thời Pháp thuộc' },
                            ]}
                        />
                    </div>

                    {/* Reset Btn */}
                    <div className="filter-action">
                        <Button
                            className="delete-filter-btn"
                            icon={<FilterOutlined />}
                            onClick={() => {
                                setFilters({
                                    q: '',
                                    yearCreated: undefined,
                                    dynasty: undefined,
                                });
                                setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                        >
                            Xóa lọc
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
                            <DiscoveryCard data={randomFeatured} type="artifact" />
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
                             
                             {artifacts.length === 0 ? (
                                <Empty description="Không tìm thấy hiện vật nào khác" />
                            ) : (
                                <Row gutter={[24, 24]}>
                                    {artifacts.map((artifact) => (
                                         <Col xs={24} sm={12} lg={8} key={artifact.id}>
                                            <ArticleCard
                                                data={artifact}
                                                type="artifact"
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

export default ArtifactBrowsePage;
