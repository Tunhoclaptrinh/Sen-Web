import React, {useEffect, useState} from "react";
import {
  Card,
  Row,
  Col,
  Typography,
  Button,
  Progress,
  Statistic,
  List,
  Avatar,
  message,
  Empty,
  Badge,
  Space,
} from "antd";
import {
  TrophyOutlined,
  FireOutlined,
  RocketOutlined,
  RightOutlined,
  BookOutlined,
  ShopOutlined,
  HistoryOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import {useSelector, useDispatch} from "react-redux";
import {RootState} from "@/store";
import questService from "@/services/quest.service";
import {claimQuestRewards} from "@/store/slices/questSlice";
import {Quest} from "@/types/quest.types";
import "./styles.less";
import {getImageUrl} from "@/utils/image.helper";
import {notificationService} from "@/services/notification.service";
import {Notification} from "@/types/notification.types";
import {formatRelativeTime} from "@/utils/formatters";

const {Title, Text} = Typography;

const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const {user} = useSelector((state: RootState) => state.auth);
  const {progress} = useSelector((state: RootState) => state.game);
  const [activeQuests, setActiveQuests] = useState<Quest[]>([]);
  const [loadingQuests, setLoadingQuests] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  useEffect(() => {
    fetchActiveQuests();
    fetchNotifications();
  }, []);

  const fetchActiveQuests = async () => {
    try {
      setLoadingQuests(true);
      const quests = await questService.getActiveQuests();
      // Filter only active or in-progress/completed but not claimed if needed.
      // Service returns array of Quest objects with progress embedded.
      const filteredQuests = quests.filter((q) => q.progress?.status !== "claimed");
      setActiveQuests(filteredQuests.slice(0, 3)); // Show top 3 active/unclaimed
    } catch (error) {
      console.error("Failed to fetch quests:", error);
    } finally {
      setLoadingQuests(false);
    }
  };

  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true);
      const data = await notificationService.getNotifications(1, 5);
      setNotifications(data.items);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoadingNotifications(false);
    }
  };

  const handleMarkAsRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications((prev) => prev.map((n) => (n.id === id ? {...n, isRead: true} : n)));
    } catch (error) {
      message.error("Thao tác thất bại");
    }
  };

  const handleClaim = async (questId: number) => {
    try {
      await dispatch(claimQuestRewards(questId) as any).unwrap();
      message.success("Đã nhận thưởng thành công!");
      fetchActiveQuests(); // Refresh
    } catch (error) {
      message.error("Không thể nhận thưởng");
    }
  };

  return (
    <div className="game-dashboard">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="hero-bg-layer">
          <div className="bronze-drum-container">
            <div className="bronze-drum-bg" />
          </div>
          <div className="lotus-bg lotus-1" />
          <div className="lotus-bg lotus-2" />
          <div className="lotus-bg lotus-3" />
          <div className="lac-bird" />
          <div className="clouds" />
        </div>
        <Row gutter={[24, 24]} align="middle" style={{position: "relative", zIndex: 1}}>
          <Col xs={24} md={16}>
            <div className="hero-content">
              <Title level={2} style={{color: "#fff", marginBottom: 8}}>
                Xin chào, {user?.name || "Nhà thám hiểm"}!
              </Title>
              <Text style={{color: "rgba(255,255,255,0.9)", fontSize: 16}}>
                Hành trình khám phá di sản của bạn đang chờ đợi. Hãy tiếp tục chinh phục các thử thách!
              </Text>
              <div style={{marginTop: 24, display: "flex", gap: 16}}>
                <Button
                  type="primary"
                  size="large"
                  icon={<RocketOutlined />}
                  onClick={() => navigate("/game/chapters")}
                  className="hero-btn"
                >
                  Tiếp tục chơi
                </Button>
                <Button size="large" ghost className="hero-btn-ghost" onClick={() => navigate("/game/quests")}>
                  Xem nhiệm vụ
                </Button>
              </div>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <Card bordered={false} className="rank-card">
              <div style={{textAlign: "center"}}>
                <Avatar
                  size={80}
                  icon={<span>{progress?.rankIcon || <TrophyOutlined />}</span>}
                  style={{backgroundColor: "#fde3cf", color: "#f56a00", fontSize: 32}}
                />
                <Title level={4} style={{marginTop: 16, marginBottom: 4}}>
                  Hạng {progress?.currentRank || "Tập Sự"}
                </Title>
                <Text type="secondary">
                  {progress?.nextRankName
                    ? `Cần ${progress.pointsToNextRank} 🏆 để lên hạng ${progress.nextRankName}`
                    : "Bạn đã đạt hạng cao nhất! 🎉"}
                </Text>
                <Progress
                  percent={progress?.progressPercent || 0}
                  status="active"
                  strokeColor={{"0%": "#108ee9", "100%": "#87d068"}}
                  style={{marginTop: 16}}
                />
              </div>
            </Card>
          </Col>
        </Row>
      </div>

      {/* Stats Overview */}
      <Row gutter={[16, 16]} style={{marginTop: -40, padding: "0 24px"}}>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Tổng cúp"
              value={progress?.totalPoints || 0}
              prefix={<TrophyOutlined style={{color: "#faad14"}} />}
              valueStyle={{color: "#3f8600"}}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Hoa Sen"
              value={progress?.totalSenPetals || 0}
              prefix={<span style={{fontSize: 20}}>🌸</span>}
              valueStyle={{color: "#cf1322"}}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card bordered={false} className="stat-card">
            <Statistic
              title="Xu vàng"
              value={progress?.coins || 0}
              prefix={<span style={{fontSize: 20}}>🪙</span>}
              valueStyle={{color: "#d48806"}}
            />
          </Card>
        </Col>
      </Row>

      <div style={{padding: 24}}>
        {/* Upper Section: Quests & News */}
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Card
              title={
                <>
                  <FireOutlined style={{color: "#ff4d4f"}} /> Nhiệm vụ đang làm
                </>
              }
              extra={
                <Button type="link" onClick={() => navigate("/game/quests")}>
                  Xem tất cả
                </Button>
              }
              bordered={false}
              className="content-card"
              style={{height: "100%"}}
            >
              <List
                loading={loadingQuests}
                rowKey="id"
                itemLayout="horizontal"
                dataSource={activeQuests}
                locale={{
                  emptyText: <Empty description="Chưa có nhiệm vụ nào" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
                }}
                renderItem={(item: Quest) => {
                  const progressVal = item.progress?.currentValue || 0;
                  const targetVal = item.requirements?.[0]?.target || 100;
                  const percent = Math.min(100, (progressVal / targetVal) * 100);

                  // Determine Status
                  const isNotStarted = !item.progress;
                  const isCompleted = item.progress?.status === "completed";
                  const isClaimed = item.progress?.status === "claimed";

                  // Handlers
                  const onStart = async () => {
                    try {
                      await questService.startQuest(item.id);
                      message.success("Đã nhận nhiệm vụ!");
                      fetchActiveQuests();
                    } catch (e) {
                      message.error("Không thể nhận nhiệm vụ lúc này");
                    }
                  };

                  const onNavigate = () => {
                    const type = item.requirements?.[0]?.type;
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

                  return (
                    <List.Item
                      actions={[
                        isNotStarted ? (
                          <Button size="small" type="primary" ghost onClick={onStart}>
                            Nhận nhiệm vụ
                          </Button>
                        ) : isCompleted ? (
                          <Button size="small" type="primary" onClick={() => handleClaim(item.id)}>
                            Nhận thưởng
                          </Button>
                        ) : isClaimed ? (
                          <Button size="small" disabled>
                            Đã nhận
                          </Button>
                        ) : (
                          <Button size="small" onClick={onNavigate}>
                            Thực hiện
                          </Button>
                        ),
                      ]}
                    >
                      <List.Item.Meta
                        avatar={
                          <Avatar
                            style={{
                              backgroundColor: "#e6f7ff",
                              color: "#1890ff",
                            }}
                            icon={<RocketOutlined />}
                            src={getImageUrl(item.thumbnail)}
                          />
                        }
                        title={item.title}
                        description={
                          <div style={{marginTop: 4}}>
                            {!isNotStarted && (
                              <Progress
                                percent={percent}
                                size="small"
                                status={isCompleted ? "success" : "active"}
                                format={() => `${progressVal}/${targetVal}`}
                              />
                            )}
                            <div
                              style={{
                                fontSize: 12,
                                color: "#888",
                                marginTop: 2,
                              }}
                            >
                              {item.description}
                            </div>
                          </div>
                        }
                      />
                      <div
                        style={{
                          minWidth: 80,
                          textAlign: "right",
                          marginLeft: 16,
                        }}
                      >
                        {item.rewards.experience && <div style={{color: "#87d068"}}>🏆 +{item.rewards.experience}</div>}
                        {item.rewards.coins && <div style={{color: "#d48806"}}>🪙 +{item.rewards.coins}</div>}
                        {item.rewards.petals && <div style={{color: "#cf1322"}}>🌸 +{item.rewards.petals}</div>}
                      </div>
                    </List.Item>
                  );
                }}
              />
            </Card>
          </Col>
          <Col xs={24} lg={8}>
            <Card title="Tin tức & Sự kiện" bordered={false} className="content-card" style={{height: "100%"}}>
              <List
                dataSource={[
                  {title: "Sự kiện: Mùa Sen Nở", date: "Còn 2 ngày"},
                  {title: "Cập nhật chương mới", date: "Vừa xong"},
                  {title: "Bảo trì định kỳ", date: "26/01"},
                ]}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta title={<a href="#">{item.title}</a>} description={item.date} />
                    <Button type="text" icon={<RightOutlined />} size="small" />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
        </Row>

        {/* Notifications & Recent Activity or similar */}
        <Row gutter={[24, 24]} style={{marginTop: 24}}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <BellOutlined style={{color: "#f5222d", marginRight: 8}} />
                  Thông báo mới
                </span>
              }
              bordered={false}
              className="content-card"
              extra={
                <Button type="link" size="small" onClick={() => navigate("/notifications")}>
                  Tất cả
                </Button>
              }
            >
              <List
                loading={loadingNotifications}
                dataSource={notifications}
                locale={{
                  emptyText: <Empty description="Không có thông báo mới" image={Empty.PRESENTED_IMAGE_SIMPLE} />,
                }}
                renderItem={(item) => (
                  <List.Item
                    actions={[
                      !item.isRead && (
                        <Button
                          type="text"
                          icon={<CheckCircleOutlined style={{color: "#52c41a"}} />}
                          onClick={() => handleMarkAsRead(item.id)}
                        />
                      ),
                    ]}
                  >
                    <List.Item.Meta
                      avatar={
                        <Badge dot={!item.isRead} offset={[-2, 32]}>
                          <Avatar
                            icon={<BellOutlined />}
                            style={{
                              backgroundColor: item.isRead ? "#f5f5f5" : "#e6f7ff",
                              color: item.isRead ? "#bfbfbf" : "#1890ff",
                            }}
                          />
                        </Badge>
                      }
                      title={<Text strong={!item.isRead}>{item.title}</Text>}
                      description={
                        <Space direction="vertical" size={0}>
                          <Text type="secondary" style={{fontSize: 12}}>
                            {item.message}
                          </Text>
                          <Text type="secondary" style={{fontSize: 11, opacity: 0.7}}>
                            <ClockCircleOutlined style={{marginRight: 4}} />
                            {formatRelativeTime(item.createdAt)}
                          </Text>
                        </Space>
                      }
                    />
                  </List.Item>
                )}
              />
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <span>
                  <HistoryOutlined style={{color: "#722ed1", marginRight: 8}} />
                  Lịch sử hoạt động
                </span>
              }
              bordered={false}
              className="content-card"
            >
              <Empty description="Tính năng đang cập nhật" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            </Card>
          </Col>
        </Row>

        {/* Lower Section: Shortcuts & Promo */}
        <Title level={4} style={{marginTop: 24, marginBottom: 16}}>
          Khám phá nhanh
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} lg={16}>
            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6} lg={6}>
                <Card hoverable className="shortcut-card" onClick={() => navigate("/game/learning")}>
                  <BookOutlined style={{fontSize: 32, color: "#1890ff"}} />
                  <div className="shortcut-title">Ôn tập</div>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={6}>
                <Card hoverable className="shortcut-card" onClick={() => navigate("/game/museum")}>
                  <HistoryOutlined style={{fontSize: 32, color: "#722ed1"}} />
                  <div className="shortcut-title">Bảo tàng</div>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={6}>
                <Card hoverable className="shortcut-card" onClick={() => navigate("/game/shop")}>
                  <ShopOutlined style={{fontSize: 32, color: "#eb2f96"}} />
                  <div className="shortcut-title">Cửa hàng</div>
                </Card>
              </Col>
              <Col xs={12} sm={6} lg={6}>
                <Card hoverable className="shortcut-card" onClick={() => navigate("/game/leaderboard")}>
                  <TrophyOutlined style={{fontSize: 32, color: "#faad14"}} />
                  <div className="shortcut-title">Xếp hạng</div>
                </Card>
              </Col>
            </Row>
          </Col>

          <Col xs={24} lg={8}>
            <Card className="promo-card" bordered={false} style={{height: "100%"}}>
              <div style={{textAlign: "center", padding: "12px 0"}}>
                <Title level={4}>Gói Ưu Đãi</Title>
                <Text>Nhận ngay 500 xu khi hoàn thành khảo sát.</Text>
                <Button type="primary" shape="round" className="promo-btn">
                  Tham gia ngay
                </Button>
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};

export default DashboardPage;
