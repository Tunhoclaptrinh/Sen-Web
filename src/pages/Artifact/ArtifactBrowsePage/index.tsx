import React, { useEffect, useState } from 'react';

import {
    Row,
    Col,
    Button,
    Input,
    Spin,
    Empty,
    Typography,
    Pagination
} from 'antd';
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
    const [filters, setFilters] = useState({
        q: '',
        year_created: undefined,
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
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={10} lg={8}>
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
                        <Input
                            size="large"
                            placeholder="Năm tạo tác"
                            prefix={<CalendarOutlined />}
                            allowClear
                            onPressEnter={(e) =>
                                setFilters((prev) => ({ ...prev, year_created: e.currentTarget.value as any }))
                            }
                        />
                    </Col>
                    <Col xs={12} md={4} lg={4}>
                         <Input
                            size="large"
                            placeholder="Triều đại"
                            prefix={<UserOutlined />}
                            allowClear
                            onPressEnter={(e) =>
                                setFilters((prev) => ({ ...prev, dynasty: e.currentTarget.value as any }))
                            }
                        />
                    </Col>
                    <Col xs={24} md={4} lg={8}>
                        <Button
                            size="large"
                            icon={<FilterOutlined />}
                            onClick={() => {
                                setFilters({
                                    q: '',
                                    year_created: undefined,
                                    dynasty: undefined,
                                });
                                setPagination((prev) => ({ ...prev, current: 1 }));
                            }}
                        >
                            Xóa Bộ Lọc
                        </Button>
                    </Col>
                </Row>
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
