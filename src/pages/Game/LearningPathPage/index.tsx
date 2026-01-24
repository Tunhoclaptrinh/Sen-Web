import React, {
  useEffect,
  useState,
  startTransition,
  Suspense,
  lazy,
} from "react";
import { useNavigate, useParams,
} from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Button,
  Spin,
  Empty,
  Typography,
  Tag,
  message,
} from "antd";
import {
  BookOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  TrophyOutlined,
  PlayCircleOutlined,
  LockOutlined,
} from "@ant-design/icons";
import learningService, { LearningModule } from "@/services/learning.service";
import { StatisticsCard } from "@/components/common";
import { motion, AnimatePresence } from "framer-motion";
import defaultThumbnail from "@/assets/images/background/senhoacum.png";
import "./styles.less";

const LearningDetail = lazy(() => import("./LearningDetail"));

const { Title, Paragraph } = Typography;

const LearningPathPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [learningPath, setLearningPath] = useState<LearningModule[]>([]);
  const [progress, setProgress] = useState<any>(null);

  useEffect(() => {
    if (!id) {
      fetchLearningPath();
    }
  }, [id]);

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
      easy: "geekblue",
      medium: "orange",
      hard: "volcano",
    };
    return colors[difficulty] || "blue";
  };

  const handlesNavigate = (path: string) => {
    startTransition(() => {
      navigate(path);
    });
  };

  // If ID is present, render detail view (LearningDetail handle its own loading)
  if (id) {
    return (
      <Suspense
        fallback={
          <div className="loading-overlay">
             <div className="loading-content">
                <Spin size="large" />
                <p>Đang tải bài học...</p>
             </div>
          </div>
        }
      >
        <LearningDetail />
      </Suspense>
    );
  }

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" tip="Đang tải lộ trình..." />
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
          <BookOutlined className="title-icon" /> Ôn tập kiến thức
        </Title>
        <Paragraph className="subtitle">
          Ôn luyện và củng cố kiến thức về lịch sử văn hóa Việt Nam qua các bài học chuyên sâu
        </Paragraph>
      </motion.div>

      {progress && (
        <div className="stats-container">
          <StatisticsCard
            data={[
              {
                title: "Tổng bài học",
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
                title: "Thời lượng",
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
            <Empty description="Chưa có bài học nào" />
          ) : (
            <Row gutter={[24, 24]} className="learning-grid">
              {learningPath.map((module, index) => {
                // Logic: A module is locked if the previous module is not completed
                // Exception: The first module (index 0) is always unlocked
                const isLocked = index > 0 && !learningPath[index - 1].is_completed;

                return (
                <Col xs={24} sm={12} lg={8} key={module.id}>
                  <motion.div
                    variants={{
                      hidden: { y: 20, opacity: 0 },
                      visible: {
                        y: 0,
                        opacity: 1,
                      },
                    }}
                    style={{ height: '100%' }}
                  >
                    <Card
                      hoverable={!isLocked}
                      className={`learning-card ${
                        module.is_completed ? "completed" : ""
                      } ${isLocked ? "locked" : ""}`}
                      style={{ 
                          borderRadius: 20, 
                          border: 'none', 
                          boxShadow: isLocked 
                              ? 'none' 
                              : (module.is_completed ? '0 10px 30px rgba(82, 196, 26, 0.15)' : '0 10px 30px rgba(0,0,0,0.08)'),
                          background: isLocked ? '#f5f5f5' : '#fff',
                          height: '100%',
                          display: 'flex',
                          flexDirection: 'column',
                          overflow: 'hidden',
                          position: 'relative',
                          transition: 'all 0.3s ease'
                      }}
                      bodyStyle={{ 
                          flex: 1, 
                          display: 'flex', 
                          flexDirection: 'column', 
                          padding: 24 
                      }}
                      cover={
                          <div className="learning-cover" style={{ position: 'relative', height: 200, overflow: 'hidden' }}>
                              <img 
                                  src={module.thumbnail || defaultThumbnail} 
                                  alt={module.title} 
                                  onError={(e) => {
                                      e.currentTarget.src = defaultThumbnail;
                                  }}
                                  style={{ 
                                      width: '100%', 
                                      height: '100%', 
                                      objectFit: 'cover',
                                      filter: isLocked ? "grayscale(100%) contrast(80%)" : "none", 
                                      opacity: isLocked ? 0.8 : 1,
                                      transition: 'transform 0.5s ease',
                                  }}
                                  className="card-image"
                              />
                              {module.is_completed && (
                                <div style={{ 
                                    position: 'absolute', top: 12, right: 12, 
                                    background: 'rgba(255, 255, 255, 0.95)', color: '#52c41a', 
                                    padding: '6px 14px', borderRadius: 20, 
                                    fontSize: 12, fontWeight: 700,
                                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                    display: 'flex', alignItems: 'center', gap: 6
                                }}>
                                  <CheckCircleOutlined /> Hoàn thành
                                </div>
                              )}
                              {isLocked && (
                                 <div style={{ 
                                     position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', 
                                     display: 'flex', alignItems: 'center', justifyContent: 'center',
                                     background: 'rgba(240, 240, 240, 0.6)'
                                 }}>
                                    <div style={{ 
                                        width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.8)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
                                    }}>
                                        <LockOutlined style={{ fontSize: 28, color: '#bfbfbf' }} />
                                    </div>
                                 </div>
                              )}
                          </div>
                      }
                    >
                      <div className="module-meta" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                        <div className="tags" style={{ marginBottom: 16, display: 'flex', gap: 8 }}>
                          <Tag
                            color={isLocked ? "default" : getDifficultyColor(module.difficulty || 'easy')}
                            style={{ 
                                borderRadius: 6, margin: 0, padding: '4px 12px', border: 'none',
                                fontWeight: 600, fontSize: 11
                            }}
                          >
                            {module.difficulty?.toUpperCase() || 'EASY'}
                          </Tag>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#8c8c8c' }}>
                             <ClockCircleOutlined /> {module.estimated_duration} phút
                          </div>
                        </div>

                        <Title level={4} ellipsis={{ rows: 2 }} style={{ marginBottom: 12, fontSize: 18, lineHeight: 1.4, flex: 1 }}>
                          {module.title}
                        </Title>

                        <div style={{ marginTop: 'auto' }}>
                            {module.is_completed ? (
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 20 }}>
                                    <Tag color="success" style={{ borderRadius: 6, border: 'none', padding: '2px 10px', background: 'rgba(82, 196, 26, 0.1)', color: '#52c41a' }}>
                                        Đã nhận thưởng
                                    </Tag>
                                    <div style={{ fontSize: 24, fontWeight: 800, color: module.score && module.score >= 80 ? '#52c41a' : '#faad14', lineHeight: 1 }}>
                                        {module.score}<span style={{ fontSize: 12, fontWeight: 500, color: '#8c8c8c', marginLeft: 4 }}>/100</span>
                                    </div>
                                </div>
                            ) : (
                                <div style={{ height: 28, marginBottom: 20 }}>
                                    {isLocked && <div style={{ color: '#8c8c8c', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}><LockOutlined /> Yêu cầu hoàn thành bài trước</div>}
                                    {!isLocked && <Tag color="processing" style={{ borderRadius: 6, border: 'none' }}>Chưa học</Tag>}
                                </div>
                            )}
                            
                            <Button
                                block
                                size="large"
                                disabled={isLocked}
                                onClick={() => !isLocked && handlesNavigate(`/game/learning/${module.id}`)}
                                type={module.is_completed ? "default" : "primary"}
                                style={{ 
                                    borderRadius: 12, 
                                    height: 48, 
                                    fontWeight: 700,
                                    fontSize: 16,
                                    border: module.is_completed ? '1px solid #d9d9d9' : 'none',
                                    background: isLocked 
                                        ? '#e6e6e6' 
                                        : (module.is_completed ? '#fff' : 'linear-gradient(90deg, #A31D1D 0%, #800000 100%)'), // Premium Red/Brown
                                    color: isLocked ? '#bfbfbf' : (module.is_completed ? '#595959' : '#fff'),
                                    boxShadow: !isLocked && !module.is_completed ? '0 8px 20px rgba(163, 29, 29, 0.25)' : 'none'
                                }}
                                icon={isLocked ? <LockOutlined /> : (module.is_completed ? <BookOutlined /> : <PlayCircleOutlined />)}
                            >
                                {isLocked ? "Chưa mở khóa" : (module.is_completed ? "Ôn lại" : "Học ngay")}
                            </Button>
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              );})}
            </Row>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default LearningPathPage;
