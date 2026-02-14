import React, {useEffect, useState} from "react";
import {Typography, Row, Col, Avatar, Button, Spin, Card, Space, Tag} from "antd";
import {UserOutlined, ArrowRightOutlined, CrownFilled} from "@ant-design/icons";
import {useNavigate} from "react-router-dom";
import gameService from "@/services/game.service";
import {LeaderboardEntry} from "@/types/game.types";
import "./HomeGame.less";

const {Title, Text, Paragraph} = Typography;

const HomeLeaderboardSection: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topPlayers, setTopPlayers] = useState<LeaderboardEntry[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await gameService.getLeaderboard("points", 5);
      if (res) {
        setTopPlayers(res);
      }
    } catch (error) {
      console.error("Failed to load top players", error);
    } finally {
      setLoading(false);
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "#FFD700"; // Gold
      case 2:
        return "#E0E0E0"; // Silver
      case 3:
        return "#CD7F32"; // Bronze
      default:
        return "#f0f0f0";
    }
  };

  return (
    <section className="home-game-section">
      <style>
        {`
          @keyframes spin-slow {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>

      {/* Background pattern directly on section */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundImage: "url('/images/hoatiettrongdong.png')",
          backgroundSize: "600px",
          backgroundRepeat: "repeat",
          opacity: 0.08,
          pointerEvents: "none",
          mixBlendMode: "overlay",
          zIndex: 0,
        }}
      />

      <div
        className="container"
        style={{
          maxWidth: 1300,
          margin: "0 auto",
          padding: "60px",
          position: "relative",
          zIndex: 1,
          minHeight: "auto",
        }}
      >
        {/* Removed Inner Red Card Div - Content sits directly on Section now */}

        <Row gutter={[80, 48]} align="middle" style={{width: "100%", position: "relative", zIndex: 2}}>
          {/* Left Column: Text & CTA */}
          <Col xs={24} lg={11}>
            <div className="section-header" style={{textAlign: "left"}}>
              <div style={{display: "flex", alignItems: "center", gap: 8, marginBottom: 16}}>
                <CrownFilled style={{color: "#ffd700", fontSize: 16}} />
                <span
                  style={{
                    fontFamily: "var(--font-serif)",
                    fontWeight: 700,
                    fontSize: 14,
                    textTransform: "uppercase",
                    letterSpacing: 2,
                    color: "var(--gold-color)",
                    opacity: 1,
                  }}
                >
                  Bảng vàng danh dự
                </span>
              </div>

              <h2
                style={{
                  fontFamily: "var(--font-serif)",
                  textAlign: "left",
                  color: "#ffffff" /* White on Red */,
                  fontSize: 56,
                  fontWeight: 900,
                  marginBottom: 24,
                  lineHeight: 1.1,
                  textTransform: "uppercase",
                  textShadow: "0 2px 10px rgba(0,0,0,0.2)",
                }}
              >
                Vinh danh <br />
                những <br />
                <span style={{color: "var(--gold-color)", textShadow: "0 2px 10px rgba(0,0,0,0.2)"}}>
                  Nhà thám hiểm
                </span>{" "}
                <br />
                xuất sắc
              </h2>

              <Paragraph
                style={{
                  textAlign: "left",
                  margin: "0 0 40px 0",
                  color: "rgba(255, 255, 255, 0.9)" /* Off-white for readability */,
                  fontSize: 17,
                  maxWidth: 420,
                  fontWeight: 400,
                  lineHeight: 1.6,
                }}
              >
                Cùng chiêm ngưỡng những người chơi dẫn đầu trong hành trình khám phá di sản. Bạn có muốn tên mình được
                xướng lên tại đây? Tham gia ngay để tích điểm và leo hạng!
              </Paragraph>

              <Button
                className="home-game-btn"
                size="large"
                icon={<ArrowRightOutlined />}
                onClick={() => navigate("/game/leaderboard")}
                style={{
                  height: 54,
                  padding: "0 36px",
                  fontWeight: 700,
                  background: "#5a1a1f" /* Dark Burgundy Button */,
                  color: "var(--gold-color)" /* Gold text */,
                  border: "1px solid rgba(255, 215, 0, 0.3)",
                  fontSize: 14,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  boxShadow: "0 8px 16px rgba(0,0,0,0.3)",
                }}
              >
                Xem bảng xếp hạng đầy đủ
              </Button>
            </div>
          </Col>

          {/* Right Column: Leaderboard Card */}
          <Col xs={24} lg={13}>
            <Card
              bordered={false}
              className="home-game-leaderboard-card"
              bodyStyle={{padding: 0}}
              style={{
                borderRadius: 12,
                boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
                overflow: "hidden",
                border: "none", // Remove the gold border from less class for this specific card
              }}
            >
              <div
                style={{
                  padding: "24px 32px",
                  background: "#fffcf5",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  borderBottom: "1px solid rgba(0,0,0,0.05)",
                }}
              >
                <Title level={4} style={{margin: 0, color: "var(--seal-red)", fontFamily: "var(--font-serif)"}}>
                  Top 5 Nhà Thám Hiểm
                </Title>
                <Tag
                  style={{
                    margin: 0,
                    color: "#fff",
                    fontWeight: 700,
                    border: "none",
                    background: "#fca311",
                    padding: "4px 12px",
                    borderRadius: 4,
                  }}
                >
                  THÁNG {new Date().getMonth() + 1}
                </Tag>
              </div>

              {loading ? (
                <div style={{padding: 60, textAlign: "center", background: "#fffcf5"}}>
                  <Spin size="large" tip="Đang tải dữ liệu..." style={{color: "#8c3b3b"}} />
                </div>
              ) : (
                <div className="leaderboard-list">
                  {topPlayers.map((player, index) => (
                    <div
                      key={player.userId}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        padding: "16px 32px",
                        borderBottom: index < topPlayers.length - 1 ? "1px solid rgba(0,0,0,0.03)" : "none",
                        transition: "all 0.3s",
                        background: "#fffcf5",
                      }}
                      className="leaderboard-item"
                    >
                      <div
                        style={{
                          width: 36,
                          height: 36,
                          borderRadius: "50%",
                          background: getRankColor(index + 1),
                          display: "flex",
                          justifyContent: "center",
                          alignItems: "center",
                          fontWeight: "800",
                          color: index + 1 === 1 ? "#fff" : index + 1 <= 3 ? "#fff" : "#999",
                          marginRight: 20,
                          fontSize: 16,
                          boxShadow: index < 3 ? "0 2px 4px rgba(0,0,0,0.1)" : "none",
                        }}
                      >
                        {index + 1}
                      </div>

                      <Avatar
                        src={player.userAvatar}
                        icon={<UserOutlined />}
                        size={48}
                        style={{
                          border: index === 0 ? "2px solid #FFD700" : "1px solid #ddd",
                          boxShadow: "0 2px 8px rgba(0,0,0,0.05)",
                        }}
                      />

                      <div style={{flex: 1, marginLeft: 16}}>
                        <div style={{display: "flex", alignItems: "center", gap: 8}}>
                          <Text
                            strong
                            style={{fontSize: 16, color: "var(--text-color-primary)", fontFamily: "var(--font-sans)"}}
                          >
                            {player.userName}
                          </Text>
                          {index === 0 && <CrownFilled style={{color: "#FFD700", fontSize: 14}} />}
                        </div>
                        <Space size={4} style={{marginTop: 2}}>
                          <Tag
                            style={{
                              borderRadius: 4,
                              fontSize: 10,
                              margin: 0,
                              background: "rgba(0,0,0,0.04)",
                              border: "none",
                              color: "var(--text-color-secondary)",
                              fontWeight: 600,
                            }}
                          >
                            LV.{player.level}
                          </Tag>
                        </Space>
                      </div>

                      <div style={{textAlign: "right"}}>
                        <Text
                          strong
                          style={{
                            fontSize: 18,
                            color: "var(--seal-red)",
                            display: "block",
                            lineHeight: 1,
                            fontWeight: 700,
                          }}
                        >
                          {player.totalPoints.toLocaleString()}
                        </Text>
                        <Text type="secondary" style={{fontSize: 11, textTransform: "uppercase"}}>
                          điểm
                        </Text>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </section>
  );
};

export default HomeLeaderboardSection;
