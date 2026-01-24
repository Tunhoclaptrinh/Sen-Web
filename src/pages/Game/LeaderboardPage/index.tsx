import React, { useEffect, useState } from "react";
import { useAppDispatch, useAppSelector } from "@/hooks/useRedux";
import { fetchLeaderboard } from "@/store/slices/gameSlice";
import { Card, Table, Avatar, Tag, Tabs, Spin, Typography } from "antd";
import {
  TrophyOutlined,
  CrownOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { motion, AnimatePresence } from "framer-motion";
import type { LeaderboardEntry } from "@/types";
import "./styles.less";

const { Title, Text, Paragraph } = Typography;

const PodiumItem: React.FC<{ entry: LeaderboardEntry; rank: number }> = ({
  entry,
  rank,
}) => {
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
          src={entry.user_avatar}
          size={rank === 1 ? 100 : 80}
          icon={<UserOutlined />}
          style={{
            border: `4px solid ${rank === 1 ? "#ffd700" : rank === 2 ? "#c0c0c0" : "#cd7f32"}`,
          }}
        />
        <div className="player-info">
          <span className="player-name">{entry.user_name}</span>
          <span className="player-level">Cấp độ {entry.level}</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Điểm</span>
            <span className="stat-value">
              {entry.total_points.toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cánh Sen</span>
            <span className="stat-value">🌸 {entry.sen_petals}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { leaderboard, leaderboardLoading } = useAppSelector(
    (state) => state.game,
  );
  const [activeTab, setActiveTab] = useState<"global" | "weekly" | "monthly">(
    "global",
  );

  useEffect(() => {
    dispatch(fetchLeaderboard({ type: activeTab, limit: 50 }));
  }, [dispatch, activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as "global" | "weekly" | "monthly");
  };

  const columns = [
    {
      title: "Hạng",
      dataIndex: "rank",
      key: "rank",
      width: 80,
      render: (rank: number) => (
        <div
          className={`rank-badge ${rank === 1 ? "gold" : rank === 2 ? "silver" : rank === 3 ? "bronze" : ""}`}
        >
          {rank}
        </div>
      ),
    },
    {
      title: "Người chơi",
      key: "player",
      render: (_: any, record: LeaderboardEntry) => (
        <div className="player-info-cell">
          <Avatar src={record.user_avatar} icon={<UserOutlined />} />
          <div className="player-details">
            <span className="name">{record.user_name}</span>
            <span className="level">Level {record.level}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Điểm",
      dataIndex: "total_points",
      key: "total_points",
      render: (points: number) => (
        <Tag
          color="blue"
          icon={<StarOutlined />}
          style={{ borderRadius: 12, padding: "2px 12px" }}
        >
          {points.toLocaleString()}
        </Tag>
      ),
    },
    {
      title: "Cánh Sen",
      dataIndex: "sen_petals",
      key: "sen_petals",
      align: "center" as const,
      render: (petals: number) => (
        <Text strong style={{ color: "#ff85c0" }}>
          🌸 {petals}
        </Text>
      ),
    },
    {
      title: "Nhân vật",
      dataIndex: "characters_count",
      key: "characters_count",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="purple" style={{ borderRadius: 12 }}>
          {count} nhân vật
        </Tag>
      ),
    },
  ];

  const top3 = leaderboard
    .filter((item) => item.rank <= 3)
    .sort((a, b) => a.rank - b.rank);
  const restOfPlayers = leaderboard.filter((item) => item.rank > 3);

  return (
    <motion.div
      className="leaderboard-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="leaderboard-header">
        <Title level={1} className="main-title">
          <TrophyOutlined className="title-icon" /> Bảng xếp hạng
        </Title>
        <Paragraph className="subtitle">
          Vinh danh những nhà thám hiểm xuất sắc nhất trên hành trình di sản
        </Paragraph>
      </div>

      {leaderboardLoading ? (
        <div className="leaderboard-loading">
          <Spin size="large" tip="Đang tải dữ liệu..." />
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
              {top3[1] && <PodiumItem entry={top3[1]} rank={2} />}
              {top3[0] && <PodiumItem entry={top3[0]} rank={1} />}
              {top3[2] && <PodiumItem entry={top3[2]} rank={3} />}
            </motion.div>
          </AnimatePresence>

          <div className="tabs-container glass-morphism">
            <Tabs
              activeKey={activeTab}
              onChange={handleTabChange}
              centered
              items={[
                { key: "global", label: "Toàn thời gian" },
                { key: "weekly", label: "Tuần này" },
                { key: "monthly", label: "Tháng này" },
              ]}
            />
          </div>

          <Card className="leaderboard-card glass-morphism">
            <div className="leaderboard-table-wrapper">
              <Table
                dataSource={restOfPlayers}
                columns={columns}
                rowKey="user_id"
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
