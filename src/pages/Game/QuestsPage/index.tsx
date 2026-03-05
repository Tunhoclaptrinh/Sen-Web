import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Tabs, Spin, Empty, Progress, Tag, message, Modal, Typography, Space } from "antd";
import Button from "@/components/common/Button";
import { useGameSounds } from "@/hooks/useSound";
import { StatisticsCard } from "@/components/common";
import {
  TrophyOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  GiftOutlined,
  RocketOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  fetchActiveQuests,
  startQuest,
  claimQuestRewards,
  clearSuccessMessage,
  clearError,
  QuestState,
} from "@/store/slices/questSlice";
import type { Quest } from "@/types/quest.types";
import "./styles.less";
import { getImageUrl } from "@/utils/image.helper";

const { Title, Paragraph } = Typography;

const QuestsPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { activeQuests, activeLoading, error, successMessage } = useAppSelector(
    (state) =>
      (state.quest || { activeQuests: [], activeLoading: false, error: null, successMessage: null }) as QuestState,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const { playClick } = useGameSounds();

  useEffect(() => {
    dispatch(fetchActiveQuests());
  }, [dispatch]);

  useEffect(() => {
    if (successMessage) {
      message.success(successMessage);
      dispatch(clearSuccessMessage());
    }
    if (error) {
      message.error(error);
      dispatch(clearError());
    }
  }, [successMessage, error, dispatch]);

  const handleStartQuest = (questId: number) => {
    dispatch(startQuest(questId));
  };

  const handleClaimRewards = (questId: number) => {
    dispatch(claimQuestRewards(questId))
      .unwrap()
      .then(() => {
        message.success("Phần thưởng đã được chuyển vào túi đồ!");
      })
      .catch(() => {
        // Error handled by global state
      });
  };

  const handleNavigate = (quest: Quest) => {
    const type = quest.requirements?.[0]?.type;
    switch (type) {
      case "complete_chapter":
        navigate("/game/chapters");
        break;
      case "collect_artifact":
        navigate("/game/museum");
        break;
      case "perfect_quiz":
        navigate("/game/learning");
        break;
      case "visit_museum":
        navigate("/game/museum");
        break;
      default:
        navigate("/game");
    }
  };

  const handleViewDetail = (quest: Quest) => {
    setSelectedQuest(quest);
    setDetailModalVisible(true);
  };

  const getQuestsByTab = () => {
    let filtered = activeQuests;
    if (activeTab !== "all") {
      filtered = filtered.filter((q: Quest) => q.type === activeTab);
    }

    // Sort: Completed (not claimed) > In Progress > Not Started > Claimed
    return [...filtered].sort((a: Quest, b: Quest) => {
      const getScore = (q: Quest) => {
        if (q.progress?.status === "completed") return 3; // Top priority (Claim now)
        if (q.progress?.status === "inProgress") return 2;
        if (!q.progress) return 1; // Not started
        if (q.progress?.status === "claimed") return 0; // Bottom
        return 0;
      };
      return getScore(b) - getScore(a);
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "daily":
        return <CalendarOutlined />;
      case "weekly":
        return <ClockCircleOutlined />;
      case "achievement":
        return <TrophyOutlined />;
      case "exploration":
        return <RocketOutlined />;
      default:
        return <CheckCircleOutlined />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "daily":
        return "blue";
      case "weekly":
        return "purple";
      case "achievement":
        return "gold";
      case "exploration":
        return "cyan";
      default:
        return "default";
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
    },
  };

  const statsData = [
    {
      title: "Tất cả",
      value: activeQuests.length,
      valueColor: "#1890ff",
      icon: <CheckCircleOutlined />,
    },
    {
      title: "Hàng ngày",
      value: activeQuests.filter((q) => q.type === "daily").length,
      valueColor: "#52c41a",
      icon: <CalendarOutlined />,
    },
    {
      title: "Hàng tuần",
      value: activeQuests.filter((q) => q.type === "weekly").length,
      valueColor: "#722ed1",
      icon: <ClockCircleOutlined />,
    },
    {
      title: "Thành tích",
      value: activeQuests.filter((q) => q.type === "achievement").length,
      valueColor: "#faad14",
      icon: <TrophyOutlined />,
    },
  ];

  if (activeLoading && activeQuests.length === 0) {
    return (
      <div className="quests-loading">
        <Spin size="large" tip="Đang chuẩn bị nhiệm vụ..." />
      </div>
    );
  }

  return (
    <div className="premium-quests-page">
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="page-header">
        <Title level={1} className="main-title">
          <TrophyOutlined className="title-icon" /> Đường đến Vinh quang
        </Title>
        <Paragraph className="subtitle">Hoàn thành thử thách, nhận báu vật di truyền và thăng cấp bản thân</Paragraph>
      </motion.div>

      <div className="stats-container">
        <StatisticsCard data={statsData} hideCard colSpan={{ xs: 12, sm: 12, md: 6 }} />
      </div>

      <div className="tabs-container glass-morphism">
        <Tabs
          activeKey={activeTab}
          onChange={(key) => { playClick(); setActiveTab(key); }}
          centered
          items={[
            { key: "all", label: "Tất cả" },
            { key: "daily", label: "Hằng ngày" },
            { key: "weekly", label: "Hằng tuần" },
            { key: "achievement", label: "Thành tích" },
            { key: "exploration", label: "Thám hiểm" },
          ]}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="quests-grid-container"
        >
          {getQuestsByTab().length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <Empty description="Hiện không có nhiệm vụ nào trong mục này" />
            </motion.div>
          ) : (
            <Row gutter={[24, 24]}>
              {getQuestsByTab().map((quest) => (
                <Col xs={24} sm={12} lg={8} key={quest.id}>
                  <motion.div variants={itemVariants} whileHover={{ y: -5 }}>
                    <Card
                      className={`quest-card glass-morphism ${quest.progress?.status || "locked"}`}
                      cover={
                        quest.thumbnail && (
                          <div className="quest-image-container">
                            <img alt={quest.title} src={getImageUrl(quest.thumbnail)} className="quest-image" />
                            <div className="quest-overlay" />
                          </div>
                        )
                      }
                    >
                      <div className="quest-type-tag">
                        <Tag color={getTypeColor(quest.type)} icon={getTypeIcon(quest.type)}>
                          {quest.type.toUpperCase()}
                        </Tag>
                      </div>

                      <Title level={4} className="quest-title">
                        {quest.title}
                      </Title>
                      <Paragraph ellipsis={{ rows: 2 }} className="quest-desc">
                        {quest.description}
                      </Paragraph>

                      {quest.progress ? (
                        <div className="quest-progress-section">
                          <div className="progress-info">
                            <span>Tiến độ</span>
                            <span>
                              currentValue: {quest.progress.currentValue}/{quest.requirements[0]?.target}
                            </span>
                          </div>
                          <Progress
                            percent={Math.round(
                              (quest.progress.currentValue / (quest.requirements[0]?.target || 1)) * 100,
                            )}
                            status={quest.progress.isCompleted ? "success" : "active"}
                            showInfo={false}
                            strokeColor={quest.progress.isCompleted ? "#52c41a" : "#1890ff"}
                          />
                        </div>
                      ) : (
                        <div className="quest-locked-state">
                          <RocketOutlined /> Chăm chỉ học tập để mở khóa
                        </div>
                      )}

                      <div className="quest-rewards-summary">
                        <Space>
                          {quest.rewards.experience && (
                            <span className="reward-item">🏆 {quest.rewards.experience}</span>
                          )}
                          {quest.rewards.petals && <span className="reward-item">🌸 {quest.rewards.petals}</span>}
                          {quest.rewards.badge && <span className="reward-item">🏅 {quest.rewards.badge}</span>}
                        </Space>
                      </div>

                      <div className="quest-actions">
                        {!quest.progress ? (
                          <Button
                            variant="primary"
                            fullWidth
                            className="action-btn start-btn"
                            onClick={() => handleStartQuest(quest.id)}
                          >
                            Bắt đầu
                          </Button>
                        ) : quest.progress.status === "completed" ? (
                          <Button
                            variant="primary"
                            fullWidth
                            className="action-btn claim-btn"
                            icon={<GiftOutlined />}
                            onClick={() => handleClaimRewards(quest.id)}
                          >
                            Nhận Thưởng
                          </Button>
                        ) : quest.progress.status === "claimed" ? (
                          <Button fullWidth disabled className="action-btn claimed-btn">
                            <CheckCircleOutlined /> Đã Hoàn Thành
                          </Button>
                        ) : (
                          <div style={{ display: "flex", gap: 8 }}>
                            <Button variant="outline" onClick={() => handleViewDetail(quest)} style={{ flex: 1 }}>
                              Chi tiết
                            </Button>
                            <Button variant="primary" onClick={() => handleNavigate(quest)} style={{ flex: 1 }}>
                              Thực hiện
                            </Button>
                          </div>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                </Col>
              ))}
            </Row>
          )}
        </motion.div>
      </AnimatePresence>

      <Modal
        title={<span className="modal-title">{selectedQuest?.title}</span>}
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={null}
        className="premium-quest-modal"
        centered
      >
        {selectedQuest && (
          <div className="quest-modal-content">
            <Paragraph className="modal-desc">{selectedQuest.description}</Paragraph>

            <div className="modal-section">
              <Title level={5}>Yêu cầu</Title>
              <Paragraph>{selectedQuest.requirements[0]?.description}</Paragraph>
            </div>

            <div className="modal-section">
              <Title level={5}>Phần thưởng</Title>
              <div className="rewards-grid">
                {selectedQuest.rewards.experience && (
                  <div className="modal-reward">
                    <div className="reward-icon">🏆</div>
                    <div className="reward-val">{selectedQuest.rewards.experience} Cúp</div>
                  </div>
                )}
                {selectedQuest.rewards.petals && (
                  <div className="modal-reward">
                    <div className="reward-icon">🌸</div>
                    <div className="reward-val">{selectedQuest.rewards.petals} Cánh</div>
                  </div>
                )}
                {selectedQuest.rewards.coins && (
                  <div className="modal-reward">
                    <div className="reward-icon">💰</div>
                    <div className="reward-val">{selectedQuest.rewards.coins} Xu</div>
                  </div>
                )}
              </div>
            </div>

            <Button
              variant="primary"
              buttonSize="large"
              fullWidth
              onClick={() => { playClick(); setDetailModalVisible(false); }}
              className="modal-close-btn"
            >
              Đã hiểu
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QuestsPage;
