import React, { useEffect, useState } from "react";
import { Row, Col, Input, Button, Spin, Empty, Typography, Pagination, Select } from "antd";
import { useTranslation } from "react-i18next";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import heritageService from "@/services/heritage.service";
import ArticleCard from "@/components/common/cards/ArticleCard";
import DiscoveryCard from "@/components/common/cards/DiscoveryCard";
import { ITEM_TYPES } from "@/config/constants";
import { useCategories } from "@/hooks/useCategories";
import { HeritageSite } from "@/types/heritage.types";
import SeoHead from "@/components/common/SeoHead";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import "./styles.less";

const { Title } = Typography;

const HeritageBrowsePage: React.FC = () => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [sites, setSites] = useState<HeritageSite[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomFeatured, setRandomFeatured] = useState<HeritageSite | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  });

  interface FilterState {
    q: string;
    region?: string;
    categoryId?: number;
    unescoListed?: boolean;
  }

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    region: undefined,
    categoryId: undefined,
    unescoListed: undefined,
  });

  useEffect(() => {
    fetchSites();
  }, [pagination.current, filters]);

  usePrerenderReady(!loading);

  const fetchSites = async () => {
    try {
      setLoading(true);
      const response = await heritageService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        isActive: true,
        status: "published",
        ...filters,
      });

      const fetchedSites = response.data || [];
      setSites(fetchedSites);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));

      // Logic: Randomly pick one for Featured if not already set or filters changed
      if (fetchedSites.length > 0 && (!randomFeatured || filters.q)) {
        const newRandom = fetchedSites[Math.floor(Math.random() * fetchedSites.length)];
        setRandomFeatured(newRandom);
      } else if (fetchedSites.length === 0) {
        setRandomFeatured(null);
      }
    } catch (error) {
      console.error("Cannot fetch heritage sites", error);
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
      <SeoHead
        title={t("heritage.browse.heroTitle")}
        description={t("heritage.browse.heroSubtitle")}
        path="/heritage-sites"
        image="/images/Zero_home.png"
        keywords={["di tich", "di san", "van hoa viet nam", "du lich", "heritage"]}
      />

      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <Title level={1}>{t('heritage.browse.heroTitle')}</Title>
          <p className="hero-subtitle">
            {t('heritage.browse.heroSubtitle')}
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
              placeholder={t('heritage.browse.searchPlaceholder')}
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
              placeholder={t('heritage.browse.regionPlaceholder')}
              style={{ width: "100%" }}
              allowClear
              value={filters.region}
              onChange={(value) => setFilters((prev) => ({ ...prev, region: value }))}
            >
              <Select.Option value="North">{t('common.regions.North')}</Select.Option>
              <Select.Option value="Central">{t('common.regions.Central')}</Select.Option>
              <Select.Option value="South">{t('common.regions.South')}</Select.Option>
            </Select>
          </div>

          {/* Category Select */}
          <div className="filter-item">
            <Select
              bordered={false}
              placeholder={t('heritage.browse.categoryPlaceholder')}
              style={{ width: "100%" }}
              allowClear
              value={filters.categoryId}
              onChange={(value) => setFilters((prev) => ({ ...prev, categoryId: value }))}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="filter-divider" />

          {/* Unesco Select */}
          <div className="filter-item">
            <Select
              bordered={false}
              placeholder={t('heritage.browse.unescoPlaceholder')}
              style={{ width: "100%" }}
              allowClear
              value={filters.unescoListed}
              onChange={(value) => setFilters((prev) => ({ ...prev, unescoListed: value }))}
            >
              <Select.Option value={true}>{t('heritage.browse.unescoYes')}</Select.Option>
              <Select.Option value={false}>{t('heritage.browse.unescoNo')}</Select.Option>
            </Select>
          </div>

          {/* Reset Button */}
          <div className="filter-action">
            <Button
              className="delete-filter-btn"
              icon={<FilterOutlined />}
              onClick={() => {
                setFilters({
                  q: "",
                  region: undefined,
                  categoryId: undefined,
                  unescoListed: undefined,
                });
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            >
              {t('heritage.browse.resetFilters')}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip={t('heritage.browse.loading')} />
        </div>
      ) : (
        <>
          {/* 3. Discovered Section (Random/Featured Item) */}
          {randomFeatured && (
            <section className="discovered-section">
              <Title level={2} className="header-title">
                {t('heritage.browse.featuredSection')}
              </Title>
              <DiscoveryCard data={randomFeatured} type={ITEM_TYPES.HERITAGE} />
            </section>
          )}

          {/* 4. Undiscovered Section (Grid) */}
          <section className="undiscovered-section">
            <div className="bg-drum-container">
              <img src="/images/hoatiettrongdong.png" alt="drum" className="bg-drum" />
            </div>
            <div className="section-content">
              <Title level={2} className="header-title">
                {t('heritage.browse.exploreSection')}
              </Title>

              {sites.length === 0 ? (
                <Empty description={t('heritage.browse.empty')} />
              ) : (
                <Row gutter={[24, 24]}>
                  {sites.map((site) => (
                    <Col xs={24} sm={12} lg={8} key={site.id}>
                      <ArticleCard data={site} type={ITEM_TYPES.HERITAGE} />
                    </Col>
                  ))}
                </Row>
              )}
              <div style={{ marginTop: 40, display: "flex", justifyContent: "center", width: "100%" }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showTotal={(total) => t('heritage.browse.total', { count: total })}
                  onChange={(page) => setPagination((prev) => ({ ...prev, current: page }))}
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
