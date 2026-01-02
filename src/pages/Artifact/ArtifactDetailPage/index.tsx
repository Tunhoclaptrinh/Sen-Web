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
  Image,
} from "antd";
import { RootState } from "@/types";
import { AppDispatch } from "@/store";
import { HeartOutlined, HeartFilled } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { fetchArtifactById } from "@store/slices/artifactSlice";
import favoriteService from "@/services/favorite.service";

const ArtifactDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const {
    currentItem: artifact,
    loading,
    error,
  } = useSelector((state: RootState) => state.artifact);
  const [isFavorite, setIsFavorite] = useState(false);
  useEffect(() => {
    if (id) {
      dispatch(fetchArtifactById(id));
    }
  }, [dispatch, id]);

  useEffect(() => {
    if (error) {
      message.error(error);
      navigate("/artifacts");
    }
  }, [error, navigate]);

  const handleToggleFavorite = async () => {
    try {
      if (isFavorite) {
        message.info("Feature updating...");
        setIsFavorite(false);
        message.success("Đã xóa khỏi yêu thích");
      } else {
        // Updated to pass two arguments if required, assuming second arg is itemType 'artifact' if needed separately or fixed in service
        // Service expects (type, id)
        await favoriteService.add('artifact', Number(id));
        setIsFavorite(true);
        message.success("Đã thêm vào yêu thích");
      }
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  if (loading) return <Spin />;

  if (!artifact) return <Empty description="Không tìm thấy hiện vật" />;

  return (
    <div>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 16 }}>
        ← Quay Lại
      </Button>

      <Card>
        <Row gutter={24}>
          <Col xs={24} md={12}>
            {artifact.image && (
              <Image
                src={artifact.image}
                alt={artifact.name}
                style={{ width: "100%", borderRadius: 8 }}
              />
            )}
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
                <h1>{artifact.name}</h1>
                <p style={{ color: "#8c8c8c" }}>{artifact.artifact_type}</p>
              </div>
              <Button
                icon={isFavorite ? <HeartFilled /> : <HeartOutlined />}
                onClick={handleToggleFavorite}
                style={{ fontSize: 20 }}
              />
            </div>

            <Row gutter={[16, 16]}>
              <Col xs={12}>
                <Statistic title="Đánh Giá" value={artifact.rating || "N/A"} />
              </Col>
              <Col xs={12}>
                <Statistic
                  title="Số Đánh Giá"
                  value={artifact.total_reviews || 0}
                />
              </Col>
            </Row>

            <div style={{ marginTop: 24 }}>
              <h3>Thông Tin</h3>
              <p>
                <strong>Loại:</strong> {artifact.artifact_type}
              </p>
              <p>
                <strong>Tình Trạng:</strong> {artifact.condition}
              </p>
              <p>
                <strong>Năm Tạo Tác:</strong> {artifact.year_created}
              </p>
              <p>
                <strong>Tác Giả:</strong> {artifact.creator || "N/A"}
              </p>
              <p>
                <strong>Chất Liệu:</strong> {artifact.material || "N/A"}
              </p>
              <p>
                <strong>Kích Thước:</strong> {artifact.dimensions || "N/A"}
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
              children: <p>{artifact.description}</p>,
            },
            {
              key: "2",
              label: "Chi Tiết",
              children: (
                <div>
                  <p>
                    <strong>Ngữ Cảnh Lịch Sử:</strong>{" "}
                    {artifact.historical_context}
                  </p>
                  <p>
                    <strong>Ý Nghĩa Văn Hóa:</strong>{" "}
                    {artifact.cultural_significance}
                  </p>
                  <p>
                    <strong>Câu Chuyện:</strong> {artifact.story}
                  </p>
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default ArtifactDetailPage;
