import React, {useEffect, useState} from "react";
import {Row, Col, Input, Button, Spin, Empty, Typography, Pagination, Select} from "antd";
import {SearchOutlined, FilterOutlined, CalendarOutlined, UserOutlined} from "@ant-design/icons";
import artifactService from "@/services/artifact.service";
import ArticleCard from "@/components/common/cards/ArticleCard";
import DiscoveryCard from "@/components/common/cards/DiscoveryCard";
import {ITEM_TYPES} from "@/config/constants";
import {useCategories} from "@/hooks/useCategories";
import {Artifact} from "@/types/artifact.types";
import "./styles.less";

const {Title} = Typography;

const ArtifactBrowsePage: React.FC = () => {
  const {categories} = useCategories();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [loading, setLoading] = useState(true);
  const [randomFeatured, setRandomFeatured] = useState<Artifact | null>(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 9,
    total: 0,
  });

  interface FilterState {
    q: string;
    categoryId?: number;
    year_created?: string;
    dynasty?: string;
  }

  const [filters, setFilters] = useState<FilterState>({
    q: "",
    categoryId: undefined,
    year_created: undefined,
    dynasty: undefined,
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
        status: "published",
        ...filters,
      });

      const fetchedArtifacts = response.data || [];
      setArtifacts(fetchedArtifacts);
      setPagination((prev) => ({
        ...prev,
        total: response.pagination?.total || 0,
      }));

      // Logic: Randomly pick one for Featured if not already set or filters changed
      if (fetchedArtifacts.length > 0 && (!randomFeatured || filters.q)) {
        const newRandom = fetchedArtifacts[Math.floor(Math.random() * fetchedArtifacts.length)];
        setRandomFeatured(newRandom);
      } else if (fetchedArtifacts.length === 0) {
        setRandomFeatured(null);
      }
    } catch (error) {
      console.error("Cannot fetch artifacts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setFilters((prev) => ({...prev, q: value}));
    setPagination((prev) => ({...prev, current: 1}));
  };

  return (
    <div className="artifact-browse-page">
      {/* 1. Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Kho tàng Hiện Vật</h1>
          <p className="hero-subtitle">Lưu giữ những giá trị văn hóa, lịch sử qua từng hiện vật cổ xưa</p>
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
                setFilters((prev) => ({...prev, q: e.target.value}));
                if (!e.target.value) setPagination((prev) => ({...prev, current: 1}));
              }}
            />
          </div>

          {/* Category Select */}
          <div className="filter-item">
            <Select
              bordered={false}
              placeholder="Danh mục"
              style={{width: "100%"}}
              allowClear
              value={filters.categoryId}
              onChange={(value) => setFilters((prev) => ({...prev, categoryId: value}))}
            >
              {categories.map((cat) => (
                <Select.Option key={cat.id} value={cat.id}>
                  {cat.name}
                </Select.Option>
              ))}
            </Select>
          </div>

          <div className="filter-divider" />

          {/* Year Created */}
          <div className="filter-item">
            <CalendarOutlined />
            <Input
              bordered={false}
              placeholder="Năm tạo tác"
              allowClear
              value={filters.year_created}
              onPressEnter={(e) => setFilters((prev) => ({...prev, year_created: e.currentTarget.value}))}
              onChange={(e) => setFilters((prev) => ({...prev, year_created: e.target.value}))}
            />
          </div>

          <div className="filter-divider" />

          {/* Dynasty */}
          <div className="filter-item">
            <UserOutlined />
            <Input
              bordered={false}
              placeholder="Triều đại"
              allowClear
              value={filters.dynasty}
              onPressEnter={(e) => setFilters((prev) => ({...prev, dynasty: e.currentTarget.value}))}
              onChange={(e) => setFilters((prev) => ({...prev, dynasty: e.target.value}))}
            />
          </div>

          {/* Reset Btn */}
          <div className="filter-action">
            <Button
              className="delete-filter-btn"
              icon={<FilterOutlined />}
              onClick={() => {
                setFilters({
                  q: "",
                  categoryId: undefined,
                  year_created: undefined,
                  dynasty: undefined,
                });
                setPagination((prev) => ({...prev, current: 1}));
              }}
            >
              Xóa Lọc
            </Button>
          </div>
        </div>
      </div>

      {loading ? (
        <div style={{textAlign: "center", padding: "100px 0"}}>
          <Spin size="large" tip="Đang tải dữ liệu..." />
        </div>
      ) : (
        <>
          {/* 3. Discovered Section (Random/Featured Item) */}
          {randomFeatured && (
            <section className="discovered-section">
              <Title level={2} className="header-title">
                Nổi bật
              </Title>
              <DiscoveryCard data={randomFeatured} type={ITEM_TYPES.ARTIFACT} />
            </section>
          )}

          {/* 4. Undiscovered Section (Grid) */}
          <section className="undiscovered-section">
            <div className="bg-drum-container">
              <img src="/images/hoatiettrongdong.png" alt="drum" className="bg-drum" />
            </div>
            <div className="section-content">
              <Title level={2} className="header-title">
                Khám phá
              </Title>

              {artifacts.length === 0 ? (
                <Empty description="Không tìm thấy hiện vật nào khác" />
              ) : (
                <Row gutter={[24, 24]}>
                  {artifacts.map((artifact) => (
                    <Col xs={24} sm={12} lg={8} key={artifact.id}>
                      <ArticleCard data={artifact} type={ITEM_TYPES.ARTIFACT} />
                    </Col>
                  ))}
                </Row>
              )}

              <div style={{marginTop: 40, display: "flex", justifyContent: "center", width: "100%"}}>
                <Pagination
                  current={pagination.current}
                  pageSize={pagination.pageSize}
                  total={pagination.total}
                  showTotal={(total) => `Tổng số: ${total}`}
                  onChange={(page) => setPagination((prev) => ({...prev, current: page}))}
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
