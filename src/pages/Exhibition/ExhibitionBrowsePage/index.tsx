import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
    const { t } = useTranslation();
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
                    <Title level={1}>{t('exhibition.browse.title')}</Title>
                    <p className="hero-subtitle">
                        {t('exhibition.browse.subtitle')}
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
                            placeholder={t('exhibition.browse.searchPlaceholder')}
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
                            placeholder={t('exhibition.browse.filters.theme')}
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.theme}
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, theme: value }))
                            }
                        >
                            <Select.Option value="Gốm sứ">{t('exhibition.browse.themes.pottery')}</Select.Option>
                            <Select.Option value="Lịch sử">{t('exhibition.browse.themes.history')}</Select.Option>
                            <Select.Option value="Văn hóa">{t('exhibition.browse.themes.culture')}</Select.Option>
                            <Select.Option value="Nghệ thuật">{t('exhibition.browse.themes.art')}</Select.Option>
                        </Select>
                    </div>

                    <div className="filter-divider" />

                    {/* Permanent Select */}
                    <div className="filter-item">
                        <Select
                            bordered={false}
                            placeholder={t('exhibition.browse.filters.type')}
                            style={{ width: '100%' }}
                            allowClear
                            value={filters.isPermanent}
                            onChange={(value) =>
                                setFilters((prev) => ({ ...prev, isPermanent: value }))
                            }
                        >
                            <Select.Option value={true}>{t('exhibition.browse.filters.permanent')}</Select.Option>
                            <Select.Option value={false}>{t('exhibition.browse.filters.temporary')}</Select.Option>
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
                            {t('exhibition.browse.filters.reset')}
                        </Button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{ textAlign: 'center', padding: '100px 0' }}>
                    <Spin size="large" tip={t('exhibition.browse.messages.loading')} />
                </div>
            ) : (
                <>
                    {/* 3. Discovered Section (Random/Featured Item) */}
                    {randomFeatured && (
                        <section className="discovered-section">
                            <Title level={2} className="header-title">{t('exhibition.browse.sections.featured')}</Title>
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
                            <Title level={2} className="header-title">{t('exhibition.browse.sections.explore')}</Title>

                            {exhibitions.length === 0 ? (
                                <Empty description={t('exhibition.browse.messages.empty')} />
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
                                    showTotal={(total) => t('exhibition.browse.pagination.total', { count: total })}
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
