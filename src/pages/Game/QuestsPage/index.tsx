import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Tabs,
  Button,
  Spin,
  Empty,
  Progress,
  Tag,
  message,
  Modal,
  Typography,
  Space,
} from "antd";
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
} from "@/store/slices/questSlice";
import type { Quest } from "@/types/quest.types";
import "./styles.less";

const { Title, Paragraph } = Typography;

const QuestsPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { activeQuests, activeLoading, error, successMessage } = useAppSelector(
    (state) => state.quest,
  );
  const [activeTab, setActiveTab] = useState("all");
  const [selectedQuest, setSelectedQuest] = useState<Quest | null>(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);

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
    dispatch(claimQuestRewards(questId));
  };

  const handleViewDetail = (quest: Quest) => {
    setSelectedQuest(quest);
    setDetailModalVisible(true);
  };

  const getQuestsByTab = () => {
    if (activeTab === "all") return activeQuests;
    return activeQuests.filter((q) => q.type === activeTab);
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
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="page-header"
      >
        <Title level={1} className="main-title">
          <TrophyOutlined className="title-icon" /> Đường đến vinh quang
        </Title>
        <Paragraph className="subtitle">
          Hoàn thành thử thách, nhận báu vật di truyền và thăng cấp bản thân
        </Paragraph>
      </motion.div>

      <div className="stats-container">
        <StatisticsCard
          data={statsData}
          hideCard
          colSpan={{ xs: 12, sm: 12, md: 6 }}
          cardStyle={{
            borderRadius: 20,
            backdropFilter: "blur(8px)",
            background: "rgba(255, 255, 255, 0.7)",
            border: "1px solid rgba(255, 255, 255, 0.3)",
          }}
        />
      </div>

      <div className="tabs-container glass-morphism">
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          centered
          items={[
            { key: "all", label: "Tất Cả" },
            { key: "daily", label: "Hằng Ngày" },
            { key: "weekly", label: "Hằng Tuần" },
            { key: "achievement", label: "Thành Tích" },
            { key: "exploration", label: "Thám Hiểm" },
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
                            <img
                              alt={quest.title}
                              src={quest.thumbnail}
                              className="quest-image"
                            />
                            <div className="quest-overlay" />
                          </div>
                        )
                      }
                    >
                      <div className="quest-type-tag">
                        <Tag
                          color={getTypeColor(quest.type)}
                          icon={getTypeIcon(quest.type)}
                        >
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
                              {quest.progress.current_value}/
                              {quest.requirements[0]?.target}
                            </span>
                          </div>
                          <Progress
                            percent={Math.round(
                              (quest.progress.current_value /
                                (quest.requirements[0]?.target || 1)) *
                                100,
                            )}
                            status={
                              quest.progress.is_completed ? "success" : "active"
                            }
                            showInfo={false}
                            strokeColor={
                              quest.progress.is_completed
                                ? "#52c41a"
                                : "#1890ff"
                            }
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
                            <span className="reward-item">
                              ⭐ {quest.rewards.experience}
                            </span>
                          )}
                          {quest.rewards.petals && (
                            <span className="reward-item">
                              🌸 {quest.rewards.petals}
                            </span>
                          )}
                          {quest.rewards.badge && (
                            <span className="reward-item">
                              🏅 {quest.rewards.badge}
                            </span>
                          )}
                        </Space>
                      </div>

                      <div className="quest-actions">
                        {!quest.progress ? (
                          <Button
                            type="primary"
                            block
                            className="action-btn start-btn"
                            onClick={() => handleStartQuest(quest.id)}
                          >
                            Bắt đầu
                          </Button>
                        ) : quest.progress.status === "completed" ? (
                          <Button
                            type="primary"
                            block
                            className="action-btn claim-btn"
                            icon={<GiftOutlined />}
                            onClick={() => handleClaimRewards(quest.id)}
                          >
                            Nhận Thưởng
                          </Button>
                        ) : quest.progress.status === "claimed" ? (
                          <Button
                            block
                            disabled
                            className="action-btn claimed-btn"
                          >
                            <CheckCircleOutlined /> Đã Hoàn Thành
                          </Button>
                        ) : (
                          <Button
                            ghost
                            type="primary"
                            block
                            className="action-btn detail-btn"
                            onClick={() => handleViewDetail(quest)}
                          >
                            Chi Tiết
                          </Button>
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
            <Paragraph className="modal-desc">
              {selectedQuest.description}
            </Paragraph>

            <div className="modal-section">
              <Title level={5}>Yêu cầu</Title>
              <Paragraph>
                {selectedQuest.requirements[0]?.description}
              </Paragraph>
            </div>

            <div className="modal-section">
              <Title level={5}>Phần thưởng</Title>
              <div className="rewards-grid">
                {selectedQuest.rewards.experience && (
                  <div className="modal-reward">
                    <div className="reward-icon">⭐</div>
                    <div className="reward-val">
                      {selectedQuest.rewards.experience} XP
                    </div>
                  </div>
                )}
                {selectedQuest.rewards.petals && (
                  <div className="modal-reward">
                    <div className="reward-icon">🌸</div>
                    <div className="reward-val">
                      {selectedQuest.rewards.petals} Cánh
                    </div>
                  </div>
                )}
                {selectedQuest.rewards.coins && (
                  <div className="modal-reward">
                    <div className="reward-icon">💰</div>
                    <div className="reward-val">
                      {selectedQuest.rewards.coins} Xu
                    </div>
                  </div>
                )}
              </div>
            </div>

            <Button
              type="primary"
              size="large"
              block
              onClick={() => setDetailModalVisible(false)}
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
