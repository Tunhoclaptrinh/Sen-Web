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
import { fetchArtifacts } from "@store/slices/artifactSlice";
import { Link } from "react-router-dom";

const ArtifactListPage = () => {
  const dispatch = useDispatch();
  const {
    items: artifacts,
    loading,
    error,
  } = useSelector((state) => state.artifact);
  const [filters, setFilters] = useState({ q: "" });

  useEffect(() => {
    dispatch(fetchArtifacts(filters));
  }, [dispatch, filters]);

  useEffect(() => {
    if (error) message.error(error);
  }, [error]);

  const handleSearch = (value) => {
    setFilters({ ...filters, q: value });
  };

  return (
    <div>
      <h2>Danh Sách Hiện Vật</h2>

      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12}>
          <Input
            placeholder="Tìm kiếm hiện vật..."
            prefix={<SearchOutlined />}
            value={filters.q}
            onChange={(e) => handleSearch(e.target.value)}
            size="large"
          />
        </Col>
        <Col xs={24} sm={12}>
          <Select
            placeholder="Chọn loại"
            style={{ width: "100%" }}
            size="large"
            onChange={(value) =>
              setFilters({ ...filters, artifact_type: value })
            }
            allowClear
            options={[
              { label: "Tranh Vẽ", value: "painting" },
              { label: "Gốm Sứ", value: "pottery" },
              { label: "Điêu Khắc", value: "sculpture" },
            ]}
          />
        </Col>
      </Row>

      <Spin spinning={loading}>
        {artifacts.length === 0 ? (
          <Empty description="Không tìm thấy hiện vật" />
        ) : (
          <Row gutter={[24, 24]}>
            {artifacts.map((artifact) => (
              <Col key={artifact.id} xs={24} sm={12} md={8} lg={6}>
                <Card
                  hoverable
                  cover={
                    <img
                      alt={artifact.name}
                      src={artifact.image}
                      style={{ height: 200, objectFit: "cover" }}
                    />
                  }
                >
                  <h4>{artifact.name}</h4>
                  <p style={{ fontSize: 12, color: "#8c8c8c" }}>
                    {artifact.artifact_type}
                  </p>
                  <p style={{ fontSize: 12 }}>
                    {artifact.description?.substring(0, 60)}...
                  </p>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>⭐ {artifact.rating || "N/A"}</span>
                    <Link to={`/artifacts/${artifact.id}`}>
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

export default ArtifactListPage;
