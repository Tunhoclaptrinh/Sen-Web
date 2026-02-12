import React, {useEffect, useState} from "react";
import {useAppDispatch, useAppSelector} from "@/hooks/useRedux";
import {fetchLeaderboard} from "@/store/slices/gameSlice";
import {Card, Table, Avatar, Tag, Tabs, Spin, Typography} from "antd";
import {TrophyOutlined, CrownOutlined, UserOutlined, EnvironmentOutlined} from "@ant-design/icons";
import {motion, AnimatePresence} from "framer-motion";
import type {LeaderboardEntry} from "@/types";
import {getImageUrl} from "@/utils/image.helper";
import "./styles.less";

const {Title, Text, Paragraph} = Typography;

const PodiumItem: React.FC<{entry: LeaderboardEntry; rank: number; activeTab: "points" | "checkins" | "level"}> = ({
  entry,
  rank,
  activeTab,
}) => {
  const isCheckins = activeTab === "checkins";
  const isLevel = activeTab === "level";

  const mainStatValue = isCheckins ? entry.checkinCount || 0 : isLevel ? entry.level : entry.totalPoints;

  const mainStatIcon = isCheckins ? "📍" : isLevel ? "⭐" : "🏆";
  const mainStatLabel = isCheckins ? "Check-in" : isLevel ? "LeveL" : "Cúp";

  return (
    <motion.div
      className={`podium-item rank-${rank}`}
      initial={{opacity: 0, y: 50}}
      animate={{opacity: 1, y: 0}}
      transition={{duration: 0.5, delay: rank * 0.1}}
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
          <span className="player-level">Cấp độ {entry.level}</span>
        </div>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">{mainStatLabel}</span>
            <span className="stat-value">
              {mainStatIcon} {mainStatValue.toLocaleString()}
            </span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Cánh Sen</span>
            <span className="stat-value">🌸 {entry.senPetals}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const LeaderboardPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const {leaderboard, leaderboardLoading} = useAppSelector((state) => state.game);
  const [activeTab, setActiveTab] = useState<"points" | "checkins" | "level">("points");

  useEffect(() => {
    dispatch(fetchLeaderboard({type: activeTab, limit: 50}));
  }, [dispatch, activeTab]);

  const handleTabChange = (key: string) => {
    setActiveTab(key as "points" | "checkins" | "level");
  };

  const columns = [
    {
      title: "Hạng",
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
      title: "Người chơi",
      key: "player",
      render: (_: unknown, record: LeaderboardEntry) => (
        <div className="player-info-cell">
          <Avatar src={getImageUrl(record.userAvatar)} icon={<UserOutlined />} />
          <div className="user-info">
            <div className="user-name">{record.userName}</div>
            <div className="user-level">Cấp {record.level}</div>
          </div>
        </div>
      ),
    },
    {
      title: activeTab === "checkins" ? "Địa điểm" : activeTab === "level" ? "Cấp độ" : "Cúp",
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
          style={{borderRadius: 12, padding: "2px 12px"}}
        >
          {(value || 0).toLocaleString()} {activeTab === "checkins" ? "địa điểm" : ""}
        </Tag>
      ),
    },
    {
      title: "Cánh Sen",
      dataIndex: "senPetals",
      key: "senPetals",
      align: "center" as const,
      render: (petals: number) => (
        <Text strong style={{color: "#ff85c0"}}>
          🌸 {petals}
        </Text>
      ),
    },
    {
      title: "Nhân vật",
      dataIndex: "charactersCount",
      key: "charactersCount",
      align: "center" as const,
      render: (count: number) => (
        <Tag color="purple" style={{borderRadius: 12}}>
          {count} nhân vật
        </Tag>
      ),
    },
  ];

  const top3 = leaderboard.filter((item) => item.rank <= 3).sort((a, b) => a.rank - b.rank);
  const restOfPlayers = leaderboard.filter((item) => item.rank > 3);

  return (
    <motion.div className="leaderboard-page" initial={{opacity: 0}} animate={{opacity: 1}} transition={{duration: 0.5}}>
      <div className="leaderboard-header">
        <Title level={1} className="main-title">
          <TrophyOutlined className="title-icon" /> Bảng xếp hạng
        </Title>
        <Paragraph className="subtitle">Vinh danh những nhà thám hiểm xuất sắc nhất trên hành trình di sản</Paragraph>
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
              initial={{opacity: 0, scale: 0.9}}
              animate={{opacity: 1, scale: 1}}
              exit={{opacity: 0, scale: 0.9}}
              transition={{duration: 0.3}}
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
                {key: "points", label: "Điểm số (Cúp)"},
                {key: "checkins", label: "Nhà thám hiểm (Check-in)"},
                {key: "level", label: "Cấp độ"},
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
