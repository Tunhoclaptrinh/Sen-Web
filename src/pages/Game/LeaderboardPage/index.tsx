import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchLeaderboard } from "@/store/slices/gameSlice";
import { Card, Table, Avatar, Tag, Tabs, Spin, Typography } from "antd";
import { useTranslation } from "react-i18next";
import { TrophyOutlined, CrownOutlined, UserOutlined, EnvironmentOutlined } from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import { useGameSounds } from "@/hooks/useSound";
import type { LeaderboardEntry } from "@/types";
import { getImageUrl } from "@/utils/image.helper";
import "./styles.less";

const { Title, Text, Paragraph } = Typography;

const PodiumItem: React.FC<{ entry: LeaderboardEntry; rank: number; activeTab: "points" | "checkins" | "level" }> = ({
  entry,
  rank,
  activeTab,
}) => {
  const { t } = useTranslation();
  const isCheckins = activeTab === "checkins";
  const isLevel = activeTab === "level";

  const mainStatValue = isCheckins ? entry.checkinCount || 0 : isLevel ? entry.level : entry.totalPoints;

  const mainStatIcon = isCheckins ? "📍" : isLevel ? "⭐" : "🏆";
  const mainStatLabel = isCheckins ? t('gameLeaderboard.podium.labels.checkins') : isLevel ? t('gameLeaderboard.podium.labels.level') : t('gameLeaderboard.podium.labels.points');

  return (
    <motion.div
      className={`podium-item rank-${rank}`}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: rank * 0.1 }}
    >
      {rank === 1 && <CrownOutlined className="crown-icon" />}
      <div className="podium-card">
        <Avatar
          src={getImageUrl(entry.userAvatar)}
          size={rank === 1 ? 100 : 80}
          icon={<UserOutlined />}
          style={{
            border: `4px solid ${rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : "#cd7f32"}`,
          }}
        />
        <div className="player-info">
          <span className="player-name">{entry.userName}</span>
          <span className="player-level">{t('gameLeaderboard.podium.level', { level: entry.level })}</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">{mainStatLabel}</span>
            <span className="stat-value">
              {mainStatIcon} {mainStatValue.toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">{t('gameLeaderboard.podium.petals')}</span>
            <span className="stat-value">🌸 {entry.senPetals}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardPage: React.FC = () => {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const { leaderboard, leaderboardLoading } = useAppSelector((state) => state.game);
  const [activeTab, setActiveTab] = useState<"points" | "checkins" | "level">("points");
  const { playClick } = useGameSounds();

  useEffect(() => {
    dispatch(fetchLeaderboard({ type: activeTab, limit: 50 }));
  }, [dispatch, activeTab]);

  const handleTabChange = (key: string) => {
    playClick();
    setActiveTab(key as "points" | "checkins" | "level");
  };

  const columns = [
    {
      title: t('gameLeaderboard.columns.rank'),
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <div className={`rank-badge ${rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : ""}`}>
          {rank}
        </div>
      ),
    },
    {
      title: t('gameLeaderboard.columns.player'),
      key: "player",
      render: (_: unknown, record: LeaderboardEntry) => (
        <div className="player-info-cell">
          <Avatar src={getImageUrl(record.userAvatar)} icon={<UserOutlined />} />
          <div className="user-info">
            <div className="user-name">{record.userName}</div>
            <div className="user-level">{t('gameLeaderboard.table.level', { level: record.level })}</div>
          </div>
        </div>
      ),
    },
    {
      title: activeTab === "checkins" ? t('gameLeaderboard.columns.checkins') : activeTab === "level" ? t('gameLeaderboard.columns.level') : t('gameLeaderboard.columns.points'),
      dataIndex: activeTab === "checkins" ? "checkinCount" : activeTab === "level" ? "level" : "totalPoints",
      key: "score",
      render: (value: number) => (
        <Tag
          color={activeTab === "checkins" ? "green" : activeTab === "level" ? "purple" : "blue"}
          icon={
            activeTab === "checkins" ? (
              <EnvironmentOutlined />
            ) : activeTab === "level" ? (
              <CrownOutlined />
            ) : (
              <TrophyOutlined />
            )
          }
          style={{ borderRadius: 12, padding: "2px 12px" }}
        >
          {(value || 0).toLocaleString()} {activeTab === "checkins" ? t('gameLeaderboard.columns.checkins').toLowerCase() : ""}
        </Tag>
      ),
    },
    {
      title: t('gameLeaderboard.columns.petals'),
      dataIndex: "senPetals",
      key: "senPetals",
      align: "center" as const,
      render: (petals: number) => (
        <Text strong style={{ color: "#ff85c0" }}>
          🌸 {petals}
        </Text>
      ),
    },
    {
      title: t('gameLeaderboard.columns.characters'),
      dataIndex: "charactersCount",
      key: "charactersCount",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="purple" style={{ borderRadius: 12 }}>
          {t('gameLeaderboard.table.charactersCount', { count })}
        </Tag>
      ),
    },
  ];

  const top3 = leaderboard.filter((item) => item.rank <= 3).sort((a, b) => a.rank - b.rank);
  const restOfPlayers = leaderboard.filter((item) => item.rank > 3);

  return (
    <motion.div className="leaderboard-page" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div className="leaderboard-header">
        <Title level={1} className="main-title">
          <TrophyOutlined className="title-icon" /> {t('gameLeaderboard.header.title')}
        </Title>
        <Paragraph className="subtitle">{t('gameLeaderboard.header.subtitle')}</Paragraph>
      </div>

      {leaderboardLoading ? (
        <div className="leaderboard-loading">
          <Spin size="large" tip={t('gameLeaderboard.loading')} />
        </div>
      ) : (
        <>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              className="podium-container"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
            >
              {top3[1] && <PodiumItem entry={top3[1]} rank={2} activeTab={activeTab} />}
              {top3[0] && <PodiumItem entry={top3[0]} rank={1} activeTab={activeTab} />}
              {top3[2] && <PodiumItem entry={top3[2]} rank={3} activeTab={activeTab} />}
            </motion.div>
          </AnimatePresence>

          <div className="tabs-container glass-morphism">
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              centered
              items={[
                { key: "points", label: t('gameLeaderboard.tabs.points') },
                { key: "checkins", label: t('gameLeaderboard.tabs.checkins') },
                { key: "level", label: t('gameLeaderboard.tabs.level') },
              ]}
            />
          </div>

          <Card className="leaderboard-card glass-morphism">
            <div className="leaderboard-table-wrapper">
              <Table
                dataSource={restOfPlayers}
                columns={columns}
                rowKey="userId"
                pagination={{
                  pageSize: 10,
                  showSizeChanger: false,
                }}
              />
            </div>
          </Card>
        </>
      )}
    </motion.div>
  );
};

export default LeaderboardPage;
