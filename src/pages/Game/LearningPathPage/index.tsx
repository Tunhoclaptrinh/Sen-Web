import React, {
  useEffect,
  useState,
  startTransition,
  Suspense,
  lazy,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Spin,
  Empty,
  Progress,
  Tag,
  message,
  Typography,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
} from "@ant-design/icons";
import learningService from "@/services/learning.service";
import { fetchProgress } from "@/store/slices/gameSlice";
import { useAppDispatch } from "@/store/hooks";
import { StatisticsCard } from "@/components/common";
import { motion, AnimatePresence } from "framer-motion";
import "./styles.less";

const LearningDetail = lazy(() => import("./LearningDetail"));

const { Meta } = Card;
const { Title, Paragraph } = Typography;

const LearningPathPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<any[]>([]);
  const [progress, setProgress] = useState<any>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!id) {
      fetchLearningPath();
      dispatch(fetchProgress());
    }
  }, [id, dispatch]);

  const fetchLearningPath = async () => {
    try {
      setLoading(true);
      const response = await learningService.getLearningPath();
      setLearningPath(response.data || []);
      setProgress(response.progress);
    } catch (error) {
      message.error("Không thể tải lộ trình học tập");
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      easy: "green",
      medium: "orange",
      hard: "red",
    };
    return colors[difficulty] || "default";
  };

  const getDifficultyLabel = (difficulty: string) => {
    const labels: Record<string, string> = {
      easy: "Dễ",
      medium: "Trung Bình",
      hard: "Khó",
    };
    return labels[difficulty] || difficulty;
  };

  const handleNavigate = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  // If ID is present, render detail view (LearningDetail handle its own loading)
  if (id) {
    return (
      <Suspense
        fallback={
          <div className="loading-container">
            <Spin size="large" tip="Đang tải bài học..." />
          </div>
        }
      >
        <LearningDetail />
      </Suspense>
    );
  }

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "100px 0" }}>
        <Spin size="large" tip="Đang tải lộ trình học tập..." />
      </div>
    );
  }

  return (
    <div className="learning-path-page">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <Title level={1} className="main-title">
          <BookOutlined className="title-icon" /> Lộ trình học tập
        </Title>
        <Paragraph className="subtitle">
          Khám phá và học hỏi về lịch sử văn hóa Việt Nam qua các module chuyên
          sâu
        </Paragraph>
      </motion.div>

      {progress && (
        <div className="learning-stats">
          <StatisticsCard
            data={[
              {
                title: "Tổng module",
                value: progress.total || 0,
                icon: <BookOutlined />,
                valueColor: "#1890ff",
              },
              {
                title: "Đã hoàn thành",
                value: progress.completed || 0,
                icon: <CheckCircleOutlined />,
                valueColor: "#52c41a",
              },
              {
                title: "Tiến độ",
                icon: <TrophyOutlined />,
                valueColor: "#faad14",
                value: `${progress.percentage || 0}%`,
              },
              {
                title: "Thời gian",
                value: `${learningPath.reduce((sum, m) => sum + (m.estimated_duration || 0), 0)}'`,
                icon: <ClockCircleOutlined />,
                valueColor: "#722ed1",
              },
            ]}
            colSpan={{ xs: 12, sm: 12, md: 6 }}
            hideCard
            cardStyle={{
              borderRadius: 20,
              backdropFilter: "blur(8px)",
              background: "rgba(255, 255, 255, 0.7)",
              border: "1px solid rgba(255, 255, 255, 0.3)",
            }}
          />
        </div>
      )}

      <AnimatePresence>
        <motion.div
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
          initial="hidden"
          animate="visible"
          className="learning-content"
        >
          {learningPath.length === 0 ? (
            <Empty description="Chưa có module học tập nào" />
          ) : (
            <Row gutter={[24, 24]} className="learning-grid">
              {learningPath.map((module, index) => (
                <Col xs={24} sm={12} lg={8} key={module.id}>
                  <motion.div
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                      },
                    }}
                  >
                    <Card
                      hoverable
                      className={`learning-card ${
                        module.is_completed ? "completed" : ""
                      }`}
                      cover={
                        <div className="learning-cover">
                          <div className="learning-number">{index + 1}</div>
                          {module.is_completed && (
                            <div className="completed-badge">
                              <CheckCircleOutlined /> Hoàn thành
                            </div>
                          )}
                        </div>
                      }
                      actions={[
                        <Button
                          key="start"
                          type={module.is_completed ? "default" : "primary"}
                          block
                          onClick={() =>
                            handleNavigate(`/game/learning/${module.id}`)
                          }
                        >
                          {module.is_completed ? "Xem Lại" : "Bắt Đầu"}
                        </Button>,
                      ]}
                    >
                      <Meta
                        title={module.title}
                        description={
                          <div className="module-meta">
                            <div className="tags">
                              <Tag
                                color={getDifficultyColor(module.difficulty)}
                              >
                                {getDifficultyLabel(module.difficulty)}
                              </Tag>
                              <Tag icon={<ClockCircleOutlined />}>
                                {module.estimated_duration} phút
                              </Tag>
                            </div>

                            {module.is_completed && module.score !== null && (
                              <div className="score">
                                <Progress
                                  type="circle"
                                  percent={module.score}
                                  width={60}
                                  strokeColor={{
                                    "0%": "#108ee9",
                                    "100%": "#87d068",
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        }
                      />
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LearningPathPage;
