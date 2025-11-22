import {
  Row,
  Col,
  Card,
  Input,
  Select,
  Button,
  Spin,
  Empty,
  message,
} from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { fetchHeritageSites } from "@store/slices/heritageSlice";
import { Link } from "react-router-dom";

const HeritageListPage = () => {
  const dispatch = useDispatch();
  const {
    items: sites,
    loading,
    error,
  } = useSelector((state) => state.heritage);
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ q: searchParams.get("q") || "" });

  useEffect(() => {
    dispatch(fetchHeritageSites(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleSearch = (value) => {
    setFilters({ ...filters, q: value });
  };

  return (
    <div>
      <h2>Danh Sách Di Sản Văn Hóa</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Tìm kiếm di sản..."
            prefix={<SearchOutlined />}
            value={filters.q}
            onChange={(e) => handleSearch(e.target.value)}
            size="large"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            placeholder="Chọn vùng"
            style={{ width: "100%" }}
            size="large"
            onChange={(value) => setFilters({ ...filters, region: value })}
            allowClear
            options={[
              { label: "Hà Nội", value: "Hà Nội" },
              { label: "Huế", value: "Huế" },
              { label: "Hội An", value: "Hội An" },
            ]}
          />
        </Col>
      </Row>

      <Spin spinning={loading}>
        {sites.length === 0 ? (
          <Empty description="Không tìm thấy di sản" />
        ) : (
          <Row gutter={[24, 24]}>
            {sites.map((site) => (
              <Col key={site.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={site.name}
                      src={site.image}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                >
                  <h4>{site.name}</h4>
                  <p style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {site.region}
                  </p>
                  <p style={{ fontSize: 12 }}>
                    {site.description?.substring(0, 60)}...
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>⭐ {site.rating || "N/A"}</span>
                    <Link to={`/heritage-sites/${site.id}`}>
                      <Button type="link" size="small">
                        Chi Tiết
                      </Button>
                    </Link>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Spin>
    </div>
  );
};

export default HeritageListPage;
