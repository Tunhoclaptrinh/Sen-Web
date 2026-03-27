import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Row, Col, Input, Button, Spin, Empty, Typography, Pagination, Select } from "antd";
import { SearchOutlined, FilterOutlined } from "@ant-design/icons";
import historyService from "@/services/history.service";
import ArticleCard from "@/components/common/cards/ArticleCard";
import DiscoveryCard from "@/components/common/cards/DiscoveryCard";
import { useCategories } from "@/hooks/useCategories";
import SeoHead from "@/components/common/SeoHead";
import { usePrerenderReady } from "@/hooks/usePrerenderReady";
import "./styles.less";

const { Title } = Typography;

const HistoryListPage: React.FC = () => {
  const { t } = useTranslation();
  const { categories } = useCategories();
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomFeatured, setRandomFeatured] = useState<any | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  });

  interface FilterState {
    q: string;
    categoryId?: number;
    isActive?: boolean;
  }
  const [filters, setFilters] = useState<FilterState>({
    q: "",
    categoryId: undefined,
    isActive: true,
  });

  useEffect(() => {
    fetchData();
  }, [pagination.current, filters]);

  usePrerenderReady(!loading);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await historyService.getAll({
        page: pagination.current,
        limit: pagination.pageSize,
        status: "published",
        ...filters,
      });

      const fetchedData = response.data || [];
      setArticles(fetchedData);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));

      // Logic: Randomly pick one for Featured if on first page and no search
      if (fetchedData.length > 0 && (!randomFeatured || filters.q)) {
        const newRandom = fetchedData[Math.floor(Math.random() * fetchedData.length)];
        setRandomFeatured(newRandom);
      } else if (fetchedData.length === 0) {
        setRandomFeatured(null);
      }
    } catch (error) {
      console.error("Cannot fetch history articles", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({ ...prev, q: value }));
    setPagination((prev) => ({ ...prev, current: 1 }));
  };

  return (
    <div className="heritage-browse-page history-list-page">
      <SeoHead
        title={t("history.list.title")}
        description={t("history.list.subtitle")}
        path="/history"
        image="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355946/sen_web/static/public/images/Zero_home.jpg"
        keywords={["bai viet lich su", "lich su viet nam", "van hoa", "history"]}
      />

      {/* 1. Hero Section - Reusing heritage styling classes */}
      <section className="hero-section">
        <div className="hero-content">
          <Title level={1}>{t('history.list.title')}</Title>
          <p className="hero-subtitle">{t('history.list.subtitle')}</p>
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
              placeholder={t('history.list.searchPlaceholder')}
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

          {/* Category Select */}
          <div className="filter-item">
            <Select
              bordered={false}
              placeholder={t('history.list.filters.category')}
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

          {/* Reset Button */}
          <div className="filter-action">
            <Button
              className="delete-filter-btn"
              icon={<FilterOutlined />}
              onClick={() => {
                setFilters({
                  q: "",
                  categoryId: undefined,
                  isActive: true,
                });
                setPagination((prev) => ({ ...prev, current: 1 }));
              }}
            >
              {t('history.list.filters.reset')}
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip={t('history.list.messages.loading')} />
        </div>
      ) : (
        <>
          {/* 3. Discovered Section (Random/Featured Item) */}
          {randomFeatured && (
            <section className="discovered-section">
              <Title level={2} className="header-title">
                {t('history.list.sections.featured')}
              </Title>
              {/* @ts-ignore - type 'history' to be added */}
              <DiscoveryCard data={{ ...randomFeatured, name: randomFeatured.title }} type="history" />
            </section>
          )}

          {/* 4. Undiscovered Section (Grid) */}
          <section className="undiscovered-section">
            <div className="bg-drum-container">
              <img src="https://res.cloudinary.com/dmqb5l6bw/image/upload/f_auto,q_auto/v1774355964/sen_web/static/public/images/hoatiettrongdong.png" alt="drum" className="bg-drum" />
            </div>
            <div className="section-content">
              <Title level={2} className="header-title">
                {t('history.list.sections.explore')}
              </Title>

              {articles.length === 0 ? (
                <Empty description={t('history.list.messages.empty')} />
              ) : (
                <Row gutter={[24, 24]}>
                  {articles.map((item) => (
                    <Col xs={24} sm={12} lg={8} key={item.id}>
                      <ArticleCard
                        // @ts-ignore - mapping title to name and type handling
                        data={{ ...item, name: item.title, id: item.id }}
                        type="history"
                      />
                    </Col>
                  ))}
                </Row>
              )}
              <div style={{ marginTop: 40, display: "flex", justifyContent: "center", width: "100%" }}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showTotal={(total) => t('history.list.pagination.total', { count: total })}
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

export default HistoryListPage;
