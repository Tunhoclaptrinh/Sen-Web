import {
  Card,
  Button,
  Spin,
  message,
  Empty,
  Row,
  Col,
  Statistic,
  Tabs,
} from "antd";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchHeritageSiteById } from "@store/slices/heritageSlice";
import favoriteService from "@services/favorite.service";

const HeritageDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {
    currentItem: site,
    loading,
    error,
  } = useSelector((state) => state.heritage);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    dispatch(fetchHeritageSiteById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      message.error(error);
      navigate("/heritage-sites");
    }
  }, [error, navigate]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        await favoriteAPI.remove("heritage_site", id);
        setIsFavorite(false);
        message.success("Đã xóa khỏi yêu thích");
      } else {
        await favoriteAPI.add("heritage_site", id);
        setIsFavorite(true);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  if (loading) return <Spin />;

  if (!site) return <Empty description="Không tìm thấy di sản" />;

  return (
    <div>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Quay Lại
      </Button>

      <Card>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            <img
              src={site.image}
              alt={site.name}
              style={{ width: "100%", borderRadius: 8 }}
            />
          </Col>
          <Col xs={24} md={12}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "start",
                marginBottom: 16,
              }}
            >
              <div>
                <h1>{site.name}</h1>
                <p style={{ color: "#8c8c8c" }}>{site.region}</p>
              </div>
              <Button
                icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleToggleFavorite}
                style={{ fontSize: 20 }}
              />
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Statistic title="Đánh Giá" value={site.rating || "N/A"} />
              </Col>
              <Col xs={12}>
                <Statistic
                  title="Số Đánh Giá"
                  value={site.total_reviews || 0}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <h3>Thông Tin</h3>
              <p>
                <strong>Loại:</strong> {site.type}
              </p>
              <p>
                <strong>Vùng:</strong> {site.region}
              </p>
              <p>
                <strong>Năm Thành Lập:</strong> {site.year_established}
              </p>
              <p>
                <strong>Địa Chỉ:</strong> {site.address}
              </p>
              <p>
                <strong>Giờ Mở Cửa:</strong> {site.visit_hours}
              </p>
              <p>
                <strong>Phí Vào Cửa:</strong>{" "}
                {site.entrance_fee?.toLocaleString()} VNĐ
              </p>
            </div>
          </Col>
        </Row>

        <Tabs
          style={{ marginTop: 32 }}
          items={[
            {
              key: "1",
              label: "Mô Tả",
              children: <p>{site.description}</p>,
            },
            {
              key: "2",
              label: "Hiện Vật",
              children: <Empty description="Chưa có hiện vật" />,
            },
            {
              key: "3",
              label: "Dòng Thời Gian",
              children: <Empty description="Chưa có sự kiện" />,
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default HeritageDetailPage;
